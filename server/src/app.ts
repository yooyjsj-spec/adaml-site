import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma, UserRole } from '@prisma/client';
import { ZodError } from 'zod';
import { env } from './env.js';
import {
  ensureCoverUrl,
  fallbackCoverSvg,
  isPlaceholderCover,
  isValidDoi,
  normalizeDoi,
  publicationCoverImage,
} from './journalCover.js';
import { prisma } from './prisma.js';
import { cleanHtml } from './sanitize.js';
import {
  sendAdminNewRequestEmail,
  sendAssigneeAssignedEmail,
  sendRequestStatusEmail,
  sendRequestSubmittedEmail,
  sendVerificationEmail,
  type RequestNotifyDetails,
} from './mailer.js';
import {
  consumeRecoveryCode,
  createRecoveryCodes,
  createTotpSecret,
  encrypt,
  hashPassword,
  randomToken,
  sha256,
  totpQrDataUrl,
  verifyPassword,
  verifyTotp,
} from './security.js';
import {
  analysisRequestSchema,
  communitySchema,
  disableOtpSchema,
  journalSchema,
  loginSchema,
  otpSchema,
  paginationSchema,
  patentSchema,
  personSchema,
  setupOtpSchema,
  signupSchema,
  updateAnalysisRequestSchema,
  updateUserRoleSchema,
  verifyEmailSchema,
} from './schemas.js';

type AuthenticatedRequest = FastifyRequest & {
  auth?: {
    id: string;
    username: string | null;
    email: string | null;
    name: string | null;
    role: UserRole;
    emailVerified: boolean;
    csrfToken: string;
    totpEnabled: boolean;
  };
};

const SESSION_COOKIE = 'smd_admin_session';
const loginChallenges = new Map<string, { userId: string; expiresAt: number }>();

const jsonArray = (value: Prisma.JsonValue | null | undefined): unknown[] =>
  Array.isArray(value) ? value : [];

const toPersonDto = (person: Awaited<ReturnType<typeof prisma.person.findFirst>>) =>
  person && {
    ...person,
    equipment: jsonArray(person.equipment),
    education: jsonArray(person.education),
    experience: jsonArray(person.experience),
  };

const toCommunityDto = (post: Awaited<ReturnType<typeof prisma.communityPost.findFirst>>) =>
  post && {
    ...post,
    images: jsonArray(post.images) as string[],
  };

const toPatentDto = (patent: Awaited<ReturnType<typeof prisma.patentPublication.findFirst>>) =>
  patent && {
    ...patent,
    inventors: jsonArray(patent.inventors) as string[],
  };

const toUserDto = (user: {
  id: string;
  username: string | null;
  email: string | null;
  name: string | null;
  affiliation: string | null;
  role: UserRole;
  emailVerified: boolean;
  totpEnabled: boolean;
  createdAt: Date;
}) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  name: user.name,
  affiliation: user.affiliation,
  role: user.role,
  emailVerified: user.emailVerified,
  totpEnabled: user.totpEnabled,
  createdAt: user.createdAt,
});

const getSession = async (request: FastifyRequest) => {
  const token = request.cookies[SESSION_COOKIE];
  if (!token) return null;
  const session = await prisma.session.findFirst({
    where: {
      tokenHash: sha256(token),
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
  return session;
};

const createSession = async (userId: string) => {
  const token = randomToken();
  const csrfToken = randomToken(24);
  await prisma.session.create({
    data: {
      tokenHash: sha256(token),
      csrfToken,
      userId,
      expiresAt: new Date(Date.now() + env.sessionTtlHours * 60 * 60 * 1000),
    },
  });
  return { token, csrfToken };
};

const setSessionCookie = (reply: FastifyReply, token: string) => {
  reply.setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'strict',
    path: '/',
    maxAge: env.sessionTtlHours * 60 * 60,
  });
};

const clearSessionCookie = (reply: FastifyReply) => {
  reply.clearCookie(SESSION_COOKIE, { path: '/' });
};

const requireAuth = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  const session = await getSession(request);
  if (!session) {
    return reply.code(401).send({ message: 'Authentication required' });
  }
  request.auth = {
    id: session.user.id,
    username: session.user.username,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    emailVerified: session.user.emailVerified,
    csrfToken: session.csrfToken,
    totpEnabled: session.user.totpEnabled,
  };
};

const requireRole = (roles: UserRole[]) => async (request: AuthenticatedRequest, reply: FastifyReply) => {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (!request.auth || !roles.includes(request.auth.role)) {
    return reply.code(403).send({ message: 'Insufficient permissions' });
  }
};

const requireAdmin = requireRole(['ADMIN']);
const requireStaff = requireRole(['STAFF', 'ADMIN']);

const requireCsrf = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;
  if (request.headers['x-csrf-token'] !== request.auth?.csrfToken) {
    return reply.code(403).send({ message: 'Invalid CSRF token' });
  }
};

const requireTotp = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  if (!request.auth?.totpEnabled) {
    return reply.code(403).send({ message: 'TOTP setup required' });
  }
};

const audit = async (request: AuthenticatedRequest, action: string, resource?: string, metadata = {}) => {
  await prisma.auditLog.create({
    data: {
      userId: request.auth?.id,
      action,
      resource,
      metadata,
      ip: request.ip,
    },
  });
};

const listParams = (query: unknown) => paginationSchema.parse(query);

const buildSearch = (q?: string, fields: string[] = []) => {
  if (!q) return {};
  return {
    OR: fields.map((field) => ({
      [field]: { contains: q, mode: 'insensitive' },
    })),
  };
};

const personInput = (data: ReturnType<typeof personSchema.parse>) => ({
  ...data,
  equipment: data.equipment as Prisma.InputJsonValue,
  education: data.education as Prisma.InputJsonValue,
  experience: data.experience as Prisma.InputJsonValue,
});

const verifyUrlFor = (token: string) => `${env.publicOrigin}/#/verify-email?token=${token}`;

const requesterPublicSelect = { id: true, name: true, email: true, affiliation: true, phone: true } as const;
const assigneePublicSelect = { id: true, name: true, email: true } as const;

const collectAdminNotifyEmails = async () => {
  const emails = new Set<string>();
  if (env.adminNotifyEmail) emails.add(env.adminNotifyEmail);
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', email: { not: null } },
    select: { email: true },
  });
  for (const admin of admins) {
    if (admin.email) emails.add(admin.email);
  }
  return [...emails];
};

const toRequestNotifyDetails = (item: {
  id: string;
  title: string;
  category: string | null;
  sampleInfo: string | null;
  description: string;
  status: string;
  createdAt: Date;
  dueDate: Date | null;
  adminNote: string | null;
  guestEmail?: string | null;
  guestName?: string | null;
  guestAffiliation?: string | null;
  guestPhone?: string | null;
  requester: { name: string | null; email: string | null; affiliation: string | null; phone: string | null } | null;
}): RequestNotifyDetails => ({
  id: item.id,
  title: item.title,
  category: item.category,
  sampleInfo: item.sampleInfo,
  description: item.description,
  status: item.status,
  createdAt: item.createdAt,
  dueDate: item.dueDate,
  adminNote: item.adminNote,
  requester: item.requester ?? {
    name: item.guestName ?? '비회원',
    email: item.guestEmail ?? null,
    affiliation: item.guestAffiliation ?? null,
    phone: item.guestPhone ?? null,
  },
});

const requesterNotifyEmail = (item: {
  guestEmail?: string | null;
  requester?: { email: string | null } | null;
}) => item.requester?.email ?? item.guestEmail ?? null;

export const buildApp = async () => {
  const app = Fastify({ logger: true, trustProxy: true });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        message: error.issues.map((issue) => issue.message).join(', '),
      });
    }
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (typeof statusCode === 'number' && statusCode < 500) {
      return reply.code(statusCode).send({ message: (error as Error).message });
    }
    app.log.error(error);
    return reply.code(500).send({ message: 'Internal server error' });
  });

  await fs.promises.mkdir(env.uploadDir, { recursive: true });

  await app.register(cors, {
    origin: env.publicOrigin,
    credentials: true,
  });
  await app.register(cookie);
  await app.register(rateLimit, { max: 200, timeWindow: '1 minute' });
  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 6,
    },
  });
  await app.register(fastifyStatic, {
    root: env.uploadDir,
    prefix: env.uploadPublicPath,
  });

  app.get('/api/health', async () => ({ ok: true }));

  app.post('/api/auth/signup', { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } }, async (request, reply) => {
    const body = signupSchema.parse(request.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return reply.code(409).send({ message: '이미 등록된 이메일입니다.' });
    }

    const passwordHash = await hashPassword(body.password);
    const verificationToken = randomToken(24);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        name: body.name,
        affiliation: body.affiliation,
        phone: body.phone,
        role: 'MEMBER',
        emailVerified: false,
        verificationTokenHash: sha256(verificationToken),
        verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(body.email, body.name, verifyUrlFor(verificationToken));
    return { ok: true, id: user.id };
  });

  app.post('/api/auth/verify-email', { config: { rateLimit: { max: 20, timeWindow: '15 minutes' } } }, async (request, reply) => {
    const body = verifyEmailSchema.parse(request.body);
    const user = await prisma.user.findFirst({
      where: { verificationTokenHash: sha256(body.token), verificationExpiresAt: { gt: new Date() } },
    });
    if (!user) {
      return reply.code(400).send({ message: '유효하지 않거나 만료된 인증 링크입니다.' });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationTokenHash: null, verificationExpiresAt: null },
    });
    return { ok: true };
  });

  app.post('/api/auth/login', { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } }, async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const identifier = body.username.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: body.username }, { email: identifier }] },
    });
    if (!user) return reply.code(401).send({ message: 'Invalid credentials' });
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return reply.code(423).send({ message: 'Account temporarily locked' });
    }

    const passwordOk = await verifyPassword(user.passwordHash, body.password);
    if (!passwordOk) {
      const failedLoginCount = user.failedLoginCount + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount,
          lockedUntil:
            failedLoginCount >= env.maxLoginFailures
              ? new Date(Date.now() + env.lockoutMinutes * 60 * 1000)
              : null,
        },
      });
      return reply.code(401).send({ message: 'Invalid credentials' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null },
    });

    if (user.totpEnabled) {
      const challengeId = randomToken(18);
      loginChallenges.set(challengeId, { userId: user.id, expiresAt: Date.now() + 5 * 60 * 1000 });
      return { ok: true, requiresOtp: true, challengeId };
    }

    const { token, csrfToken } = await createSession(user.id);
    setSessionCookie(reply, token);
    // TOTP is mandatory for ADMIN; MEMBER/STAFF may opt in later but are never forced.
    return { ok: true, csrfToken, requiresTotpSetup: user.role === 'ADMIN' };
  });

  app.post('/api/auth/verify-otp', { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } }, async (request, reply) => {
    const body = otpSchema.parse(request.body);
    const challenge = loginChallenges.get(body.challengeId);
    if (!challenge || challenge.expiresAt < Date.now()) {
      loginChallenges.delete(body.challengeId);
      return reply.code(401).send({ message: 'OTP challenge expired' });
    }
    const user = await prisma.user.findUnique({ where: { id: challenge.userId } });
    if (!user?.encryptedTotpSecret) return reply.code(401).send({ message: 'OTP is not configured' });

    const recoveryHashes = zodJsonStringArray(user.recoveryCodeHashes);
    const remainingRecoveryCodes = await consumeRecoveryCode(recoveryHashes, body.token);
    const otpOk = verifyTotp(body.token, user.encryptedTotpSecret);
    if (!otpOk && !remainingRecoveryCodes) {
      return reply.code(401).send({ message: 'Invalid OTP' });
    }

    loginChallenges.delete(body.challengeId);
    const { token, csrfToken } = await createSession(user.id);
    setSessionCookie(reply, token);
    await prisma.user.update({
      where: { id: user.id },
      data: remainingRecoveryCodes ? { recoveryCodeHashes: remainingRecoveryCodes } : {},
    });
    return { ok: true, csrfToken };
  });

  app.get('/api/auth/me', { preHandler: [requireAuth] }, async (request: AuthenticatedRequest) => ({
    user: request.auth,
    csrfToken: request.auth?.csrfToken,
    requiresTotpSetup: request.auth?.role === 'ADMIN' && !request.auth?.totpEnabled,
  }));

  app.post('/api/auth/logout', { preHandler: [requireAuth, requireCsrf] }, async (request: AuthenticatedRequest, reply) => {
    const token = request.cookies[SESSION_COOKIE];
    if (token) {
      await prisma.session.updateMany({
        where: { tokenHash: sha256(token), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    clearSessionCookie(reply);
    return { ok: true };
  });

  app.post('/api/auth/setup-otp', { preHandler: [requireAuth, requireCsrf] }, async (request: AuthenticatedRequest) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: request.auth!.id } });
    const { secret, otpauth } = createTotpSecret(user.username ?? user.email ?? user.id);
    const qrCode = await totpQrDataUrl(otpauth);
    await prisma.user.update({
      where: { id: user.id },
      data: { encryptedTotpSecret: encrypt(secret), totpEnabled: false },
    });
    return { otpauth, qrCode };
  });

  app.post('/api/auth/confirm-otp', { preHandler: [requireAuth, requireCsrf] }, async (request: AuthenticatedRequest, reply) => {
    const body = setupOtpSchema.parse(request.body);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: request.auth!.id } });
    if (!user.encryptedTotpSecret || !verifyTotp(body.token, user.encryptedTotpSecret)) {
      return reply.code(401).send({ message: 'Invalid OTP' });
    }
    const { codes, hashes } = await createRecoveryCodes();
    await prisma.user.update({
      where: { id: user.id },
      data: { totpEnabled: true, recoveryCodeHashes: hashes },
    });
    await audit(request, 'auth.totp_enabled', 'user', { userId: user.id });
    return { ok: true, recoveryCodes: codes };
  });

  app.post('/api/auth/disable-otp', { preHandler: [requireAuth, requireCsrf] }, async (request: AuthenticatedRequest, reply) => {
    if (request.auth!.role === 'ADMIN') {
      return reply.code(403).send({ message: 'Administrators must keep two-factor authentication enabled.' });
    }
    const body = disableOtpSchema.parse(request.body);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: request.auth!.id } });
    const passwordOk = await verifyPassword(user.passwordHash, body.password);
    if (!passwordOk) {
      return reply.code(401).send({ message: 'Invalid credentials' });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { totpEnabled: false, encryptedTotpSecret: null, recoveryCodeHashes: [] },
    });
    await audit(request, 'auth.totp_disabled', 'user', { userId: user.id });
    return { ok: true };
  });

  app.get('/api/people', async () => {
    const people = await prisma.person.findMany({
      where: { visible: true },
      orderBy: [{ role: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });
    return people.map((person) => toPersonDto(person));
  });

  app.get('/api/community', async (request) => {
    const category = (request.query as { category?: string }).category;
    const posts = await prisma.communityPost.findMany({
      where: { published: true, ...(category ? { category: category as never } : {}) },
      orderBy: [{ date: 'desc' }, { sortOrder: 'asc' }],
    });
    return posts.map((post) => toCommunityDto(post));
  });

  app.get('/api/publications/journals', async (request) => {
    const { page, pageSize, q } = listParams(request.query);
    const where = buildSearch(q, ['title', 'journal']);
    const [items, total] = await Promise.all([
      prisma.journalPublication.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { date: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.journalPublication.count({ where }),
    ]);
    return {
      items: items.map((item) => ({ ...item, image: publicationCoverImage(item) })),
      total,
      page,
      pageSize,
    };
  });

  app.get('/api/publications/cover', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (request, reply) => {
    const doi = normalizeDoi(String((request.query as { doi?: string }).doi ?? ''));
    if (!isValidDoi(doi)) {
      return reply.code(400).send({ message: 'Invalid DOI' });
    }

    const row = await prisma.journalPublication.findFirst({
      where: { doi: { contains: doi, mode: 'insensitive' } },
    });
    if (row?.image && !isPlaceholderCover(row.image) && !row.image.startsWith('/api/')) {
      return reply.redirect(row.image);
    }

    const stored = await ensureCoverUrl(doi, { journal: row?.journal, date: row?.date });
    if (stored) {
      if (row && stored !== row.image) {
        await prisma.journalPublication.update({ where: { id: row.id }, data: { image: stored } });
      }
      return reply.redirect(stored);
    }

    return reply
      .type('image/svg+xml')
      .header('Cache-Control', 'public, max-age=86400')
      .send(fallbackCoverSvg(row?.journal ?? 'Journal article', row?.date ?? ''));
  });

  app.get('/api/publications/patents', async (request) => {
    const { page, pageSize, q } = listParams(request.query);
    const where = buildSearch(q, ['title', 'number', 'country']);
    const [items, total] = await Promise.all([
      prisma.patentPublication.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { date: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.patentPublication.count({ where }),
    ]);
    return { items: items.map((item) => toPatentDto(item)), total, page, pageSize };
  });

  // Guests may submit with an email; signed-in members use their account.
  app.post(
    '/api/analysis-requests',
    { config: { rateLimit: { max: 20, timeWindow: '15 minutes' } } },
    async (request: AuthenticatedRequest, reply) => {
      const session = await getSession(request);
      const data = analysisRequestSchema.parse(request.body);
      const { email, name, affiliation, phone, ...fields } = data;

      if (session) {
        request.auth = {
          id: session.user.id,
          username: session.user.username,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          emailVerified: session.user.emailVerified,
          csrfToken: session.csrfToken,
          totpEnabled: session.user.totpEnabled,
        };
        await requireCsrf(request, reply);
        if (reply.sent) return;
        if (!session.user.emailVerified) {
          return reply.code(403).send({ message: '이메일 인증 후 이용할 수 있습니다.' });
        }
        const item = await prisma.analysisRequest.create({
          data: { ...fields, requesterId: session.user.id },
          include: { requester: { select: requesterPublicSelect } },
        });
        await audit(request, 'analysisRequest.create', 'analysisRequest', { id: item.id });
        if (session.user.email) {
          await sendRequestSubmittedEmail(session.user.email, item.title, item.id);
        }
        const details = toRequestNotifyDetails(item);
        const adminEmails = await collectAdminNotifyEmails();
        await Promise.all(adminEmails.map((to) => sendAdminNewRequestEmail(to, details)));
        return item;
      }

      if (!email) {
        return reply.code(400).send({ message: '이메일을 입력해주세요.' });
      }
      if (!name) {
        return reply.code(400).send({ message: '이름을 입력해주세요.' });
      }
      const item = await prisma.analysisRequest.create({
        data: {
          ...fields,
          guestEmail: email,
          guestName: name ?? null,
          guestAffiliation: affiliation ?? null,
          guestPhone: phone ?? null,
        },
        include: { requester: { select: requesterPublicSelect } },
      });
      await prisma.auditLog.create({
        data: {
          action: 'analysisRequest.create',
          resource: 'analysisRequest',
          metadata: { id: item.id, guest: true },
          ip: request.ip,
        },
      });
      await sendRequestSubmittedEmail(email, item.title, item.id, { guest: true });
      const details = toRequestNotifyDetails(item);
      const adminEmails = await collectAdminNotifyEmails();
      await Promise.all(adminEmails.map((to) => sendAdminNewRequestEmail(to, details)));
      return item;
    }
  );

  // Any authenticated member/staff/admin: view their own analysis requests.
  app.register(async (member) => {
    member.addHook('preHandler', requireAuth);
    member.addHook('preHandler', requireCsrf);

    member.get('/api/analysis-requests/mine', async (request: AuthenticatedRequest) => {
      return prisma.analysisRequest.findMany({
        where: { requesterId: request.auth!.id },
        orderBy: { createdAt: 'desc' },
        include: { assignee: { select: { id: true, name: true } } },
      });
    });

    member.post(
      '/api/auth/resend-verification',
      { config: { rateLimit: { max: 3, timeWindow: '15 minutes' } } },
      async (request: AuthenticatedRequest, reply) => {
        if (request.auth!.emailVerified) {
          return reply.code(400).send({ message: '이미 인증된 계정입니다.' });
        }
        if (!request.auth!.email) {
          return reply.code(400).send({ message: '등록된 이메일이 없습니다.' });
        }
        const verificationToken = randomToken(24);
        await prisma.user.update({
          where: { id: request.auth!.id },
          data: {
            verificationTokenHash: sha256(verificationToken),
            verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
        await sendVerificationEmail(request.auth!.email, request.auth!.name, verifyUrlFor(verificationToken));
        return { ok: true };
      }
    );
  });

  // Staff/Admin: review and manage submitted analysis requests.
  app.register(async (staff) => {
    staff.addHook('preHandler', requireStaff);
    staff.addHook('preHandler', requireCsrf);

    staff.get('/api/admin/analysis-requests', async (request) => {
      const query = request.query as { status?: string; assigneeId?: string; q?: string };
      const where: Prisma.AnalysisRequestWhereInput = {
        ...(query.status ? { status: query.status as never } : {}),
        ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
        ...(query.q
          ? { OR: [{ title: { contains: query.q, mode: 'insensitive' } }, { description: { contains: query.q, mode: 'insensitive' } }] }
          : {}),
      };
      return prisma.analysisRequest.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          requester: { select: requesterPublicSelect },
          assignee: { select: assigneePublicSelect },
        },
      });
    });

    staff.get('/api/admin/analysis-requests/calendar', async (request) => {
      const query = request.query as { from?: string; to?: string };
      const from = query.from ? new Date(query.from) : new Date(new Date().setDate(1));
      const to = query.to ? new Date(query.to) : new Date(new Date().setMonth(new Date().getMonth() + 1));
      return prisma.analysisRequest.findMany({
        where: { dueDate: { gte: from, lte: to } },
        orderBy: [{ dueDate: 'asc' }],
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          assignee: { select: assigneePublicSelect },
          requester: { select: requesterPublicSelect },
        },
      });
    });

    staff.patch('/api/admin/analysis-requests/:id', async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const data = updateAnalysisRequestSchema.parse(request.body);
      const existing = await prisma.analysisRequest.findUnique({
        where: { id },
        include: {
          requester: { select: requesterPublicSelect },
          assignee: { select: assigneePublicSelect },
        },
      });
      if (!existing) return reply.code(404).send({ message: 'Not found' });

      const item = await prisma.analysisRequest.update({
        where: { id },
        data: {
          ...(data.status ? { status: data.status, completedAt: data.status === 'COMPLETED' ? new Date() : existing.completedAt } : {}),
          ...(data.assigneeId !== undefined ? { assigneeId: data.assigneeId } : {}),
          ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate) : null } : {}),
          ...(data.adminNote !== undefined ? { adminNote: data.adminNote } : {}),
        },
        include: {
          requester: { select: requesterPublicSelect },
          assignee: { select: assigneePublicSelect },
        },
      });
      await audit(request, 'analysisRequest.update', 'analysisRequest', { id: item.id, changes: data });

      const statusChanged = Boolean(data.status && data.status !== existing.status);
      const assigneeChanged = data.assigneeId !== undefined && data.assigneeId !== existing.assigneeId;

      const notifyEmail = requesterNotifyEmail(existing);
      if (statusChanged && notifyEmail) {
        await sendRequestStatusEmail(notifyEmail, {
          id: item.id,
          title: item.title,
          status: item.status,
          previousStatus: existing.status,
          adminNote: item.adminNote,
          assigneeName: item.assignee?.name ?? null,
          guest: !existing.requester && Boolean(existing.guestEmail),
        });
      }

      if (assigneeChanged && item.assignee?.email) {
        await sendAssigneeAssignedEmail(item.assignee.email, item.assignee.name, toRequestNotifyDetails(item));
      }
      return item;
    });

    staff.get('/api/admin/users/assignable', async () => {
      const users = await prisma.user.findMany({
        where: { role: { in: ['STAFF', 'ADMIN'] } },
        select: { id: true, name: true, email: true, username: true, role: true },
        orderBy: { name: 'asc' },
      });
      return users;
    });
  });

  app.register(async (admin) => {
    admin.addHook('preHandler', requireAdmin);
    admin.addHook('preHandler', requireTotp);
    admin.addHook('preHandler', requireCsrf);

    admin.get('/api/admin/users', async (request) => {
      const query = request.query as { q?: string };
      const where = query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              { email: { contains: query.q, mode: 'insensitive' as const } },
            ],
          }
        : {};
      const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' } });
      return users.map(toUserDto);
    });

    admin.patch('/api/admin/users/:id/role', async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const data = updateUserRoleSchema.parse(request.body);
      const user = await prisma.user.update({ where: { id }, data: { role: data.role } });
      await audit(request, 'user.role_change', 'user', { id, role: data.role });
      return toUserDto(user);
    });

    admin.get('/api/admin/people', async () => {
      const people = await prisma.person.findMany({ orderBy: [{ role: 'asc' }, { sortOrder: 'asc' }] });
      return people.map((person) => toPersonDto(person));
    });
    admin.post('/api/admin/people', async (request: AuthenticatedRequest) => {
      const data = personSchema.parse(request.body);
      const person = await prisma.person.create({ data: personInput(data) });
      await audit(request, 'person.create', 'person', { id: person.id });
      return toPersonDto(person);
    });
    admin.put('/api/admin/people/:id', async (request: AuthenticatedRequest) => {
      const data = personSchema.parse(request.body);
      const person = await prisma.person.update({ where: { id: (request.params as { id: string }).id }, data: personInput(data) });
      await audit(request, 'person.update', 'person', { id: person.id });
      return toPersonDto(person);
    });
    admin.delete('/api/admin/people/:id', async (request: AuthenticatedRequest) => {
      const { id } = request.params as { id: string };
      await prisma.person.delete({ where: { id } });
      await audit(request, 'person.delete', 'person', { id });
      return { ok: true };
    });

    admin.get('/api/admin/community', async () => {
      const posts = await prisma.communityPost.findMany({ orderBy: [{ date: 'desc' }, { sortOrder: 'asc' }] });
      return posts.map((post) => toCommunityDto(post));
    });
    admin.post('/api/admin/community', async (request: AuthenticatedRequest) => {
      const data = communitySchema.parse(request.body);
      const post = await prisma.communityPost.create({ data: { ...data, content: cleanHtml(data.content) } });
      await audit(request, 'community.create', 'communityPost', { id: post.id });
      return toCommunityDto(post);
    });
    admin.put('/api/admin/community/:id', async (request: AuthenticatedRequest) => {
      const data = communitySchema.parse(request.body);
      const post = await prisma.communityPost.update({
        where: { id: (request.params as { id: string }).id },
        data: { ...data, content: cleanHtml(data.content) },
      });
      await audit(request, 'community.update', 'communityPost', { id: post.id });
      return toCommunityDto(post);
    });
    admin.delete('/api/admin/community/:id', async (request: AuthenticatedRequest) => {
      const { id } = request.params as { id: string };
      await prisma.communityPost.delete({ where: { id } });
      await audit(request, 'community.delete', 'communityPost', { id });
      return { ok: true };
    });

    admin.get('/api/admin/publications/journals', async (request) => {
      const { page, pageSize, q } = listParams(request.query);
      const where = buildSearch(q, ['title', 'journal']);
      const [items, total] = await Promise.all([
        prisma.journalPublication.findMany({ where, orderBy: [{ sortOrder: 'asc' }], skip: (page - 1) * pageSize, take: pageSize }),
        prisma.journalPublication.count({ where }),
      ]);
      return { items, total, page, pageSize };
    });
    admin.post('/api/admin/publications/journals', async (request: AuthenticatedRequest) => {
      const data = journalSchema.parse(request.body);
      if (!data.image && data.doi) {
        data.image = (await ensureCoverUrl(data.doi, { journal: data.journal, date: data.date })) ?? data.image;
      }
      const item = await prisma.journalPublication.create({ data });
      await audit(request, 'journal.create', 'journalPublication', { id: item.id });
      return item;
    });
    admin.put('/api/admin/publications/journals/:id', async (request: AuthenticatedRequest) => {
      const data = journalSchema.parse(request.body);
      const item = await prisma.journalPublication.update({ where: { id: (request.params as { id: string }).id }, data });
      await audit(request, 'journal.update', 'journalPublication', { id: item.id });
      return item;
    });
    admin.delete('/api/admin/publications/journals/:id', async (request: AuthenticatedRequest) => {
      const { id } = request.params as { id: string };
      await prisma.journalPublication.delete({ where: { id } });
      await audit(request, 'journal.delete', 'journalPublication', { id });
      return { ok: true };
    });

    admin.get('/api/admin/publications/patents', async (request) => {
      const { page, pageSize, q } = listParams(request.query);
      const where = buildSearch(q, ['title', 'number', 'country']);
      const [items, total] = await Promise.all([
        prisma.patentPublication.findMany({ where, orderBy: [{ sortOrder: 'asc' }], skip: (page - 1) * pageSize, take: pageSize }),
        prisma.patentPublication.count({ where }),
      ]);
      return { items: items.map((item) => toPatentDto(item)), total, page, pageSize };
    });
    admin.post('/api/admin/publications/patents', async (request: AuthenticatedRequest) => {
      const data = patentSchema.parse(request.body);
      const item = await prisma.patentPublication.create({ data });
      await audit(request, 'patent.create', 'patentPublication', { id: item.id });
      return toPatentDto(item);
    });
    admin.put('/api/admin/publications/patents/:id', async (request: AuthenticatedRequest) => {
      const data = patentSchema.parse(request.body);
      const item = await prisma.patentPublication.update({ where: { id: (request.params as { id: string }).id }, data });
      await audit(request, 'patent.update', 'patentPublication', { id: item.id });
      return toPatentDto(item);
    });
    admin.delete('/api/admin/publications/patents/:id', async (request: AuthenticatedRequest) => {
      const { id } = request.params as { id: string };
      await prisma.patentPublication.delete({ where: { id } });
      await audit(request, 'patent.delete', 'patentPublication', { id });
      return { ok: true };
    });

    admin.post('/api/admin/media', async (request: AuthenticatedRequest, reply) => {
      const part = await request.file();
      if (!part) return reply.code(400).send({ message: 'Missing file' });
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(part.mimetype)) {
        return reply.code(415).send({ message: 'Only image uploads are allowed' });
      }
      const ext = path.extname(part.filename).toLowerCase();
      const fileName = `${randomToken(12)}${ext}`;
      const storagePath = path.join(env.uploadDir, fileName);
      await pipeline(part.file, fs.createWriteStream(storagePath));
      const media = await prisma.mediaAsset.create({
        data: {
          originalName: part.filename,
          fileName,
          mimeType: part.mimetype,
          size: Number(part.file.bytesRead ?? 0),
          storagePath,
          url: `${env.uploadPublicPath}/${fileName}`,
        },
      });
      await audit(request, 'media.upload', 'mediaAsset', { id: media.id });
      return media;
    });
  });

  return app;
};

const zodJsonStringArray = (value: Prisma.JsonValue): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

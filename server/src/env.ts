import crypto from 'node:crypto';
import path from 'node:path';
import 'dotenv/config';
import { LAB_NAME } from './lab.js';

const requireEnv = (name: string, fallback?: string) => {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const originVariants = (origin: string) => {
  try {
    const url = new URL(origin);
    const hostname = url.hostname.replace(/^www\./i, '');
    const port = url.port ? `:${url.port}` : '';
    const apex = `${url.protocol}//${hostname}${port}`;
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) return [apex];
    return [apex, `${url.protocol}//www.${hostname}${port}`];
  } catch {
    return [origin];
  }
};

const publicOrigin = process.env.PUBLIC_ORIGIN ?? 'http://localhost:5173';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  host: process.env.API_HOST ?? '0.0.0.0',
  port: Number(process.env.API_PORT ?? 4000),
  databaseUrl: requireEnv('DATABASE_URL', 'postgresql://smd:smd_dev_password@localhost:15432/smd_lab?schema=public'),
  publicOrigin,
  corsOrigins: Array.from(
    new Set([...originVariants(publicOrigin), ...originVariants('https://smd-lab.com'), ...originVariants('https://adaml.site')])
  ),
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? './uploads'),
  uploadPublicPath: process.env.UPLOAD_PUBLIC_PATH ?? '/uploads',
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS ?? 8),
  lockoutMinutes: Number(process.env.LOGIN_LOCKOUT_MINUTES ?? 15),
  maxLoginFailures: Number(process.env.MAX_LOGIN_FAILURES ?? 5),
  adminCryptoKey: crypto.createHash('sha256').update(requireEnv('ADMIN_CRYPTO_KEY', 'change-me-in-production')).digest(),
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.MAIL_FROM ?? `${LAB_NAME} <no-reply@smd-lab.local>`,
    tlsServername: process.env.SMTP_TLS_SERVERNAME ?? '',
  },
  adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL ?? '',
};

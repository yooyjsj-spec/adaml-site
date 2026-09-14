import { z } from 'zod';

const nonEmpty = z.string().trim().min(1);
const optionalText = z.string().trim().optional().nullable();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(20),
  q: z.string().trim().optional(),
});

export const personSchema = z.object({
  name: nonEmpty,
  email: optionalText,
  role: z.enum(['PROFESSOR', 'PHD', 'MASTERS', 'POST_PHD', 'POST_MS', 'POST_BS', 'UNDERGRAD', 'ALUMNI']),
  title: optionalText,
  affiliation: optionalText,
  location: optionalText,
  phone: optionalText,
  research: optionalText,
  equipment: z.array(z.string().trim()).default([]),
  image: optionalText,
  education: z.array(z.record(z.string(), z.unknown())).default([]),
  experience: z.array(z.record(z.string(), z.unknown())).default([]),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const communitySchema = z.object({
  title: nonEmpty,
  date: nonEmpty,
  summary: nonEmpty,
  content: optionalText,
  category: z.enum(['Award', 'Conference', 'Paper', 'General', 'Notice', 'Gallery']),
  link: optionalText,
  image: optionalText,
  images: z.array(z.string().trim()).default([]),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const journalSchema = z.object({
  title: nonEmpty,
  doi: optionalText,
  image: optionalText,
  journal: nonEmpty,
  date: nonEmpty,
  sortOrder: z.number().int().default(0),
});

export const patentSchema = z.object({
  title: nonEmpty,
  country: nonEmpty,
  date: nonEmpty,
  number: nonEmpty,
  applicantsCount: z.number().int().min(0).default(0),
  inventors: z.array(z.string().trim()).default([]),
  link: optionalText,
  image: optionalText,
  sortOrder: z.number().int().default(0),
});

export const loginSchema = z.object({
  username: nonEmpty,
  password: nonEmpty,
});

export const otpSchema = z.object({
  challengeId: nonEmpty,
  token: z.string().trim().min(6),
});

export const setupOtpSchema = z.object({
  token: z.string().trim().min(6),
});

export const disableOtpSchema = z.object({
  password: nonEmpty,
});

export const createAdminSchema = z.object({
  username: nonEmpty,
  password: z.string().min(12),
});

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  name: nonEmpty,
  affiliation: optionalText,
  phone: optionalText,
});

export const verifyEmailSchema = z.object({
  token: nonEmpty,
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['MEMBER', 'STAFF', 'ADMIN']),
});

export const analysisRequestSchema = z.object({
  title: nonEmpty,
  category: optionalText,
  sampleInfo: optionalText,
  description: nonEmpty,
  email: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().toLowerCase().email().optional()
  ),
  name: optionalText,
  affiliation: optionalText,
  phone: optionalText,
});

export const updateAnalysisRequestSchema = z.object({
  status: z.enum(['SUBMITTED', 'IN_REVIEW', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED']).optional(),
  assigneeId: z.string().trim().min(1).nullable().optional(),
  dueDate: z.string().trim().min(1).nullable().optional(),
  adminNote: optionalText,
});

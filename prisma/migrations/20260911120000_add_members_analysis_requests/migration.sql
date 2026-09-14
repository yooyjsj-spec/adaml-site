-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'STAFF', 'ADMIN');
CREATE TYPE "RequestStatus" AS ENUM ('SUBMITTED', 'IN_REVIEW', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- Rename AdminUser -> User, generalize into a multi-role member table
ALTER TABLE "AdminUser" RENAME TO "User";
ALTER TABLE "User" RENAME CONSTRAINT "AdminUser_pkey" TO "User_pkey";
ALTER INDEX "AdminUser_username_key" RENAME TO "User_username_key";

ALTER TABLE "User" ALTER COLUMN "username" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "email" TEXT;
ALTER TABLE "User" ADD COLUMN "name" TEXT;
ALTER TABLE "User" ADD COLUMN "affiliation" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "verificationTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN "verificationExpiresAt" TIMESTAMP(3);

-- Existing rows are the pre-existing CMS admin(s): mark them ADMIN + verified,
-- then flip the column defaults so new signups default to MEMBER / unverified.
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'ADMIN';
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ALTER COLUMN "emailVerified" SET DEFAULT false;

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");

-- Rename AdminSession -> Session
ALTER TABLE "AdminSession" RENAME TO "Session";
ALTER TABLE "Session" RENAME CONSTRAINT "AdminSession_pkey" TO "Session_pkey";
ALTER TABLE "Session" RENAME CONSTRAINT "AdminSession_userId_fkey" TO "Session_userId_fkey";
ALTER INDEX "AdminSession_tokenHash_key" RENAME TO "Session_tokenHash_key";
ALTER INDEX "AdminSession_userId_idx" RENAME TO "Session_userId_idx";
ALTER INDEX "AdminSession_expiresAt_idx" RENAME TO "Session_expiresAt_idx";

-- CreateTable
CREATE TABLE "AnalysisRequest" (
  "id" TEXT NOT NULL,
  "requesterId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT,
  "sampleInfo" TEXT,
  "description" TEXT NOT NULL,
  "attachments" JSONB NOT NULL DEFAULT '[]',
  "status" "RequestStatus" NOT NULL DEFAULT 'SUBMITTED',
  "assigneeId" TEXT,
  "dueDate" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "adminNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AnalysisRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AnalysisRequest_status_idx" ON "AnalysisRequest"("status");
CREATE INDEX "AnalysisRequest_requesterId_idx" ON "AnalysisRequest"("requesterId");
CREATE INDEX "AnalysisRequest_assigneeId_idx" ON "AnalysisRequest"("assigneeId");
CREATE INDEX "AnalysisRequest_dueDate_idx" ON "AnalysisRequest"("dueDate");

ALTER TABLE "AnalysisRequest" ADD CONSTRAINT "AnalysisRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalysisRequest" ADD CONSTRAINT "AnalysisRequest_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "EmailLog" (
  "id" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "template" TEXT NOT NULL,
  "relatedRequestId" TEXT,
  "status" TEXT NOT NULL,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");
CREATE INDEX "EmailLog_relatedRequestId_idx" ON "EmailLog"("relatedRequestId");

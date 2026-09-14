CREATE TYPE "PersonRole" AS ENUM ('PROFESSOR', 'PHD', 'MASTERS', 'UNDERGRAD', 'ALUMNI');
CREATE TYPE "CommunityCategory" AS ENUM ('Award', 'Conference', 'Paper', 'General', 'Notice', 'Gallery');
CREATE TYPE "MediaOwnerType" AS ENUM ('PERSON', 'COMMUNITY', 'JOURNAL', 'PATENT', 'GENERAL');

CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "encryptedTotpSecret" TEXT,
  "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
  "recoveryCodeHashes" JSONB NOT NULL DEFAULT '[]',
  "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
  "lockedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminSession" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "csrfToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "resource" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "ip" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Person" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "role" "PersonRole" NOT NULL,
  "title" TEXT,
  "affiliation" TEXT,
  "location" TEXT,
  "phone" TEXT,
  "research" TEXT,
  "equipment" JSONB NOT NULL DEFAULT '[]',
  "image" TEXT,
  "education" JSONB NOT NULL DEFAULT '[]',
  "experience" JSONB NOT NULL DEFAULT '[]',
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityPost" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "content" TEXT,
  "category" "CommunityCategory" NOT NULL,
  "link" TEXT,
  "image" TEXT,
  "images" JSONB NOT NULL DEFAULT '[]',
  "published" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JournalPublication" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "doi" TEXT,
  "image" TEXT,
  "journal" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JournalPublication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PatentPublication" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "applicantsCount" INTEGER NOT NULL DEFAULT 0,
  "inventors" JSONB NOT NULL DEFAULT '[]',
  "link" TEXT,
  "image" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PatentPublication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MediaAsset" (
  "id" TEXT NOT NULL,
  "ownerType" "MediaOwnerType" NOT NULL DEFAULT 'GENERAL',
  "ownerId" TEXT,
  "originalName" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "url" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");
CREATE UNIQUE INDEX "MediaAsset_fileName_key" ON "MediaAsset"("fileName");
CREATE INDEX "AdminSession_userId_idx" ON "AdminSession"("userId");
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");
CREATE INDEX "Person_role_sortOrder_idx" ON "Person"("role", "sortOrder");
CREATE INDEX "CommunityPost_category_date_idx" ON "CommunityPost"("category", "date");
CREATE INDEX "CommunityPost_published_idx" ON "CommunityPost"("published");
CREATE INDEX "JournalPublication_date_idx" ON "JournalPublication"("date");
CREATE INDEX "JournalPublication_sortOrder_idx" ON "JournalPublication"("sortOrder");
CREATE INDEX "PatentPublication_date_idx" ON "PatentPublication"("date");
CREATE INDEX "PatentPublication_sortOrder_idx" ON "PatentPublication"("sortOrder");
CREATE INDEX "MediaAsset_ownerType_ownerId_idx" ON "MediaAsset"("ownerType", "ownerId");

ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

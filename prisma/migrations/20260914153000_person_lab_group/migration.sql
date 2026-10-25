-- CreateEnum
CREATE TYPE "PersonLabGroup" AS ENUM ('SEOL', 'ADAML');

-- AlterTable
ALTER TABLE "Person" ADD COLUMN "labGroup" "PersonLabGroup" NOT NULL DEFAULT 'SEOL';

-- CreateIndex
CREATE INDEX "Person_labGroup_role_sortOrder_idx" ON "Person"("labGroup", "role", "sortOrder");

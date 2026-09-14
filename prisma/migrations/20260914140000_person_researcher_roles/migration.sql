-- AlterEnum
BEGIN;
CREATE TYPE "PersonRole_new" AS ENUM ('PROFESSOR', 'PHD', 'MASTERS', 'POST_PHD', 'POST_MS', 'POST_BS', 'UNDERGRAD', 'ALUMNI');
ALTER TABLE "Person" ALTER COLUMN "role" TYPE "PersonRole_new" USING ("role"::text::"PersonRole_new");
ALTER TYPE "PersonRole" RENAME TO "PersonRole_old";
ALTER TYPE "PersonRole_new" RENAME TO "PersonRole";
DROP TYPE "PersonRole_old";
COMMIT;

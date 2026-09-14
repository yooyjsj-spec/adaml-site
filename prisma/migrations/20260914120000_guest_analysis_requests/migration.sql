ALTER TABLE "AnalysisRequest" ALTER COLUMN "requesterId" DROP NOT NULL;
ALTER TABLE "AnalysisRequest" ADD COLUMN "guestEmail" TEXT;

CREATE INDEX "AnalysisRequest_guestEmail_idx" ON "AnalysisRequest"("guestEmail");

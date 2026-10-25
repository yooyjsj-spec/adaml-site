CREATE TYPE "AnalysisPurpose" AS ENUM ('PROJECT_PRESENTATION', 'JOINT_PAPER', 'OTHER');

ALTER TABLE "AnalysisRequest" ADD COLUMN "purposes" "AnalysisPurpose"[] NOT NULL DEFAULT ARRAY[]::"AnalysisPurpose"[];

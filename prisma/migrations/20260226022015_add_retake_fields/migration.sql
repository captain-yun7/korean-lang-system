-- AlterTable
ALTER TABLE "public"."assigned_exams" ADD COLUMN     "allowRetake" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "public"."exam_results" ADD COLUMN     "attemptNumber" INTEGER NOT NULL DEFAULT 1;

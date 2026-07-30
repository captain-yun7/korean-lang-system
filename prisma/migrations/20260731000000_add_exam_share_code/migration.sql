-- AlterTable
ALTER TABLE "public"."exams" ADD COLUMN     "shareCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "exams_shareCode_key" ON "public"."exams"("shareCode");

-- CreateIndex
CREATE INDEX "exams_shareCode_idx" ON "public"."exams"("shareCode");

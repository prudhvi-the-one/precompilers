-- AlterTable
ALTER TABLE "User" ADD COLUMN     "reportShowCollege" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reportShowMockNotes" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ReadinessSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallScore" INTEGER,
    "pillars" JSONB NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadinessSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReadinessSnapshot_userId_capturedAt_idx" ON "ReadinessSnapshot"("userId", "capturedAt");

-- AddForeignKey
ALTER TABLE "ReadinessSnapshot" ADD CONSTRAINT "ReadinessSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

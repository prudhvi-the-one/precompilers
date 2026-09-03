-- CreateTable
CREATE TABLE "ScheduledRelease" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "quizId" TEXT,
    "problemId" TEXT,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "windowMinutes" INTEGER NOT NULL DEFAULT 720,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledRelease_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduledRelease_vendorId_closesAt_idx" ON "ScheduledRelease"("vendorId", "closesAt");

-- CreateIndex
CREATE INDEX "ScheduledRelease_quizId_idx" ON "ScheduledRelease"("quizId");

-- CreateIndex
CREATE INDEX "ScheduledRelease_problemId_idx" ON "ScheduledRelease"("problemId");

-- AddForeignKey
ALTER TABLE "ScheduledRelease" ADD CONSTRAINT "ScheduledRelease_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledRelease" ADD CONSTRAINT "ScheduledRelease_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledRelease" ADD CONSTRAINT "ScheduledRelease_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

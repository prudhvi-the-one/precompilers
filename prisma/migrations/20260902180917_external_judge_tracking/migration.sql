-- CreateEnum
CREATE TYPE "ExternalJudgePlatform" AS ENUM ('LEETCODE', 'CODECHEF');

-- CreateEnum
CREATE TYPE "ExternalTrackingStatus" AS ENUM ('UNVERIFIED', 'ACTIVE', 'BLOCKED_OR_PRIVATE');

-- AlterTable
ALTER TABLE "ScheduledRelease" ADD COLUMN     "externalPlatform" "ExternalJudgePlatform",
ADD COLUMN     "externalProblemSlug" TEXT,
ADD COLUMN     "externalProblemTitle" TEXT;

-- CreateTable
CREATE TABLE "ExternalJudgeAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "ExternalJudgePlatform" NOT NULL,
    "handle" TEXT NOT NULL,
    "verificationCode" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "trackingStatus" "ExternalTrackingStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "lastPolledAt" TIMESTAMP(3),
    "lastSuccessfulPollAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalJudgeAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalSubmissionRecord" (
    "id" TEXT NOT NULL,
    "externalJudgeAccountId" TEXT NOT NULL,
    "problemSlug" TEXT NOT NULL,
    "problemTitle" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalSubmissionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalJudgeAccount_userId_platform_key" ON "ExternalJudgeAccount"("userId", "platform");

-- CreateIndex
CREATE INDEX "ExternalSubmissionRecord_externalJudgeAccountId_idx" ON "ExternalSubmissionRecord"("externalJudgeAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalSubmissionRecord_externalJudgeAccountId_problemSlug_key" ON "ExternalSubmissionRecord"("externalJudgeAccountId", "problemSlug", "submittedAt");

-- AddForeignKey
ALTER TABLE "ExternalJudgeAccount" ADD CONSTRAINT "ExternalJudgeAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalSubmissionRecord" ADD CONSTRAINT "ExternalSubmissionRecord_externalJudgeAccountId_fkey" FOREIGN KEY ("externalJudgeAccountId") REFERENCES "ExternalJudgeAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

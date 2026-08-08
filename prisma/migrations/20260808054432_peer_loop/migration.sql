-- CreateEnum
CREATE TYPE "HireVerdict" AS ENUM ('NOT_YET', 'CLOSE', 'YES');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "requiredEntitlement" "Entitlement" NOT NULL DEFAULT 'FREE',

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSubmission" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "submissionUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeerReview" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "correctness" INTEGER NOT NULL,
    "efficiency" INTEGER NOT NULL,
    "readability" INTEGER NOT NULL,
    "wouldHire" "HireVerdict" NOT NULL,
    "comment" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PeerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pairedWithId" TEXT,
    "roomUrl" TEXT,
    "scheduledAt" TIMESTAMP(3),

    CONSTRAINT "MockRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockFeedback" (
    "id" TEXT NOT NULL,
    "mockRequestId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "rateeId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "quote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GdSession" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "roomUrl" TEXT NOT NULL,
    "minParticipants" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "GdSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GdParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "speakingSeconds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GdParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GdRating" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "rateeId" TEXT NOT NULL,
    "clarity" INTEGER NOT NULL,
    "content" INTEGER NOT NULL,
    "courtesy" INTEGER NOT NULL,

    CONSTRAINT "GdRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSubmission_projectId_userId_key" ON "ProjectSubmission"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PeerReview_submissionId_reviewerId_key" ON "PeerReview"("submissionId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "MockRequest_pairedWithId_key" ON "MockRequest"("pairedWithId");

-- CreateIndex
CREATE UNIQUE INDEX "MockFeedback_mockRequestId_raterId_key" ON "MockFeedback"("mockRequestId", "raterId");

-- CreateIndex
CREATE UNIQUE INDEX "GdParticipant_sessionId_userId_key" ON "GdParticipant"("sessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "GdRating_sessionId_raterId_rateeId_key" ON "GdRating"("sessionId", "raterId", "rateeId");

-- AddForeignKey
ALTER TABLE "ProjectSubmission" ADD CONSTRAINT "ProjectSubmission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSubmission" ADD CONSTRAINT "ProjectSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerReview" ADD CONSTRAINT "PeerReview_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ProjectSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerReview" ADD CONSTRAINT "PeerReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockRequest" ADD CONSTRAINT "MockRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockRequest" ADD CONSTRAINT "MockRequest_pairedWithId_fkey" FOREIGN KEY ("pairedWithId") REFERENCES "MockRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockFeedback" ADD CONSTRAINT "MockFeedback_mockRequestId_fkey" FOREIGN KEY ("mockRequestId") REFERENCES "MockRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockFeedback" ADD CONSTRAINT "MockFeedback_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockFeedback" ADD CONSTRAINT "MockFeedback_rateeId_fkey" FOREIGN KEY ("rateeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GdParticipant" ADD CONSTRAINT "GdParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GdSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GdParticipant" ADD CONSTRAINT "GdParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GdRating" ADD CONSTRAINT "GdRating_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GdSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GdRating" ADD CONSTRAINT "GdRating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GdRating" ADD CONSTRAINT "GdRating_rateeId_fkey" FOREIGN KEY ("rateeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

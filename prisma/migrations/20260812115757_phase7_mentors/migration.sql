-- CreateEnum
CREATE TYPE "MentorSessionKind" AS ENUM ('MOCK', 'HR_ROUND', 'COUNSELLING');

-- CreateEnum
CREATE TYPE "MentorSessionStatus" AS ENUM ('BOOKED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "MentorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specializations" TEXT[],
    "bio" TEXT NOT NULL,
    "capacityPerDay" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "MentorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorAvailability" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MentorAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorSession" (
    "id" TEXT NOT NULL,
    "kind" "MentorSessionKind" NOT NULL,
    "mentorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "roomUrl" TEXT,
    "status" "MentorSessionStatus" NOT NULL DEFAULT 'BOOKED',
    "notes" TEXT,

    CONSTRAINT "MentorSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorScorecard" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "technical" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "problemSolving" INTEGER NOT NULL,
    "confidence" INTEGER NOT NULL,
    "verdict" "HireVerdict" NOT NULL,
    "writtenFeedback" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorScorecard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MentorProfile_userId_key" ON "MentorProfile"("userId");

-- CreateIndex
CREATE INDEX "MentorAvailability_mentorId_startsAt_idx" ON "MentorAvailability"("mentorId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "MentorSession_slotId_key" ON "MentorSession"("slotId");

-- CreateIndex
CREATE INDEX "MentorSession_studentId_idx" ON "MentorSession"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "MentorScorecard_sessionId_key" ON "MentorScorecard"("sessionId");

-- AddForeignKey
ALTER TABLE "MentorProfile" ADD CONSTRAINT "MentorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorAvailability" ADD CONSTRAINT "MentorAvailability_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorSession" ADD CONSTRAINT "MentorSession_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorSession" ADD CONSTRAINT "MentorSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorSession" ADD CONSTRAINT "MentorSession_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "MentorAvailability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorScorecard" ADD CONSTRAINT "MentorScorecard_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MentorSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

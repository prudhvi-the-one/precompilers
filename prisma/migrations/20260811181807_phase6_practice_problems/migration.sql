-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "SubmissionVerdict" AS ENUM ('ACCEPTED', 'WRONG_ANSWER', 'RUNTIME_ERROR', 'COMPILE_ERROR');

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "companies" TEXT[],
    "statement" TEXT NOT NULL,
    "examples" JSONB NOT NULL,
    "constraints" TEXT NOT NULL,
    "hints" TEXT NOT NULL,
    "solutionExplanation" TEXT NOT NULL,
    "requiredEntitlement" "Entitlement" NOT NULL DEFAULT 'FREE',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "isSample" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "verdict" "SubmissionVerdict" NOT NULL,
    "passedCount" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "runtimeMs" INTEGER,
    "memoryKb" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");

-- CreateIndex
CREATE INDEX "TestCase_problemId_idx" ON "TestCase"("problemId");

-- CreateIndex
CREATE INDEX "Submission_userId_problemId_idx" ON "Submission"("userId", "problemId");

-- CreateIndex
CREATE INDEX "Comment_problemId_idx" ON "Comment"("problemId");

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "CompanyQuestionCategory" AS ENUM ('BEHAVIORAL', 'TECHNICAL', 'HR');

-- CreateTable
CREATE TABLE "CompanyQuestion" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "category" "CompanyQuestionCategory" NOT NULL,
    "question" TEXT NOT NULL,
    "guidance" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "authorId" TEXT,
    "reviewedById" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyQuestion_status_idx" ON "CompanyQuestion"("status");

-- CreateIndex
CREATE INDEX "CompanyQuestion_authorId_idx" ON "CompanyQuestion"("authorId");

-- CreateIndex
CREATE INDEX "CompanyQuestion_companyName_idx" ON "CompanyQuestion"("companyName");

-- AddForeignKey
ALTER TABLE "CompanyQuestion" ADD CONSTRAINT "CompanyQuestion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyQuestion" ADD CONSTRAINT "CompanyQuestion_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Drive" ADD COLUMN     "eligibleBranches" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "hiringBarScore" INTEGER,
ADD COLUMN     "maxBacklogs" INTEGER,
ADD COLUMN     "minCgpa" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "backlogCount" INTEGER DEFAULT 0,
ADD COLUMN     "cgpa" DOUBLE PRECISION;

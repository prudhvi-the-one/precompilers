-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'DRIVE_ELIGIBILITY_CHANGED';

-- CreateTable
CREATE TABLE "DriveEligibilityWatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriveEligibilityWatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriveEligibilityWatch_userId_driveId_key" ON "DriveEligibilityWatch"("userId", "driveId");

-- AddForeignKey
ALTER TABLE "DriveEligibilityWatch" ADD CONSTRAINT "DriveEligibilityWatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveEligibilityWatch" ADD CONSTRAINT "DriveEligibilityWatch_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "Drive"("id") ON DELETE CASCADE ON UPDATE CASCADE;

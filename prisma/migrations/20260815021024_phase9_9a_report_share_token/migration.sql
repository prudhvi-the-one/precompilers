-- AlterTable
ALTER TABLE "User" ADD COLUMN "reportShareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_reportShareToken_key" ON "User"("reportShareToken");

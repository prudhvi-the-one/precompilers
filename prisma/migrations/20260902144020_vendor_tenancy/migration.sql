-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'VENDOR_ADMIN';

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "vendorId" TEXT;

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "ratePaisePerStudent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Batch_vendorId_idx" ON "Batch"("vendorId");

-- CreateIndex
CREATE INDEX "User_vendorId_role_idx" ON "User"("vendorId", "role");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "VendorBillingStatus" AS ENUM ('FINALIZED', 'INVOICED');

-- CreateTable
CREATE TABLE "VendorBillingRecord" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "periodMonth" TEXT NOT NULL,
    "activeStudentCount" INTEGER NOT NULL,
    "ratePaisePerStudent" INTEGER NOT NULL,
    "totalAmountPaise" INTEGER NOT NULL,
    "status" "VendorBillingStatus" NOT NULL DEFAULT 'FINALIZED',
    "finalizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorBillingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loggedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorBillingRecord_vendorId_periodMonth_key" ON "VendorBillingRecord"("vendorId", "periodMonth");

-- CreateIndex
CREATE INDEX "LoginEvent_userId_loggedInAt_idx" ON "LoginEvent"("userId", "loggedInAt");

-- AddForeignKey
ALTER TABLE "VendorBillingRecord" ADD CONSTRAINT "VendorBillingRecord_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginEvent" ADD CONSTRAINT "LoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

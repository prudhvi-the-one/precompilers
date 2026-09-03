-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rollNumber" TEXT;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "selfSignupEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "signupSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_vendorId_rollNumber_key" ON "User"("vendorId", "rollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_signupSlug_key" ON "Vendor"("signupSlug");


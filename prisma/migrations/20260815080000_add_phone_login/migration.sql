-- AlterEnum
ALTER TYPE "OtpPurpose" ADD VALUE 'PHONE_LOGIN';

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

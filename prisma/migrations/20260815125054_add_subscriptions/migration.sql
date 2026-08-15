-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('PRACTICE', 'LEARN', 'FULL_ACCESS');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('CREATED', 'ACTIVE', 'FAILED');

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'CREATED',
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_razorpayOrderId_key" ON "Subscription"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

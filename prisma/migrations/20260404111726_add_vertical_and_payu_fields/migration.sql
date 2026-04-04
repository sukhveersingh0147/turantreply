-- AlterTable
ALTER TABLE "User" ADD COLUMN "businessType" TEXT,
ADD COLUMN "businessName" TEXT,
ADD COLUMN "dashboardSeeded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "payuSubscriptionId" TEXT,
ADD COLUMN "payuPaymentId" TEXT,
ADD COLUMN "payuOrderId" TEXT,
ADD COLUMN "autopayEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "planId" TEXT,
ADD COLUMN "trialEndsAt" TIMESTAMP(3),
ADD COLUMN "isTrialActive" BOOLEAN NOT NULL DEFAULT false;

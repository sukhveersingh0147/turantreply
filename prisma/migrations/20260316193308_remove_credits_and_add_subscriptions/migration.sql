/*
  Warnings:

  - You are about to drop the column `included_credits` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `Credit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreditTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Credit" DROP CONSTRAINT "Credit_userId_fkey";

-- DropForeignKey
ALTER TABLE "CreditTransaction" DROP CONSTRAINT "CreditTransaction_userId_fkey";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "trialConversationsToday" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ALTER COLUMN "plan" SET DEFAULT 'TRIAL';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "appointmentTime" TIMESTAMP(3),
ADD COLUMN     "conversationSummary" TEXT,
ADD COLUMN     "customerInterest" TEXT,
ADD COLUMN     "leadStage" TEXT,
ADD COLUMN     "leadType" TEXT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "included_credits";

-- DropTable
DROP TABLE "Credit";

-- DropTable
DROP TABLE "CreditTransaction";

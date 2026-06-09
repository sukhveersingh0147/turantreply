import { prisma } from "../config/prisma";

export type PlanName = "FREE" | "STARTER" | "GROWTH" | "PRO";

export const PLAN_DETAILS: Record<PlanName, { price: number }> = {
    FREE: { price: 0 },
    STARTER: { price: 999 },
    GROWTH: { price: 2499 },
    PRO: { price: 4999 },
};

export class SubscriptionService {
    /**
     * Activate a new subscription for a user.
     */
    static async activateSubscription(userId: string, planName: PlanName): Promise<void> {
        const plan = PLAN_DETAILS[planName];
        if (!plan) throw new Error("Invalid plan name");

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await prisma.$transaction(async (tx: any) => {
            // Update Business plan info
            await tx.business.update({
                where: { userId },
                data: {
                    plan: planName,
                    subscriptionStatus: "ACTIVE",
                    subscriptionExpiresAt: expiresAt,
                    lastPayment: new Date(),
                },
            });

            // Create Subscription record
            await tx.subscription.create({
                data: {
                    userId,
                    plan_name: planName,
                    price: plan.price,
                    status: "active",
                    renewal_date: expiresAt,
                },
            });
        }, {
            maxWait: 15000,
            timeout: 30000
        });
    }

    /**
     * Check if a subscription is expired and update status if necessary.
     */
    static async checkAndExpireSubscription(userId: string): Promise<boolean> {
        const business = await prisma.business.findUnique({
            where: { userId },
        });

        if (!business || !business.subscriptionExpiresAt) return true;

        const isExpired = new Date() > business.subscriptionExpiresAt;

        if (isExpired && business.subscriptionStatus !== "EXPIRED") {
            await prisma.business.update({
                where: { userId },
                data: { subscriptionStatus: "EXPIRED" },
            });

            // Also update the active subscription record
            await prisma.subscription.updateMany({
                where: { userId, status: "active" },
                data: { status: "expired" },
            });
        }

        return isExpired;
    }
}

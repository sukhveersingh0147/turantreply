import { prisma } from "@/lib/prisma";

export type PlanName = "STARTER" | "GROWTH" | "PRO" | "FREE";

export const PLAN_DETAILS: Record<Exclude<PlanName, "FREE">, { price: number; features: string[] }> = {
    STARTER: {
        price: 999,
        features: ["WhatsApp automation", "AI auto reply", "Lead capture", "Basic analytics"]
    },
    GROWTH: {
        price: 2499,
        features: ["Everything in Starter", "Advanced analytics", "Appointment booking", "Lead scoring", "Automation rules"]
    },
    PRO: {
        price: 4999,
        features: ["Everything in Growth", "Advanced AI responses", "Multi-channel support", "Priority support", "Custom automation flows"]
    },
};

export class SubscriptionService {
    /**
     * Activate a new subscription for a user.
     */
    static async activateSubscription(userId: string, planName: Exclude<PlanName, "FREE">): Promise<void> {
        const plan = PLAN_DETAILS[planName];
        if (!plan) throw new Error("Invalid plan name");

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await prisma.$transaction(async (tx) => {
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
        });
    }

    /**
     * Check if a subscription is expired and update status if necessary.
     */
    static async checkAndExpireSubscription(userId: string): Promise<boolean> {
        const business = await prisma.business.findUnique({
            where: { userId },
        });

        if (!business || business.plan === "FREE") return false;

        const now = new Date();
        let isExpired = false;

        if (business.subscriptionExpiresAt) {
            isExpired = now > business.subscriptionExpiresAt;
        }

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

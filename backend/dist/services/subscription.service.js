"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = exports.PLAN_DETAILS = void 0;
const prisma_1 = require("../config/prisma");
exports.PLAN_DETAILS = {
    FREE: { price: 0 },
    STARTER: { price: 999 },
    GROWTH: { price: 2499 },
    PRO: { price: 4999 },
};
class SubscriptionService {
    /**
     * Activate a new subscription for a user.
     */
    static async activateSubscription(userId, planName) {
        const plan = exports.PLAN_DETAILS[planName];
        if (!plan)
            throw new Error("Invalid plan name");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await prisma_1.prisma.$transaction(async (tx) => {
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
    static async checkAndExpireSubscription(userId) {
        const business = await prisma_1.prisma.business.findUnique({
            where: { userId },
        });
        if (!business || !business.subscriptionExpiresAt)
            return true;
        const isExpired = new Date() > business.subscriptionExpiresAt;
        if (isExpired && business.subscriptionStatus !== "EXPIRED") {
            await prisma_1.prisma.business.update({
                where: { userId },
                data: { subscriptionStatus: "EXPIRED" },
            });
            // Also update the active subscription record
            await prisma_1.prisma.subscription.updateMany({
                where: { userId, status: "active" },
                data: { status: "expired" },
            });
        }
        return isExpired;
    }
}
exports.SubscriptionService = SubscriptionService;

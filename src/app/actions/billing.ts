"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from "@/config/subscription";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createCheckoutOrder(planKey: SubscriptionPlan) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const plan = SUBSCRIPTION_PLANS[planKey];
    if (!plan || plan.price === 0) throw new Error("Invalid plan or free plan");

    const options = {
        amount: plan.price * 100, // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_${Date.now()}_${session.user.id.slice(-5)}`,
        notes: {
            plan: planKey,
            userId: session.user.id,
        },
    };

    // Fallback for development/placeholders
    if (process.env.RAZORPAY_KEY_ID === "rzp_test_placeholder") {
        console.warn("Using placeholder Razorpay Key. Returning mock order.");
        return {
            id: `order_mock_${Date.now()}`,
            amount: options.amount,
            currency: options.currency,
            isMock: true
        };
    }

    try {
        const order = await razorpay.orders.create(options);
        return {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        };
    } catch (error: any) {
        console.error("Razorpay order creation failed. Error details:", {
            message: error.message,
            metadata: error.metadata,
            statusCode: error.statusCode,
        });
        throw new Error(`Failed to create payment order: ${error.message}`);
    }
}

export async function verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    planKey: SubscriptionPlan;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const body = data.razorpay_order_id + "|" + data.razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === data.razorpay_signature;

    if (isAuthentic) {
        // Update business subscription
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month validity

        await prisma.business.update({
            where: { userId: session.user.id },
            data: {
                plan: data.planKey,
                subscriptionStatus: "ACTIVE",
                subscriptionExpiresAt: expiryDate,
                lastPayment: new Date(),
            },
        });

        revalidatePath("/settings");
        return { success: true };
    } else {
        throw new Error("Payment verification failed");
    }
}

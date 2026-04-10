"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from "@/config/subscription";

// Lazy initialize Razorpay to avoid build-time errors when keys are missing
let razorpayInstance: Razorpay | null = null;
const getRazorpay = () => {
    if (razorpayInstance) return razorpayInstance;
    
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_id.startsWith('rzp_')) {
        console.warn("Razorpay keys missing or invalid. Payments will not work.");
        // Return a dummy object for build-time safety if needed, 
        // but the code should ideally handle this at runtime.
    }

    razorpayInstance = new Razorpay({
        key_id: key_id || 'rzp_test_placeholder',
        key_secret: key_secret || 'placeholder_secret',
    });
    return razorpayInstance;
};

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
            type: "PLAN",
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
        const order = await getRazorpay().orders.create(options);
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
    
    // Allow mock verification
    const isMock = data.razorpay_order_id.startsWith("order_mock_") && data.razorpay_signature === "mock_signature";
    
    const expectedSignature = isMock ? "mock_signature" : crypto
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

        // ──────────────────────────────────────────────────────────
        // AFFILIATE COMMISSION LOGIC
        // ──────────────────────────────────────────────────────────
        try {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { referredById: true }
            });

            if (user?.referredById) {
                const affiliate = await prisma.affiliate.findUnique({
                    where: { userId: user.referredById }
                });

                if (affiliate && affiliate.status === "ACTIVE") {
                    const plan = SUBSCRIPTION_PLANS[data.planKey];
                    const commissionAmount = plan.price * 0.30; // 30% commission

                    await prisma.$transaction([
                        prisma.commission.create({
                            data: {
                                affiliateId: affiliate.id,
                                userId: session.user.id,
                                amount: commissionAmount,
                                status: "PENDING",
                            }
                        }),
                        prisma.affiliate.update({
                            where: { id: affiliate.id },
                            data: {
                                earningsTotal: { increment: commissionAmount },
                                earningsPending: { increment: commissionAmount },
                            }
                        }),
                        prisma.notification.create({
                            data: {
                                userId: affiliate.userId,
                                title: "New Commission! 💰",
                                message: `You earned ₹${commissionAmount.toFixed(2)} from a referral's ${plan.name} plan purchase.`,
                                type: "SUCCESS",
                                link: "/affiliate"
                            }
                        })
                    ]);
                }
            }
        } catch (affiliateError) {
            console.error("Affiliate commission processing failed:", affiliateError);
            // Don't fail the main payment because of affiliate logic
        }

        revalidatePath("/settings");
        return { success: true };
    } else {
        throw new Error("Payment verification failed");
    }
}
export async function getBusinessForCheckout() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
        select: {
            name: true,
            user: {
                select: { email: true }
            }
        }
    });

    return business;
}

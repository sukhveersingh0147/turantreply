import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
            return new NextResponse("Invalid Signature Configuration", { status: 400 });
        }

        // Verify Signature
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest("hex");

        if (signature !== expectedSignature) {
            console.error("Invalid Webhook Signature");
            return new NextResponse("Invalid Signature", { status: 400 });
        }

        const event = JSON.parse(body);
        console.log("[RAZORPAY_WEBHOOK]", event.event);

        // Handle specific events
        if (event.event === "order.paid") {
            const { notes } = event.payload.payment.entity; // Razorpay usually sends payment entity in order.paid or use payment.captured
            const { userId, type, plan } = notes || {};

            if (userId) {
                if (type === "PLAN" && plan) {
                    const { SubscriptionService } = await import("@/services/subscription.service");
                    await SubscriptionService.activateSubscription(userId, plan);
                    console.log(`Plan ${plan} activated for User ${userId}`);
                }

                // Log Payment
                const amount = event.payload.order.entity.amount / 100;
                await prisma.payment.create({
                    data: {
                        userId,
                        amount,
                        status: "SUCCESS",
                        payment_gateway: "razorpay",
                    },
                });

                // --- NEW: Affiliate Commission Logic ---
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { referredById: true }
                });

                if (user?.referredById) {
                    const affiliate = await prisma.affiliate.findUnique({
                        where: { userId: user.referredById }
                    });

                    if (affiliate && affiliate.status === "ACTIVE") {
                        const commissionAmount = amount * 0.30; // 30% Commission
                        await prisma.commission.create({
                            data: {
                                affiliateId: affiliate.id,
                                userId: userId,
                                amount: commissionAmount,
                                status: "PENDING",
                            }
                        });

                        // Update affiliate pending balance
                        await prisma.affiliate.update({
                            where: { id: affiliate.id },
                            data: {
                                earningsPending: { increment: commissionAmount }
                            }
                        });
                        console.log(`Commission of ${commissionAmount} created for Affiliate ${affiliate.id}`);
                    }
                }
                // ----------------------------------------
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("[RAZORPAY_WEBHOOK_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

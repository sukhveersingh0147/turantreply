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
            const { notes } = event.payload.order.entity;
            const { businessId, plan } = notes;

            if (businessId && plan) {
                // Update Business Plan in Database
                // Set expiry to 30 days from now
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);

                await prisma.business.update({
                    where: { id: businessId },
                    data: {
                        plan: plan.toUpperCase(),
                        subscriptionStatus: "ACTIVE",
                        subscriptionExpiresAt: expiresAt,
                        lastPayment: new Date(),
                    },
                });

                console.log(`Plan ${plan} activated for Business ${businessId}`);
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("[RAZORPAY_WEBHOOK_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

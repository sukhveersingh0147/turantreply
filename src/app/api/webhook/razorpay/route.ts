import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const payload = JSON.parse(body);
    const event = payload.event;
    
    console.log(`[RAZORPAY WEBHOOK] Received event: ${event}`);

    try {
        if (event === "payment_link.paid") {
            const paymentLink = payload.payload.payment_link.entity;
            const orderId = paymentLink.notes?.order_id;

            if (orderId) {
                // Fetch order and business to get the specific webhook secret
                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                    include: { business: true }
                });

                if (!order || !order.business) {
                    console.error(`[RAZORPAY WEBHOOK] Order ${orderId} or business not found`);
                    return NextResponse.json({ error: "Order not found" }, { status: 404 });
                }

                const webhookSecret = order.business.razorpayWebhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET;

                if (!webhookSecret) {
                    console.error("[RAZORPAY WEBHOOK] No webhook secret found for business or platform");
                    return NextResponse.json({ error: "Missing secret" }, { status: 500 });
                }

                // Verify signature
                const expectedSignature = crypto
                    .createHmac("sha256", webhookSecret)
                    .update(body)
                    .digest("hex");

                if (signature !== expectedSignature) {
                    console.error("[RAZORPAY WEBHOOK] Invalid signature");
                    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
                }

                console.log(`[RAZORPAY WEBHOOK] Marking order ${orderId} as PAID`);
                await prisma.order.update({
                    where: { id: orderId },
                    data: { 
                        paymentStatus: "PAID",
                        status: "CONFIRMED"
                    }
                });
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error: any) {
        console.error("[RAZORPAY WEBHOOK ERROR]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

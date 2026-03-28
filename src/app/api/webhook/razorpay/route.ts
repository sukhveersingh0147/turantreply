import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("[RAZORPAY WEBHOOK] Missing RAZORPAY_WEBHOOK_SECRET");
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

    const payload = JSON.parse(body);
    const event = payload.event;

    console.log(`[RAZORPAY WEBHOOK] Received event: ${event}`);

    try {
        if (event === "payment_link.paid") {
            const paymentLink = payload.payload.payment_link.entity;
            const orderId = paymentLink.notes?.order_id;

            if (orderId) {
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

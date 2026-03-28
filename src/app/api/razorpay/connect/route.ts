import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { keyId, keySecret, webhookSecret } = await req.json();

        if (!keyId || !keySecret) {
            return NextResponse.json({ error: "Key ID and Key Secret are required" }, { status: 400 });
        }

        // Update the business associated with the user
        await prisma.business.update({
            where: { userId: session.user.id },
            data: {
                razorpayKeyId: keyId,
                razorpayKeySecret: keySecret,
                razorpayWebhookSecret: webhookSecret || null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[RAZORPAY_CONNECT_POST]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.business.update({
            where: { userId: session.user.id },
            data: {
                razorpayKeyId: null,
                razorpayKeySecret: null,
                razorpayWebhookSecret: null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[RAZORPAY_CONNECT_DELETE]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

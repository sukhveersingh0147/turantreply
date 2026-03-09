import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

const PLAN_PRICES = {
    STARTER: 999 * 100, // In paise
    GROWTH: 2999 * 100,
    AGENCY: 9999 * 100,
};

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { plan } = await req.json();
        const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];

        if (!amount) {
            return new NextResponse("Invalid Plan", { status: 400 });
        }

        const business = await prisma.business.findUnique({
            where: { userId: session.user.id },
        });

        if (!business) {
            return new NextResponse("Business not found", { status: 404 });
        }

        // Create Razorpay Order
        const order = await razorpay.orders.create({
            amount,
            currency: "INR",
            receipt: `receipt_${business.id}_${Date.now()}`,
            notes: {
                businessId: business.id,
                plan: plan,
            },
        });

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error("[PAYMENT_CREATE_ORDER]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generatePayUHash, generateSIDetails, PAYU_CONFIG } from "@/lib/payu";
import { PLAN_DETAILS, PlanName } from "@/services/subscription.service";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { planName } = await req.json();
        const plan = PLAN_DETAILS[planName as keyof typeof PLAN_DETAILS];

        if (!plan) {
            return new NextResponse("Invalid plan", { status: 400 });
        }

        const txnid = `TR_${uuidv4().replace(/-/g, "").substring(0, 15)}`;
        const amount = plan.price.toString();
        const productinfo = `TurantReply ${planName} Subscription`;
        const firstname = session.user.name || "Customer";
        const email = session.user.email || "";

        const si_details = generateSIDetails(plan.price, planName);

        const params = {
            txnid,
            amount,
            productinfo,
            firstname,
            email,
            udf1: session.user.id, // Storing userId for webhook
            udf2: planName,
            si: "1",
            si_details,
        };

        const hash = generatePayUHash(params);

        // Pre-create the subscription record in PENDING state
        await prisma.subscription.create({
            data: {
                userId: session.user.id,
                plan_name: planName as PlanName,
                price: plan.price,
                status: "pending",
                payuOrderId: txnid,
            },
        });

        return NextResponse.json({
            ...params,
            key: PAYU_CONFIG.key,
            hash,
            surl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payu/webhook?status=success`,
            furl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payu/webhook?status=failure`,
            action: PAYU_CONFIG.baseUrl,
        });

    } catch (error) {
        console.error("[PAYU_INITIATE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

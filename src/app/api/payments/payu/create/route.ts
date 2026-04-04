import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { 
  generatePayUHash, 
  generateTxnId,
  getSIParams,
  PAYU_CONFIG,
  PLANS,
  PlanId
} from "@/lib/payu";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // 2. Parse body
    const { planId } = await req.json();
    
    if (!["starter", "growth", "agency"].includes(planId)) {
      return NextResponse.json(
        { error: "Invalid plan" }, 
        { status: 400 }
      );
    }

    const plan = PLANS[planId as PlanId];
    const user = session.user;

    // 3. Generate transaction ID
    const txnid = generateTxnId(user.id);

    // 4. Build PayU params
    const amount = plan.price.toFixed(2);
    const productinfo = `TurantReply-${plan.name}`;
    const firstname = user.name?.split(" ")[0] ?? "User";
    const email = user.email ?? "";

    // 5. Generate hash
    const hash = generatePayUHash({
      key:         PAYU_CONFIG.key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      salt:        PAYU_CONFIG.salt,
      udf1:        user.id,
      udf2:        planId,
      udf3:        txnid,
    });

    // 6. SI params for autopay
    const siParams = getSIParams(planId as PlanId);

    // 7. Save pending transaction to DB
    await prisma.payment.create({
      data: {
        userId:          user.id,
        amount:          plan.price,
        payment_gateway: "payu",
        status:          "PENDING",
        createdAt:       new Date(),
      }
    });

    // 8. Return all params for form submission
    return NextResponse.json({
      success: true,
      payuUrl: `${PAYU_CONFIG.baseUrl}/_payment`,
      params: {
        key:         PAYU_CONFIG.key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        phone:       "",  // optional
        surl:        PAYU_CONFIG.successUrl,
        furl:        PAYU_CONFIG.failureUrl,
        hash,
        service_provider: "payu_paisa",
        // SI autopay params
        ...siParams,
        // Pass planId + userId in udf fields
        // These come back in webhook
        udf1:        user.id,
        udf2:        planId,
        udf3:        txnid,
      }
    });
  } catch (error) {
    console.error("[PAYU_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

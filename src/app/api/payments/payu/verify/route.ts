import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayUHash, PAYU_CONFIG, PLANS } from "@/lib/payu";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse PayU response (form data)
    const formData = await req.formData();
    
    const status      = formData.get("status") as string;
    const txnid       = formData.get("txnid") as string;
    const amount      = formData.get("amount") as string;
    const email       = formData.get("email") as string;
    const firstname   = formData.get("firstname") as string;
    const productinfo = formData.get("productinfo") as string;
    const hash        = formData.get("hash") as string;
    const payuMoneyId = formData.get("payuMoneyId") as string;
    const mihpayid    = formData.get("mihpayid") as string;
    
    // udf fields we passed
    const userId  = formData.get("udf1") as string;
    const planId  = formData.get("udf2") as string;
    
    // SI subscription ID (for autopay)
    const siDetails = formData.get("si_details") as string;

    // 2. Verify hash
    const isValid = verifyPayUHash({
      salt:        PAYU_CONFIG.salt,
      status,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      key:         PAYU_CONFIG.key,
      receivedHash: hash,
      udf1:        userId,
      udf2:        planId,
      udf3:        txnid,
    });

    if (!isValid) {
      console.error("[PAYU_VERIFY] Hash mismatch", { txnid, userId });
      return NextResponse.redirect(
        new URL("/pricing?payment=tampered", process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // 3. Handle payment status
    if (status === "success") {
      const plan = PLANS[planId as keyof typeof PLANS];
      if (!plan) {
         console.error("[PAYU_VERIFY] Plan not found", planId);
         return NextResponse.redirect(new URL("/pricing?payment=failed", process.env.NEXT_PUBLIC_APP_URL!));
      }

      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);

      // Parse SI subscription ID if available
      let payuSubscriptionId: string | undefined;
      try {
        const si = JSON.parse(siDetails || "{}");
        payuSubscriptionId = si.si_token || si.subscription_id;
      } catch {}

      // 4. Find existing subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId },
        select: { id: true }
      });

      // 5. Upsert subscription
      await prisma.subscription.upsert({
        where:  { 
          id: existingSubscription?.id ?? "new_id_placeholder" // cuid generated if create
        },
        update: {
          plan_name:          plan.name,
          price:              plan.price,
          status:             "active",
          renewal_date:       renewalDate,
          planId,
          payuPaymentId:      mihpayid ?? payuMoneyId,
          payuSubscriptionId: payuSubscriptionId,
          autopayEnabled:     !!payuSubscriptionId,
          isTrialActive:      false,
          updatedAt:          new Date(),
        },
        create: {
          userId,
          plan_name:          plan.name,
          price:              plan.price,
          status:             "active",
          renewal_date:       renewalDate,
          planId,
          payuPaymentId:      mihpayid ?? payuMoneyId,
          payuSubscriptionId: payuSubscriptionId,
          autopayEnabled:     !!payuSubscriptionId,
          isTrialActive:      false,
          createdAt:          new Date(),
          updatedAt:          new Date(),
        }
      });

      // 6. Update Business plan
      await prisma.business.update({
        where:  { userId },
        data:   { 
          plan:                 planId.toUpperCase(),
          subscriptionStatus:   "ACTIVE",
          subscriptionExpiresAt: renewalDate,
          lastPayment:          new Date(),
          updatedAt:            new Date(),
        }
      });

      // 7. Update Payment record status
      await prisma.payment.updateMany({
        where: { 
          userId, 
          status: "PENDING",
          payment_gateway: "payu"
        },
        data: { status: "SUCCESS" }
      });

      // 8. Redirect to dashboard with success
      return NextResponse.redirect(
        new URL(
          "/overview?payment=success&plan=" + planId,
          process.env.NEXT_PUBLIC_APP_URL!
        )
      );

    } else {
      // Payment failed
      await prisma.payment.updateMany({
        where: { 
          userId, 
          status: "PENDING",
          payment_gateway: "payu"
        },
        data: { status: "FAILED" }
      });

      return NextResponse.redirect(
        new URL("/pricing?payment=failed", process.env.NEXT_PUBLIC_APP_URL!)
      );
    }
  } catch (error) {
    console.error("[PAYU_VERIFY_ERROR]", error);
    return NextResponse.redirect(
      new URL("/pricing?payment=failed", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}

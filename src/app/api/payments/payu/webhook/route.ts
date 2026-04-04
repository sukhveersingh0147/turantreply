import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayUHash, PAYU_CONFIG } from "@/lib/payu";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const status      = formData.get("status") as string;
    const txnid       = formData.get("txnid") as string;
    const amount      = formData.get("amount") as string;
    const email       = formData.get("email") as string;
    const firstname   = formData.get("firstname") as string;
    const productinfo = formData.get("productinfo") as string;
    const hash        = formData.get("hash") as string;
    const mihpayid    = formData.get("mihpayid") as string;
    const userId      = formData.get("udf1") as string;
    const planId      = formData.get("udf2") as string;

    // 1. Verify webhook hash
    const isValid = verifyPayUHash({
      salt:         PAYU_CONFIG.salt,
      status,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      key:          PAYU_CONFIG.key,
      receivedHash: hash,
      udf1:         userId,
      udf2:         planId,
      udf3:         txnid,
    });

    if (!isValid) {
      console.error("[PAYU_WEBHOOK] Hash mismatch:", txnid);
      return NextResponse.json(
        { error: "Hash mismatch" }, 
        { status: 400 }
      );
    }

    // 2. Handle different statuses
    if (status === "success") {
      // Recurring payment success
      // Extend subscription by 1 month
      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);

      await prisma.subscription.updateMany({
        where: { userId, status: "active" },
        data:  {
          renewal_date:   renewalDate,
          status:         "active",
          payuPaymentId:  mihpayid,
          updatedAt:      new Date(),
        }
      });

      await prisma.business.updateMany({
        where: { userId },
        data:  {
          subscriptionStatus:    "ACTIVE",
          subscriptionExpiresAt: renewalDate,
          lastPayment:           new Date(),
          updatedAt:             new Date(),
        }
      });

      // Log payment
      await prisma.payment.create({
        data: {
          userId,
          amount:          parseFloat(amount),
          payment_gateway: "payu",
          status:          "SUCCESS",
          createdAt:       new Date(),
        }
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId,
          title:   "Payment Successful ✅",
          message: `₹${amount} successfully deducted. Subscription renewed till ${renewalDate.toLocaleDateString("en-IN")}.`,
          type:    "SUCCESS",
          isRead:  false,
          createdAt: new Date(),
        }
      });

    } else if (status === "failure") {
      // Recurring payment failed
      await prisma.notification.create({
        data: {
          userId,
          title:   "Payment Failed ⚠️",
          message: `₹${amount} ka payment fail ho gaya. Please billing settings mein payment method update karein.`,
          type:    "WARNING",
          isRead:  false,
          createdAt: new Date(),
        }
      });

    } else if (status === "cancelled") {
      // User cancelled autopay
      await prisma.subscription.updateMany({
        where: { userId },
        data:  { 
          autopayEnabled: false,
          updatedAt:      new Date()
        }
      });

      await prisma.notification.create({
        data: {
          userId,
          title:   "Autopay Cancelled",
          message: "Aapka autopay cancel ho gaya. Current subscription period khatam hone tak service jaari rahegi.",
          type:    "INFO",
          isRead:  false,
          createdAt: new Date(),
        }
      });
    }

    // Always return 200 to PayU
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PAYU_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

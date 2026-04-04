import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    const business = await prisma.business.findUnique({
      where: { userId },
      select: { 
        plan: true, 
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        lastPayment: true
      }
    });

    return NextResponse.json({ subscription, business });
  } catch (error) {
    console.error("[SUBSCRIPTION_STATUS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

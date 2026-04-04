import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Update subscription record
    await prisma.subscription.updateMany({
      where: { userId, status: "active" },
      data:  { 
        autopayEnabled: false,
        updatedAt:      new Date()
      }
    });

    // 2. Create notification for user
    await prisma.notification.create({
      data: {
        userId,
        title:   "Autopay Cancelled",
        message: "Aapka autopay cancel ho gaya. Current subscription khatam hone tak service active rahegi.",
        type:    "INFO",
        isRead:  false,
        createdAt: new Date(),
      }
    });

    // TODO: If SI token exists, call PayU cancel_si_details API
    // This requires specific PayU SI API integration.
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CANCEL_AUTOPAY_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

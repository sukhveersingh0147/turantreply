import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { businessType, businessName, onboardingCompleted } = body;

    // Validate businessType
    const validTypes = ["salon", "gym", "coaching", "realestate", "restaurant", "other"];
    if (businessType && !validTypes.includes(businessType)) {
      return new NextResponse("Invalid business type", { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        businessType: businessType || null,
        businessName: businessName || null,
        onboardingCompleted: onboardingCompleted ?? true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ONBOARDING_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

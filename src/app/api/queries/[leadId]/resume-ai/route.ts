import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: { leadId: string } }
) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { leadId } = params;

    try {
        const business = await prisma.business.findFirst({
            where: { userId: session.user.id }
        });

        if (!business) return new NextResponse("Forbidden", { status: 403 });

        await prisma.lead.update({
            where: { id: leadId, businessId: business.id },
            data: {
                isAiPaused: false,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[RESUME_AI_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

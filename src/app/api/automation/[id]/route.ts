import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Force redeploy - Next.js 16 type alignment
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { triggerKeyword, responseMessage, isActive } = await request.json();

        const business = await prisma.business.findUnique({
            where: { userId: session.user.id },
        });

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const automation = await prisma.automation.update({
            where: {
                id,
                businessId: business.id // Security: ensure business owns this automation
            },
            data: {
                triggerKeyword,
                responseMessage,
                isActive,
            },
        });

        return NextResponse.json(automation);
    } catch (error) {
        console.error("Error updating automation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const business = await prisma.business.findUnique({
            where: { userId: session.user.id },
        });

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        await prisma.automation.delete({
            where: {
                id,
                businessId: business.id // Security: ensure business owns this automation
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting automation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

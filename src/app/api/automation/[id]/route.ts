import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// RELOAD_OBVIOUS_V3 - Next.js 15 Stable
export async function PATCH(
    request: NextRequest,
    context: any // NUCLEAR: Use any to bypass Vercel type mismatch
) {
    const params = await context.params;
    const { id } = params;
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
                businessId: business.id
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
    context: any // NUCLEAR
) {
    const params = await context.params;
    const { id } = params;
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
                businessId: business.id
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting automation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

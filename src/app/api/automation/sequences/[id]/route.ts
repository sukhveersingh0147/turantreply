import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// RELOAD_OBVIOUS_V3 - Next.js 15 Stable
export async function PATCH(request: NextRequest, context: any) {
    const params = await context.params;
    const { id } = params;
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, isActive, steps } = await request.json();

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id }
    });

    const sequence = await prisma.followUpSequence.findUnique({
        where: { id }
    });

    if (!sequence || sequence.businessId !== business?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await prisma.followUpSequence.update({
        where: { id },
        data: {
            name,
            isActive,
            steps: steps ? {
                deleteMany: {},
                create: steps.map((step: any, index: number) => ({
                    dayDelay: parseInt(step.dayDelay),
                    message: step.message,
                    order: index
                }))
            } : undefined
        },
        include: { steps: true }
    });

    return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, context: any) {
    const params = await context.params;
    const { id } = params;
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id }
    });

    const sequence = await prisma.followUpSequence.findUnique({
        where: { id }
    });

    if (!sequence || sequence.businessId !== business?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.followUpSequence.delete({
        where: { id }
    });

    return NextResponse.json({ success: true });
}

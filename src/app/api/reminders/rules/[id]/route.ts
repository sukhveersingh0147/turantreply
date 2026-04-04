import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = params;

    try {
        const body = await req.json();
        
        const business = await prisma.business.findFirst({
            where: { userId: session.user.id }
        });

        if (!business) return new NextResponse("Forbidden", { status: 403 });

        const rule = await prisma.automationRule.update({
            where: { id, businessId: business.id },
            data: { ...body, updatedAt: new Date() }
        });

        return NextResponse.json({ success: true, rule });

    } catch (error) {
        console.error("[RULE_UPDATE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = params;

    try {
        const business = await prisma.business.findFirst({
            where: { userId: session.user.id }
        });

        if (!business) return new NextResponse("Forbidden", { status: 403 });

        await prisma.automationRule.delete({
            where: { id, businessId: business.id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[RULE_DELETE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

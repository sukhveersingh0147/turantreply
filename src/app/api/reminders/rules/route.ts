import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { name, triggerStage, message, delayMinutes, isActive } = await req.json();
        
        const business = await prisma.business.findFirst({
            where: { userId: session.user.id }
        });

        if (!business) return new NextResponse("Forbidden", { status: 403 });

        const rule = await prisma.automationRule.create({
            data: {
                businessId: business.id,
                name,
                triggerStage,
                message,
                delayMinutes: parseInt(delayMinutes || "0"),
                isActive: isActive ?? true
            }
        });

        return NextResponse.json({ success: true, rule });

    } catch (error) {
        console.error("[RULES_POST_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const business = await prisma.business.findFirst({
            where: { userId: session.user.id }
        });

        if (!business) return new NextResponse("Forbidden", { status: 403 });

        const rules = await prisma.automationRule.findMany({
            where: { businessId: business.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ rules });

    } catch (error) {
        console.error("[RULES_GET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

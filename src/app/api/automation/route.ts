import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

        const automations = await prisma.automation.findMany({
            where: { businessId: business.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(automations);
    } catch (error) {
        console.error("Error fetching automations:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { triggerKeyword, responseMessage } = await req.json();

        if (!triggerKeyword || !responseMessage) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const business = await prisma.business.findUnique({
            where: { userId: session.user.id },
        });

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const automation = await prisma.automation.create({
            data: {
                businessId: business.id,
                triggerKeyword,
                responseMessage,
                isActive: true,
            },
        });

        return NextResponse.json(automation);
    } catch (error) {
        console.error("Error creating automation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

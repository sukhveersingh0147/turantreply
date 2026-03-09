import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
        include: { recoverySettings: true }
    });

    if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Return current settings or default if none exist
    return NextResponse.json(business.recoverySettings || {
        isEnabled: false,
        waitTimeMinutes: 30,
        message: "Hi! Sorry for the delay. How can I help you?"
    });
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isEnabled, waitTimeMinutes, message } = await req.json();

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id }
    });

    if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const settings = await prisma.leadRecovery.upsert({
        where: { businessId: business.id },
        update: {
            isEnabled,
            waitTimeMinutes: parseInt(waitTimeMinutes),
            message
        },
        create: {
            businessId: business.id,
            isEnabled,
            waitTimeMinutes: parseInt(waitTimeMinutes),
            message
        }
    });

    return NextResponse.json(settings);
}

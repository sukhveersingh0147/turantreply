import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id }
    });

    if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const sequences = await prisma.followUpSequence.findMany({
        where: { businessId: business.id },
        include: {
            steps: {
                orderBy: { order: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(sequences);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, steps } = await req.json();

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id }
    });

    if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const sequence = await prisma.followUpSequence.create({
        data: {
            businessId: business.id,
            name,
            steps: {
                create: steps.map((step: any, index: number) => ({
                    dayDelay: parseInt(step.dayDelay),
                    message: step.message,
                    order: index
                }))
            }
        },
        include: { steps: true }
    });

    return NextResponse.json(sequence);
}

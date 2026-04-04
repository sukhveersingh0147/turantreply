import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const business = await prisma.business.findFirst({
            where: { userId: session.user.id }
        });

        if (!business) {
            return NextResponse.json({ pendingCount: 0, pausedCount: 0 });
        }

        const businessId = business.id;

        const [pendingCount, pausedCount] = await Promise.all([
            // Pending: last interaction within 7 days, and last message was from customer
            // For stats, we'll use a slightly broader count and filter in UI if needed, 
            // but let's try to be precise about "needs attention"
            prisma.lead.count({
                where: {
                    businessId,
                    isAiPaused: false,
                    NOT: { tags: { has: "Resolved" } },
                    lastInteraction: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            }),
            prisma.lead.count({
                where: { businessId, isAiPaused: true }
            })
        ]);

        return NextResponse.json({
            pendingCount,
            pausedCount,
            totalCount: pendingCount + pausedCount
        });

    } catch (error) {
        console.error("[QUERIES_STATS_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

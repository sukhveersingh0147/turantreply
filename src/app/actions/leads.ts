"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getLeadsData() {
    const session = await auth();
    if (!session?.user?.id) return { leads: [], stats: { total: 0, newToday: 0 } };

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
    });

    if (!business) return { leads: [], stats: { total: 0, newToday: 0 } };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [leads, totalCount, newTodayCount] = await Promise.all([
        prisma.lead.findMany({
            where: { businessId: business.id },
            include: {
                messages: {
                    orderBy: { timestamp: "desc" },
                    take: 1,
                },
            },
            orderBy: { updatedAt: "desc" },
        }),
        prisma.lead.count({ where: { businessId: business.id } }),
        prisma.lead.count({
            where: {
                businessId: business.id,
                createdAt: { gte: today },
            },
        }),
    ]);

    return {
        leads: leads.map((l) => ({
            id: l.id,
            name: l.name || "Anonymous",
            phone: l.phone,
            query: l.lastQuery || "No query recorded",
            status: l.status,
            score: l.score,
            isAiPaused: l.isAiPaused,
            lastMsg: l.messages[0]?.message || "No messages yet",
            time: l.updatedAt,
            tags: l.status === "Recovered" ? ["Recovered"] : l.status === "Converted" ? ["Converted"] : ["Lead"],
        })),
        stats: {
            total: totalCount,
            newToday: newTodayCount,
        },
    };
}

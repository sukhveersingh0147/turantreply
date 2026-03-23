"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { getAccessibleBusiness } from "./settings";

export async function getLeadsData() {
    const session = await auth();
    if (!session?.user?.id) return { leads: [], stats: { total: 0, newToday: 0 } };

    const business = await getAccessibleBusiness();

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
            score: l.score || 0,
            isAiPaused: l.isAiPaused,
            interest: l.customerInterest || "Unknown",
            stage: l.leadStage || "NEW",
            summary: l.conversationSummary || "No summary available",
            lastMsg: l.messages[0]?.message || "No messages yet",
            time: l.updatedAt,
            lastInteraction: (l as any).lastInteraction,
            source: (l as any).source || "WhatsApp",
            tags: (l as any).tags || [],
        })),
        stats: {
            total: totalCount,
            newToday: newTodayCount,
        },
    };
}
export async function toggleAiPause(leadId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found or unauthorized");

    const lead = await prisma.lead.findUnique({
        where: { id: leadId, businessId: business.id },
    });

    if (!lead) {
        throw new Error("Lead not found or unauthorized");
    }

    const updated = await prisma.lead.update({
        where: { id: leadId },
        data: { isAiPaused: !lead.isAiPaused }
    });

    return updated.isAiPaused;
}

"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getAnalyticsData() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
    });

    if (!business) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const [
        totalLeads,
        recoveredLeads,
        totalMessages,
        aiMessages,
        recentLeads,
        recentMessages,
        appointmentCount,
        recentLeadsData
    ] = await Promise.all([
        prisma.lead.count({ where: { businessId: business.id } }),
        prisma.lead.count({ where: { businessId: business.id, status: "RECOVERING" } }), // Or "RECOVERED"
        prisma.message.count({ where: { businessId: business.id } }),
        prisma.message.count({ where: { businessId: business.id, senderType: { in: ["AI", "AI_FOLLOWUP"] } } }),
        prisma.lead.findMany({
            where: {
                businessId: business.id,
                createdAt: { gte: sevenDaysAgo }
            },
            select: { createdAt: true, status: true }
        }),
        prisma.message.findMany({
            where: {
                businessId: business.id,
                timestamp: { gte: sevenDaysAgo }
            },
            select: { timestamp: true }
        }),
        prisma.appointment.count({
            where: { businessId: business.id }
        }),
        prisma.lead.findMany({
            where: { businessId: business.id },
            orderBy: { updatedAt: "desc" },
            take: 5,
            select: { name: true, phone: true, status: true, lastQuery: true, updatedAt: true }
        })
    ]);

    // Format weekly data (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        const dayLabel = days[d.getDay()];
        const dateStr = d.toISOString().split('T')[0];

        const dayLeads = recentLeads.filter(l => l.createdAt.toISOString().split('T')[0] === dateStr);
        const dayMessages = recentMessages.filter(m => m.timestamp.toISOString().split('T')[0] === dateStr);

        return {
            day: dayLabel,
            leads: dayLeads.length,
            recovered: dayLeads.filter(l => l.status === "RECOVERING" || l.status === "RECOVERED").length,
            converted: dayLeads.filter(l => l.status === "CONVERTED").length,
        };
    });

    // Top Queries (using lastQuery from leads)
    const leadsWithQueries = await prisma.lead.findMany({
        where: { businessId: business.id, NOT: { lastQuery: null } },
        select: { lastQuery: true },
    });

    const queryCounts: Record<string, number> = {};
    leadsWithQueries.forEach(l => {
        const q = l.lastQuery?.trim() || "Unknown";
        queryCounts[q] = (queryCounts[q] || 0) + 1;
    });

    const topQueries = Object.entries(queryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([query, count]) => ({
            query,
            count,
            pct: Math.round((count / (totalLeads || 1)) * 100) || 10
        }));

    // Top performing items from appointments/orders
    const topItems = await (prisma as any).item.findMany({
        where: { businessId: business.id, isActive: true },
        orderBy: { appointments: { _count: 'desc' } }, 
        take: 3,
        select: { name: true, type: true, price: true }
    });

    return {
        stats: {
            totalLeads,
            recoveredLeads,
            totalMessages,
            conversionRate: totalLeads > 0 ? ((appointmentCount / totalLeads) * 100).toFixed(1) : "0",
            aiReplyRate: totalMessages > 0 ? ((aiMessages / totalMessages) * 100).toFixed(1) : "0"
        },
        weeklyData,
        topQueries,
        recentActivity: recentLeadsData.map((l: any) => ({
            name: l.name,
            phone: l.phone,
            status: l.status,
            query: l.lastQuery,
            time: l.updatedAt
        })),
        topItems
    };
}

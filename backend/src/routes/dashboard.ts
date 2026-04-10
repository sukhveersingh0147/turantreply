import { Router, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { SubscriptionService } from "../services/subscription.service";
import { startOfDay } from "date-fns";

export const dashboardRouter = Router();

dashboardRouter.get("/overview", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const businessId = req.businessId;

        if (!userId || !businessId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const business = await prisma.business.findUnique({
            where: { id: businessId },
            select: { id: true, name: true, plan: true, businessType: true, aiRepliesUsed: true, monthlyLimit: true, subscriptionStatus: true, subscriptionExpiresAt: true }
        });

        if (!business) {
            return res.status(404).json({ error: "Business not found" });
        }

        // Check subscription status
        await SubscriptionService.checkAndExpireSubscription(userId);

        const startOfToday = startOfDay(new Date());

        const [
            counts,
            hotLeads,
            appointmentsBooked,
            leadsToday,
            pendingReplies,
            conversions,
            orders,
            recentSuggestions,
            recentLeads,
            upcomingAppointments,
            dailyUsage
        ] = await Promise.all([
            prisma.business.findUnique({
                where: { id: businessId },
                select: { _count: { select: { leads: true, messages: true } } }
            }),
            prisma.lead.count({ where: { businessId, leadType: "Hot lead" } }),
            prisma.lead.count({ where: { businessId, leadType: "Appointment booked" } }),
            prisma.lead.count({ where: { businessId, createdAt: { gte: startOfToday } } }),
            prisma.lead.count({
                where: {
                    businessId,
                    status: { not: "CONVERTED" },
                    messages: { some: { senderType: "CUSTOMER" } }
                }
            }),
            prisma.lead.count({ where: { businessId, status: "CONVERTED" } }),
            prisma.order.findMany({
                where: { businessId, status: { not: "CANCELLED" } },
                select: { totalAmount: true }
            }),
            prisma.suggestion.findMany({
                where: { businessId, status: "PENDING" },
                take: 5,
                orderBy: { createdAt: "desc" }
            }),
            prisma.lead.findMany({
                where: { businessId },
                orderBy: { updatedAt: "desc" },
                take: 5,
                select: { name: true, phone: true, lastQuery: true, status: true, score: true, leadType: true }
            }),
            prisma.appointment.findMany({
                where: { businessId },
                include: { item: { select: { name: true, type: true } }, lead: { select: { name: true } } },
                orderBy: { startTime: "asc" },
                take: 5
            }),
            prisma.business.findUnique({
                where: { id: businessId },
                select: { trialConversationsToday: true }
            })
        ]);

        const revenue = orders.reduce((sum: number, order: { totalAmount: number }) => sum + order.totalAmount, 0);

        res.json({
            businessName: business.name,
            businessType: business.businessType || "OTHER",
            plan: business.plan,
            subscriptionStatus: business.subscriptionStatus,
            subscriptionExpiresAt: business.subscriptionExpiresAt,
            aiRepliesUsed: business.aiRepliesUsed,
            monthlyLimit: business.monthlyLimit,
            trialConversationsToday: dailyUsage?.trialConversationsToday || 0,
            stats: {
                totalLeads: (counts as any)?._count?.leads ?? 0,
                totalMessages: (counts as any)?._count?.messages ?? 0,
                hotLeads: hotLeads ?? 0,
                appointmentsBooked: appointmentsBooked ?? 0,
                leadsToday: leadsToday ?? 0,
                pendingReplies: pendingReplies ?? 0,
                conversions: conversions ?? 0,
                revenue: revenue ?? 0,
                estimatedValue: revenue || (((counts as any)?._count?.leads ?? 0) * 500),
            },
            suggestions: recentSuggestions,
            recentLeads: recentLeads.map((l: any) => ({
                ...l,
                name: l.name || "Anonymous",
                query: l.lastQuery || "No recent query"
            })),
            upcomingAppointments: upcomingAppointments.map((a: any) => ({
                id: a.id,
                customer: (a as any).lead?.name || "Anonymous",
                item: (a as any).item?.name || "Service",
                start: a.startTime,
                end: (a as any).endTime,
                status: a.status,
                type: (a as any).item?.type || "APPOINTMENT"
            }))
        });

    } catch (error) {
        console.error("[BACKEND_DASHBOARD_ERROR]", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

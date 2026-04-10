import { Router, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { startOfDay, endOfDay } from "date-fns";

export const systemRouter = Router();

// Sidebar Counts
systemRouter.get("/sidebar/counts", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const businessId = req.businessId;
        if (!businessId) return res.status(401).json({ error: "Unauthorized" });

        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);

        const [queries, appointments, reminders, inbox] = await Promise.all([
            // 1. Pending Queries (AI Paused leads)
            prisma.lead.count({ where: { businessId, isAiPaused: true } }),
            // 2. Today's Appointments
            prisma.appointment.count({
                where: { businessId, status: "SCHEDULED", startTime: { gte: todayStart, lte: todayEnd } }
            }),
            // 3. Pending Reminders (Follow-ups due today)
            prisma.lead.count({
                where: { businessId, nextFollowUpDate: { gte: todayStart, lte: todayEnd } }
            }),
            // 4. Unread Inbox (Recent inquiries from NEW leads)
            prisma.lead.count({ where: { businessId, status: "NEW" } }),
        ]);

        res.json({
            pendingQueries: queries,
            todayAppointments: appointments,
            pendingReminders: reminders,
            unreadInbox: inbox
        });
    } catch (error) {
        console.error("[BACKEND_SIDEBAR_COUNTS_ERROR]", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Reminders List
systemRouter.get("/reminders", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const businessId = req.businessId;
        if (!businessId) return res.status(401).json({ error: "Unauthorized" });

        const reminders = await prisma.lead.findMany({
            where: { 
                businessId,
                nextFollowUpDate: { not: null }
            },
            include: { messages: { take: 1, orderBy: { timestamp: "desc" } } },
            orderBy: { nextFollowUpDate: "asc" }
        });

        res.json(reminders);
    } catch (error) {
        console.error("[BACKEND_REMINDERS_ERROR]", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Queries List
systemRouter.get("/queries", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const businessId = req.businessId;
        if (!businessId) return res.status(401).json({ error: "Unauthorized" });

        const queries = await prisma.lead.findMany({
            where: { businessId, isAiPaused: true },
            orderBy: { updatedAt: "desc" }
        });

        res.json(queries);
    } catch (error) {
        console.error("[BACKEND_QUERIES_ERROR]", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

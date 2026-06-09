import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";

export const analyticsRouter = Router();

// Get analytics overview for a business
analyticsRouter.get("/", async (req: Request, res: Response) => {
    const businessId = req.query.businessId as string;

    if (!businessId) {
        res.status(400).json({ error: "Missing businessId parameter" });
        return;
    }

    try {
        const totalLeads = await prisma.lead.count({ where: { businessId } });
        const newLeads = await prisma.lead.count({ where: { businessId, status: "NEW" } });

        const totalMessages = await prisma.message.count({ where: { businessId } });

        res.json({
            totalLeads,
            newLeads,
            totalMessages,
        });
    } catch (error) {
        console.error("Failed to fetch analytics:", error);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});

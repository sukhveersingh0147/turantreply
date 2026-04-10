import { Router, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";

export const messagesRouter = Router();

// Get recent messages for a specific lead (Secured)
messagesRouter.get("/:leadId", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const businessId = req.businessId;
        const { leadId } = req.params;

        if (!businessId) return res.status(401).json({ error: "Unauthorized" });

        const messages = await prisma.message.findMany({
            where: { leadId: leadId as string, businessId },
            orderBy: { timestamp: "asc" },
            take: 100,
        });
        res.json({ messages });
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

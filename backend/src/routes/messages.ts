import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";

export const messagesRouter = Router();

// Get recent messages for a specific lead
messagesRouter.get("/:leadId", async (req: Request, res: Response) => {
    const { leadId } = req.params;

    try {
        const messages = await prisma.message.findMany({
            where: { leadId: leadId as string },
            orderBy: { timestamp: "asc" },
            take: 100,
        });
        res.json({ messages });
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

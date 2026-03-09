import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";

export const broadcastRouter = Router();

// Get all broadcasts for a business
broadcastRouter.get("/", async (req: Request, res: Response) => {
    const businessId = req.query.businessId as string;

    if (!businessId) {
        res.status(400).json({ error: "Missing businessId parameter" });
        return;
    }

    try {
        const broadcasts = await prisma.broadcast.findMany({
            where: { businessId },
            orderBy: { createdAt: "desc" },
        });
        res.json({ broadcasts });
    } catch (error) {
        console.error("Failed to fetch broadcasts:", error);
        res.status(500).json({ error: "Failed to fetch broadcasts" });
    }
});

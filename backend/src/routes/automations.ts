import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";

export const automationsRouter = Router();

// Get all automations for a business
automationsRouter.get("/", async (req: Request, res: Response) => {
    const businessId = req.query.businessId as string;

    if (!businessId) {
        res.status(400).json({ error: "Missing businessId parameter" });
        return;
    }

    try {
        const automations = await prisma.automation.findMany({
            where: { businessId },
            orderBy: { createdAt: "desc" },
        });
        res.json({ automations });
    } catch (error) {
        console.error("Failed to fetch automations:", error);
        res.status(500).json({ error: "Failed to fetch automations" });
    }
});

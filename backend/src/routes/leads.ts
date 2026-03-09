import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";

export const leadsRouter = Router();

// Get all leads for a business
leadsRouter.get("/", async (req: Request, res: Response) => {
    const businessId = req.query.businessId as string;

    if (!businessId) {
        res.status(400).json({ error: "Missing businessId parameter" });
        return;
    }

    try {
        const leads = await prisma.lead.findMany({
            where: { businessId },
            orderBy: { updatedAt: "desc" },
        });
        res.json({ leads });
    } catch (error) {
        console.error("Failed to fetch leads:", error);
        res.status(500).json({ error: "Failed to fetch leads" });
    }
});

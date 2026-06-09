import { Router, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";

export const leadsRouter = Router();

// Get all leads for a business (Secured)
leadsRouter.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const businessId = req.businessId;
        if (!businessId) return res.status(401).json({ error: "Unauthorized" });

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

// Update lead status
leadsRouter.patch("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const businessId = req.businessId;
        const { id } = req.params;
        const { status, name, isAiPaused } = req.body;

        if (!businessId) return res.status(401).json({ error: "Unauthorized" });

        const lead = await prisma.lead.update({
            where: { id: id as string },
            data: { status, name, isAiPaused }
        });

        res.json(lead);
    } catch (error) {
        console.error("Failed to update lead:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

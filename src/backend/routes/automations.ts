import { Router, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";

export const automationsRouter = Router();

// Get all automations (Secured)
automationsRouter.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const businessId = req.businessId;
        if (!businessId) return res.status(401).json({ error: "Unauthorized" });

        const automations = await prisma.automation.findMany({
            where: { businessId },
            orderBy: { createdAt: "desc" },
        });
        res.json({ automations });
    } catch (error) {
        console.error("[BACKEND_AUTOMATIONS_GET]", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Create Automation (Secured)
automationsRouter.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const businessId = req.businessId;
        if (!businessId) return res.status(401).json({ error: "Unauthorized" });

        const { triggerKeyword, responseMessage } = req.body;

        if (!triggerKeyword || !responseMessage) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const automation = await prisma.automation.create({
            data: {
                businessId,
                triggerKeyword,
                responseMessage,
                isActive: true,
            }
        });

        res.json(automation);
    } catch (error) {
        console.error("[BACKEND_AUTOMATIONS_POST]", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

import { Router, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { WhatsAppService } from "../services/whatsapp.service";

export const broadcastRouter = Router();

// Get all broadcasts (Secured)
broadcastRouter.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const businessId = req.businessId;
        if (!businessId) return res.status(401).json({ error: "Unauthorized" });

        const broadcasts = await prisma.broadcast.findMany({
            where: { businessId },
            orderBy: { createdAt: "desc" },
        });
        res.json(broadcasts);
    } catch (error) {
        console.error("[BACKEND_BROADCAST_GET]", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Create and Send Broadcast (Secured)
broadcastRouter.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const businessId = req.businessId;
        if (!businessId) return res.status(401).json({ error: "Unauthorized" });

        const { name, content, segment } = req.body;

        if (!name || !content) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const business = await prisma.business.findUnique({
            where: { id: businessId },
        });

        if (!business || !business.waToken || !business.waPhoneNumberId) {
            return res.status(400).json({ error: "WhatsApp configuration missing" });
        }

        // 1. Fetch leads based on segment
        let whereClause: any = { businessId };
        if (segment === "new") {
            whereClause.status = "NEW";
        }

        const leads = await prisma.lead.findMany({ where: whereClause });

        if (leads.length === 0) {
            return res.status(404).json({ error: "No leads found for this segment" });
        }

        // 2. Create Broadcast record
        const broadcast = await prisma.broadcast.create({
            data: {
                businessId,
                name,
                content,
                status: "SENDING",
                sentCount: 0,
            },
        });

        // 3. Send messages
        const waService = new WhatsAppService(business.waToken, business.waPhoneNumberId);
        let successCount = 0;

        // Note: In production, this should be a background task (e.g. BullMQ)
        for (const lead of leads) {
            try {
                const personalizedMsg = content.replace(/{{name}}/g, lead.name || "Customer");
                await waService.sendTextMessage(lead.phone, personalizedMsg);

                try {
                    await prisma.message.create({
                        data: {
                            businessId,
                            leadId: lead.id,
                            message: personalizedMsg,
                            sender: "BUSINESS",
                            senderType: "AI",
                        }
                    });
                } catch (msgErr: any) {
                    if (msgErr.code !== 'P2002') console.error("Msg save err:", msgErr.message);
                }

                successCount++;
            } catch (err) {
                console.error(`Failed broadcast to ${lead.phone}:`, err);
            }
        }

        // 4. Finalize
        const updatedBroadcast = await prisma.broadcast.update({
            where: { id: broadcast.id },
            data: { status: "COMPLETED", sentCount: successCount },
        });

        res.json(updatedBroadcast);
    } catch (error) {
        console.error("[BACKEND_BROADCAST_POST]", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

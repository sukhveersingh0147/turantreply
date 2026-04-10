import { Router, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";

export const paymentsRouter = Router();

// Connect Razorpay
paymentsRouter.post("/razorpay/connect", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { keyId, keySecret, webhookSecret } = req.body;

        if (!keyId || !keySecret) {
            return res.status(400).json({ error: "Key ID and Key Secret are required" });
        }

        await prisma.business.update({
            where: { userId },
            data: {
                razorpayKeyId: keyId,
                razorpayKeySecret: keySecret,
                razorpayWebhookSecret: webhookSecret || null,
            },
        });

        res.json({ success: true });
    } catch (error) {
        console.error("[BACKEND_RAZORPAY_CONNECT_POST]", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Disconnect Razorpay
paymentsRouter.delete("/razorpay/connect", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        await prisma.business.update({
            where: { userId },
            data: {
                razorpayKeyId: null,
                razorpayKeySecret: null,
                razorpayWebhookSecret: null,
            },
        });

        res.json({ success: true });
    } catch (error) {
        console.error("[BACKEND_RAZORPAY_CONNECT_DELETE]", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

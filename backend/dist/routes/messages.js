"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
exports.messagesRouter = (0, express_1.Router)();
// Get recent messages for a specific lead
exports.messagesRouter.get("/:leadId", async (req, res) => {
    const { leadId } = req.params;
    try {
        const messages = await prisma_1.prisma.message.findMany({
            where: { leadId: leadId },
            orderBy: { timestamp: "asc" },
            take: 100,
        });
        res.json({ messages });
    }
    catch (error) {
        console.error("Failed to fetch messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

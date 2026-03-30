"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
exports.broadcastRouter = (0, express_1.Router)();
// Get all broadcasts for a business
exports.broadcastRouter.get("/", async (req, res) => {
    const businessId = req.query.businessId;
    if (!businessId) {
        res.status(400).json({ error: "Missing businessId parameter" });
        return;
    }
    try {
        const broadcasts = await prisma_1.prisma.broadcast.findMany({
            where: { businessId },
            orderBy: { createdAt: "desc" },
        });
        res.json({ broadcasts });
    }
    catch (error) {
        console.error("Failed to fetch broadcasts:", error);
        res.status(500).json({ error: "Failed to fetch broadcasts" });
    }
});

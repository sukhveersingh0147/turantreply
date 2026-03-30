"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.automationsRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
exports.automationsRouter = (0, express_1.Router)();
// Get all automations for a business
exports.automationsRouter.get("/", async (req, res) => {
    const businessId = req.query.businessId;
    if (!businessId) {
        res.status(400).json({ error: "Missing businessId parameter" });
        return;
    }
    try {
        const automations = await prisma_1.prisma.automation.findMany({
            where: { businessId },
            orderBy: { createdAt: "desc" },
        });
        res.json({ automations });
    }
    catch (error) {
        console.error("Failed to fetch automations:", error);
        res.status(500).json({ error: "Failed to fetch automations" });
    }
});

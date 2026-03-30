"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
exports.analyticsRouter = (0, express_1.Router)();
// Get analytics overview for a business
exports.analyticsRouter.get("/", async (req, res) => {
    const businessId = req.query.businessId;
    if (!businessId) {
        res.status(400).json({ error: "Missing businessId parameter" });
        return;
    }
    try {
        const totalLeads = await prisma_1.prisma.lead.count({ where: { businessId } });
        const newLeads = await prisma_1.prisma.lead.count({ where: { businessId, status: "NEW" } });
        const totalMessages = await prisma_1.prisma.message.count({ where: { businessId } });
        res.json({
            totalLeads,
            newLeads,
            totalMessages,
        });
    }
    catch (error) {
        console.error("Failed to fetch analytics:", error);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});

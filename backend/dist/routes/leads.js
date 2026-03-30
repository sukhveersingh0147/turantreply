"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadsRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
exports.leadsRouter = (0, express_1.Router)();
// Get all leads for a business
exports.leadsRouter.get("/", async (req, res) => {
    const businessId = req.query.businessId;
    if (!businessId) {
        res.status(400).json({ error: "Missing businessId parameter" });
        return;
    }
    try {
        const leads = await prisma_1.prisma.lead.findMany({
            where: { businessId },
            orderBy: { updatedAt: "desc" },
        });
        res.json({ leads });
    }
    catch (error) {
        console.error("Failed to fetch leads:", error);
        res.status(500).json({ error: "Failed to fetch leads" });
    }
});

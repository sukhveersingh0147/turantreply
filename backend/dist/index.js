"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const webhook_1 = require("./routes/webhook");
const leads_1 = require("./routes/leads");
const messages_1 = require("./routes/messages");
const automations_1 = require("./routes/automations");
const broadcast_1 = require("./routes/broadcast");
const analytics_1 = require("./routes/analytics");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 4000;
// ─── Security & Middleware ─────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express_1.default.json({ limit: "10mb" }));
// ─── Rate Limiting ────────────────────────────────────────
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api", apiLimiter);
// ─── Routes ───────────────────────────────────────────────
app.use("/api/webhook", webhook_1.webhookRouter);
app.use("/api/leads", leads_1.leadsRouter);
app.use("/api/messages", messages_1.messagesRouter);
app.use("/api/automations", automations_1.automationsRouter);
app.use("/api/broadcast", broadcast_1.broadcastRouter);
app.use("/api/analytics", analytics_1.analyticsRouter);
// ─── Health Check ─────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "Turant Reply Backend", ts: new Date().toISOString() });
});
// ─── Global Error Handler ─────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});
(async () => {
    try {
        // Start follow-up queue worker
        // const { startFollowUpWorker } = await import("./queues/followUp.queue");
        // startFollowUpWorker();
        app.listen(PORT, () => {
            console.log(`🚀 Turant Reply Backend running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
})();
exports.default = app;

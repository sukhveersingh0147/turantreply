import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { webhookRouter } from "./routes/webhook";
import { leadsRouter } from "./routes/leads";
import { messagesRouter } from "./routes/messages";
import { automationsRouter } from "./routes/automations";
import { broadcastRouter } from "./routes/broadcast";
import { analyticsRouter } from "./routes/analytics";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;

// ─── Security & Middleware ─────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json({ limit: "10mb" }));

// ─── Rate Limiting ────────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api", apiLimiter);

// ─── Routes ───────────────────────────────────────────────
app.use("/api/webhook", webhookRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/automations", automationsRouter);
app.use("/api/broadcast", broadcastRouter);
app.use("/api/analytics", analyticsRouter);

// ─── Health Check ─────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "ReplyFlow AI Backend", ts: new Date().toISOString() });
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

(async () => {
    try {
        // Start follow-up queue worker
        // const { startFollowUpWorker } = await import("./queues/followUp.queue");
        // startFollowUpWorker();

        app.listen(PORT, () => {
            console.log(`🚀 ReplyFlow AI Backend running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
})();

export default app;

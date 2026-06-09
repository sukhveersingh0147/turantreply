import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware/auth";
import { webhookRouter } from "./routes/webhook";
import { leadsRouter } from "./routes/leads";
import { messagesRouter } from "./routes/messages";
import { automationsRouter } from "./routes/automations";
import { broadcastRouter } from "./routes/broadcast";
import { analyticsRouter } from "./routes/analytics";
import { dashboardRouter } from "./routes/dashboard";
import { appointmentsRouter } from "./routes/appointments";
import { paymentsRouter } from "./routes/payments";
import { systemRouter } from "./routes/system";
import { deploymentRouter } from "./routes/deployment";

// Env variables are auto-loaded by Next.js
const app = express();
const PORT = process.env.PORT ?? 4000;

// ─── Security & Middleware ─────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true
}));
app.use(cookieParser());
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
app.use("/api/dashboard", dashboardRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/system", systemRouter);
app.use("/api/deployment", deploymentRouter);

// ─── Health Check ─────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "Turant Reply Backend", ts: new Date().toISOString() });
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// ─── Export App for Next.js Wrapper ───────────────────────
export default app;

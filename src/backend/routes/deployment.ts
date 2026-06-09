import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import axios from "axios";

export const deploymentRouter = Router();

// Deployment Status from GitHub Actions
deploymentRouter.get("/status", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        // Only allow admins to check deployment status
        // For simplicity, we assume any authenticated user with access to settings can see this
        // but you might want to restrict to specific user IDs or roles.

        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const REPO_OWNER = "rinoowner";
        const REPO_NAME = "turantreply";

        if (!GITHUB_TOKEN) {
            return res.json({
                status: "UNCONFIGURED",
                message: "GITHUB_TOKEN not found in .env. Deployment tracking is disabled."
            });
        }

        const response = await axios.get(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs`,
            {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                },
                params: {
                    per_page: 1,
                    branch: "main"
                }
            }
        );

        const lastRun = response.data.workflow_runs[0];

        if (!lastRun) {
            return res.json({ status: "NO_RUNS", message: "No deployment runs found." });
        }

        res.json({
            status: lastRun.status,
            conclusion: lastRun.conclusion,
            updatedAt: lastRun.updated_at,
            htmlUrl: lastRun.html_url,
            id: lastRun.id
        });

    } catch (error: any) {
        console.error("[BACKEND_DEPLOYMENT_STATUS_ERROR]", error.message);
        res.status(500).json({ error: "Failed to fetch deployment status" });
    }
});

// Trigger Deployment (Manual Dispatch)
deploymentRouter.post("/trigger", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const REPO_OWNER = "rinoowner";
        const REPO_NAME = "turantreply";

        if (!GITHUB_TOKEN) {
            return res.status(400).json({
                error: "GITHUB_TOKEN not configured. Cannot trigger deployment."
            });
        }

        // Trigger a 'workflow_dispatch' event
        // Note: The workflow file must have 'workflow_dispatch' trigger enabled.
        await axios.post(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/deploy.yml/dispatches`,
            {
                ref: "main"
            },
            {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                }
            }
        );

        res.json({ success: true, message: "Deployment triggered successfully via GitHub Actions." });

    } catch (error: any) {
        console.error("[BACKEND_DEPLOYMENT_TRIGGER_ERROR]", error.message);
        res.status(500).json({ error: "Failed to trigger deployment" });
    }
});

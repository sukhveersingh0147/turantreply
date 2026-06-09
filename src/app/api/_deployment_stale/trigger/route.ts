import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER || "rinoowner";
    const repo = process.env.GITHUB_REPO_NAME || "turantreply";

    if (!token) {
        return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 400 });
    }

    try {
        // Trigger a workflow_dispatch event for main.yml
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/main.yml/dispatches`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ref: "main" 
            }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `GitHub API error: ${res.statusText}`);
        }

        return NextResponse.json({ success: true, message: "Deployment triggered successfully" });
    } catch (error: any) {
        console.error("Failed to trigger deployment:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

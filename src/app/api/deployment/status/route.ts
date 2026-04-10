import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER || "rinoowner";
    const repo = process.env.GITHUB_REPO_NAME || "turantreply";

    if (!token) {
        return NextResponse.json({ status: "UNCONFIGURED" });
    }

    try {
        // Fetch latest workflow runs for main.yml (Deploy to cPanel)
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/main.yml/runs?per_page=1`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
            },
            next: { revalidate: 30 } // Cache for 30 seconds
        });

        if (!res.ok) {
            throw new Error(`GitHub API error: ${res.statusText}`);
        }

        const data = await res.json();
        const latestRun = data.workflow_runs?.[0];

        if (!latestRun) {
            return NextResponse.json({ status: "NO_RUNS" });
        }

        return NextResponse.json({
            status: latestRun.status,
            conclusion: latestRun.conclusion,
            updatedAt: latestRun.updated_at,
            htmlUrl: latestRun.html_url,
            id: latestRun.id
        });
    } catch (error: any) {
        console.error("Failed to fetch deployment status:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    // Basic security: Check for a secret token in headers
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        console.log("Running daily trial limit reset...");

        // Reset trialConversationsToday for all businesses
        const result = await prisma.business.updateMany({
            data: {
                // @ts-ignore
                trialConversationsToday: 0,
                // @ts-ignore
                lastLimitReset: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: `Reset daily limits for ${result.count} businesses.`
        });
    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

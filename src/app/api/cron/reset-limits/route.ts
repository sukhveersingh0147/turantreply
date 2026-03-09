import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    // Basic security: Check for a secret token in headers or search params
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        console.log("Running monthly usage reset...");

        // Reset aiRepliesUsed for all businesses where lastLimitReset is more than 30 days ago
        // In a real production environment, you might want more complex logic based on
        // individual signup dates, but a global monthly reset is a common starting point.
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await prisma.business.updateMany({
            where: {
                lastLimitReset: {
                    lte: thirtyDaysAgo
                }
            },
            data: {
                aiRepliesUsed: 0,
                lastLimitReset: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: `Reset usage for ${result.count} businesses.`
        });
    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

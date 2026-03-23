import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();

        if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const [
            recentUsers,
            mostActiveBusinesses,
            systemStats
        ] = await Promise.all([
            // Recent Users
            prisma.user.findMany({
                take: 10,
                orderBy: { createdAt: "desc" },
                include: {
                    business: {
                        select: { name: true }
                    }
                }
            }),

            // Most Active Businesses (by message count)
            prisma.business.findMany({
                take: 10,
                include: {
                    _count: {
                        select: { messages: true }
                    },
                    user: {
                        select: { name: true, email: true }
                    }
                }
            }),

            // Total System Usage
            prisma.message.aggregate({
                _count: true,
            })
        ]);

        return NextResponse.json({
            recentUsers,
            mostActiveBusinesses,
            totalMessages: systemStats._count,
        });
    } catch (error) {
        console.error("[ADMIN_STATS_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

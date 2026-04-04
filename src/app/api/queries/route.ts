import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    try {
        const business = await prisma.business.findFirst({
            where: { userId: session.user.id }
        });

        if (!business) {
            return NextResponse.json({ queries: [], total: 0, stats: { pendingCount: 0, pausedCount: 0, resolvedToday: 0 } });
        }

        const businessId = business.id;

        // Logic for "unanswered" queries
        // 1. isAiPaused = true
        // OR 2. lastInteraction within last 7 days AND (isAiPaused = false AND we will filter for last message = customer)

        const whereClause: any = {
            businessId,
            OR: [
                { isAiPaused: true },
                {
                    lastInteraction: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    },
                    // We'll filter for last message in memory or with a subquery if possible, 
                    // but for now let's get all recent interactions and filter.
                }
            ]
        };

        // Filter by Status
        if (filter === "paused") {
            whereClause.isAiPaused = true;
            delete whereClause.OR;
        } else if (filter === "resolved") {
            whereClause.tags = { has: "Resolved" };
            delete whereClause.OR;
        } else if (filter === "pending") {
            whereClause.isAiPaused = false;
            whereClause.NOT = { tags: { has: "Resolved" } };
            // Plus the last interaction check
            whereClause.lastInteraction = {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            };
            delete whereClause.OR;
        }

        // Search
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } }
            ];
        }

        const leads = await prisma.lead.findMany({
            where: whereClause,
            include: {
                messages: {
                    orderBy: { timestamp: "desc" },
                    take: 3,
                }
            },
            orderBy: sort === "score" 
                ? { score: "desc" } 
                : sort === "oldest" 
                    ? { lastInteraction: "asc" }
                    : { lastInteraction: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        });

        // Filter: If not AI paused, last message must be from customer
        const queryResults = leads.filter(lead => {
            const lastMsg = lead.messages[0];
            if (!lastMsg) return false;
            
            // If it's already marked resolved via filter above, just return
            if (filter === "resolved") return true;

            // If it has Resolved tag, it's not pending
            if (lead.tags.includes("Resolved") && filter !== "all") return false;

            const isCustomerMessage = lastMsg.senderType === "CUSTOMER" || lastMsg.senderType === "customer";
            return lead.isAiPaused || isCustomerMessage;
        }).map(lead => {
            const lastCustomerMsg = lead.messages.find(m => m.senderType === "CUSTOMER" || m.senderType === "customer");
            const lastAiMsg = lead.messages.find(m => m.senderType === "AI" || m.senderType === "AI_AUTO_ACTION");
            
            let status: "PENDING" | "PAUSED" | "RESOLVED" = "PENDING";
            if (lead.tags.includes("Resolved")) status = "RESOLVED";
            else if (lead.isAiPaused) status = "PAUSED";

            return {
                leadId: lead.id,
                leadName: lead.name || "Unknown",
                phone: lead.phone,
                score: lead.score,
                leadStage: lead.leadStage,
                isAiPaused: lead.isAiPaused,
                tags: lead.tags,
                lastInteraction: lead.lastInteraction,
                lastCustomerMessage: lastCustomerMsg ? {
                    id: lastCustomerMsg.id,
                    message: lastCustomerMsg.message,
                    timestamp: lastCustomerMsg.timestamp,
                } : null,
                lastAiAttempt: lastAiMsg?.message || null,
                status
            };
        });

        // Stats
        const [pendingCount, pausedCount, resolvedCount] = await Promise.all([
            prisma.lead.count({
                where: {
                    businessId,
                    isAiPaused: false,
                    NOT: { tags: { has: "Resolved" } },
                    lastInteraction: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            }),
            prisma.lead.count({
                where: { businessId, isAiPaused: true }
            }),
            prisma.lead.count({
                where: {
                    businessId,
                    tags: { has: "Resolved" },
                    updatedAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ]);

        return NextResponse.json({
            queries: queryResults,
            stats: {
                pendingCount,
                pausedCount,
                resolvedToday: resolvedCount,
            },
            total: queryResults.length, // Simplified for now since we filter in-memory
            hasMore: queryResults.length === limit
        });

    } catch (error) {
        console.error("[QUERIES_GET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

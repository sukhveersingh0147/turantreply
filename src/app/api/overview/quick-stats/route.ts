import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay, addDays } from "date-fns";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
        select: { id: true, businessType: true }
    });

    if (!business) {
        return new NextResponse("Business not found", { status: 404 });
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const nextWeekEnd = endOfDay(addDays(now, 7));

    try {
        const [
            pendingQueries,
            todayAppointments,
            todayReminders,
            expiringThisWeek,
            feeDueCount,
            hotLeadsCount,
            lapsedCount
        ] = await Promise.all([
            // Pending queries count (AI is paused)
            prisma.lead.count({
                where: { businessId: business.id, isAiPaused: true }
            }),
            // Today's appointments
            prisma.appointment.count({
                where: { 
                    businessId: business.id, 
                    status: "SCHEDULED",
                    startTime: { gte: todayStart, lte: todayEnd }
                }
            }),
            // Today's follow-up reminders
            prisma.lead.count({
                where: {
                    businessId: business.id,
                    nextFollowUpDate: { gte: todayStart, lte: todayEnd }
                }
            }),
            // Gym - Expiring this week
            prisma.lead.count({
                where: {
                    businessId: business.id,
                    tags: { has: "Expiring This Week" }
                }
            }),
            // Coaching - Fee Due
            prisma.lead.count({
                where: {
                    businessId: business.id,
                    tags: { has: "Fee Due" }
                }
            }),
            // Real Estate/Other - Hot Lead
            prisma.lead.count({
                where: {
                    businessId: business.id,
                    tags: { has: "Hot Lead" }
                }
            }),
            // Salon/Restaurant - Lapsed clients
            prisma.lead.count({
                where: {
                    businessId: business.id,
                    OR: [
                        { tags: { has: "Lapsed (45+ days)" } },
                        { tags: { has: "Lapsed (30+ days)" } }
                    ]
                }
            })
        ]);

        return NextResponse.json({
            pendingQueries,
            todayAppointments,
            todayReminders,
            expiringThisWeek,
            feeDueCount,
            hotLeadsCount,
            lapsedCount
        });
    } catch (error) {
        console.error("Quick stats fetch error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

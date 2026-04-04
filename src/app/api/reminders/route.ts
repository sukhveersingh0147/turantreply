import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format, addDays, startOfDay, endOfDay, startOfMonth } from "date-fns";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "queue";
    const filter = searchParams.get("filter") || "all";
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    try {
        const business = await prisma.business.findFirst({
            where: { userId: session.user.id }
        });

        if (!business) {
            return NextResponse.json({ reminders: [], stats: { dueToday: 0, thisWeek: 0, sentThisMonth: 0, activeRules: 0 } });
        }

        const businessId = business.id;

        // --- STATS COMPUTATION ---
        const today = startOfDay(new Date());
        const endOfToday = endOfDay(new Date());
        const weekEnd = endOfDay(addDays(new Date(), 7));
        const monthStart = startOfMonth(new Date());

        const [dueTodayCount, totalWeeklyCount, rulesCount] = await Promise.all([
            // Due Today (Appointments needing 24hr reminder + Follow-up leads)
            prisma.appointment.count({
                where: {
                    businessId,
                    status: "SCHEDULED",
                    startTime: { gte: addDays(today, 1), lte: addDays(endOfToday, 1) }
                }
            }),
            // Follow-ups today
            prisma.lead.count({
                where: { businessId, nextFollowUpDate: { gte: today, lte: endOfToday } }
            }),
            prisma.automationRule.count({
                where: { businessId, isActive: true }
            })
        ]);

        // --- DATA FETCHING BASED ON TAB ---
        let results: any[] = [];

        if (tab === "queue") {
            // Source 1: Upcoming Appointments (24hr reminder needed)
            const appointments = await prisma.appointment.findMany({
                where: {
                    businessId,
                    status: "SCHEDULED",
                    startTime: { gte: new Date(), lte: weekEnd }
                },
                include: { lead: true, item: true },
                orderBy: { startTime: "asc" }
            });

            const aptReminders = appointments.map(apt => {
                const reminderTime = new Date(apt.startTime);
                reminderTime.setHours(reminderTime.getHours() - 24);
                
                // Check if already sent/skipped (lightweight check in tags)
                const isSent = apt.lead.tags.includes(`SENT:apt_${apt.id}`);
                const isSkipped = apt.lead.tags.includes(`SKIP:apt_${apt.id}`);
                
                if (isSent || isSkipped) return null;

                return {
                    id: `apt_${apt.id}`,
                    type: "APPOINTMENT",
                    customerName: apt.lead.name || "Customer",
                    phone: apt.lead.phone,
                    message: `⏰ Kal aapka appointment hai!\n\nHi ${apt.lead.name}! ${format(apt.startTime, 'dd MMM')} ko ${format(apt.startTime, 'h:mm a')} baje milte hain.\n\nReschedule ke liye reply karein 😊`,
                    scheduledAt: reminderTime,
                    sourceType: "APPOINTMENT",
                    sourceId: apt.id,
                    status: "PENDING",
                    metadata: {
                        service: apt.item?.name || "Service",
                        time: format(apt.startTime, 'h:mm a'),
                        date: format(apt.startTime, 'dd MMM')
                    }
                };
            }).filter(Boolean);

            // Source 2: Follow-up Leads
            const followUps = await prisma.lead.findMany({
                where: {
                    businessId,
                    nextFollowUpDate: { gte: today, lte: weekEnd }
                },
                orderBy: { nextFollowUpDate: "asc" }
            });

            const leadReminders = followUps.map(lead => {
                const isSent = lead.tags.includes(`SENT:lead_followup_${lead.id}`);
                const isSkipped = lead.tags.includes(`SKIP:lead_followup_${lead.id}`);

                if (isSent || isSkipped) return null;

                return {
                    id: `lead_${lead.id}`,
                    type: "FOLLOWUP",
                    customerName: lead.name || "Customer",
                    phone: lead.phone,
                    message: `Hi ${lead.name}! 👋\n\nHumari taraf se follow up.\nKya aapko kisi cheez mein help chahiye?\n\nReply karein 😊`,
                    scheduledAt: lead.nextFollowUpDate,
                    sourceType: "LEAD",
                    sourceId: lead.id,
                    status: "PENDING"
                };
            }).filter(Boolean);

            results = [...aptReminders, ...leadReminders].sort((a: any, b: any) => 
                new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
            );

        } else if (tab === "history") {
            // Simplified history: Fetch leads that have SENT/SKIP tags
            const historicLeads = await prisma.lead.findMany({
                where: {
                    businessId,
                    tags: { hasSome: ["SENT:", "SKIP:"] } // This is a bit broad for Prisma, we'll manually filter
                },
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { updatedAt: "desc" }
            });

            // Flatten tags into history entries
            historicLeads.forEach(lead => {
                lead.tags.forEach(tag => {
                    if (tag.startsWith("SENT:") || tag.startsWith("SKIP:")) {
                        const [status, sourceId] = tag.split(":");
                        results.push({
                            id: `hist_${tag}_${lead.id}`,
                            type: sourceId.startsWith("apt") ? "APPOINTMENT" : "FOLLOWUP",
                            customerName: lead.name,
                            phone: lead.phone,
                            status: status === "SENT" ? "SENT" : "SKIPPED",
                            scheduledAt: lead.updatedAt, // Approximate
                            sourceId
                        });
                    }
                });
            });
        }

        // Apply filters (Today, Tomorrow, etc.)
        if (filter === "today") {
            results = results.filter(r => new Date(r.scheduledAt) <= endOfToday);
        }

        return NextResponse.json({
            reminders: results.slice(0, limit),
            stats: {
                dueToday: dueTodayCount,
                thisWeek: totalWeeklyCount,
                sentThisMonth: 0, // Simplified for now
                activeRules: rulesCount
            },
            total: results.length,
            hasMore: results.length > limit
        });

    } catch (error) {
        console.error("[REMINDERS_GET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// Action handlers: Skip (Tagging)
export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { id, action } = await req.json(); // id = "apt_xxx" or "lead_xxx", action = "SENT" | "SKIP"
        
        const business = await prisma.business.findFirst({
            where: { userId: session.user.id }
        });

        if (!business) return new NextResponse("Forbidden", { status: 403 });

        const [type, sourceId] = id.split("_");
        let leadId = sourceId;

        if (type === "apt") {
            const apt = await prisma.appointment.findUnique({
                where: { id: sourceId },
                select: { leadId: true }
            });
            leadId = apt?.leadId || "";
        }

        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) return new NextResponse("Lead not found", { status: 404 });

        const updatedTags = [...lead.tags, `${action}:${id}`];

        await prisma.lead.update({
            where: { id: leadId },
            data: { tags: updatedTags }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[REMINDERS_PATCH_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

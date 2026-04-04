import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import RemindersClient from "@/components/dashboard/RemindersClient";

export default async function RemindersPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
    });

    if (!business) redirect("/setup");

    // Fetch leads with upcoming AI actions/follow-ups
    const leadsWithReminders = await prisma.lead.findMany({
        where: { 
            businessId: business.id,
            OR: [
                { nextFollowUpDate: { not: null } },
                { nextAiActionAt: { not: null } }
            ]
        },
        orderBy: {
            nextAiActionAt: 'asc',
        },
        take: 50
    });

    // Also fetch upcoming appointments for reminders
    const upcomingAppointments = await prisma.appointment.findMany({
        where: {
            businessId: business.id,
            startTime: { gt: new Date() },
            status: 'SCHEDULED'
        },
        include: { lead: true },
        orderBy: { startTime: 'asc' },
        take: 20
    });

    // Map to RemindersClient format
    const reminders = [
        ...leadsWithReminders.map(l => ({
            id: `lead-${l.id}`,
            time: (l.nextAiActionAt || l.nextFollowUpDate || new Date()).toISOString(),
            type: "NUDGE",
            customerName: l.name || "Customer",
            customerPhone: l.phone,
            message: "Automated follow-up to re-engage lead."
        })),
        ...upcomingAppointments.map(a => {
            // Reminder is usually 24h before
            const reminderTime = new Date(a.startTime.getTime() - 24 * 60 * 60 * 1000);
            return {
                id: `appt-${a.id}`,
                time: reminderTime > new Date() ? reminderTime : new Date(),
                type: "APPOINTMENT",
                customerName: a.lead?.name || "Customer",
                customerPhone: a.lead?.phone || "No Phone",
                message: "Reminder for upcoming booking."
            };
        })
    ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return (
        <div className="animate-in fade-in duration-500">
            <RemindersClient initialReminders={reminders} />
        </div>
    );
}

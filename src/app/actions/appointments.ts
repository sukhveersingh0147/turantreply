"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAccessibleBusiness } from "./settings";

export async function getAppointmentsData() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const business = await getAccessibleBusiness();
    if (!business) return [];

    const appointments = await (prisma as any).appointment.findMany({
        where: { businessId: business.id },
        include: {
            lead: true,
            item: true,
        },
        orderBy: { startTime: "desc" },
    });

    return appointments.map((a: any) => ({
        id: a.id,
        customerName: a.lead?.name || "Unknown",
        customerPhone: a.lead?.phone || "N/A",
        itemName: a.item?.name || "Service",
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        source: a.source,
        query: a.lead?.lastQuery || "No query recorded",
        summary: a.lead?.conversationSummary || "No summary",
    }));
}

export async function updateAppointmentStatus(id: string, status: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found");

    const res = await (prisma as any).appointment.update({
        where: { id, businessId: business.id },
        data: { status },
    });

    return res;
}

export async function createAppointment(data: {
    leadId: string;
    itemId?: string;
    startTime: Date;
    endTime?: Date;
    title?: string;
    description?: string;
    status?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found");

    return await (prisma as any).appointment.create({
        data: {
            ...data,
            businessId: business.id,
            source: "MANUAL"
        }
    });
}

export async function getBookingResources() {
    const session = await auth();
    if (!session?.user?.id) return { leads: [], items: [] };

    const business = await getAccessibleBusiness();
    if (!business) return { leads: [], items: [] };

    const [leads, items] = await Promise.all([
        prisma.lead.findMany({ where: { businessId: business.id }, select: { id: true, name: true, phone: true } }),
        (prisma as any).item.findMany({ where: { businessId: business.id, isActive: true }, select: { id: true, name: true, price: true } })
    ]);

    return { leads, items };
}

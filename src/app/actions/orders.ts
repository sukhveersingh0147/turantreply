"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAccessibleBusiness } from "./settings";

export async function getOrdersData() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const business = await getAccessibleBusiness();
    if (!business) return [];

    const orders = await (prisma as any).order.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
    });

    // Enhance with lead query if phone matches
    const enrichedOrders = await Promise.all(orders.map(async (o: any) => {
        const lead = await prisma.lead.findFirst({
            where: { businessId: business.id, phone: o.customerPhone }
        });
        return {
            id: o.id,
            customerName: o.customerName || lead?.name || "Customer",
            customerPhone: o.customerPhone,
            items: o.items,
            totalAmount: o.totalAmount,
            status: o.status,
            paymentStatus: o.paymentStatus,
            createdAt: o.createdAt,
            query: lead?.lastQuery || "No query recorded",
        };
    }));

    return enrichedOrders;
}

export async function updateOrderStatus(id: string, status: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found");

    return await (prisma as any).order.update({
        where: { id, businessId: business.id },
        data: { status },
    });
}

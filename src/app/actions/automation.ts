"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getBusiness() {
    const session = await auth();
    if (!session?.user?.id) return null;

    return await prisma.business.findUnique({
        where: { userId: session.user.id }
    });
}

export async function getFlows() {
    const business = await getBusiness();
    if (!business) return [];
    return await (prisma as any).flow.findMany({
        where: { businessId: business.id },
        orderBy: { updatedAt: "desc" }
    });
}

export async function createFlow(data: {
    name: string;
    triggerType: string;
    triggerValue?: string;
    nodes: any;
    edges: any;
}) {
    const business = await getBusiness();
    if (!business) throw new Error("Business not found");
    const flow = await (prisma as any).flow.create({
        data: {
            ...data,
            businessId: business.id,
            isActive: true,
        }
    });
    revalidatePath("/automation");
    return flow;
}

export async function updateFlow(id: string, data: any) {
    const business = await getBusiness();
    if (!business) throw new Error("Business not found");
    const flow = await (prisma as any).flow.update({
        where: { id, businessId: business.id },
        data
    });
    revalidatePath("/automation");
    return flow;
}

export async function deleteFlow(id: string) {
    const business = await getBusiness();
    if (!business) throw new Error("Business not found");
    await (prisma as any).flow.delete({
        where: { id, businessId: business.id }
    });
    revalidatePath("/automation");
}

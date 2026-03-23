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

export async function getCampaigns() {
    const business = await getBusiness();
    if (!business) return [];
    return await (prisma as any).campaign.findMany({
        where: { businessId: business.id },
        include: { steps: true },
        orderBy: { createdAt: "desc" }
    });
}

export async function createCampaign(data: {
    name: string;
    description?: string;
    steps: { order: number; delayHours: number; message: string }[];
    itemIds?: string[];
    couponId?: string | null;
    imageUrl?: string | null;
    audienceSource?: "SEGMENT" | "TAG" | "SHEET";
    audienceValue?: string;
    scheduledAt?: string | null;
}) {
    const business = await getBusiness();
    if (!business) throw new Error("Business not found");
    
    const campaign = await (prisma as any).campaign.create({
        data: {
            name: data.name,
            description: data.description,
            businessId: business.id,
            isActive: true,
            itemIds: data.itemIds || [],
            couponId: data.couponId || null,
            imageUrl: data.imageUrl || null,
            audienceSource: data.audienceSource || "SEGMENT",
            audienceValue: data.audienceValue || "ALL",
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
            steps: {
                create: data.steps
            }
        },
        include: { steps: true }
    });

    revalidatePath("/campaigns");
    return campaign;
}

export async function toggleCampaign(id: string, isActive: boolean) {
    const business = await getBusiness();
    if (!business) throw new Error("Business not found");
    await (prisma as any).campaign.update({
        where: { id, businessId: business.id },
        data: { isActive }
    });
    revalidatePath("/campaigns");
}

export async function deleteCampaign(id: string) {
    const business = await getBusiness();
    if (!business) throw new Error("Business not found");
    await (prisma as any).campaign.delete({
        where: { id, businessId: business.id }
    });
    revalidatePath("/campaigns");
}

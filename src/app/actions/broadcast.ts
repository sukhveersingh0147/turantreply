"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function getBroadcasts() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
    });

    if (!business) return [];

    return await (prisma as any).broadcast.findMany({
        where: { businessId: business.id },
        include: {
            variants: true,
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createBroadcast(data: {
    name: string;
    content: string;
    segment: string;
    sheetUrl?: string | null;
    scheduledAt?: Date | null;
    variants?: { name: string; content: string }[];
    itemIds?: string[];
    couponId?: string | null;
    imageUrl?: string | null;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
    });

    if (!business || !business.waToken || !business.waPhoneNumberId) {
        throw new Error("WhatsApp configuration missing");
    }

    // 1. Create Broadcast record
    const broadcast = await (prisma as any).broadcast.create({
        data: {
            businessId: business.id,
            name: data.name,
            content: data.content,
            status: data.scheduledAt ? "SCHEDULED" : "SENDING",
            segment: data.segment,
            sheetUrl: data.sheetUrl || null,
            scheduledAt: data.scheduledAt,
            itemIds: data.itemIds || [],
            couponId: data.couponId || null,
            imageUrl: data.imageUrl || null,
            variants: {
                create: data.variants?.map(v => ({
                    name: v.name,
                    content: v.content,
                })) || []
            }
        },
        include: { variants: true }
    });

    // 2. Offload to Queue if NOT scheduled (if scheduled, a cron job handles it)
    if (!data.scheduledAt) {
        const { getCampaignQueue } = await import("@/lib/queue");
        const queue = getCampaignQueue();
        if (queue) {
            if (data.segment === "gsheets" && data.sheetUrl) {
                await queue.add("sheet-broadcast", {
                    broadcastId: broadcast.id,
                    sheetUrl: data.sheetUrl,
                    message: data.content,
                    businessId: business.id,
                    imageUrl: data.imageUrl
                });
            } else {
                // For standard segments, we can still use the queue or process here if small
                // Better to use queue for ALL to avoid timeouts
                await queue.add("segment-broadcast", {
                    broadcastId: broadcast.id,
                    businessId: business.id
                });
            }
        }
    }

    revalidatePath("/broadcast");
    return broadcast;
}

export async function deleteBroadcast(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const broadcast = await prisma.broadcast.findUnique({
        where: { id },
        include: { business: true }
    });

    if (!broadcast || broadcast.business.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    await prisma.broadcast.delete({ where: { id } });
    revalidatePath("/broadcast");
}

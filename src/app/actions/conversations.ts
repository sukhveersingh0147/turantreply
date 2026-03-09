"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
    });

    if (!business) {
        return [];
    }

    const leads = await prisma.lead.findMany({
        where: { businessId: business.id },
        include: {
            messages: {
                orderBy: { timestamp: "desc" },
                take: 1,
            },
        },
        orderBy: { updatedAt: "desc" },
    });

    return leads.map((lead) => ({
        id: lead.id,
        name: lead.name || "Anonymous",
        phone: lead.phone,
        lastMsg: lead.messages[0]?.message || "No messages yet",
        time: lead.updatedAt,
        status: lead.status,
        isAiPaused: lead.isAiPaused,
        unread: 0,
    }));
}

export async function toggleAiPause(leadId: string, pause: boolean) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return await prisma.lead.update({
        where: { id: leadId },
        data: { isAiPaused: pause },
        select: { isAiPaused: true }
    });
}

export async function getConversationMessages(leadId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const messages = await prisma.message.findMany({
        where: { leadId },
        orderBy: { timestamp: "asc" },
    });

    return messages.map((msg) => ({
        id: msg.id,
        sender: msg.sender.toLowerCase() === "customer" ? "customer" : "ai",
        msg: msg.message,
        time: msg.timestamp,
        aiLabel: msg.senderType === "AI" ? "AI Reply" : msg.senderType === "AUTOMATION" ? "Auto-Reply" : null,
    }));
}

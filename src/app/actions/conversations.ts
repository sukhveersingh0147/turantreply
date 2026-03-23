"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getAccessibleBusiness } from "./settings";

export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const business = await getAccessibleBusiness();

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
            suggestions: {
                where: { status: "PENDING" },
                take: 5,
            }
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
        leadStage: lead.leadStage || "NEW",
        isAiPaused: lead.isAiPaused,
        unread: 0,
        suggestions: lead.suggestions.map(s => ({
            id: s.id,
            content: s.content,
            type: s.type
        }))
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
    if (!session?.user?.id) throw new Error("Unauthorized");

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

export async function handleSuggestion(suggestionId: string, action: "APPROVED" | "IGNORED", editedContent?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (action === "APPROVED" && editedContent) {
        // Logic to actually send the message via WhatsApp would go here
        // For now, we just mark it as approved and updated
        await (prisma as any).suggestion.update({
            where: { id: suggestionId },
            data: { status: "APPROVED", content: editedContent }
        });
    } else {
        await (prisma as any).suggestion.update({
            where: { id: suggestionId },
            data: { status: action }
        });
    }
}

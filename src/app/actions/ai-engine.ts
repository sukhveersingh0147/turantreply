"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAccessibleBusiness } from "./settings";

/**
 * Fetches recent AI actions (suggestions) for the activity log.
 */
export async function getAIActivityLog(limit = 20) {
    try {
        const business = await getAccessibleBusiness();
        
        const logs = await (prisma as any).suggestion.findMany({
            where: { businessId: business.id },
            include: { lead: true },
            orderBy: { createdAt: "desc" },
            take: limit
        });

        return { success: true, logs };
    } catch (error) {
        console.error("[AI_ENGINE] Failed to fetch activity log:", error);
        return { success: false, error: "Failed to fetch activity log" };
    }
}

/**
 * Fetches high-level insights for the insight panel.
 */
export async function getAIInsights() {
    try {
        const business = await getAccessibleBusiness();

        const [hotLeads, pendingReplies, followUpsSent] = await Promise.all([
            // 1. Hot Leads (Score > 70 or Stage is HOT)
            prisma.lead.count({
                where: { 
                    businessId: business.id, 
                    OR: [
                        { score: { gte: 70 } },
                        { leadType: "Hot lead" }
                    ]
                }
            }),
            // 2. Pending Replies (Last message was from CUSTOMER and no reply in 2+ hours)
            // Simplified for now: just count NEW or INTERESTED leads interactive in last 24h
            prisma.lead.count({
                where: {
                    businessId: business.id,
                    status: "NEW",
                    lastInteraction: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }
            }),
            // 3. Follow-ups sent (Actions of type FOLLOW_UP)
            (prisma as any).suggestion.count({
                where: {
                    businessId: business.id,
                    type: "FOLLOW_UP",
                    status: "AUTO_EXECUTED"
                }
            })
        ]);

        return { 
            success: true, 
            insights: {
                hotLeads,
                pendingReplies,
                followUpsSent,
                conversions: 0 // Placeholder or calculate from status CONVERTED
            }
        };
    } catch (error) {
        console.error("[AI_ENGINE] Failed to fetch insights:", error);
        return { success: false, error: "Failed to fetch insights" };
    }
}

/**
 * Updates AI Smart Engine settings for the business.
 */
export async function updateAISettings(data: {
    aiActionMode: string;
    followUpInterval: number;
    maxFollowUps: number;
    aiPersonalization: boolean;
}) {
    try {
        const business = await getAccessibleBusiness();

        await prisma.business.update({
            where: { id: business.id },
            data: {
                aiActionMode: data.aiActionMode,
                followUpInterval: data.followUpInterval,
                maxFollowUps: data.maxFollowUps,
                aiPersonalization: data.aiPersonalization
            }
        });

        revalidatePath("/automation");
        revalidatePath("/overview");
        
        return { success: true };
    } catch (error) {
        console.error("[AI_ENGINE] Failed to update settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}

/**
 * Approves a suggested action manually.
 */
export async function approveAISuggestion(suggestionId: string) {
    try {
        const business = await getAccessibleBusiness();
        
        const suggestion = await (prisma as any).suggestion.findFirst({
            where: { id: suggestionId, businessId: business.id }
        });

        if (!suggestion || suggestion.status !== "PENDING") {
            return { success: false, error: "Suggestion not found or already processed" };
        }

        // Logic to send message if suggestion has content
        // (Similar to SmartEngineService.applyAction but manual)
        
        await (prisma as any).suggestion.update({
            where: { id: suggestionId },
            data: { status: "APPROVED" }
        });

        revalidatePath("/overview");
        return { success: true };
    } catch (error) {
        console.error("[AI_ENGINE] Failed to approve suggestion:", error);
        return { success: false, error: "Failed to approve suggestion" };
    }
}

"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { INDUSTRY_BLUEPRINTS } from "@/config/blueprints";
import { SubscriptionService } from "@/services/subscription.service";
import { OpenAI } from "openai";
import { savePushSubscription } from "./notifications";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});

export async function getBusinessSettings() {
    return await getAccessibleBusiness();
}

export async function updateBusinessSettings(data: { name: string; industry: string; description: string; businessType: string }) {
    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Unauthorized or Business not found");

    await prisma.business.update({
        where: { id: business.id },
        data: {
            name: data.name,
            industry: data.industry,
            description: data.description,
            // @ts-ignore
            businessType: data.businessType,
        },
    });

    revalidatePath("/settings");
    return { success: true };
}

export async function updateWhatsAppSettings(data: { whatsappNumber: string; waToken: string; waPhoneNumberId: string }) {
    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Unauthorized or Business not found");

    await prisma.business.update({
        where: { id: business.id },
        data: {
            whatsappNumber: data.whatsappNumber,
            waToken: data.waToken,
            waPhoneNumberId: data.waPhoneNumberId,
        },
    });

    revalidatePath("/settings");
    return { success: true };
}

export async function updateAISettings(data: { 
    aiSystemPrompt: string; 
    knowledgeBase: string;
    autoReplyEnabled: boolean;
    followUpEnabled: boolean;
    autoBookingEnabled: boolean;
    mediaAutoSendEnabled: boolean;
    lowStockAlertsEnabled: boolean;
}) {
    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Unauthorized or Business not found");

    await prisma.business.update({
        where: { id: business.id },
        data: {
            aiSystemPrompt: data.aiSystemPrompt,
            knowledgeBase: data.knowledgeBase,
            // @ts-ignore
            autoReplyEnabled: data.autoReplyEnabled,
            // @ts-ignore
            followUpEnabled: data.followUpEnabled,
            // @ts-ignore
            autoBookingEnabled: data.autoBookingEnabled,
            // @ts-ignore
            mediaAutoSendEnabled: data.mediaAutoSendEnabled,
            // @ts-ignore
            lowStockAlertsEnabled: data.lowStockAlertsEnabled,
        },
    });

    revalidatePath("/settings");
    return { success: true };
}
export async function applyBlueprint(blueprintKey: string) {
    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Unauthorized or Business not found");

    const blueprint = INDUSTRY_BLUEPRINTS[blueprintKey];
    if (!blueprint) throw new Error("Blueprint not found");

    await prisma.business.update({
        where: { id: business.id },
        data: {
            industry: blueprint.industry,
            aiSystemPrompt: blueprint.aiSystemPrompt,
            knowledgeBase: blueprint.knowledgeBase,
        },
    });

    revalidatePath("/settings");
    return { success: true };
}

export async function generateAISettings(businessDescription: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (!businessDescription || businessDescription.length < 10) {
        throw new Error("Please provide a more detailed business description (at least 10 characters).");
    }

    try {
        const response = await openai.chat.completions.create({
            model: process.env.AI_MODEL || "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert AI configuration assistant for Turant Reply.
Take the business description and generate a JSON object.

REQUIRED JSON KEYS:
1. "aiSystemPrompt": Detailed personality and WhatsApp rules.
2. "knowledgeBase": FAQ, pricing, and business data.

RULES FOR JSON:
- Do not include any text before or after the JSON.
- Ensure the output is a single valid JSON object.
- The word "JSON" must be present in this prompt (it is).`
                },
                {
                    role: "user",
                    content: `Generate AI settings for this business description: ${businessDescription}. 
Respond ONLY with a JSON object containing "aiSystemPrompt" and "knowledgeBase".`
                }
            ],
            response_format: { type: "json_object" }
        });

        const rawContent = response.choices[0].message.content || "{}";
        const content = JSON.parse(rawContent);
        
        if (!content.aiSystemPrompt || !content.knowledgeBase) {
            throw new Error("AI failed to generate valid settings. Please try again with a better description.");
        }

        // Ensure these are strings to prevent [object] issues in UI
        const aiSystemPrompt = typeof content.aiSystemPrompt === 'string' 
            ? content.aiSystemPrompt 
            : JSON.stringify(content.aiSystemPrompt, null, 2);
            
        const knowledgeBase = typeof content.knowledgeBase === 'string' 
            ? content.knowledgeBase 
            : JSON.stringify(content.knowledgeBase, null, 2);

        return {
            success: true,
            data: {
                aiSystemPrompt,
                knowledgeBase
            }
        };
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        throw new Error(error.message || "AI engine encountered an error. Please try again later.");
    }
}

export async function updateNotificationSettings(data: { notifyOnEmergency: boolean; notifyOnNewLead: boolean; notifyOnAiPause: boolean }) {
    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Unauthorized or Business not found");

    await prisma.business.update({
        where: { id: business.id },
        data: {
            notifyOnEmergency: data.notifyOnEmergency,
            notifyOnNewLead: data.notifyOnNewLead,
            notifyOnAiPause: data.notifyOnAiPause,
        },
    });

    revalidatePath("/settings");
    return { success: true };
}

export async function getAccessibleBusiness() {
    const session = await auth();
    
    if (!session?.user?.id) return null;

    // Check if they are an owner
    const ownedBusiness = await prisma.business.findUnique({
        where: { userId: session.user.id },
        include: { user: true }
    });

    if (ownedBusiness) return ownedBusiness as any;

    // Diagnostic fallback
    const fallbackBusiness = await prisma.business.findFirst({
        where: { userId: session.user.id }
    });
    if (fallbackBusiness) return fallbackBusiness as any;

    // Check if they are a member
    const membership = await (prisma as any).businessMember.findFirst({
        where: { userId: session.user.id },
        include: { business: true }
    });

    if (membership) return membership.business as any;

    return null;
}

export async function getTeamMembers() {
    const business = await getAccessibleBusiness();
    if (!business) return [];

    const members = await (prisma as any).businessMember.findMany({
        where: { businessId: business.id },
        include: { user: true }
    });

    return members;
}

export async function addTeamMember(email: string, role: string = "AGENT") {
    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Only business owners or authorized members can invite team members");

    // Only owners can invite for now (safety)
    // if (business.userId !== session.user.id) throw new Error("Permission denied");

    const userToInvite = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
    });

    if (!userToInvite) {
        throw new Error("User with this email not found. They must sign up first.");
    }

    await (prisma as any).businessMember.upsert({
        where: { 
            businessId_userId: { 
                businessId: business.id, 
                userId: userToInvite.id 
            } 
        },
        update: { role },
        create: { 
            businessId: business.id, 
            userId: userToInvite.id, 
            role 
        }
    });

    revalidatePath("/settings");
    return { success: true };
}

export async function removeTeamMember(memberId: string) {
    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Only business owners or authorized members can remove team members");

    await (prisma as any).businessMember.delete({
        where: { id: memberId }
    });

    revalidatePath("/settings");
    return { success: true };
}

"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { INDUSTRY_BLUEPRINTS } from "@/config/blueprints";
import { SubscriptionService } from "@/services/subscription.service";
import { OpenAI } from "openai";
import { savePushSubscription } from "./notifications";
import { DEFAULT_AI_MODEL } from "@/config/ai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
    baseURL: process.env.OPENAI_BASE_URL,
});

export async function getBusinessSettings() {
    return await getAccessibleBusiness();
}

export async function updateBusinessSettings(data: { 
    name: string; 
    industry: string; 
    description: string; 
    businessType: string;
    location?: string;
    workingHours?: any;
    phone?: string;
    targetAudience?: string;
    pricingDetails?: string;
    businessRules?: string;
}) {
    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Unauthorized or Business not found");

    await prisma.business.update({
        where: { id: business.id },
        data: {
            name: data.name,
            industry: data.industry,
            description: data.description,
            location: data.location || null,
            workingHours: data.workingHours || null,
            whatsappNumber: data.phone || business.whatsappNumber,
            // @ts-ignore
            businessType: data.businessType,
            // @ts-ignore
            targetAudience: data.targetAudience,
            // @ts-ignore
            pricingDetails: data.pricingDetails,
            // @ts-ignore
            businessRules: data.businessRules,
        },
    });

    revalidatePath("/settings");
    return { success: true };
}

export async function updateWhatsAppSettings(data: { whatsappNumber: string; waToken: string; waPhoneNumberId: string }) {
    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Unauthorized or Business not found");

    // De-duplicate: Ensure no OTHER business is using this Phone ID
    await prisma.$transaction([
        prisma.business.updateMany({
            where: { 
                waPhoneNumberId: data.waPhoneNumberId,
                id: { not: business.id }
            },
            data: {
                waPhoneNumberId: null,
                waToken: null,
                whatsappNumber: null,
            }
        }),
        prisma.business.update({
            where: { id: business.id },
            data: {
                whatsappNumber: data.whatsappNumber,
                waToken: data.waToken,
                waPhoneNumberId: data.waPhoneNumberId,
            },
        })
    ]);

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
    agentName?: string;
    welcomeMessage?: string;
    tone?: string;
    fallbackMessage?: string;
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
            agentName: data.agentName || null,
            welcomeMessage: data.welcomeMessage || null,
            tone: data.tone || "PROFESSIONAL",
            fallbackMessage: data.fallbackMessage || null,
        },
    });

    revalidatePath("/settings");
    revalidatePath("/ai-agent");
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
            model: process.env.AI_MODEL || DEFAULT_AI_MODEL,
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

export async function improveContentWithAI(fieldName: string, content: string, businessType?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const promptMap: Record<string, string> = {
        description: "Improve this business description to be more professional and clear for an AI receptionist.",
        targetAudience: "Refine this target audience description to help an AI assistant understand who it is talking to.",
        pricingDetails: "Format and improve these pricing details so an AI can easily quote them to customers.",
        businessRules: "Clarify these business rules (e.g., cancellation policy, refund policy) for an AI assistant."
    };

    const prompt = promptMap[fieldName] || "Improve this text for a business AI assistant.";

    try {
        const response = await openai.chat.completions.create({
            model: process.env.AI_MODEL || DEFAULT_AI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are a professional business copywriter and AI configuration expert. Your goal is to improve the user's input while staying true to their original meaning. Provide ONLY the improved text, no preamble or quotes."
                },
                {
                    role: "user",
                    content: `${prompt}\n\nUser Input: ${content}${businessType ? `\nBusiness Type: ${businessType}` : ""}`
                }
            ],
        });

        return { success: true, improvedContent: response.choices[0].message.content?.trim() };
    } catch (error: any) {
        throw new Error(error.message || "AI failed to improve content");
    }
}

export async function generateConversationPreview(data: {
    description: string;
    targetAudience: string;
    pricingDetails: string;
    businessRules: string;
    businessType: string;
    name: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const response = await openai.chat.completions.create({
            model: process.env.AI_MODEL || DEFAULT_AI_MODEL,
            messages: [
                {
                    role: "system",
                    content: `You are simulating a WhatsApp conversation between a CUSTOMER and an AI RECEPTIONIST for ${data.name}.
                    
                    BUSINESS CONTEXT:
                    - Type: ${data.businessType}
                    - Description: ${data.description}
                    - Audience: ${data.targetAudience}
                    - Pricing: ${data.pricingDetails}
                    - Rules: ${data.businessRules}
                    
                    Respond ONLY with a JSON object containing a "messages" key which is an array of message objects: {"messages": [{"role": "user", "text": "..."}, {"role": "assistant", "text": "..."}]}.
                    Show a realistic greeting and a query about pricing or service. Generate 3-4 messages.`
                },
                {
                    role: "user",
                    content: "Generate a sample conversation preview."
                }
            ],
            response_format: { type: "json_object" }
        });

        const rawContent = response.choices[0].message.content || "{}";
        const content = JSON.parse(rawContent);
        
        return { success: true, messages: content.messages || [] };
    } catch (error: any) {
        throw new Error(error.message || "AI failed to generate preview");
    }
}

export async function sendWhatsAppTestMessage(to: string) {
    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Unauthorized or Business not found");
    if (!business.waPhoneNumberId || !business.waToken) {
        throw new Error("WhatsApp account not connected");
    }

    const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
    const cleanTo = to.replace(/\D/g, "");

    await sendWhatsAppMessage(
        business.waPhoneNumberId,
        business.waToken,
        cleanTo,
        "Hello from Turant Reply! Your WhatsApp connection is active. 🚀"
    );

    return { success: true };
}

export async function testAIChatReply(message: string, systemPrompt: string, knowledgeBase: string, tone: string) {
    try {
        const response = await openai.chat.completions.create({
            model: process.env.AI_MODEL || DEFAULT_AI_MODEL,
            temperature: 0.7,
            messages: [
                {
                    role: "system",
                    content: `You are simulating the AI receptionist for a business on WhatsApp.
Tone: ${tone}
System Prompt: ${systemPrompt}
Knowledge Base Context:
${knowledgeBase}

Respond to the customer's query. Follow the rules: be concise, do not invent facts, and match the specified tone.`
                },
                { role: "user", content: message }
            ]
        });
        return { success: true, reply: response.choices[0]?.message?.content?.trim() || "No response." };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to generate reply" };
    }
}

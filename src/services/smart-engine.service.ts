import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { hasFeature } from "@/lib/plans";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export type SmartActionType = "FOLLOW_UP" | "OFFER" | "PRIORITIZE" | "REMINDER" | "NONE";

export interface SmartActionResult {
    type: SmartActionType;
    message?: string;
    reasoning: string;
    priorityScore: number;
    actionData?: any;
}

export class SmartEngineService {
    /**
     * Main entry point to analyze a lead and perform a smart action.
     */
    static async processLead(leadId: string) {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: { 
                business: true,
                messages: {
                    orderBy: { timestamp: "desc" },
                    take: 10
                }
            }
        });

        if (!lead || lead.isAiPaused || !lead.business.followUpEnabled) return;

        // 0. Check Plan Permissions (Automation Rules are GROWTH+)
        if (!hasFeature(lead.business, "canUseAutomationRules")) {
            console.log(`[SMART_ENGINE] Business ${lead.businessId} plan ${lead.business.plan} cannot use automation rules. Skipping.`);
            return;
        }

        // 1. Analyze with AI
        const action = await this.generateSmartAction(lead);
        if (action.type === "NONE") return;

        // 2. Apply Action based on Business Mode
        await this.applyAction(lead, action);
    }

    /**
     * Uses OpenAI to decide the best next step for a lead.
     */
    static async generateSmartAction(lead: any): Promise<SmartActionResult> {
        try {
            const history = lead.messages.reverse().map((m: any) => ({
                role: m.sender === "CUSTOMER" ? "user" : "assistant",
                content: m.message
            }));

            const response = await openai.chat.completions.create({
                model: process.env.AI_MODEL || "openai/gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are a Senior Sales Strategist for ${lead.business.name}.
                        Analyze the conversation and decide the best NEXT Smart Action.
                        
                        Lead Stage: ${lead.leadType || "NEW"}
                        Score: ${lead.score}
                        Last Interaction: ${lead.lastInteraction}
                        Summary: ${lead.conversationSummary || "None"}
                        Follow-up Count: ${lead.followUpCount}
                        
                        Actions:
                        - FOLLOW_UP: Friendly check-in for silent users.
                        - OFFER: Suggest discount or specific item if interested but hesitant.
                        - PRIORITIZE: High intent detected (asking for price, booking, location).
                        - REMINDER: Appointment or payment pending.
                        - NONE: No action needed yet.
                        
                        Rules:
                        - Max 1-2 follow-ups allowed. Stop if followUpCount >= ${lead.business.maxFollowUps}.
                        - Messages must be short (< 2 lines), conversational, no fluff.
                        - Match previous language (Hinglish/English/Hindi).
                        
                        Return JSON:
                        {
                            "type": "FOLLOW_UP" | "OFFER" | "PRIORITIZE" | "REMINDER" | "NONE",
                            "message": "Suggested text",
                            "reasoning": "Internal strategic reason",
                            "priorityScore": 0-100,
                            "actionData": {}
                        }`
                    },
                    ...history
                ],
                response_format: { type: "json_object" },
                temperature: 0.3
            });

            const content = response.choices[0]?.message?.content;
            if (!content) throw new Error("AI returned empty content");
            
            return JSON.parse(content) as SmartActionResult;
        } catch (error) {
            console.error("[SMART_ENGINE] AI Generation failed:", error);
            return { type: "NONE", reasoning: "AI Error", priorityScore: 0 };
        }
    }

    /**
     * Executes or logs the action based on business configuration.
     */
    private static async applyAction(lead: any, action: SmartActionResult) {
        const mode = lead.business.aiActionMode || "SUGGEST";
        const businessId = lead.businessId;
        const leadId = lead.id;

        // 1. Log to Suggestions table for visibility (The Activity Log)
        const suggestion = await (prisma as any).suggestion.create({
            data: {
                businessId,
                leadId,
                type: action.type,
                content: action.message || "Priority updated",
                reasoning: action.reasoning,
                actionData: action.actionData,
                status: mode === "AUTO" ? "AUTO_EXECUTED" : "PENDING"
            }
        });

        // 2. Execute based on Mode
        if (action.type === "PRIORITIZE") {
            await prisma.lead.update({
                where: { id: leadId },
                data: { score: action.priorityScore, leadType: "Hot lead" }
            });
        }

        if (mode === "AUTO" && action.message) {
            // Send Message
            const token = lead.business.waToken || process.env.WHATSAPP_TOKEN;
            if (token && lead.business.waPhoneNumberId) {
                const waResponse = await sendWhatsAppMessage(
                    lead.business.waPhoneNumberId,
                    token,
                    lead.phone,
                    action.message
                );

                // Log Message
                await prisma.message.create({
                    data: {
                        businessId,
                        leadId,
                        waMessageId: waResponse.messages[0]?.id,
                        message: action.message,
                        sender: "BUSINESS",
                        senderType: "AI_AUTO_ACTION"
                    }
                });

                // Update follow-up tracking
                await prisma.lead.update({
                    where: { id: leadId },
                    data: {
                        followUpCount: { increment: 1 },
                        lastAiActionAt: new Date(),
                        nextAiActionAt: new Date(Date.now() + (lead.business.followUpInterval * 60 * 60 * 1000))
                    }
                });
            }
        } else if (mode === "SUGGEST") {
            // Just notify or wait for manual approval
            // Implementation detail: The user sees this in the AI Activity Log.
            await prisma.lead.update({
                where: { id: leadId },
                data: {
                    lastAiActionAt: new Date()
                }
            });
        }
    }
}

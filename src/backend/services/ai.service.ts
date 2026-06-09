import OpenAI from "openai";
import { DEFAULT_AI_MODEL } from "../../config/ai";

export class AIService {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({
            apiKey,
            baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
        });
    }

    async generateReply(systemPrompt: string, userMessage: string, contextString: string, businessType?: string) {
        try {
            const model = process.env.AI_MODEL || DEFAULT_AI_MODEL;
            const response = await this.openai.chat.completions.create({
                model: model,
                temperature: 0.7,
                max_tokens: 300,
                messages: [
                    {
                        role: "system",
                        content: `You represent a business on WhatsApp. Follow these TURANT AI CORE RULES:
1. CONCISE: Max 2-3 short sentences. People read on small screens.
2. CTA-DRIVEN: Every single message MUST end with a clear question or Call To Action.
3. FORMATTING: Use line breaks for readability. Use *text* for bold (WhatsApp style). Use emojis sparingly.
5. CONTEXT-GROUNDED: ONLY use the Business Details provided below. DO NOT invent facts, services, or prices not listed. If information is missing, politely say you don't know or ask them to wait for a human.
6. NO PAYMENTS: Do NOT discuss or attempt to take payments from customers. Payment automation is not enabled.
7. NON-PUSHY: Be helpful and advisory. 

PERSONA RULES (${businessType || "GENERIC"}):
${this.getPersonaRules(businessType)}

Business Details/Context:
${contextString}

Specific Business Personality/Instructions:
${systemPrompt}`,
                    },
                    { role: "user", content: userMessage },
                ],
            });

            return response.choices[0]?.message?.content?.trim() ?? "Sorry, I couldn't understand that.";
        } catch (error: any) {
            console.error("Error generating AI reply:", error.message || error);
            return "I am currently experiencing technical difficulties. Real humans will get back to you soon.";
        }
    }

    async extractLeadInfo(contextString: string): Promise<{ name: string | null; requirement: string | null }> {
        try {
            const model = process.env.AI_MODEL || DEFAULT_AI_MODEL;
            const response = await this.openai.chat.completions.create({
                model: model,
                temperature: 0,
                max_tokens: 150,
                messages: [
                    {
                        role: "system",
                        content: `You are an expert CRM assistant. Analyze the following WhatsApp conversation transcript between a Business and a Customer.
Extract the customer's:
1. Name (only if explicitly mentioned, otherwise null)
2. Requirement/Interest (what specific product, service, or topic they are interested in, e.g. "Web development", "Foam wash", etc.)

Respond ONLY with a valid JSON object containing the keys "name" (string or null) and "requirement" (string or null). Do not include any formatting, markdown, or code block ticks (e.g. do not write \`\`\`json). Just the raw json string.`
                    },
                    { role: "user", content: contextString }
                ]
            });

            const content = response.choices[0]?.message?.content?.trim() || "{}";
            // Strip potential markdown code blocks if any
            const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleaned);
            return {
                name: parsed.name || null,
                requirement: parsed.requirement || null
            };
        } catch (error: any) {
            console.error("Error extracting lead info:", error.message || error);
            return { name: null, requirement: null };
        }
    }

    private getPersonaRules(type?: string): string {
        switch (type) {
            case "SERVICE":
                return "- Intent: Booking/Price. Detect if they want a slot. Suggest specific times if not mentioned.\n- CTA: Ask to confirm a slot or suggest a time.";
            case "SELLING":
                return "- Intent: Shopping. Suggest best-matching products. Ask for size/color if they want to buy.\n- CTA: Ask if they want to add to cart or see more items.";
            case "FOOD":
                return "- Intent: Order. Offer the menu (PDF/Sections). Draft orders with items+qty. Ask for address/ETA.\n- CTA: Ask to confirm the items or if they want to add anything else.";
            case "RENTAL":
                return "- Intent: Booking. Ask for duration. Suggest availability.\n- CTA: Ask if they want to confirm dates or see the catalog.";
            case "COACHING":
                return "- Intent: Demo/Enroll. Recommend courses. Suggest specific demo slots.\n- CTA: Ask if they want to book a free demo or see the syllabus.";
            default:
                return "- Intent: FAQ/General. Answer based on context. Tag hot leads.\n- CTA: Ask a follow-up question to keep the conversation alive.";
        }
    }
}

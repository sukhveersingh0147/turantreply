import OpenAI from "openai";

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
            const model = process.env.AI_MODEL || "gpt-4o-mini";
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
        } catch (error) {
            console.error("Error generating AI reply:", error);
            return "I am currently experiencing technical difficulties. Real humans will get back to you soon.";
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

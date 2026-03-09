import OpenAI from "openai";

export class AIService {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    async generateReply(systemPrompt: string, userMessage: string, contextString: string) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o-mini", // Use smaller, faster model for chat
                temperature: 0.7,
                max_tokens: 300,
                messages: [
                    {
                        role: "system",
                        content: `You are a helpful AI assistant representing a business. Be polite, concise, and helpful. 
                        
Business Details/Context:
${contextString}

Base System Instructions:
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
}

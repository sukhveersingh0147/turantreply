import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});

/**
 * Generates an AI response for a WhatsApp conversation.
 * 
 * @param customerMessage The message received from the customer
 * @param businessContext The custom instructions/prompt for the business
 * @param conversationHistory (Optional) Previous messages for context
 * @returns The generated response string
 */
export async function generateAIResponse(
    customerMessage: string,
    businessContext: string,
    conversationHistory: { role: "user" | "assistant"; content: string }[] = [],
    knowledgeBase: string = ""
) {
    if (!process.env.OPENAI_API_KEY) {
        console.error("Missing OPENAI_API_KEY");
        return "I'm sorry, my AI engine is currently offline. Please try again later.";
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful AI assistant for a business. 
                    
                    Business Context and Instructions:
                    ${businessContext || "You are a professional assistant. Be helpful and concise."}
                    
                    ${knowledgeBase ? `Additional Business Knowledge:\n${knowledgeBase}` : ""}
                    
                    Rules:
                    1. Keep responses short and friendly (suitable for WhatsApp).
                    2. Only answer based on the business context provided.
                    3. If you don't know the answer, ask the user to wait for a human agent.
                    4. Do not use complex formatting like markdown tables, as they don't render well on WhatsApp.`
                },
                ...conversationHistory,
                {
                    role: "user",
                    content: customerMessage,
                },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        return response.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
    } catch (error) {
        console.error("OpenAI Error:", error);
        return "I'm sorry, I'm having trouble thinking right now. A human agent will get back to you soon!";
    }
}

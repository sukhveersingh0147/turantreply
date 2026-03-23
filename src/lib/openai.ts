import OpenAI from "openai";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
    timeout: 120000, // 120 seconds for free model latency
    defaultHeaders: {
        "HTTP-Referer": "https://www.turantreply.com",
        "X-Title": "Turant Reply",
    }
});

/**
 * Generates an AI response for a WhatsApp conversation.
 */
export async function generateAIResponse(
    customerMessage: string,
    business: {
        name: string;
        businessType?: string | null;
        industry?: string | null;
        description?: string | null;
        location?: string | null;
        aiSystemPrompt?: string | null;
        knowledgeBase?: string | null;
        plan: string;
        items?: any[];
        currentBookings?: any[]; // [{ itemName, startTime, endTime, status }]
        customerName?: string | null;
    },
    conversationHistory: { role: "user" | "assistant"; content: string }[] = []
) {
    if (!process.env.OPENAI_API_KEY) {
        console.error("Missing OPENAI_API_KEY");
        return {
            content: "I'm sorry, my AI engine is currently offline. Please try again later.",
            isEmergency: false
        };
    }

    try {
        const model = process.env.AI_MODEL || "openai/gpt-4o-mini";
        console.log(`[AI] Generating response using model: ${model}`);
        const response = await openai.chat.completions.create({
            model: model,

            messages: [
                {
                    role: "system",
                    content: `You are a warm, premium, and highly helpful Sales & Hospitality Assistant for ${business.name}. 
                    Role: Professional, energetic, and concise. Your aim is to make the customer feel valued while guiding them to a decision.

                    STRICT STYLE RULES:
                    1. LANGUAGE: Match the user's language (English, Hindi, Hinglish) perfectly. Use a natural, friendly conversational tone.
                    2. EMOJIS: ALWAYS use 1-2 relevant emojis per message to feel friendly (e.g., 👋, ✨, 🛍️, ☕).
                    3. FORMATTING: Use standard text. DO NOT use *stars* for bolding and DO NOT use fancy Unicode fonts or mathematical symbols. Use clear spacing between sections.
                    4. BREVITY: Keep responses between 1-4 lines. Avoid long "bot-like" automated-sounding paragraphs.
                    5. PERSONALIZATION: If name is "${business.customerName || ""}", use it once ("Hi ${business.customerName || ""}! ✨").
                    6. GROUNDING: ONLY use the information provided in the "Business Details" and "Knowledge Base" below. DO NOT invent facts, prices, or policies not explicitly mentioned. If you don't know an answer, politely say: "Mujhe check karna hoga, main team se puch kar batata hoon. 👍"

                    INTERACTION FLOW:
                    - Answer questions clearly and first.
                    - Offer exactly 2-3 numbered options (1️⃣, 2️⃣, 3️⃣) for the NEXT step (e.g., 1️⃣ View Menu, 2️⃣ Book Table).
                    - Never show more than 3 options.
                    - If the user seems frustrated, offer human support ("Mere team ke member aapki help karenge 👍").

                    Business Details:
                    - Name: ${business.name}
                    - Context: ${business.description || ""}
                    - Knowledge Base: ${business.knowledgeBase || "N/A"}
                    
                    ${business.items && business.items.length > 0 ? `*Available Today:*
${business.items.slice(0, 8).map(p => {
                        return `• ${p.name}: ₹${p.price}${p.isAvailable ? '' : ' (Out of Stock)'}`;
                    }).join('\n')}` : ""}

                    ${business.aiSystemPrompt ? `Special Instructions: ${business.aiSystemPrompt}` : ""}
                    
                    Example Response (Hinglish):
                    "Ji zaroor! Humare paas Special Cold Coffee ₹90 mein available hai. ☕ 
                    Kya aap order place karna chahenge?
                    
                    1️⃣ Order Now
                    2️⃣ View Full Menu"`
                },
                ...conversationHistory,
                {
                    role: "user",
                    content: customerMessage,
                },
            ],
            temperature: 0.3,
            max_tokens: 150,
        });

        const rawReply = response.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

        // Emergency Detection
        const emergencyKeywords = [
            "frustrated", "angry", "terrible", "bad service", "complaint", "human", "scam", 
            "shouting", "fraud", "manager", "support", "real person", "not helpful",
            "fake", "useless", "disappointed", "worst", "hate", "stop", "unsubscribe"
        ];
        const isEmergency = emergencyKeywords.some(keyword => customerMessage.toLowerCase().includes(keyword));

        // 4. Extract Buttons from AI Reply (Pattern: 1️⃣ Title)
        const buttons: string[] = [];
        const buttonPattern = /[1-3]️⃣\s*(?:\[)?(.*?)(?:\])?(?:\n|$|(?=\s[1-3]️⃣))/g;
        let match;
        while ((match = buttonPattern.exec(rawReply)) !== null) {
            const btnText = match[1].trim();
            if (btnText && btnText.length > 0) {
                buttons.push(btnText);
            }
        }

        // 5. Image Suggestion (If AI mentions an item from inventory, pick its image)
        let imageUrl: string | undefined = undefined;
        if (business.items) {
            const mentionedItem = business.items.find(item => 
                rawReply.toLowerCase().includes(item.name.toLowerCase())
            );
            if (mentionedItem?.imageUrl || (mentionedItem?.imageUrls && mentionedItem.imageUrls.length > 0)) {
                imageUrl = mentionedItem.imageUrl || mentionedItem.imageUrls[0];
            }
        }

        // Append Branding for FREE users
        const brandingSuffix = (business.plan === "FREE") ? "\n\nPowered by Turant Reply" : "";
        const finalReply = rawReply + brandingSuffix;

        return {
            content: finalReply,
            isEmergency,
            buttons: buttons.slice(0, 3), // Max 3 buttons
            imageUrl // Pass the extracted image URL
        };
    } catch (error) {
        console.error("OpenAI Error:", error);
        return {
            content: "I'm sorry, I'm having trouble thinking right now. A human agent will get back to you soon!",
            isEmergency: true // Default to emergency for safety on error
        };
    }
}

/**
 * Extracts lead data from a conversation.
 */
export async function extractLeadData(
    customerMessage: string,
    conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<{
    name?: string;
    interest?: string;
    stage?: "Hot lead" | "Interested lead" | "Appointment booked" | "Information requested" | "NEW";
    summary?: string;
    appointmentTime?: string; // Singular time (fallback)
    startDate?: string;       // For rentals/bookings
    endDate?: string;         // For rentals/bookings
    itemId?: string;          // Extracted if mentioned
}> {
    if (!process.env.OPENAI_API_KEY) return {};

    try {
        const model = process.env.AI_MODEL || "openai/gpt-4o-mini";
        console.log(`[AI] Extracting lead data using model: ${model}`);
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "system",
                    content: `You are an expert data analyst. Extract lead information from the following conversation.
                    Return the data in VALID JSON format.
                    
                    Fields:
                    - name: Customer's name (if mentioned)
                    - interest: What the customer is interested in
                    - stage: One of: "Hot lead", "Interested lead", "Appointment booked", "Information requested", "NEW"
                    - summary: A very brief summary of the conversation (1 sentence)
                    - appointmentTime: If an appointment is mentioned, extract it in ISO 8601 format.
                    - startDate: Start of rental/booking in ISO 8601.
                    - endDate: End of rental/booking in ISO 8601.
                    - itemId: The ID or Name of the item/bike/service if clearly identified.
                    
                    Only return the JSON object. No extra text.`
                },
                ...conversationHistory,
                { role: "user", content: customerMessage }
            ],
            response_format: { type: "json_object" },
            temperature: 0,
        });

        const content = response.choices[0]?.message?.content;
        return content ? JSON.parse(content) : {};
    } catch (error) {
        console.error("Extraction Error:", error);
        return {};
    }
}

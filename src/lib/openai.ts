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
        targetAudience?: string | null;
        pricingDetails?: string | null;
        businessRules?: string | null;
        plan: string;
        items?: any[];
        currentBookings?: any[]; // [{ itemName, startTime, endTime, status }]
        customerName?: string | null;
        paymentEnabled?: boolean;
        lastPaymentStatus?: string; // "PENDING", "PAID", "NONE"
        lastOrderAmount?: number;
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
        const model = process.env.AI_MODEL || "moonshotai/kimi-k2-instruct";
        console.log(`[AI] Generating response using model: ${model}`);
        const response = await openai.chat.completions.create({
            model: model,

            messages: [
                {
                    role: "system",
                    content: `You are an AI Receptionist, Sales Assistant, and Follow-up Manager for ${business.name}.
                    Your job is to behave like a real local business receptionist who talks to customers, understands their needs, helps them, and converts them into paying customers.

                    ---
                    SECTION 1 — PERSONALITY
                    Friendly, Polite, Helpful, Professional, Natural (human-like). You are NOT a bot. Talk like a real receptionist.

                    ---
                    SECTION 2 — OPERATIONAL GUIDELINES (Priority)
                    - Business Name: ${business.name}
                    - About: ${business.description || "N/A"}
                    - Target Audience: ${business.targetAudience || "N/A"}
                    - Pricing & Services: ${business.pricingDetails || "N/A"}
                    - Rules & Policies: ${business.businessRules || "N/A"}
                    - Knowledge Base: ${business.knowledgeBase || "N/A"}
                    
                    ---
                    SECTION 3 — BUSINESS-SPECIFIC SYSTEM PROMPT (Highest Priority)
                    ${business.aiSystemPrompt ? `CRITICAL INSTRUCTIONS:\n${business.aiSystemPrompt}\n\nStrictly follow the templates and instructions provided above.` : "No specific instructions provided. Follow general professional behavior."}
                    
                    ${business.items && business.items.length > 0 ? `*Available Today:*
${business.items.slice(0, 8).map(p => {
                        return `• ${p.name}: ₹${p.price}${p.isAvailable ? '' : ' (Out of Stock)'}`;
                    }).join('\n')}` : ""}

                    ---
                    SECTION 3 — FIRST MESSAGE
                    If this is the start of a conversation, always start exactly with:
                    "Hi 👋 Welcome to ${business.name}! How can I help you today?"
                    Do NOT start selling immediately.

                    ---
                    SECTION 4 — CONVERSATION FLOW
                    1. Greet -> 2. Understand need -> 3. Ask clarification -> 4. Offer options -> 5. Guide step-by-step -> 6. Ask confirmation -> 7. Execute action.

                    ---
                    SECTION 5 — INTENT HANDLING
                    Detect if user wants: Product inquiry, Service booking, Food order, Rental inquiry, or Course inquiry. Respond accordingly.

                    ---
                    SECTION 6 — BUSINESS-SPECIFIC BEHAVIOR
                    - Selling: Show products -> ask preference -> guide to order.
                    - Service: Explain service -> ask date/time -> confirm -> book.
                    - Food: Show menu -> take order -> confirm.
                    - Rental: Check availability -> ask duration -> confirm.
                    - Coaching: Explain course -> offer demo -> capture lead.

                    ---
                    SECTION 7 — NO DIRECT ACTION
                    Never auto-book, auto-order, or auto-send payments. Always confirm with the customer first.

                    ---
                    SECTION 8 — SALES BEHAVIOR
                    Help -> Suggest -> Guide -> Close. Do NOT push aggressively.
                    Example: "We have this option at ₹499 👍 Would you like to see more or place an order?"

                    ---
                    SECTION 9 — PERSONALIZATION
                    Use customer name: ${business.customerName || "available name"}. Use previous context and business data.

                    ---
                    SECTION 10-13 — FOLLOW-UP SYSTEM
                    - Trigger follow-ups if user showed interest but stopped replying.
                    - Send only 1-2 follow-ups. Do not spam.
                    - Stop if user says "later", "not interested", or if they are active.

                    ---
                    SECTION 14-15 — DASHBOARD & SUGGESTION MODE
                    Log every action (Lead status, conversation stage). Suggest actions like "Send follow-up?" or "Offer discount?".

                    ---
                    SECTION 16 — PAYMENT RULES
                    Integration Status: payment_enabled = ${business.paymentEnabled ? "true" : "false"}.
                    
                    If payment_enabled = true:
                    - CURRENT ORDER STATUS: ${business.lastPaymentStatus || "NONE"}. ${business.lastOrderAmount ? `AMOUNT: ₹${business.lastOrderAmount}` : ""}
                    - CRITICAL: You MUST NOT say "payment complete" or "payment received" if status is 'NONE', 'PENDING', or 'UNPAID'.
                    - If status is 'PAID': Confidently thank them for the payment.
                    - If status is 'NONE' or 'PENDING': You must assume they have NOT paid yet. Even if they say "I paid", you must politely say "I haven't received the confirmation yet, please wait a moment or check your payment link."
                    - NEVER say payment is successful just because you are about to book or sending a link.
                    - Only say "Payment complete" if status is strictly 'PAID'.
                    
                    If payment_enabled = false:
                    - You must NOT offer online payment, send links, or ask for methods.
                    - Instead say: "Payment can be done at the store/office" or "Our team will assist you with payment."
                    - Never assume payment capability.

                    ---
                    SECTION 17 — TONE & STYLE
                    - Short messages (1-3 lines).
                    - Clear, helpful, simple language.
                    - Moderate emoji use (1-2 per message).
                    - NO FANCY FONTS (*bold*, unicode, etc.). Match user language (Hinglish/English/Hindi).

                    ---
                    SECTION 18-19 — ERROR HANDLING & FINAL GOAL
                    If unsure, ask: "Can you tell me more about what you're looking for?"
                    GOAL: Help the customer, build trust, and convert into a paying customer to support business growth.

                    ${business.aiSystemPrompt ? `Business-Specific Instructions: ${business.aiSystemPrompt}` : ""}`
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
        const model = process.env.AI_MODEL || "moonshotai/kimi-k2-instruct";
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

"use server";

import { auth } from "@/auth";
import { openai } from "@/lib/openai";
import { getInventory } from "./inventory";
import { getAccessibleBusiness } from "./settings";

export async function processCatalogCommand(message: string, history: any[] = [], image?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) return { reply: "I couldn't find your business settings. Please go to Settings and complete your profile first.", actionPreview: null };

    const inventory = await getInventory();

    const systemPrompt = `You are the AI Catalog Assistant for TurantReply. Your job is to help users manage their specialized product/service catalog using both text and vision.

CORE CAPABILITIES:
1. SMART EXTRACTION: If an image is provided (menu, shelf, flyer), extract ALL items. Identify Type, Name, Price, and Description visually.
2. VISUAL SEARCH/MATCHING: If a user asks "Which item is this?" or "Find this in my catalog", compare the provided image with the "Current Catalog Items" list. Return the most likely ID and Action: UPDATE.
3. CONTEXTUAL CATEGORIZATION: Use visual cues (colors, branding, layout) to suggest categories (e.g., "Luxury", "Sale", "New Arrival").

We support 5 core business types:
1. PRODUCT (Retail): Name, Price, Stock, Category, Images, Description, Variants.
2. SERVICE (Salon/Gym): Name, Price, Duration (extract e.g. "60 mins"), Description.
3. MENU (Restaurant): Name, Price, Category (Starter/Main), Image.
4. RENTAL (Bike/PG): Name, Price (per hr/day), Security Deposit, Description.
5. COURSE (Education): Name, Price, Duration, Start Date.

Current Catalog Items:
${inventory.map((item: any) => `- [${item.id}] ${item.name} (${item.type}): ₹${item.price}. Desc: ${item.description || 'N/A'}`).join('\n')}

Supported Actions:
1. CREATE: New single item. Data: { name, type, price, stock?, category?, description?, imageUrl? }
2. UPDATE: Modify ONE existing item. ALWAYS require id. Data: { id, data: Partial<Item> }
3. DELETE: Remove ONE item. ALWAYS require id. Data: { id, name }
4. BULK_ADD: Multiple new items. Use this if the user provides a list or if more than one item needs to be created/updated. Data: { items: Item[] }

Rules:
- BREVITY: Keep replies to 1-2 short sentences.
- IMAGE HANDLING: If an image is provided in the current message (vision context), ALWAYS include that exact image URL in the "imageUrl" field for any CREATE or BULK_ADD actions.
- QUALITY: For SERVICES/RENTALS, always try to extract "duration" into the description or metadata.
- MULTIPLE ITEMS: If the user provides multiple items to update or add, ALWAYS use BULK_ADD. Do not try to return multiple separate actions.

Respond ONLY with the JSON:
{
  "reply": "string",
  "actionPreview": {
    "type": "CREATE" | "UPDATE" | "DELETE" | "BULK_ADD" | "CLARIFY",
    "details": {
      // For CREATE: { name, type, price, ... }
      // For UPDATE: { id, data: { ... } }
      // For DELETE: { id, name }
      // For BULK_ADD: { items: [{ name, type, price, ... }] }
    },
    "summary": "string"
  }
}`;

    try {
        // Use a vision-capable model if an image is provided
        const isGroq = process.env.OPENAI_BASE_URL?.includes("groq");
        const defaultModel = process.env.AI_MODEL || "moonshotai/kimi-k2-instruct";
        const visionModel = isGroq ? "llama-3.2-11b-vision-instant" : "moonshotai/kimi-k2-instruct";
        const model = image ? visionModel : defaultModel;

        const messages: any[] = [
            { role: "system", content: systemPrompt },
            ...history,
        ];

        if (image) {
            messages.push({
                role: "user",
                content: [
                    { type: "text", text: message || "Analyze this image and extract catalog items." },
                    { type: "image_url", image_url: { url: image } }
                ]
            });
        } else {
            messages.push({ role: "user", content: message });
        }

        const response = await openai.chat.completions.create({
            model: model,
            messages,
            response_format: { type: "json_object" },
            temperature: 0,
        });

        const rawContent = response.choices[0]?.message?.content;
        if (!rawContent) return { reply: "I couldn't process that command. Please try again.", actionPreview: null };

        const content = JSON.parse(rawContent);
        
        // Safety check to ensure reply and summary are strings (prevents [object] issues)
        if (content.reply && typeof content.reply !== 'string') {
            content.reply = JSON.stringify(content.reply);
        }
        if (content.actionPreview?.summary && typeof content.actionPreview.summary !== 'string') {
            content.actionPreview.summary = JSON.stringify(content.actionPreview.summary);
        }

        return content;
    } catch (error) {
        console.error("[AI-CATALOG] Error:", error);
        return { reply: "Sorry, I encountered an error processing your request.", actionPreview: null };
    }
}


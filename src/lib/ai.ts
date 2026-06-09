import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";
import { DEFAULT_AI_MODEL } from "@/config/ai";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "",
});

export const KIMI_MODEL = DEFAULT_AI_MODEL;

export const MASTER_SYSTEM_PROMPT = (business: {
  name: string;
  vertical: string;
  services: string;
  timing: string;
  location: string;
  aiSystemPrompt?: string;
}) => `
Tum ${business.name} ke WhatsApp assistant ho.
Tum business ki taraf se baat karte ho.

IDENTITY RULES (NEVER BREAK):
- Business = "Hum/Humara/Humari/Hamare"
- Customer = "Aap/Aapka/Aapki"
- Examples:
  ✅ "Hamare paas appointment available hai"
  ✅ "Humari service ki price ₹500 hai"  
  ❌ "Apke salon mein..." (WRONG — never say this)
  ❌ "Apki service..." (WRONG)

CONVERSATION RULES — MOST IMPORTANT:
1. EK message mein SIRF EK kaam karo
2. Ek sawal puchho, sab sawal ek saath NAHI
3. Customer ka jawab suno, PHIR agle step pe jao
4. Chhote messages likho — max 4-5 lines
5. Jab tak customer na puchhe — price list, 
   full menu, sab services EK SAATH mat batao

CONVERSATION STAGES:

STAGE 1 — GREETING
Trigger: "hi", "hello", "namaste", or first message
Response: Warm greeting + EK open question ONLY
Example: "Namaste! 😊 ${business.name} mein 
aapka swagat hai. Kaise help kar sakta hun?"
DO NOT: List all services in greeting

STAGE 2 — UNDERSTAND NEED  
Trigger: Customer bataye kya chahiye
Response: Acknowledge + relevant follow-up ONLY
If appointment: "Zaroor! Konsi service chahiye?"
If price: Ask which specific service, not full list
If info: Answer only what they asked
DO NOT: Give full price list unless specifically asked

STAGE 3 — COLLECT DETAILS (one by one)
For appointments collect IN ORDER:
  First ask: Service/purpose
  Then ask: Preferred date
  Then ask: Preferred time (give 2-3 options)
  Then ask: Name
  NEVER ask all 4 in one message

STAGE 4 — CONFIRM
Repeat back what you understood:
"Toh [Name] ji, [Service] ke liye 
[Date] ko [Time] baje — sahi hai?"

STAGE 5 — CLOSE
After confirmation:
"✅ Perfect! Confirm ho gaya.
[Date] ko [Time] baje milte hain.
Koi aur help chahiye?"

PRICE INQUIRY FLOW:
Customer: "Price kya hai?" or "Kitna lagega?"
AI: "Kaunsi service ke baare mein poochh rahe hain?" 
(Ask which service — do NOT dump full price list)

Customer: "Facial"
AI: "Humari Basic Facial ₹600 mein available hai.
Book karein?" 
(Give ONE price, then ask if they want to book)

INFORMATION FLOW:
Customer asks specific question → Answer only that
Customer: "Sunday open ho?" 
AI: "Sunday hum band rehte hain. 
Monday se Saturday 10 AM se 8 PM tak open hain."
(Short, direct answer only)

ESCALATION & HANDOVER:
- If customer asks for: "human", "person", "owner", "staff", "baat karwao", "help", "manager"
- If customer is angry or has a complex issue the AI cannot solve
- ACTION: 
  1. Say: "Theek hai, main humari team ke ek human assistant ko notify kar raha hoon. Woh aapse jald hi yahan contact karenge. Tab tak aap apna query yahan likh sakte hain."
  2. ALWAYS include the hidden marker at the end: [HANDOVER]
- Rule: Handover message ke end mein [HANDOVER] zaroor likho.

LANGUAGE:
- Customer Hindi mein likhe → Hindi reply
- Customer English mein likhe → Hinglish/English reply  
- Customer Hinglish mein → Hinglish reply
- Match customer ki language automatically

TONE:
- Friendly lekin professional
- Emojis use karo — but sparingly (1-2 per message)
- Never robotic, never dump info

SERVICES AVAILABLE:
${business.services}

TIMING: ${business.timing}
LOCATION: ${business.location}

${business.aiSystemPrompt ?? ""}
`;

/**
 * Fetch last N messages for conversation context
 */
export async function getConversationHistory(
  leadId: string,
  limit: number = 10
) {
  const messages = await prisma.message.findMany({
    where: { leadId },
    orderBy: { timestamp: "desc" },
    take: limit,
    select: {
      message: true,
      senderType: true,
      timestamp: true,
    }
  });

  // Reverse to get chronological order
  return messages.reverse().map(m => ({
    role: (m.senderType === "CUSTOMER" 
      ? "user" 
      : "assistant") as "user" | "assistant",
    content: m.message,
  }));
}

/**
 * Build business context for AI
 */
export async function getBusinessContext(
  businessId: string
) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      name: true,
      aiSystemPrompt: true,
      businessType: true,
      workingHours: true,
      location: true,
    }
  });

  // Get catalog items for context
  const items = await prisma.item.findMany({
    where: { businessId, isActive: true },
    select: { name: true, price: true, category: true },
    take: 15,
  });

  const servicesText = items
    .map(i => `- ${i.name}: ₹${i.price}`)
    .join("\n");

  return {
    name: business?.name ?? "Business",
    vertical: business?.businessType ?? "other",
    services: servicesText,
    timing: business?.workingHours 
      ? JSON.stringify(business.workingHours)
      : "10 AM - 8 PM, Monday to Saturday",
    location: business?.location ?? "",
    aiSystemPrompt: business?.aiSystemPrompt ?? "",
  };
}

/**
 * Main AI reply function
 */
export async function generateWhatsAppReply({
  customerMessage,
  businessId,
  leadId,
}: {
  customerMessage: string;
  businessId: string;
  leadId: string;
}): Promise<{ reply: string; shouldPauseAi: boolean }> {
  try {
    // 1. Get conversation history (last 10 messages)
    const history = await getConversationHistory(leadId, 10);

    // 2. Get business context
    const businessContext = await getBusinessContext(businessId);

    // 3. Build system prompt
    const systemPrompt = MASTER_SYSTEM_PROMPT(businessContext);

    // 4. Generate reply
    const response = await groq.chat.completions.create({
      model: KIMI_MODEL,
      max_tokens: 200,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: customerMessage },
      ],
    });

    let reply = response.choices[0]?.message?.content ?? 
      "Maafi chahta hun, kuch issue aaya. Thodi der mein dobara try karein. 🙏";
    
    const shouldPauseAi = reply.includes("[HANDOVER]");
    
    // Clean up marker from public reply
    reply = reply.replace("[HANDOVER]", "").trim();

    return { reply, shouldPauseAi };
  } catch (error) {
    console.error("[AI_REPLY_ERROR]", error);
    return { 
      reply: "Maafi chahta hun, kuch issue aaya. Thodi der mein dobara try karein. 🙏",
      shouldPauseAi: false 
    };
  }
}

/**
 * Extracts structured lead data from a conversation.
 * Kept for backward compatibility if needed.
 */
export async function extractLeadDataGroq(
  customerMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
) {
  try {
    const response = await groq.chat.completions.create({
      model: KIMI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert data analyst. Extract lead information from the following conversation.
          Return the data in VALID JSON format.
          
          Fields:
          - name: Customer's name (if mentioned)
          - interest: What the customer is interested in
          - stage: One of: "Hot lead", "Interested lead", "Appointment booked", "Information requested", "NEW"
          - summary: A very brief summary (1 sentence)
          - appointmentTime: ISO 8601 format if mentioned.
          - startDate: Start of rental/booking in ISO 8601.
          - endDate: End of rental/booking in ISO 8601.
          
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
    console.error("[EXTRACTION_ERROR]", error);
    return {};
  }
}

export default groq;

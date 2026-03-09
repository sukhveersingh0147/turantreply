import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/openai";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// This is the GET endpoint used by Meta to verify the webhook.
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    // Meta will send these parameters
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // In a real multi-tenant system, you might look up the verifyToken from the DB
    // based on some identifier, or use a global system VERIFY_TOKEN if all users
    // share one Facebook App. For ReplyFlow, we usually use a single App that
    // receives all webhooks and routes them based on the incoming phone number ID.
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "replyflow_verify_token_123";

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WhatsApp Webhook Verified Successfully!");
        // Meta expects the challenge string to be returned as plain text
        return new NextResponse(challenge, {
            status: 200,
            headers: {
                "Content-Type": "text/plain",
            },
        });
    }

    return new NextResponse("Forbidden", { status: 403 });
}

// This is the POST endpoint where Meta will send the actual WhatsApp messages
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Check if this is a WhatsApp status update or message event
        if (body.object === "whatsapp_business_account") {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.value && change.value.messages) {
                        // We received a message!
                        const message = change.value.messages[0];
                        const contact = change.value.contacts[0];
                        const metadata = change.value.metadata;

                        const phoneNumberId = metadata.phone_number_id;
                        const from = message.from; // Customer's phone number
                        const messageId = message.id;
                        const messageText = message.text?.body || "";

                        console.log(`Received message from ${from} for business ${phoneNumberId}: ${messageText}`);

                        // 1. Find which Business owns this WhatsApp Number ID
                        const business = await prisma.business.findFirst({
                            where: { waPhoneNumberId: phoneNumberId }
                        });

                        if (!business) {
                            console.error(`No business found for waPhoneNumberId: ${phoneNumberId}`);
                            continue; // Skip this message, we don't know who it belongs to
                        }

                        // 2. Find or Create the Lead (Customer)
                        let lead = await prisma.lead.findFirst({
                            where: {
                                businessId: business.id,
                                phone: from,
                            }
                        });

                        const customerName = contact?.profile?.name || "Unknown Customer";

                        if (!lead) {
                            lead = await prisma.lead.create({
                                data: {
                                    businessId: business.id,
                                    phone: from,
                                    name: customerName,
                                    status: "NEW",
                                    lastQuery: messageText,
                                }
                            });
                            console.log(`Created new lead: ${from} for business: ${business.name}`);
                        } else {
                            // Update lead's last query and updatedAt, AND reset recovery status
                            lead = await prisma.lead.update({
                                where: { id: lead.id },
                                data: {
                                    lastQuery: messageText,
                                    name: lead.name === "Unknown Customer" && customerName !== "Unknown Customer" ? customerName : undefined,
                                    recoverySentAt: null, // Lead replied, reset recovery flag
                                    status: lead.status === "RECOVERING" ? "ENGAGED" : lead.status
                                }
                            });
                        }

                        // 3. Save the actual message to the database
                        await prisma.message.create({
                            data: {
                                businessId: business.id,
                                leadId: lead.id,
                                waMessageId: messageId,
                                message: messageText,
                                sender: "CUSTOMER",
                                senderType: "CUSTOMER",
                            }
                        });

                        // 4. IF HUMAN HAS TAKEN OVER (AI IS PAUSED), STOP HERE
                        if (lead.isAiPaused) {
                            console.log(`Lead ${from} has AI paused. Skipping automated responses.`);
                            continue;
                        }

                        // 5. CHECK FOR AUTOMATIONS
                        const automations = await prisma.automation.findMany({
                            where: {
                                businessId: business.id,
                                isActive: true,
                            }
                        });

                        const matchingAutomation = automations.find(a =>
                            messageText.toLowerCase().includes(a.triggerKeyword.toLowerCase())
                        );

                        if (matchingAutomation) {
                            console.log(`Automation triggered for [${messageText}]: ${matchingAutomation.triggerKeyword}`);

                            if (business.waToken) {
                                const waResponse = await sendWhatsAppMessage(
                                    phoneNumberId,
                                    business.waToken,
                                    from,
                                    matchingAutomation.responseMessage
                                );

                                // Save the automation response
                                await prisma.message.create({
                                    data: {
                                        businessId: business.id,
                                        leadId: lead.id,
                                        waMessageId: waResponse.messages[0]?.id,
                                        message: matchingAutomation.responseMessage,
                                        sender: "BUSINESS",
                                        senderType: "AUTOMATION",
                                    }
                                });

                                // Update match count
                                await prisma.automation.update({
                                    where: { id: matchingAutomation.id },
                                    data: { matchCount: { increment: 1 } }
                                });

                                // Respond to Meta and skip AI
                                continue;
                            }
                        }

                        // 5. GENERATE AI RESPONSE
                        // Check Plan Limits & Subscription Status
                        const PLAN_LIMITS = {
                            FREE: 50,
                            STARTER: 500,
                            GROWTH: 5000,
                            AGENCY: 999999,
                            ENTERPRISE: 999999,
                        };

                        const currentPlan = (business.plan || "FREE") as keyof typeof PLAN_LIMITS;
                        const limit = PLAN_LIMITS[currentPlan] || 50;
                        const isExpired = business.subscriptionStatus === "EXPIRED";

                        if (isExpired || business.aiRepliesUsed >= limit) {
                            console.warn(`Limit reached or expired for business ${business.id}. Plan: ${currentPlan}, Used: ${business.aiRepliesUsed}, Limit: ${limit}`);
                            continue; // Skip AI response
                        }

                        // Fetch some history for better context (last 5 messages)
                        const history = await prisma.message.findMany({
                            where: { leadId: lead.id },
                            orderBy: { timestamp: "desc" },
                            take: 6, // Current message + 5 history
                        });

                        const conversationHistory = history
                            .reverse()
                            .slice(0, -1) // Exclude current message since it's passed separately
                            .map(m => ({
                                role: (m.sender === "CUSTOMER" ? "user" : "assistant") as "user" | "assistant",
                                content: m.message,
                            }));

                        const aiReply = await generateAIResponse(
                            messageText,
                            business.aiSystemPrompt || "Be helpful and answer about the business.",
                            conversationHistory,
                            business.knowledgeBase || ""
                        );

                        // Increment Usage in DB
                        await prisma.business.update({
                            where: { id: business.id },
                            data: { aiRepliesUsed: { increment: 1 } }
                        });

                        // 6. SEND WHATSAPP RESPONSE
                        if (business.waToken) {
                            try {
                                const waResponse = await sendWhatsAppMessage(
                                    phoneNumberId,
                                    business.waToken,
                                    from,
                                    aiReply
                                );

                                // 7. Save the AI's response to the database
                                await prisma.message.create({
                                    data: {
                                        businessId: business.id,
                                        leadId: lead.id,
                                        waMessageId: waResponse.messages[0]?.id,
                                        message: aiReply,
                                        sender: "BUSINESS",
                                        senderType: "AI",
                                        aiModel: "gpt-4o-mini",
                                    }
                                });

                                console.log(`AI Replied to ${from}: ${aiReply}`);
                            } catch (err) {
                                console.error("Error sending AI reply via WhatsApp:", err);
                            }
                        } else {
                            console.warn(`No waToken found for business ${business.id}, cannot send AI reply.`);
                        }
                    }
                }
            }

            // Meta expects a 200 OK fast response to acknowledge receipt
            return NextResponse.json({ status: "success" }, { status: 200 });
        }

        return NextResponse.json({ error: "Not a WhatsApp event" }, { status: 404 });
    } catch (error) {
        console.error("Webhook POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

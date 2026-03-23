import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { WhatsAppService } from "../services/whatsapp.service";
import { AIService } from "../services/ai.service";

export const webhookRouter = Router();

// WhatsApp Webhook Verification
webhookRouter.get("/", (req: Request, res: Response) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // In a real app we might lookup the business by verify_token
    // For this boilerplate, you can assert a static token or skip
    if (mode === "subscribe" && token) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Incoming Message Webhook
webhookRouter.post("/", async (req: Request, res: Response) => {
    const body = req.body;

    if (body.object) {
        if (
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0] &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {
            const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
            const from = body.entry[0].changes[0].value.messages[0].from;
            const msgBody = body.entry[0].changes[0].value.messages[0].text.body;
            const waMessageId = body.entry[0].changes[0].value.messages[0].id;

            console.log(`Received message from ${from} to ${phoneNumberId}: ${msgBody}`);

            try {
                // 1. Find Business associated with this phone number id
                const business = await prisma.business.findFirst({
                    where: { waPhoneNumberId: phoneNumberId },
                    include: { automations: true },
                });

                if (!business) {
                    console.log("No business found for this phone number:", phoneNumberId);
                    return res.sendStatus(200); // return 200 so FB doesn't retry
                }

                // Deduplication check
                const existingMsg = await prisma.message.findUnique({
                    where: { waMessageId: waMessageId }
                });

                if (existingMsg) {
                    console.log(`[WEBHOOK] Message ${waMessageId} already processed. Skipping.`);
                    return res.sendStatus(200);
                }

                // 2. Find or Create Lead
                let lead = await prisma.lead.findUnique({
                    where: { businessId_phone: { businessId: business.id, phone: from } },
                });

                if (!lead) {
                    lead = await prisma.lead.create({
                        data: {
                            businessId: business.id,
                            phone: from,
                            status: "NEW",
                        },
                    });
                } else {
                    await prisma.lead.update({
                        where: { id: lead.id },
                        data: { lastQuery: msgBody, updatedAt: new Date() },
                    });
                }

                // 3. Save Incoming Message (Safe from race conditions)
                try {
                    await prisma.message.create({
                        data: {
                            businessId: business.id,
                            leadId: lead.id,
                            waMessageId,
                            message: msgBody,
                            sender: "CUSTOMER",
                            senderType: "CUSTOMER",
                        },
                    });
                } catch (msgErr: any) {
                    if (msgErr.code === 'P2002') {
                        console.log(`[BACKEND_WEBHOOK] Message ${waMessageId} already exists. Proceeding.`);
                    } else {
                        console.error("[BACKEND_WEBHOOK] Failed to save incoming message:", msgErr.message);
                    }
                }

                // Initialize Services
                const waService = new WhatsAppService(business.waToken!, business.waPhoneNumberId!);

                // ─── Subscription & Limits Check ──────────────────────────
                if (business.subscriptionStatus === "EXPIRED") {
                    console.log(`Subscription inactive for business ${business.id}. Skipping message.`);
                    return res.sendStatus(200);
                }

                // Automation check
                const matchedAutomation = business.automations.find(
                    (auto: any) => msgBody.toLowerCase().includes(auto.triggerKeyword.toLowerCase()) && auto.isActive
                );

                let replyMessage = "";
                let senderType: "AUTOMATION" | "AI" = "AUTOMATION";

                if (matchedAutomation) {
                    replyMessage = matchedAutomation.responseMessage;

                    // Update match count
                    await prisma.automation.update({
                        where: { id: matchedAutomation.id },
                        data: { matchCount: { increment: 1 } },
                    });
                } else if (business.aiSystemPrompt) {
                    // Start AI Logic
                    const platformApiKey = process.env.OPENAI_API_KEY;
                    if (!platformApiKey) {
                        console.error("PLATFORM_OPENAI_API_KEY is not set in environment variables.");
                        return res.sendStatus(200);
                    }

                    // Check trial limits
                    // @ts-ignore
                    if (business.plan === "TRIAL" && business.trialConversationsToday >= 50) {
                        console.log(`Trial limit reached for business ${business.id}`);
                        return res.sendStatus(200);
                    }


                    const aiService = new AIService(platformApiKey);
                    senderType = "AI";

                    // Fetch recent context
                    const recentMsgs = await prisma.message.findMany({
                        where: { leadId: lead.id },
                        orderBy: { timestamp: "desc" },
                        take: 5,
                    });

                    const contextString = recentMsgs.reverse().map((m: any) => `${m.sender}: ${m.message}`).join("\n");

                    // Add knowledge base to context if available
                    const fullContext = business.knowledgeBase
                        ? `Knowledge Base:\n${business.knowledgeBase}\n\nRecent Conversation:\n${contextString}`
                        : contextString;

                    replyMessage = await aiService.generateReply(business.aiSystemPrompt, msgBody, fullContext, business.businessType as any);

                    // Increment AI usage counter
                    await prisma.business.update({
                        where: { id: business.id },
                        data: { 
                            // @ts-ignore
                            aiRepliesUsed: { increment: 1 },
                            // @ts-ignore
                            trialConversationsToday: { increment: 1 }
                        },
                    });
                } else {
                    console.log("No automation matched and AI is disabled for business", business.id);
                    return res.sendStatus(200);
                }

                // 7. Check if Auto Reply is enabled
                // @ts-ignore
                if (business.autoReplyEnabled) {
                    // Send the reply via WhatsApp
                    await waService.sendTextMessage(from, replyMessage);
                    await waService.markMessageAsRead(waMessageId);

                    // 8. Save outgoing message
                    try {
                        await prisma.message.create({
                            data: {
                                businessId: business.id,
                                leadId: lead.id,
                                message: replyMessage,
                                sender: "BUSINESS",
                                senderType: "AI",
                                aiModel: "gpt-4o-mini",
                            },
                        });
                    } catch (msgErr: any) {
                        console.error("[BACKEND_WEBHOOK] Failed to save outgoing message:", msgErr.message);
                    }
                } else {
                    // Save as Suggestion
                    try {
                        // @ts-ignore
                        await prisma.suggestion.create({
                            data: {
                                businessId: business.id,
                                leadId: lead.id,
                                content: replyMessage,
                                status: "PENDING",
                                type: "REPLY_SUGGESTION"
                            }
                        });
                        console.log(`[WEBHOOK] Auto-reply disabled. Created suggestion for business ${business.id}`);
                    } catch (sugErr: any) {
                        console.error("[BACKEND_WEBHOOK] Failed to create suggestion:", sugErr.message);
                    }
                }

            } catch (error) {
                console.error("Error processing webhook:", error);
            }
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

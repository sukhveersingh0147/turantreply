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

                // 3. Save Incoming Message
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

                // Initialize Services
                const waService = new WhatsAppService(business.waToken!, business.waPhoneNumberId!);

                // 4. Check Automations first
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
                    // 5. Fallback to AI Service (Checking Limits First)
                    const { getPlanLimit } = await import("../config/subscription");
                    const limit = getPlanLimit(business.plan);

                    if (business.aiRepliesUsed >= limit) {
                        console.log(`Usage limit reached for business ${business.id}. Plan: ${business.plan}, Used: ${business.aiRepliesUsed}`);
                        // Optionally send a "limit reached" message or just skip
                        // For now we skip as per plan
                        return res.sendStatus(200);
                    }

                    // Use Platform OpenAI Key from env
                    const platformApiKey = process.env.OPENAI_API_KEY;
                    if (!platformApiKey) {
                        console.error("PLATFORM_OPENAI_API_KEY is not set in environment variables.");
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

                    replyMessage = await aiService.generateReply(business.aiSystemPrompt, msgBody, fullContext);

                    // 5.1 Increment AI usage counter
                    await prisma.business.update({
                        where: { id: business.id },
                        data: { aiRepliesUsed: { increment: 1 } },
                    });
                } else {
                    console.log("No automation matched and AI is disabled for business", business.id);
                    return res.sendStatus(200);
                }

                // 6. Send the reply via WhatsApp
                await waService.sendTextMessage(from, replyMessage);
                await waService.markMessageAsRead(waMessageId);

                // 7. Save outgoing message
                await prisma.message.create({
                    data: {
                        businessId: business.id,
                        leadId: lead.id,
                        message: replyMessage,
                        sender: "BUSINESS",
                        senderType: senderType,
                        aiModel: senderType === "AI" ? "gpt-4o-mini" : null,
                    },
                });

            } catch (error) {
                console.error("Error processing webhook:", error);
            }
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

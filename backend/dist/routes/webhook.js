"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const whatsapp_service_1 = require("../services/whatsapp.service");
const ai_service_1 = require("../services/ai.service");
exports.webhookRouter = (0, express_1.Router)();
// WhatsApp Webhook Verification
exports.webhookRouter.get("/", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    // In a real app we might lookup the business by verify_token
    // For this boilerplate, you can assert a static token or skip
    if (mode === "subscribe" && token) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
    }
    else {
        res.sendStatus(403);
    }
});
// Incoming Message Webhook
exports.webhookRouter.post("/", async (req, res) => {
    const body = req.body;
    if (body.object) {
        if (body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0] &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]) {
            const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
            const message = body.entry[0].changes[0].value.messages[0];
            const from = message.from;
            const waMessageId = message.id;
            // Robust text extraction
            let msgBody = "";
            if (message.type === "text") {
                msgBody = message.text?.body || "";
            }
            else if (message.type === "interactive") {
                const interactive = message.interactive;
                if (interactive?.type === "button_reply") {
                    msgBody = interactive.button_reply?.title || "";
                }
                else if (interactive?.type === "list_reply") {
                    msgBody = interactive.list_reply?.title || "";
                }
            }
            else if (message.type === "image") {
                msgBody = message.image?.caption || "[IMAGE]";
            }
            else {
                msgBody = `[${message.type.toUpperCase()}]`;
            }
            console.log(`[WEBHOOK] Received ${message.type} from ${from} to ${phoneNumberId}: ${msgBody}`);
            try {
                // 1. Find Business associated with this phone number id
                const business = await prisma_1.prisma.business.findFirst({
                    where: { waPhoneNumberId: phoneNumberId },
                    include: { automations: true },
                });
                if (!business) {
                    console.log(`[WEBHOOK] No business found for phone ID: ${phoneNumberId}`);
                    return res.sendStatus(200); // return 200 so FB doesn't retry
                }
                // Deduplication check
                const existingMsg = await prisma_1.prisma.message.findUnique({
                    where: { waMessageId: waMessageId }
                });
                if (existingMsg) {
                    console.log(`[WEBHOOK] Message ${waMessageId} already processed. Skipping.`);
                    return res.sendStatus(200);
                }
                // 2. Find or Create Lead
                let lead = await prisma_1.prisma.lead.findUnique({
                    where: { businessId_phone: { businessId: business.id, phone: from } },
                });
                if (!lead) {
                    lead = await prisma_1.prisma.lead.create({
                        data: {
                            businessId: business.id,
                            phone: from,
                            status: "NEW",
                        },
                    });
                }
                else {
                    await prisma_1.prisma.lead.update({
                        where: { id: lead.id },
                        data: { lastQuery: msgBody, updatedAt: new Date() },
                    });
                }
                // 3. Save Incoming Message (Safe from race conditions)
                try {
                    await prisma_1.prisma.message.create({
                        data: {
                            businessId: business.id,
                            leadId: lead.id,
                            waMessageId,
                            message: msgBody,
                            sender: "CUSTOMER",
                            senderType: "CUSTOMER",
                        },
                    });
                }
                catch (msgErr) {
                    if (msgErr.code === 'P2002') {
                        console.log(`[BACKEND_WEBHOOK] Message ${waMessageId} already exists. Proceeding.`);
                    }
                    else {
                        console.error("[BACKEND_WEBHOOK] Failed to save incoming message:", msgErr.message);
                    }
                }
                // Initialize Services
                const waService = new whatsapp_service_1.WhatsAppService(business.waToken, business.waPhoneNumberId);
                // ─── Subscription & Limits Check ──────────────────────────
                if (business.subscriptionStatus === "EXPIRED") {
                    console.log(`Subscription inactive for business ${business.id}. Skipping message.`);
                    return res.sendStatus(200);
                }
                // Automation check
                const matchedAutomation = business.automations.find((auto) => msgBody.toLowerCase().includes(auto.triggerKeyword.toLowerCase()) && auto.isActive);
                let replyMessage = "";
                let senderType = "AUTOMATION";
                if (matchedAutomation) {
                    replyMessage = matchedAutomation.responseMessage;
                    // Update match count
                    await prisma_1.prisma.automation.update({
                        where: { id: matchedAutomation.id },
                        data: { matchCount: { increment: 1 } },
                    });
                }
                else if (business.aiSystemPrompt) {
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
                    const aiService = new ai_service_1.AIService(platformApiKey);
                    senderType = "AI";
                    // Fetch recent context
                    const recentMsgs = await prisma_1.prisma.message.findMany({
                        where: { leadId: lead.id },
                        orderBy: { timestamp: "desc" },
                        take: 5,
                    });
                    const contextString = recentMsgs.reverse().map((m) => `${m.sender}: ${m.message}`).join("\n");
                    // Add knowledge base to context if available
                    const fullContext = business.knowledgeBase
                        ? `Knowledge Base:\n${business.knowledgeBase}\n\nRecent Conversation:\n${contextString}`
                        : contextString;
                    replyMessage = await aiService.generateReply(business.aiSystemPrompt, msgBody, fullContext, business.businessType);
                    // Increment AI usage counter
                    await prisma_1.prisma.business.update({
                        where: { id: business.id },
                        data: {
                            // @ts-ignore
                            aiRepliesUsed: { increment: 1 },
                            // @ts-ignore
                            trialConversationsToday: { increment: 1 }
                        },
                    });
                }
                else {
                    console.log(`[WEBHOOK] No automation matched and AI system prompt is missing for business ${business.id}. Skipping reply.`);
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
                        await prisma_1.prisma.message.create({
                            data: {
                                businessId: business.id,
                                leadId: lead.id,
                                message: replyMessage,
                                sender: "BUSINESS",
                                senderType: "AI",
                                aiModel: "gpt-4o-mini",
                            },
                        });
                    }
                    catch (msgErr) {
                        console.error("[BACKEND_WEBHOOK] Failed to save outgoing message:", msgErr.message);
                    }
                }
                else {
                    // Save as Suggestion
                    try {
                        // @ts-ignore
                        await prisma_1.prisma.suggestion.create({
                            data: {
                                businessId: business.id,
                                leadId: lead.id,
                                content: replyMessage,
                                status: "PENDING",
                                type: "REPLY_SUGGESTION"
                            }
                        });
                        console.log(`[WEBHOOK] Auto-reply disabled. Created suggestion for business ${business.id}`);
                    }
                    catch (sugErr) {
                        console.error("[BACKEND_WEBHOOK] Failed to create suggestion:", sugErr.message);
                    }
                }
            }
            catch (error) {
                console.error("Error processing webhook:", error);
            }
        }
        res.sendStatus(200);
    }
    else {
        res.sendStatus(404);
    }
});

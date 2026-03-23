import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "./prisma";
import { generateAIResponse, extractLeadData } from "./openai";
import { sendWhatsAppMessage, validatePhoneNumber } from "./whatsapp";
import { sendPushNotification } from "./push";
import { ArcFollowupService } from "@/services/arc-followup.service";
import { createPaymentLink } from "@/app/actions/payments";
import { hasFeature } from "./plans";

/**
 * GLOBAL SINGLETON PATTERN
 * This prevents creating multiple noisy connections and workers during Next.js Hot Module Replacement (HMR).
 */
const globalForQueue = globalThis as unknown as {
    redisConnection: IORedis | undefined;
    messageQueue: Queue | undefined;
    automationQueue: Queue | undefined;
    campaignQueue: Queue | undefined;
};

function getConnection() {
    const redisUrl = process.env.REDIS_URL;
    const isVercel = !!(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL || process.env.NOW_REGION);

    // If on Vercel and no REDIS_URL, don't even try to connect (avoid "Connection is closed" errors)
    if (isVercel && !redisUrl) {
        return null;
    }

    if (!globalForQueue.redisConnection) {
        try {
            globalForQueue.redisConnection = new IORedis(redisUrl || "redis://localhost:6379", {
                maxRetriesPerRequest: null,
                lazyConnect: true,
                enableOfflineQueue: false,
                connectTimeout: 5000, // 5s timeout
                retryStrategy(times) {
                    // Be very conservative to stay quiet
                    if (times > 3) return null; // Stop retrying after 3 times to avoid hanging serverless funcs
                    return Math.min(times * 1000, 5000);
                }
            });
            
            // Pervasive Silence: Catch connection errors immediately
            globalForQueue.redisConnection.on("error", (err: any) => {
                // Silently log only if it's not a common "Connection closed" or "ECONNREFUSED"
                if (!err.message?.includes("Connection is closed") && !err.message?.includes("ECONNREFUSED")) {
                    console.warn("[REDIS_GLOBAL_SILENT_ERROR]", err.message);
                }
            });
        } catch (e) {
            console.error("[REDIS_INIT_ERROR] Failed to initialize IORedis:", e);
            return null;
        }
    }
    return globalForQueue.redisConnection;
}

export function getMessageQueue() {
    const connection = getConnection();
    if (!connection) return null;

    if (!globalForQueue.messageQueue) {
        globalForQueue.messageQueue = new Queue("whatsapp-messages", {
            connection: connection as any,
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: "exponential", delay: 1000 },
            },
        });

        // Silence Queue-specific connection noise
        globalForQueue.messageQueue.on("error", (err: any) => {
            if (err.message?.includes("ECONNREFUSED")) return;
        });
    }
    return globalForQueue.messageQueue;
}

export function getAutomationQueue() {
    const connection = getConnection();
    if (!connection) return null;

    if (!globalForQueue.automationQueue) {
        globalForQueue.automationQueue = new Queue("automation-rules", {
            connection: connection as any,
            defaultJobOptions: {
                attempts: 2,
                backoff: { type: "fixed", delay: 5000 },
            },
        });

        // Silence Queue-specific connection noise
        globalForQueue.automationQueue.on("error", (err: any) => {
            if (err.message?.includes("ECONNREFUSED")) return;
        });
    }
    return globalForQueue.automationQueue;
}

export function getCampaignQueue() {
    const connection = getConnection();
    if (!connection) return null;

    if (!globalForQueue.campaignQueue) {
        globalForQueue.campaignQueue = new Queue("campaign-tasks", {
            connection: connection as any,
            defaultJobOptions: {
                attempts: 2,
                backoff: { type: "exponential", delay: 10000 },
            },
        });
    }
    return globalForQueue.campaignQueue;
}

// Core function to process inbound messages (shared by worker and sync fallback)
export async function processInboundMessage(data: {
    phoneNumberId: string;
    waToken: string;
    from: string;
    messageText: string;
    businessId: string;
    leadId: string;
    messageId: string;
}) {
    const { phoneNumberId, waToken, from, messageText, businessId, leadId, messageId } = data;

    console.log(`[PROCESSOR] Processing message from ${from} for business ${businessId}`);

    // 0. Cancel pending follow-ups since user replied
    await ArcFollowupService.cancelFollowups(leadId);

    try {
        const business = await prisma.business.findUnique({
            where: { id: businessId },
        });

        if (!business) return;

        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
        });

        if (!lead || lead.isAiPaused) return;

        // 1. Check Limits (Strict for SaaS plans)
        console.log(`[PROCESSOR] Business Status: ${business.subscriptionStatus}, Plan: ${business.plan}`);
        
        // 1. CHECK LIMITS (Unified Helper)
        const { isLimitReached } = await import("@/lib/plans");
        if (isLimitReached(business as any)) {
            console.log(`[PROCESSOR] Business ${businessId} limit reached. Skipping reply.`);
            
            // Only notify user ONCE when limit is first hit
            if (business.trialConversationsToday === 30 && business.plan === "FREE") {
                await prisma.notification.create({
                    data: {
                        userId: business.userId,
                        businessId: business.id,
                        title: "⚠️ Daily AI Limit Reached",
                        message: "Your daily FREE plan limit of 30 replies has been reached. It will reset tomorrow, or upgrade to PRO for unlimited!",
                        type: "WARNING",
                        link: "/settings"
                    }
                });
            }
            return;
        }

        // 1.5. Check for Automation Flows (Keyword Match)
        const flows = await (prisma as any).flow.findMany({
            where: { businessId, isActive: true, triggerType: "KEYWORD" }
        });

        const matchedFlow = flows.find((f: any) => 
            f.triggerValue && messageText.toLowerCase().includes(f.triggerValue.toLowerCase())
        );

        if (matchedFlow) {
            console.log(`[PROCESSOR] Matched Automation Flow: ${matchedFlow.name} for keyword: ${matchedFlow.triggerValue}`);
            await executeFlow(matchedFlow, leadId, businessId, from, phoneNumberId, waToken);
            return; // Flow executed, skip AI generation
        }

        // 1.6. Check for Media Asset Intent (Legacy Keyword Match fallback)
        const mediaAssets = await prisma.mediaAsset.findMany({
            where: { businessId, isActive: true }
        });

        const matchedAsset = mediaAssets.find(a => 
            a.intentKeyword && messageText.toLowerCase().includes(a.intentKeyword.toLowerCase())
        );

        if (matchedAsset && (hasFeature(business, "canUseCampaigns"))) {
            console.log(`[PROCESSOR] Matched Media Asset: ${matchedAsset.name}`);
            const mediaResponseText = `Here is our ${matchedAsset.name.toLowerCase()} 📄`; 
            const tokenToSend = waToken || process.env.WHATSAPP_TOKEN;
            if (tokenToSend) {
                const waResponse = await sendWhatsAppMessage(
                    phoneNumberId, 
                    tokenToSend, 
                    from, 
                    mediaResponseText, 
                    [], 
                    matchedAsset.url
                );
                await prisma.message.create({
                    data: {
                        businessId,
                        leadId,
                        waMessageId: waResponse.messages[0]?.id,
                        message: `${mediaResponseText} [Media: ${matchedAsset.name}]`,
                        sender: "BUSINESS",
                        senderType: "AI",
                        aiModel: "KEYWORD_MATCHER",
                    }
                });
                await prisma.business.update({
                    where: { id: businessId },
                    data: { aiRepliesUsed: { increment: 1 } }
                });
                return;
            }
        }

        // 2. Get history
        const history = await prisma.message.findMany({
            where: { leadId: lead.id },
            orderBy: { timestamp: "desc" },
            take: 6,
        });

        const conversationHistory = history
            .reverse()
            .slice(0, -1)
            .map(m => ({
                role: (m.sender === "CUSTOMER" ? "user" : "assistant") as "user" | "assistant",
                content: m.message,
            }));

        // 3. Fetch Current Bookings for context
        const appointments = await (prisma as any).appointment.findMany({
            where: { businessId, status: "SCHEDULED", startTime: { gte: new Date() } },
            include: { item: true },
            take: 10,
        });

        const currentBookings = appointments.map((a: any) => ({
            itemName: a.item?.name || "Service",
            startTime: a.startTime,
            endTime: a.endTime,
            status: a.status
        }));

        // REDUNDANT LIMIT CHECK REMOVED (Handled above)

        // 3. Generate AI Response and Extract Lead Data in Parallel
        const [aiResult, extractedData] = await Promise.all([
            generateAIResponse(
                messageText,
                {
                    name: business.name,
                    businessType: (business as any).businessType,
                    industry: business.industry,
                    description: business.description,
                    location: (business as any).location,
                    aiSystemPrompt: business.aiSystemPrompt,
                    knowledgeBase: business.knowledgeBase,
                    plan: business.plan,
                    items: await (prisma as any).item.findMany({ where: { businessId, isActive: true }, take: 20 }),
                    currentBookings,
                    customerName: lead.name
                },
                conversationHistory
            ),
            extractLeadData(messageText, conversationHistory)
        ]);

        const { content: rawAiReply, isEmergency, buttons, imageUrl: aiImageUrl } = aiResult;
        let aiReply = rawAiReply;
        console.log(`[PROCESSOR] AI Reply generated: ${aiReply.substring(0, 50)}... Emergency: ${isEmergency}`);

        // 4.5. Detect Booking & Generate Payment Link
        let paymentLinkUrl = null;
        if (extractedData.stage === "Appointment booked" || (extractedData.startDate && extractedData.endDate)) {
            try {
                // Find the item for price
                let item = null;
                if (extractedData.itemId) {
                    item = await (prisma as any).item.findFirst({
                        where: { businessId, OR: [{ id: extractedData.itemId }, { name: { contains: extractedData.itemId, mode: 'insensitive' } }] }
                    });
                }
                
                const amount = item?.price || 500; // Default or custom logic
                
                // Create order
                const order = await (prisma as any).order.create({
                    data: {
                        businessId,
                        customerPhone: from,
                        items: [{ 
                            itemId: item?.id || extractedData.itemId, 
                            name: item?.name || extractedData.interest || "Booking", 
                            price: amount, 
                            qty: 1 
                        }],
                        totalAmount: amount,
                        status: "PENDING",
                        paymentStatus: "UNPAID"
                    }
                });

                // Generate Razorpay Link
                const linkResult = await createPaymentLink({
                    orderId: order.id,
                    amount: amount,
                    customerName: extractedData.name || lead.name || "Customer",
                    customerPhone: from,
                    description: `Payment for ${item?.name || extractedData.interest || 'Your Booking'}`
                });

                if (linkResult.success) {
                    paymentLinkUrl = linkResult.short_url;
                    aiReply += `\n\n💳 *Pay here to confirm:* ${paymentLinkUrl}`;
                    console.log(`[PROCESSOR] Appended payment link: ${paymentLinkUrl}`);
                }
            } catch (payErr) {
                console.error("[PROCESSOR] Payment link generation failed:", payErr);
            }
        }

        // 4.6. Fetch Item Media for Reply (NEW: Send product image if identified)
        let mediaUrl = aiImageUrl || undefined;
        if (!mediaUrl && extractedData.itemId) {
            try {
                const item = await (prisma as any).item.findFirst({
                    where: { 
                        businessId, 
                        OR: [
                            { id: extractedData.itemId }, 
                            { name: { contains: extractedData.itemId, mode: 'insensitive' } }
                        ] 
                    }
                });
                if (item) {
                    mediaUrl = item.imageUrl || (item.imageUrls && item.imageUrls[0]);
                }
            } catch (mediaErr) {
                console.error("[PROCESSOR] Failed to fetch item media:", mediaErr);
            }
        }

        // 5. Send WhatsApp response IMMEDIATELY
        const tokenToSend = waToken || process.env.WHATSAPP_TOKEN;
        let waMessageId = null;
        if (tokenToSend) {
            const waResponse = await sendWhatsAppMessage(
                phoneNumberId,
                tokenToSend,
                from,
                aiReply,
                buttons,
                mediaUrl
            );
            waMessageId = waResponse.messages[0]?.id;
        }

        // 6. Check for Stage Change Automations
        const stageChanged = extractedData.stage && extractedData.stage !== lead.leadType;

        // 7. Update Lead & Business
        await prisma.$transaction([
            prisma.business.update({
                where: { id: businessId },
                data: {
                    aiRepliesUsed: { increment: 1 },
                    trialConversationsToday: { increment: 1 }
                },
            }),
            prisma.lead.update({
                where: { id: leadId },
                data: {
                    name: extractedData.name || lead.name,
                    customerInterest: extractedData.interest || lead.customerInterest,
                    leadType: extractedData.stage || lead.leadType,
                    conversationSummary: extractedData.summary || lead.conversationSummary,
                    appointmentTime: extractedData.startDate ? new Date(extractedData.startDate) : (extractedData.appointmentTime ? new Date(extractedData.appointmentTime) : lead.appointmentTime),
                    status: (extractedData.stage === "Appointment booked" || extractedData.startDate) ? "CONVERTED" : lead.status,
                    isAiPaused: isEmergency ? true : lead.isAiPaused,
                },
            }),
        ]);

        // 7.5. Create Appointment if dates are present (GROWTH+ Plan)
        const canUseBooking = hasFeature(business, "canUseBooking");
        if (canUseBooking && extractedData.startDate && extractedData.endDate) {
            try {
                // Try to find matching item by ID or Name if itemId is just a name
                let finalItemId = extractedData.itemId;
                if (finalItemId && !finalItemId.startsWith('cl')) { // Not a CUID
                    const matchedItem = await (prisma as any).item.findFirst({
                        where: { businessId, name: { contains: finalItemId, mode: 'insensitive' } }
                    });
                    if (matchedItem) finalItemId = matchedItem.id;
                }

                const appointment = await (prisma as any).appointment.create({
                    data: {
                        businessId,
                        leadId,
                        itemId: finalItemId || null,
                        startTime: new Date(extractedData.startDate),
                        endTime: new Date(extractedData.endDate),
                        title: `Booking: ${extractedData.interest || 'Untitled'}`,
                        status: "SCHEDULED",
                        source: "AI"
                    }
                });
                console.log(`[PROCESSOR] Created automated booking for ${lead.name || from}`);

                // Schedule Post-Appointment Feedback
                await ArcFollowupService.schedulePostAppointmentFollowup(
                    appointment, 
                    from, 
                    phoneNumberId, 
                    tokenToSend || ''
                );
            } catch (appErr) {
                console.error("[PROCESSOR] Failed to create automated appointment:", appErr);
            }
        }

        // 7.5. CREATE NOTIFICATIONS BASED ON PREFERENCES
        const isNewLead = history.length <= 1;

        // Emergency / AI Pause Notification
        if (isEmergency) {
            if (business.notifyOnEmergency !== false || business.notifyOnAiPause !== false) {
                await prisma.notification.create({
                    data: {
                        userId: business.userId,
                        businessId: business.id,
                        title: "🚨 Action Required: AI Paused",
                        message: `Conversation with ${lead.name || from} needs human attention.`,
                        type: "EMERGENCY",
                        link: `/leads?phone=${from}`,
                    }
                });

                await sendPushNotification(business.userId, {
                    title: "🚨 Action Required: AI Paused",
                    body: `Conversation with ${lead.name || from} needs human attention.`,
                    url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/leads?phone=${from}`
                });
            }
        } 
        // New Lead Notification (only if not an emergency, to avoid double notify)
        else if (isNewLead) {
            if (business.notifyOnNewLead !== false) {
                await prisma.notification.create({
                    data: {
                        userId: business.userId,
                        businessId: business.id,
                        title: "👤 New Lead Captured",
                        message: `${lead.name || from} just messaged your bot.`,
                        type: "INFO",
                        link: `/leads?phone=${from}`,
                    }
                });

                await sendPushNotification(business.userId, {
                    title: "👤 New Lead Captured",
                    body: `${lead.name || from} just messaged your bot.`,
                    url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/leads?phone=${from}`
                });
            }
        }

        // 8. Trigger Logic for Automation rules (Legacy & Flow)
        if (stageChanged || isNewLead) {
            const triggerType = isNewLead ? "NEW_LEAD" : "STAGE_CHANGE";
            const triggerValue = isNewLead ? null : extractedData.stage;

            const automationFlows = await (prisma as any).flow.findMany({
                where: { 
                    businessId, 
                    isActive: true, 
                    triggerType,
                    triggerValue: triggerValue
                }
            });

            for (const flow of automationFlows) {
                await executeFlow(flow, leadId, businessId, from, phoneNumberId, waToken);
            }

            // Legacy Automation Rules (Optional: could deprecate in favor of Flows)
            if (stageChanged) {
                const rules = await prisma.automationRule.findMany({
                    where: { businessId, triggerStage: extractedData.stage, isActive: true }
                });

                for (const rule of rules) {
                    try {
                        const queue = getAutomationQueue();
                        if (queue) {
                            await queue.add("delayed-automation", {
                                businessId,
                                leadId,
                                message: rule.message,
                                from,
                                phoneNumberId,
                                waToken
                            }, {
                                delay: rule.delayMinutes * 60 * 1000
                            });
                        }
                    } catch (qErr) {
                        console.error("[AUTOMATION QUEUE ERROR]", qErr);
                    }
                }
            }
        }

        // 9. Save outgoing message to DB
        if (waMessageId) {
            try {
                await prisma.message.create({
                    data: {
                        businessId,
                        leadId,
                        waMessageId: waMessageId,
                        message: aiReply,
                        sender: "BUSINESS",
                        senderType: "AI",
                        aiModel: process.env.AI_MODEL || "gpt-4o-mini",
                    }
                });
            } catch (msgErr: any) {
                if (msgErr.code !== 'P2002') {
                    console.error("[PROCESSOR] Failed to save outgoing message:", msgErr.message);
                }
            }
        }

        console.log(`[PROCESSOR] Message from ${from} processed successfully.`);

        // 10. Schedule new set of follow-ups
        if (lead.status !== "CONVERTED" && !isEmergency) {
            await ArcFollowupService.scheduleFollowups(leadId, businessId, from, phoneNumberId, waToken);
        }
    } catch (error) {
        console.error(`[PROCESSOR ERROR] Failed to process message ${messageId}:`, error);
        throw error;
    }
}

/**
 * Handles automated ARC follow-up nudges (10m, 1h, 1d)
 */
import { SmartEngineService } from "@/services/smart-engine.service";

// ... (existing code)

/**
 * Handles automated ARC follow-up nudges and smart AI actions
 */
async function handleArcFollowup(data: {
    leadId: string;
    businessId: string;
    from: string;
    phoneNumberId: string;
    waToken: string;
    type: "SMART_ACTION" | "POST_APPOINTMENT_FEEDBACK";
    appointmentId?: string;
}) {
    const { leadId, type } = data;

    console.log(`[FOLLOWUP] Processing ${type} for lead ${leadId}`);

    if (type === "SMART_ACTION") {
        await SmartEngineService.processLead(leadId);
        return;
    }

    // Handle feedback legacy
    if (type === "POST_APPOINTMENT_FEEDBACK") {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: { business: true }
        });
        if (!lead || lead.isAiPaused) return;

        const history = await prisma.message.findMany({
            where: { leadId: lead.id },
            orderBy: { timestamp: "desc" },
            take: 6,
        });

        const conversationHistory = history
            .reverse()
            .map(m => ({
                role: (m.sender === "CUSTOMER" ? "user" : "assistant") as "user" | "assistant",
                content: m.message,
            }));

        const result = await generateAIResponse(
            "[SYSTEM_NUDGE: The user's service just ended. Send a warm 'Thank You' and ask for feedback.]",
            {
                name: lead.business.name,
                plan: lead.business.plan,
                customerName: lead.name
            },
            conversationHistory
        );

        const token = data.waToken || process.env.WHATSAPP_TOKEN;
        if (token) {
            await sendWhatsAppMessage(data.phoneNumberId, token, data.from, result.content);
        }
    }
}



/**
 * Executes a visual automation flow
 */
async function executeFlow(
    flow: any, 
    leadId: string, 
    businessId: string, 
    from: string, 
    phoneNumberId: string, 
    waToken: string,
    startIndex: number = 0
) {
    const nodes = flow.nodes as any[];
    const tokenToSend = waToken || process.env.WHATSAPP_TOKEN;

    for (let i = startIndex; i < nodes.length; i++) {
        const node = nodes[i];
        
        try {
            if (node.type === "message" && node.data.message) {
                if (tokenToSend) {
                    const waResponse = await sendWhatsAppMessage(
                        phoneNumberId, 
                        tokenToSend, 
                        from, 
                        node.data.message,
                        node.data.buttons || []
                    );
                    await prisma.message.create({
                        data: {
                            businessId,
                            leadId,
                            waMessageId: waResponse.messages[0]?.id,
                            message: node.data.message + (node.data.buttons?.length ? ` [Buttons: ${node.data.buttons.join(', ')}]` : ''),
                            sender: "BUSINESS",
                            senderType: "AUTOMATION",
                        }
                    });
                }
            } else if (node.type === "tag" && node.data.tag) {
                await prisma.lead.update({
                    where: { id: leadId },
                    data: { 
                        tags: {
                            push: node.data.tag
                        }
                    }
                });
            } else if (node.type === "delay" && node.data.minutes) {
                const queue = getAutomationQueue();
                if (queue) {
                    await queue.add("delayed-flow-step", {
                        flowId: flow.id,
                        leadId,
                        businessId,
                        from,
                        phoneNumberId,
                        waToken,
                        nextIndex: i + 1
                    }, {
                        delay: Number(node.data.minutes) * 60 * 1000
                    });
                    console.log(`[FLOW] Scheduled next step for flow ${flow.name} after ${node.data.minutes}m`);
                    return; // Stop execution here, queue will pick up from nextIndex
                }
            }
        } catch (err) {
            console.error(`[FLOW ERROR] Node ${i} (${node.type}) failed:`, err);
        }
    }
    console.log(`[FLOW] Completed execution of flow: ${flow.name}`);
}

// Worker Global Singletons
const globalForWorkers = globalThis as unknown as {
    messageWorker: Worker | undefined;
    automationWorker: Worker | undefined;
    campaignWorker: Worker | undefined;
};

// Worker Initialization
const isVercelLike = !!(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL || process.env.NOW_REGION);
if (process.env.NODE_ENV !== "test" && !isVercelLike) {
    const connection = getConnection();
    if (connection) {
        if (!globalForWorkers.messageWorker) {
            console.log("Starting Messaging Worker (Singleton)...");
            globalForWorkers.messageWorker = new Worker(
                "whatsapp-messages",
                async (job: Job) => {
                    if (job.name === "arc-followup") {
                        await handleArcFollowup(job.data);
                    } else {
                        await processInboundMessage(job.data);
                    }
                },
                { connection: connection as any, removeOnComplete: { count: 100 }, removeOnFail: { count: 500 } }
            );
        }

        if (!globalForWorkers.automationWorker) {
            console.log("Starting Automation Worker (Singleton)...");
            globalForWorkers.automationWorker = new Worker(
                "automation-rules",
                async (job: Job) => {
                    if (job.name === "delayed-flow-step") {
                        const { flowId, leadId, businessId, from, phoneNumberId, waToken, nextIndex } = job.data;
                        const flow = await (prisma as any).flow.findUnique({ where: { id: flowId } });
                        if (flow && flow.isActive) {
                            await executeFlow(flow, leadId, businessId, from, phoneNumberId, waToken, nextIndex);
                        }
                        return;
                    }
                    const { businessId, leadId, message, from, phoneNumberId, waToken } = job.data;
                    await processLegacyAutomation(job.data);
                },
                { connection: connection as any, removeOnComplete: { count: 100 }, removeOnFail: { count: 500 } }
            );
        }

        if (!globalForWorkers.campaignWorker) {
            console.log("Starting Flow Orchestrator Worker (Singleton)...");
            globalForWorkers.campaignWorker = new Worker(
                "campaign-tasks",
                async (job: Job) => {
                    await FlowOrchestrator.execute(job);
                },
                { connection: connection as any, removeOnComplete: { count: 100 }, removeOnFail: { count: 500 } }
            );
        }
    }
}

/**
 * UNIFIED FLOW ORCHESTRATOR
 * Standardizes execution for Campaigns, Broadcasts, and Automation Steps
 */
export class FlowOrchestrator {
    static async execute(job: Job) {
        const { name, data } = job;
        console.log(`[ORCHESTRATOR] Executing ${name} (Job ID: ${job.id})`);

        try {
            switch (name) {
                case "campaign-step":
                    await this.handleCampaignStep(data);
                    break;
                case "sheet-broadcast":
                    await this.handleSheetBroadcast(data);
                    break;
                case "delayed-flow-step":
                    await this.handleFlowStep(data);
                    break;
                default:
                    console.warn(`[ORCHESTRATOR] Unknown job type: ${name}`);
            }
        } catch (error) {
            console.error(`[ORCHESTRATOR ERROR] Job ${job.id} failed:`, error);
            throw error; // Let BullMQ handle retries
        }
    }

    private static async handleCampaignStep(data: any) {
        const { campaignId, stepIndex, businessId } = data;
        const campaign = await (prisma as any).campaign.findUnique({
            where: { id: campaignId },
            include: { steps: { orderBy: { order: "asc" } } }
        });

        if (!campaign || !campaign.isActive) return;
        const step = campaign.steps[stepIndex];
        if (!step) return;

        const leads = await this.getAudienceLeads(campaign, businessId);
        const business = await prisma.business.findUnique({ where: { id: businessId } });
        if (!business || !business.waPhoneNumberId) return;

        for (const lead of leads) {
            await this.sendMessageWithLogging({
                businessId,
                leadId: lead.id,
                phone: lead.phone,
                message: step.message.replace(/\{\{name\}\}/g, lead.name || 'there'),
                phoneNumberId: business.waPhoneNumberId,
                waToken: business.waToken || '',
                senderType: "CAMPAIGN",
                mediaUrl: (stepIndex === 0) ? campaign.imageUrl : undefined
            });

            // 3.2. Send Product Showcase (if any)
            if (campaign.itemIds && campaign.itemIds.length > 0) {
                const { sendProductCarousel } = await import("./whatsapp");
                const products = await (prisma as any).item.findMany({
                    where: { id: { in: campaign.itemIds } }
                });
                if (products.length > 0) {
                    await sendProductCarousel(business.waPhoneNumberId, business.waToken || '', lead.phone, products);
                }
            }

            // 3.3. Send Coupon (if any)
            if (campaign.couponId) {
                const coupon = await (prisma as any).coupon.findUnique({ where: { id: campaign.couponId } });
                if (coupon) {
                    const couponMsg = `🎁 *Special Offer for You!*\nUse code: *${coupon.code}*\nDiscount: *${coupon.discount}% OFF*\nExpires: ${coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Limited time'}`;
                    await sendWhatsAppMessage(business.waPhoneNumberId, business.waToken || '', lead.phone, couponMsg, ["Shop Now", "Copy Code"]);
                }
            }
        }

        // Schedule next step if available
        const nextStep = campaign.steps[stepIndex + 1];
        if (nextStep) {
            const queue = getCampaignQueue();
            if (queue) {
                await queue.add("campaign-step", { campaignId, stepIndex: stepIndex + 1, businessId }, {
                    delay: nextStep.delayHours * 60 * 60 * 1000
                });
            }
        }
    }

    private static async handleSheetBroadcast(data: any) {
        const { sheetUrl, message, businessId } = data;
        const business = await prisma.business.findUnique({ where: { id: businessId } });
        if (!business || !business.waPhoneNumberId) return;

        // In production, this would fetch from Google Sheets API
        // For now, we simulate with the data mapping provided in the request or mock rows
        const mockRows = data.rows || [
            { phone: "919876543210", name: "Rahul Sharma" }
        ];

        for (const row of mockRows) {
            if (!validatePhoneNumber(row.phone)) continue;
            
            // Ensure lead exists for this phone
            let lead = await prisma.lead.findUnique({
                where: { businessId_phone: { businessId, phone: row.phone } }
            });

            if (!lead) {
                lead = await prisma.lead.create({
                    data: {
                        businessId,
                        phone: row.phone,
                        name: row.name || null,
                        source: "BROADCAST",
                        status: "NEW"
                    }
                });
            }
            
            await this.sendMessageWithLogging({
                businessId,
                leadId: lead.id,
                phone: row.phone,
                message: message.replace(/\{\{name\}\}/g, row.name || 'there'),
                phoneNumberId: business.waPhoneNumberId,
                waToken: business.waToken || '',
                senderType: "BROADCAST",
                mediaUrl: data.imageUrl || undefined
            });
        }
    }

    private static async handleFlowStep(data: any) {
        const { flowId, leadId, businessId, from, phoneNumberId, waToken, nextIndex } = data;
        const flow = await (prisma as any).flow.findUnique({ where: { id: flowId } });
        if (flow && flow.isActive) {
            await executeFlow(flow, leadId, businessId, from, phoneNumberId, waToken, nextIndex);
        }
    }

    private static async getAudienceLeads(campaign: any, businessId: string) {
        if (campaign.audienceSource === "SEGMENT") {
            return prisma.lead.findMany({ 
                where: { businessId, leadType: campaign.audienceValue === "ALL" ? undefined : campaign.audienceValue } 
            });
        } else if (campaign.audienceSource === "TAG") {
            return prisma.lead.findMany({ 
                where: { businessId, tags: { has: campaign.audienceValue } } 
            });
        }
        return [];
    }

    private static async sendMessageWithLogging(params: {
        businessId: string;
        leadId?: string;
        phone: string;
        message: string;
        phoneNumberId: string;
        waToken: string;
        senderType: "CAMPAIGN" | "BROADCAST" | "AUTOMATION";
        mediaUrl?: string | null;
    }) {
        const { businessId, leadId, phone, message, phoneNumberId, waToken, senderType, mediaUrl } = params;
        
        if (!leadId) {
            console.error(`[ORCHESTRATOR] Cannot log message without leadId for ${phone}`);
            return;
        }

        try {
            const waResponse = await sendWhatsAppMessage(
                phoneNumberId, 
                waToken, 
                phone, 
                message, 
                undefined, 
                mediaUrl || undefined
            );
            
            await prisma.message.create({
                data: {
                    businessId,
                    leadId,
                    waMessageId: waResponse.messages[0]?.id,
                    message,
                    sender: "BUSINESS",
                    senderType,
                }
            });

            // Update business AI count if relevant
            await prisma.business.update({
                where: { id: businessId },
                data: { aiRepliesUsed: { increment: 1 } }
            });

        } catch (error) {
            console.error(`[ORCHESTRATOR SEND ERROR] Failed for ${phone}:`, error);
        }
    }
}

async function processLegacyAutomation(data: any) {
    const { businessId, leadId, message, from, phoneNumberId, waToken } = data;
    try {
        const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { isAiPaused: true } });
        if (!lead || lead.isAiPaused) return;

        const tokenToSend = waToken || process.env.WHATSAPP_TOKEN;
        if (tokenToSend) {
            const waResponse = await sendWhatsAppMessage(phoneNumberId, tokenToSend, from, message);
            await prisma.message.create({
                data: {
                    businessId,
                    leadId,
                    waMessageId: waResponse.messages[0]?.id,
                    message,
                    sender: "BUSINESS",
                    senderType: "AUTOMATION",
                }
            });
        }
    } catch (error) {
        console.error(`[LEGACY AUTOMATION ERROR]`, error);
    }
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWhatsAppReply } from "@/lib/ai";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// This is the GET endpoint used by Meta to verify the webhook.
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "turantreply_verify_token_123";

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WhatsApp Webhook Verified Successfully!");
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

        // 1. Acknowledge webhook IMMEDIATELY
        const immediateResponse = NextResponse.json(
            { received: true },
            { status: 200 }
        );

        // 2. Process AI in background — don't await
        if (body.object === "whatsapp_business_account") {
            processAIReply(body).catch(err => {
                console.error("[WEBHOOK_PROCESS_ERROR]", err);
            });
        }

        // 3. Return 200 to WhatsApp instantly
        return immediateResponse;
    } catch (error) {
        console.error("Webhook POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

async function processAIReply(body: any) {
    try {
        for (const entry of body.entry) {
            for (const change of entry.changes) {
                if (change.value && change.value.messages) {
                    const message = change.value.messages[0];
                    const metadata = change.value.metadata;

                    const phoneNumberId = metadata.phone_number_id;
                    const from = message.from; 
                    const messageId = message.id;
                    let messageText = message.text?.body || "";

                    // Handle Interactive Button Clicks
                    if (message.type === "interactive") {
                        const interactive = message.interactive;
                        if (interactive.type === "button_reply") {
                            messageText = interactive.button_reply.title;
                        } else if (interactive.type === "list_reply") {
                            messageText = interactive.list_reply.title;
                        }
                    }

                    console.log(`[ASYNC_PROCESS] Processing message from ${from}: ${messageText}`);

                    // 1. Find the Business
                    let business = await prisma.business.findFirst({
                        where: { waPhoneNumberId: phoneNumberId },
                    });

                    // Fallback: Try finding by WABA ID if Phone ID lookup fails
                    if (!business) {
                        const wabaId = entry.id;
                        console.log(`[ASYNC_RECOVERY] No business for Phone ${phoneNumberId}, trying WABA ID: ${wabaId}`);
                        business = await prisma.business.findFirst({
                            where: { waWabaId: wabaId },
                        });
                    }

                    if (!business) {
                        console.error(`[ASYNC_ERROR] No business found for waPhoneNumberId: ${phoneNumberId} or waWabaId: ${entry.id}`);
                        continue;
                    }

                    // 2. Message Deduplication
                    const existingMessage = await prisma.message.findUnique({
                        where: { waMessageId: messageId }
                    });
                    if (existingMessage) continue;

                    // 3. Find/Create Lead & Save Message (REQUIRED for context)
                    const lead = await prisma.lead.upsert({
                        where: { businessId_phone: { businessId: business.id, phone: from } },
                        update: { lastQuery: messageText },
                        create: {
                            businessId: business.id,
                            phone: from,
                            source: "WhatsApp",
                            name: "Customer",
                            status: "NEW",
                            lastQuery: messageText,
                        }
                    });

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

                    // 4. Generate AI Reply with full context
                    const { generateWhatsAppReply } = await import("@/lib/ai");
                    const { reply: aiReply, shouldPauseAi } = await generateWhatsAppReply({
                        customerMessage: messageText,
                        businessId: business.id,
                        leadId: lead.id,
                    });

                    if (aiReply) {
                        // 5. Send Reply
                        await sendWhatsAppMessage(
                            phoneNumberId,
                            business.waToken || process.env.WHATSAPP_TOKEN || "",
                            from,
                            aiReply
                        );

                        // 6. Save AI Message
                        await prisma.message.create({
                            data: {
                                businessId: business.id,
                                leadId: lead.id,
                                message: aiReply,
                                sender: "AI",
                                senderType: "AI",
                            }
                        });

                        // 7. If Handover requested, pause AI for this lead
                        if (shouldPauseAi) {
                            await prisma.lead.update({
                                where: { id: lead.id },
                                data: { isAiPaused: true }
                            });
                            console.log(`[HANDOVER] AI Paused for lead: ${from}`);
                        }
                    }

                    console.log(`[ASYNC_PROCESS] Successfully replied to message ${messageId} via Kimi K2`);
                }
            }
        }
    } catch (err) {
        console.error("[ASYNC_CORE_ERROR]", err);
    }
}


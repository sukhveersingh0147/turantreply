import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/openai";
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
    console.log("Incoming WhatsApp Webhook POST request...");
    try {
        const body = await req.json();
        console.log("Webhook body received.");

        if (body.object === "whatsapp_business_account") {
            console.log("Processing WhatsApp Business Account event...");
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    console.log(`Processing change: ${change.field}`);
                    if (change.value && change.value.messages) {
                        const message = change.value.messages[0];
                        const contact = change.value.contacts[0];
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

                        console.log(`Received message from ${from} for business ${phoneNumberId} (${message.type}): ${messageText}`);

                        // 1. Find which Business owns this WhatsApp Number ID
                        const business = await prisma.business.findFirst({
                            where: { waPhoneNumberId: phoneNumberId }
                        });

                        if (!business) {
                            console.error(`[WEBHOOK ERROR] No business found for waPhoneNumberId: ${phoneNumberId}`);
                            continue;
                        }
                        console.log(`Found business: ${business.id} - ${business.name}`);

                        // 1.5. Check for message deduplication
                        const existingMessage = await prisma.message.findUnique({
                            where: { waMessageId: messageId }
                        });

                        if (existingMessage) {
                            console.log(`[WEBHOOK] Message ${messageId} already processed. Skipping.`);
                            continue;
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
                                    source: "WhatsApp",
                                    name: customerName,
                                    status: "NEW",
                                    lastQuery: messageText,
                                }
                            });
                            console.log(`Created new lead: ${lead.id}`);
                        } else {
                            lead = await prisma.lead.update({
                                where: { id: lead.id },
                                data: {
                                    lastQuery: messageText,
                                    name: lead.name === "Unknown Customer" && customerName !== "Unknown Customer" ? customerName : undefined,
                                    recoverySentAt: null,
                                    status: lead.status === "RECOVERING" ? "INTERESTED" : lead.status,
                                    source: "WhatsApp", // Ensure source is set even for existing leads created before this field
                                }
                            });
                            console.log(`Updated existing lead: ${lead.id}`);
                        }

                        // 3. Save the actual message to the database (Safe from race conditions)
                        try {
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
                        } catch (msgErr: any) {
                            if (msgErr.code === 'P2002') {
                                console.log(`[WEBHOOK] Message ${messageId} already exists in DB. Proceeding.`);
                            } else {
                                throw msgErr;
                            }
                        }
                        console.log("Message saved to database.");

                        // 5. PUSH TO QUEUE FOR ASYNCHRONOUS PROCESSING (Fallback to sync if Redis is down)
                        const { getMessageQueue, processInboundMessage } = await import("@/lib/queue");
                        const jobData = {
                            phoneNumberId,
                            waToken: business.waToken || process.env.WHATSAPP_TOKEN,
                            from,
                            messageText,
                            businessId: business.id,
                            leadId: lead.id,
                            messageId,
                        };

                        const isVercel = !!(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL || process.env.NOW_REGION);
                        
                        console.log(`[WEBHOOK] Environment Check - VERCEL: ${process.env.VERCEL}, NEXT_RUNTIME: ${process.env.NEXT_RUNTIME}`);

                        if (isVercel) {
                            console.log("[WEBHOOK] Vercel environment detected. Using synchronous processing.");
                            await processInboundMessage(jobData as any);
                            console.log("[WEBHOOK] Message processed synchronously on Vercel.");
                        } else {
                            try {
                                const queue = getMessageQueue();
                                if (!queue) throw new Error("Queue initialization failed (no Redis)");
                                
                                console.log("[WEBHOOK] Attempting to push to queue (timeout 5s)...");
                                
                                // Race against a 5-second timeout to prevent total function hang
                                await Promise.race([
                                    queue.add("whatsapp-received", jobData, {
                                        removeOnComplete: true,
                                        removeOnFail: false,
                                    }),
                                    new Promise((_, reject) => setTimeout(() => reject(new Error("Queue push timeout")), 5000))
                                ]);
                                
                                console.log("[WEBHOOK] Message successfully pushed to queue.");
                            } catch (queueError) {
                                console.warn("[WEBHOOK] Queue unavailable or timed out, using sync fallback:", queueError instanceof Error ? queueError.message : String(queueError));
                                await processInboundMessage(jobData as any);
                                console.log("[WEBHOOK] Message processed synchronously as fallback.");
                            }
                        }
                    }
                }
            }
            return NextResponse.json({ status: "success" }, { status: 200 });
        }
        return NextResponse.json({ error: "Not a WhatsApp event" }, { status: 404 });
    } catch (error) {
        console.error("Webhook POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

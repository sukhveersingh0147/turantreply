import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function GET() {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const business = await prisma.business.findUnique({
            where: { userId: session.user.id },
        });

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const broadcasts = await prisma.broadcast.findMany({
            where: { businessId: business.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(broadcasts);
    } catch (error) {
        console.error("Error fetching broadcasts:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, content, segment } = await req.json();

        if (!name || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const business = await prisma.business.findUnique({
            where: { userId: session.user.id },
        });

        if (!business || !business.waToken || !business.waPhoneNumberId) {
            return NextResponse.json({ error: "WhatsApp configuration missing" }, { status: 400 });
        }

        // 1. Fetch leads based on segment
        let whereClause: any = { businessId: business.id };
        if (segment === "new") {
            whereClause.status = "NEW";
        }
        // Add more segment filters as needed

        const leads = await prisma.lead.findMany({
            where: whereClause,
        });

        if (leads.length === 0) {
            return NextResponse.json({ error: "No leads found for this segment" }, { status: 404 });
        }

        // 2. Create Broadcast record
        const broadcast = await prisma.broadcast.create({
            data: {
                businessId: business.id,
                name,
                content,
                status: "SENDING",
                sentCount: 0,
            },
        });

        // 3. Send messages (Background processing would be better, but doing it here for simplicity now)
        // In a real app, use a queue like BullMQ or a Cron job
        let successCount = 0;
        for (const lead of leads) {
            try {
                // Personalize content
                const personalizedMsg = content.replace(/{{name}}/g, lead.name || "Customer");

                await sendWhatsAppMessage(
                    business.waPhoneNumberId,
                    business.waToken,
                    lead.phone,
                    personalizedMsg
                );

                // Log the message - Safe from P2002
                try {
                    await prisma.message.create({
                        data: {
                            businessId: business.id,
                            leadId: lead.id,
                            message: personalizedMsg,
                            sender: "BUSINESS",
                            senderType: "AI", // Or maybe a new type BROADCAST
                        }
                    });
                } catch (msgErr: any) {
                    if (msgErr.code !== 'P2002') {
                        console.error("[BROADCAST] Failed to save message:", msgErr.message);
                    }
                }

                successCount++;
            } catch (err) {
                console.error(`Failed to send broadcast to ${lead.phone}:`, err);
            }
        }

        // 4. Update Broadcast record
        const updatedBroadcast = await prisma.broadcast.update({
            where: { id: broadcast.id },
            data: {
                status: "COMPLETED",
                sentCount: successCount,
            },
        });

        return NextResponse.json(updatedBroadcast);
    } catch (error) {
        console.error("Error sending broadcast:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { accessToken, phoneNumberId: manualPhoneId, wabaId: manualWabaId } = await req.json();

        if (!accessToken) {
            return NextResponse.json({ error: "Missing access token or code" }, { status: 400 });
        }

        const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
        const appSecret = process.env.FACEBOOK_APP_SECRET;
        const apiVersion = "v21.0";

        console.log(`[WHATSAPP_CONNECT] Processing connection for user: ${session.user.id}`);

        // 1. Exchange for long-lived token (if it's a short-lived token or code)
        let longLivedToken = accessToken;

        try {
            // Basic check: if it doesn't look like a long-lived JWT-esque token, try to exchange it
            if (accessToken.length < 100 || !accessToken.includes('.')) {
                console.log("[WHATSAPP_CONNECT] Input looks like a code or short token, attempting exchange...");
                const tokenRes = await axios.get(
                    `https://graph.facebook.com/${apiVersion}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${accessToken}`
                ).catch(async () => {
                   return axios.get(`https://graph.facebook.com/${apiVersion}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${accessToken}`);
                });
                longLivedToken = tokenRes.data.access_token;
            }
        } catch (error: any) {
            console.warn("[WHATSAPP_CONNECT] Token exchange failed/skipped, using provided token directly.");
        }

        // 2. Determine WABA ID and Phone Number ID
        let wabaId = manualWabaId;
        let phoneNumberId = manualPhoneId;
        let displayPhoneNumber = "WhatsApp Business";

        if (!wabaId || !phoneNumberId) {
            console.log("[WHATSAPP_CONNECT] IDs not provided, attempting discovery...");
            // Run discovery if IDs are missing (legacy/automated flow)
            try {
                const wabaRes = await axios.get(
                    `https://graph.facebook.com/${apiVersion}/me/whatsapp_business_accounts?access_token=${longLivedToken}`
                );

                if (wabaRes.data.data && wabaRes.data.data.length > 0) {
                    wabaId = wabaRes.data.data[0].id;
                } else {
                     // Fallback: check if the token debug info has it
                    const debugTokenRes = await axios.get(
                        `https://graph.facebook.com/debug_token?input_token=${longLivedToken}&access_token=${appId}|${appSecret}`
                    );
                    const wabaScope = debugTokenRes.data.data.granular_scopes?.find((s: any) => s.scope === 'whatsapp_business_management');
                    if (wabaScope && wabaScope.target_ids) wabaId = wabaScope.target_ids[0];
                }

                if (wabaId) {
                    const phoneRes = await axios.get(
                        `https://graph.facebook.com/${apiVersion}/${wabaId}/phone_numbers?access_token=${longLivedToken}`
                    );
                    if (phoneRes.data.data && phoneRes.data.data.length > 0) {
                        phoneNumberId = phoneRes.data.data[0].id;
                        displayPhoneNumber = phoneRes.data.data[0].display_phone_number;
                    }
                }
            } catch (err: any) {
                console.error("[WHATSAPP_CONNECT] Discovery failed:", err.message);
            }
        }

        if (!wabaId || !phoneNumberId) {
            return NextResponse.json({ error: "Could not determine WhatsApp IDs. Please provide them manually." }, { status: 400 });
        }

        // 3. Final validation/Discovery of display phone number if we have IDs but no display name
        if (displayPhoneNumber === "WhatsApp Business") {
            try {
                const phoneDetailRes = await axios.get(
                    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}?access_token=${longLivedToken}`
                );
                displayPhoneNumber = phoneDetailRes.data.display_phone_number || displayPhoneNumber;
            } catch (err) {
                console.warn("[WHATSAPP_CONNECT] Could not fetch display phone number detail.");
            }
        }

        console.log(`[WHATSAPP_CONNECT] Final IDs - WABA: ${wabaId}, Phone: ${phoneNumberId}`);

        const business = await prisma.business.findUnique({
            where: { userId: session.user.id }
        });

        if (!business) {
            return NextResponse.json({ error: "Business profile not found. Please complete basic setup first." }, { status: 404 });
        }

        // 4. Store/Update in database
        await prisma.$transaction([
            prisma.whatsAppAccount.upsert({
                where: { userId: session.user.id },
                update: {
                    businessId: business.id,
                    waba_id: wabaId,
                    phone_number_id: phoneNumberId,
                    access_token: longLivedToken,
                },
                create: {
                    userId: session.user.id,
                    businessId: business.id,
                    waba_id: wabaId,
                    phone_number_id: phoneNumberId,
                    access_token: longLivedToken,
                }
            }),
            prisma.business.update({
                where: { id: business.id },
                data: {
                    waToken: longLivedToken,
                    waPhoneNumberId: phoneNumberId,
                    waWabaId: wabaId,
                    whatsappNumber: displayPhoneNumber,
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            wabaId,
            phoneNumberId,
            displayPhoneNumber
        });
    } catch (error: any) {
        console.error("[WHATSAPP_CONNECT_CRITICAL_ERROR]", error.response?.data || error.message);
        const errorMessage = error.response?.data?.error?.message || error.message || "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const business = await prisma.business.findUnique({
            where: { userId: session.user.id }
        });

        if (!business) {
            return NextResponse.json({ error: "Business profile not found" }, { status: 404 });
        }

        // Remove credentials from both tables
        await prisma.$transaction([
            prisma.whatsAppAccount.deleteMany({
                where: { userId: session.user.id }
            }),
            prisma.business.update({
                where: { id: business.id },
                data: {
                    waToken: null,
                    waPhoneNumberId: null,
                    waWabaId: null,
                    whatsappNumber: null,
                }
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[WHATSAPP_DISCONNECT_ERROR]", error.message);
        return NextResponse.json({ error: "Failed to disconnect account" }, { status: 500 });
    }
}




"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function processMockPayment(plan: "STARTER" | "GROWTH" | "PRO") {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const priceMap = {
        STARTER: 999,
        GROWTH: 2499,
        PRO: 4999
    };

    await prisma.$transaction(async (tx) => {
        // Update Business plan info
        await tx.business.update({
            where: { userId },
            data: {
                plan: plan,
                subscriptionStatus: "ACTIVE",
                subscriptionExpiresAt: expiresAt,
                lastPayment: new Date(),
            },
        });

        // Create Subscription record
        await tx.subscription.create({
            data: {
                userId,
                plan_name: plan,
                price: priceMap[plan],
                status: "active",
                renewal_date: expiresAt,
            },
        });
    });

    return { success: true };
}

export async function completeOnboarding(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    const businessName = formData.get("businessName") as string;
    const industry = formData.get("industry") as string;
    const agentName = formData.get("agentName") as string;
    const tone = formData.get("tone") as string;
    const welcomeMessage = formData.get("welcomeMessage") as string;

    await prisma.$transaction(async (tx) => {
        // Update User
        await tx.user.update({
            where: { id: userId },
            data: { 
                onboardingCompleted: true,
                isSetupComplete: true 
            }
        });

        // Update Business with some of the collected info
        const updateData: any = {
            isSetupComplete: true
        };
        
        if (businessName) updateData.name = businessName;
        if (industry) {
            updateData.industry = industry;
            updateData.businessType = industry.toUpperCase();
        }
        if (agentName) updateData.agentName = agentName;
        if (tone) updateData.tone = tone;
        if (welcomeMessage) updateData.welcomeMessage = welcomeMessage;

        const accessToken = formData.get("accessToken") as string;
        const phoneNumberId = formData.get("phoneNumberId") as string;
        const wabaId = formData.get("wabaId") as string;

        await tx.business.update({
            where: { userId },
            data: updateData
        });

        // Also create/update WhatsAppAccount if credentials are provided
        if (accessToken && phoneNumberId && wabaId) {
            const business = await tx.business.findUnique({ where: { userId } });
            if (business) {
                // Update business fields directly
                await tx.business.update({
                    where: { id: business.id },
                    data: {
                        waToken: accessToken,
                        waPhoneNumberId: phoneNumberId,
                        waWabaId: wabaId,
                    }
                });

                // Create or update WhatsAppAccount table
                await tx.whatsAppAccount.upsert({
                    where: { businessId: business.id },
                    create: {
                        userId: userId,
                        businessId: business.id,
                        waba_id: wabaId,
                        phone_number_id: phoneNumberId,
                        access_token: accessToken,
                    },
                    update: {
                        waba_id: wabaId,
                        phone_number_id: phoneNumberId,
                        access_token: accessToken,
                    }
                });
            }
        }
    });

    return { success: true };
}

export async function checkCalendarConnection() {
    const session = await auth();
    if (!session?.user?.id) return false;

    const account = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            provider: "google-calendar"
        }
    });

    return !!account;
}

"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBusinessSettings() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
    });

    return business;
}

export async function updateBusinessSettings(data: { name: string; industry: string; description: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.business.update({
        where: { userId: session.user.id },
        data: {
            name: data.name,
            industry: data.industry,
            description: data.description,
        },
    });

    revalidatePath("/settings");
    return { success: true };
}

export async function updateWhatsAppSettings(data: { whatsappNumber: string; waToken: string; waPhoneNumberId: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.business.update({
        where: { userId: session.user.id },
        data: {
            whatsappNumber: data.whatsappNumber,
            waToken: data.waToken,
            waPhoneNumberId: data.waPhoneNumberId,
        },
    });

    revalidatePath("/settings");
    return { success: true };
}

export async function updateAISettings(data: { aiSystemPrompt: string; knowledgeBase: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.business.update({
        where: { userId: session.user.id },
        data: {
            aiSystemPrompt: data.aiSystemPrompt,
            knowledgeBase: data.knowledgeBase,
        },
    });

    revalidatePath("/settings");
    return { success: true };
}

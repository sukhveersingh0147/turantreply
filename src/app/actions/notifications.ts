"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
    });
}

export async function markNotificationAsRead(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.notification.update({
        where: { id, userId: session.user.id },
        data: { isRead: true },
    });

    revalidatePath("/");
    return { success: true };
}

export async function clearAllNotifications() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
    });

    revalidatePath("/");
    return { success: true };
}

export async function savePushSubscription(subscription: any) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Extract keys properly from the JSON subscription object
    const { endpoint, keys } = subscription;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        throw new Error("Invalid subscription object");
    }

    await prisma.pushSubscription.upsert({
        where: { endpoint },
        update: {
            p256dh: keys.p256dh,
            auth: keys.auth,
        },
        create: {
            userId: session.user.id,
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
        },
    });

    return { success: true };
}

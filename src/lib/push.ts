// @ts-ignore
import webpush from "web-push";
import { prisma } from "./prisma";

// Generate these or keep them in env
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails(
    "mailto:rs163592@gmail.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

export async function sendPushNotification(userId: string, payload: { title: string; body: string; url?: string }) {
    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
    });

    const pushPromises = subscriptions.map((sub: any) => {
        const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
            }
        };

        return webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
        ).catch((err: any) => {
            if (err.statusCode === 410 || err.statusCode === 404) {
                // Subscription has expired or is no longer valid
                // @ts-ignore
                return prisma.pushSubscription.delete({ where: { id: sub.id } });
            }
            console.error("Push Error:", err);
        });
    });

    await Promise.all(pushPromises);
}

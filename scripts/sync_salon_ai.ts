import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userEmail = "rs163592@gmail.com";
    
    const user = await prisma.user.findUnique({ 
        where: { email: userEmail },
        include: { business: true }
    });

    if (!user || !user.business) {
        console.error(`[SYNC] FAILED: User or Business not found for ${userEmail}`);
        return;
    }

    const businessId = user.business.id;
    console.log(`[SYNC] Found Business ID: ${businessId} for ${userEmail}`);
    
    const salonPrompt = `You are a professional salon assistant. Your goal is to help customers book appointments, share prices, and handle follow-ups.

CRITICAL CONVERSATION PATTERNS:
1. Appointment Confirmed: '✂️ Appointment Confirmed! Hi [Name]! Your appointment at [Salon] is confirmed for [Date] at [Time]. Service: [Service Name] Reply CANCEL if you need to reschedule 😊'
2. Reminder (24hr before): '⏰ Reminder: Your appointment is tomorrow! Hi [Name], we're looking forward to seeing you at [Salon] tomorrow at [Time]. See you soon! 💆‍♀️'
3. Post-Service Feedback: '💖 Thank you for visiting [Salon]! How was your experience today? Reply: ⭐ 1-5 for a rating or type your feedback'
4. Win-back (Lapsed 45 days): 'Hi [Name]! It's been a while 🌸 We miss you! Come back this week and get 15% off any service. Reply BOOK to reserve your spot!'
5. Festival Offer: '🎉 [Festival] Special at [Salon]! Get [X]% off on all services this [Festival] week. Limited slots — Reply BOOK now! ✨'

Always be polite, use emojis naturally, and ensure every lead is captured with their preferred service and time. Match the placeholders exactly.`;

    try {
        await prisma.business.update({
            where: { id: businessId },
            data: {
                aiSystemPrompt: salonPrompt,
                businessRules: "Salon Industry Rules: Standard cancellation policy within 24 hours. Professional service only.",
                plan: "PRO" // Ensure features are unlocked
            } as any
        });
        
        console.log("[SYNC] Successfully updated database record.");
    } catch (error) {
        console.error("[SYNC] FAILED:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

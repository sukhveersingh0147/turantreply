"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function completeSetup(data: {
    businessType: string;
    name: string;
    description: string;
    location?: string;
    workingHours?: any;
    targetAudience?: string;
    pricingDetails?: string;
    businessRules?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
    });

    if (!business) throw new Error("Business not found");

    // Map business type to default limits (Free Forever as fallback)
    const monthlyLimit = 30; 

    await prisma.$transaction([
        prisma.business.update({
            where: { id: business.id },
            data: {
                businessType: data.businessType,
                name: data.name,
                description: data.description,
                location: data.location,
                workingHours: data.workingHours,
                // @ts-ignore
                targetAudience: data.targetAudience,
                // @ts-ignore
                pricingDetails: data.pricingDetails,
                // @ts-ignore
                businessRules: data.businessRules,
                isSetupComplete: true,
                monthlyLimit: monthlyLimit,
            } as any,
        }),
        prisma.user.update({
            where: { id: session.user.id },
            data: { isSetupComplete: true }
        })
    ]);

    // Step 2: Seed Dashboard if not already done
    try {
        const { SeedService } = await import("@/services/seed.service");
        // Map the select option to our internal vertical type
        await SeedService.seedBusinessDashboard(business.id, data.businessType as any);
    } catch (err) {
        console.error("Dashboard seeding failed during setup:", err);
        // We don't fail the whole setup if seeding fails, but we log it
    }

    revalidatePath("/overview");
    revalidatePath("/setup");
    
    return { success: true };
}

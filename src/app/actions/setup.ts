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
                isSetupComplete: true,
                monthlyLimit: monthlyLimit,
            } as any,
        }),
        prisma.user.update({
            where: { id: session.user.id },
            data: { isSetupComplete: true }
        })
    ]);

    revalidatePath("/overview");
    revalidatePath("/setup");
    
    return { success: true };
}

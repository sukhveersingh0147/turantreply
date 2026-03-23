"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

/**
 * Enrolls a user in the Affiliate/Agency program.
 */
/**
 * Submits an application for the Affiliate/Agency program.
 */
export async function applyForAffiliateProgram(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const companyName = formData.get("companyName") as string;
    const website = formData.get("website") as string;
    const upiId = formData.get("upiId") as string;

    if (!companyName || !upiId) {
        return { error: "Company name and UPI ID are required." };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { affiliate: true }
        });

        if (!user) throw new Error("User not found");
        if (user.affiliate) {
            return { error: "You have already applied or are already an affiliate." };
        }

        // We generate a temporary/placeholder code or just leave it empty until approved
        // Let's leave referralCode as a placeholder or generate it later
        // Update schema to allow referralCode to be optional if needed, but it's @unique.
        // So we'll generate a "PENDING-XXXX" code.
        const tempCode = `pending-${nanoid(6).toLowerCase()}`;

        await prisma.affiliate.create({
            data: {
                userId: user.id,
                companyName,
                website,
                upiId,
                referralCode: tempCode,
                status: "PENDING",
            }
        });

        revalidatePath("/affiliate");
        return { success: true, message: "Application submitted successfully! Admin will review it soon." };
    } catch (error: any) {
        console.error("Apply Affiliate Error:", error);
        return { error: error.message };
    }
}

export async function requestPayout() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const affiliate = await prisma.affiliate.findUnique({
            where: { userId: session.user.id },
        });

        if (!affiliate || affiliate.status !== "ACTIVE") {
            return { error: "Only active affiliates can request payouts." };
        }

        const unpaidBalance = affiliate.earningsTotal - affiliate.earningsPaid;
        
        // Minimum payout threshold: ₹500
        if (unpaidBalance < 500) {
            return { error: "Minimum balance for payout is ₹500. Keep going!" };
        }

        // Check if there's already a pending request
        const existingRequest = await prisma.payoutRequest.findFirst({
            where: { affiliateId: affiliate.id, status: "PENDING" },
        });

        if (existingRequest) {
            return { error: "You already have a pending payout request." };
        }

        await prisma.payoutRequest.create({
            data: {
                affiliateId: affiliate.id,
                amount: unpaidBalance,
                upiId: affiliate.upiId || "N/A",
                status: "PENDING",
            }
        });

        revalidatePath("/affiliate");
        return { success: true, message: "Payout request created successfully! Admin will process it soon." };
    } catch (error: any) {
        console.error("Request Payout Error:", error);
        return { error: error.message };
    }
}

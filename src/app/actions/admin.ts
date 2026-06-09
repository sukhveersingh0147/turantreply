"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Ensures the user is an admin or support admin.
 */
async function ensureAdmin() {
    const session = await auth();
    if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
        throw new Error("Unauthorized: Admin access required");
    }
    return session;
}

// --- User Management ---

export async function toggleUserStatus(userId: string, currentStatus: string) {
    await ensureAdmin();
    const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    await prisma.user.update({
        where: { id: userId },
        data: { status: newStatus as any }
    });
    revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
    await ensureAdmin();
    await prisma.user.delete({
        where: { id: userId }
    });
    revalidatePath("/admin/users");
}

// --- Business Management ---

export async function toggleBusinessStatus(businessId: string, currentStatus: string) {
    await ensureAdmin();
    const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    await prisma.business.update({
        where: { id: businessId },
        data: { subscriptionStatus: newStatus as any }
    });
    revalidatePath("/admin/businesses");
}

import { PLANS, PlanType } from "@/lib/plans";

export async function updateUserPlan(businessId: string, plan: string) {
    await ensureAdmin();
    
    const planType = (plan.toUpperCase() as PlanType) || "FREE";
    const planFeatures = PLANS[planType];
    const monthlyLimit = planFeatures?.monthlyLimit ?? 30;
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days renewal

    await prisma.business.update({
        where: { id: businessId },
        data: { 
            plan: plan as any,
            monthlyLimit,
            subscriptionStatus: "ACTIVE",
            subscriptionExpiresAt: expiresAt,
            lastPayment: new Date(),
        }
    });
    revalidatePath("/admin/businesses");
    revalidatePath("/admin/users");
    revalidatePath("/billing");
}

export async function resetBusinessUsage(businessId: string) {
    await ensureAdmin();
    await prisma.business.update({
        where: { id: businessId },
        data: { aiRepliesUsed: 0 }
    });
    revalidatePath("/admin/users");
}

/**
 * Alias for updateUserPlan to match SaaS context.
 */
export const updateBusinessPlan = updateUserPlan;

/**
 * Adds top-up credits (conversations) to a business.
 */
export async function addTopupCredits(businessId: string, amount: number) {
    await ensureAdmin();
    await prisma.business.update({
        where: { id: businessId },
        data: {
            // @ts-ignore
            topupBalance: { increment: amount }
        }
    });
    revalidatePath("/admin/subscriptions");
}

// --- Affiliate Management ---

export async function approveAffiliate(affiliateId: string) {
    await ensureAdmin();
    await prisma.affiliate.update({
        where: { id: affiliateId },
        data: { status: "ACTIVE" }
    });
    revalidatePath("/admin/affiliates");
}

export async function rejectAffiliate(affiliateId: string) {
    await ensureAdmin();
    await prisma.affiliate.update({
        where: { id: affiliateId },
        data: { status: "REJECTED" }
    });
    revalidatePath("/admin/affiliates");
}

export async function updateAffiliateStatus(affiliateId: string, status: string) {
    await ensureAdmin();
    await prisma.affiliate.update({
        where: { id: affiliateId },
        data: { status: status as any }
    });
    revalidatePath("/admin/affiliates");
}

export async function updateAffiliateReferralCode(affiliateId: string, referralCode: string) {
    await ensureAdmin();
    await prisma.affiliate.update({
        where: { id: affiliateId },
        data: { referralCode }
    });
    revalidatePath("/admin/affiliates");
    return { success: true };
}

export async function fulfillPayoutRequest(requestId: string) {
    await ensureAdmin();
    // @ts-ignore
    const request = await prisma.payoutRequest.findUnique({
        where: { id: requestId },
        include: { affiliate: true }
    });

    if (!request) throw new Error("Payout request not found");

    await prisma.$transaction([
        // @ts-ignore
        prisma.payoutRequest.update({
            where: { id: requestId },
            data: { status: "PAID", paidAt: new Date() } as any
        }),
        prisma.affiliate.update({
            where: { id: request.affiliateId },
            data: { earningsPaid: { increment: request.amount } }
        })
    ]);

    revalidatePath("/admin/affiliates");
}

export async function processPayout(affiliateId: string) {
    await ensureAdmin();
    const affiliate = await prisma.affiliate.findUnique({
        where: { id: affiliateId }
    });
    
    if (!affiliate) throw new Error("Affiliate not found");
    
    const amount = affiliate.earningsTotal - affiliate.earningsPaid;
    if (amount <= 0) return;

    await prisma.$transaction([
        prisma.affiliate.update({
            where: { id: affiliateId },
            data: { earningsPaid: { increment: amount } }
        }),
        // @ts-ignore
        prisma.payoutRequest.create({
            data: {
                affiliateId,
                amount,
                status: "PAID",
                paidAt: new Date(),
                upiId: affiliate.upiId || "MANUAL"
            } as any
        })
    ]);
    
    revalidatePath("/admin/affiliates");
}

// --- Global Stats ---

export async function getAdminStats() {
    await ensureAdmin();
    
    const [totalUsers, totalBusinesses, activeLeads, totalMessages] = await Promise.all([
        prisma.user.count(),
        prisma.business.count(),
        prisma.lead.count(),
        prisma.message.count()
    ]);

    return {
        totalUsers,
        totalBusinesses,
        activeLeads,
        totalMessages
    };
}

// --- Client CRUD Operations for Agency Owner ---

export async function createClient(data: { name: string; email: string; passwordHash: string; businessName: string; plan: string; phone?: string }) {
    await ensureAdmin();
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.default.hash(data.passwordHash, 10);
    
    // Create client user and their business
    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email.trim().toLowerCase(),
            password: hashedPassword,
            role: "client",
            isSetupComplete: true,
            onboardingCompleted: true,
        }
    });

    const business = await prisma.business.create({
        data: {
            name: data.businessName,
            userId: user.id,
            whatsappNumber: data.phone || null,
            plan: data.plan || "FREE",
            subscriptionStatus: "ACTIVE",
        }
    });

    revalidatePath("/admin/clients");
    return { success: true, client: business };
}

export async function updateClient(businessId: string, data: { name: string; email: string; businessName: string; plan: string; phone?: string; status: string }) {
    await ensureAdmin();
    
    const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { user: true }
    });
    
    if (!business) throw new Error("Client business not found");

    await prisma.business.update({
        where: { id: businessId },
        data: {
            name: data.businessName,
            whatsappNumber: data.phone || null,
            plan: data.plan || business.plan,
            subscriptionStatus: data.status || business.subscriptionStatus,
        }
    });

    if (business.user) {
        await prisma.user.update({
            where: { id: business.userId },
            data: {
                name: data.name,
                email: data.email.trim().toLowerCase(),
                status: data.status === "ACTIVE" ? "ACTIVE" : "DISABLED",
            }
        });
    }

    revalidatePath("/admin/clients");
    return { success: true };
}

export async function deleteClient(businessId: string) {
    await ensureAdmin();
    const business = await prisma.business.findUnique({
        where: { id: businessId }
    });
    if (!business) throw new Error("Client business not found");

    // Deleting the owner user cascades to delete the business and all related records (leads, messages, appointments, etc.)
    await prisma.user.delete({
        where: { id: business.userId }
    });

    revalidatePath("/admin/clients");
    return { success: true };
}

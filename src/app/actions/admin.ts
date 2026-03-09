"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("Unauthorized: No session found");
    }
    const role = session.user.role;
    if (role !== "admin" && role !== "support_admin") {
        throw new Error("Unauthorized: Admin access required");
    }
    return session;
}

async function logAdminAction(adminId: string, action: string, targetId?: string, details?: string) {
    try {
        await prisma.adminLog.create({
            data: {
                adminId,
                action,
                targetId,
                details,
            }
        });
    } catch (error) {
        console.error("Failed to log admin action:", error);
    }
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
    const session = await ensureAdmin();
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    await prisma.user.update({
        where: { id: userId },
        data: { status: newStatus }
    });

    await logAdminAction(
        session.user!.id!,
        newStatus === "SUSPENDED" ? "USER_SUSPENDED" : "USER_ACTIVATED",
        userId
    );

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
}

export async function deleteUser(userId: string) {
    const session = await ensureAdmin();

    // Prevent deleting self
    if (userId === session.user?.id) {
        throw new Error("Cannot delete your own account");
    }

    await prisma.user.delete({
        where: { id: userId }
    });

    await logAdminAction(session.user!.id!, "USER_DELETED", userId);

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
}

export async function updateUserPlan(userId: string, plan: string) {
    const session = await ensureAdmin();

    const business = await prisma.business.findUnique({
        where: { userId }
    });

    if (!business) {
        throw new Error("User does not have a business profile");
    }

    await prisma.business.update({
        where: { id: business.id },
        data: { plan }
    });

    await logAdminAction(
        session.user!.id!,
        "PLAN_UPDATED",
        userId,
        `Changed plan to ${plan}`
    );

    revalidatePath("/admin/users");
    revalidatePath("/admin/businesses");
    return { success: true };
}

export async function toggleBusinessStatus(businessId: string, currentStatus: string) {
    const session = await ensureAdmin();
    const newStatus = currentStatus === "ACTIVE" ? "EXPIRED" : "ACTIVE";

    await prisma.business.update({
        where: { id: businessId },
        data: { subscriptionStatus: newStatus }
    });

    await logAdminAction(
        session.user!.id!,
        "BUSINESS_STATUS_TOGGLED",
        businessId,
        `Status changed to ${newStatus}`
    );

    revalidatePath("/admin/businesses");
}

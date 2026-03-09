"use server";

import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function startImpersonation(targetUserId: string) {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("Unauthorized: No session found");
    }
    const role = session.user.role;

    if (role !== "admin" && role !== "support_admin") {
        throw new Error("Unauthorized: Admin access required for impersonation");
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, name: true }
    });

    if (!targetUser) {
        throw new Error("Target user not found");
    }

    // Set impersonation cookie
    // In a production app, this should be a signed/encrypted cookie
    const cookieStore = await cookies();
    cookieStore.set("replyflow_impersonation_id", targetUserId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 2, // 2 hours
        path: "/",
    });

    // Log the action
    await prisma.adminLog.create({
        data: {
            adminId: session.user!.id!,
            action: "IMPERSONATION_STARTED",
            targetId: targetUserId,
            details: `Started impersonating ${targetUser.name || targetUserId}`,
        }
    });

    redirect("/overview");
}

export async function stopImpersonation() {
    const cookieStore = await cookies();
    cookieStore.delete("replyflow_impersonation_id");
    redirect("/admin/dashboard");
}

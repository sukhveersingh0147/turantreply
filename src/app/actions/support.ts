"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Ensures the user is logged in.
 */
async function ensureAuth() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }
    return session;
}

/**
 * Ensures the user is an admin.
 */
async function ensureAdmin() {
    const session = await ensureAuth();
    if (session.user.role !== "admin" && session.user.role !== "support_admin") {
        throw new Error("Forbidden: Admin access only");
    }
    return session;
}

// --- User Actions ---

export async function createSupportTicket(subject: string, message: string) {
    const session = await ensureAuth();
    const userId = session.user.id;

    const ticket = await prisma.supportTicket.create({
        data: {
            userId,
            subject,
            status: "OPEN",
            messages: {
                create: {
                    senderId: userId,
                    content: message,
                    isAdmin: false,
                }
            }
        }
    });

    revalidatePath("/support");
    return { success: true, ticketId: ticket.id };
}

export async function getSupportTickets() {
    const session = await ensureAuth();
    return prisma.supportTicket.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        include: {
            messages: {
                orderBy: { createdAt: "asc" },
                take: 1
            }
        }
    });
}

export async function getTicketDetails(ticketId: string) {
    const session = await ensureAuth();
    const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
            messages: {
                orderBy: { createdAt: "asc" }
            }
        }
    });

    if (!ticket || (ticket.userId !== session.user.id && session.user.role !== "admin" && session.user.role !== "support_admin")) {
        throw new Error("Ticket not found or access denied");
    }

    return ticket;
}

export async function sendUserMessage(ticketId: string, content: string) {
    const session = await ensureAuth();
    const userId = session.user.id;

    // Verify ownership
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket || ticket.userId !== userId) throw new Error("Unauthorized");

    await prisma.$transaction([
        prisma.supportMessage.create({
            data: {
                ticketId,
                senderId: userId,
                content,
                isAdmin: false,
            }
        }),
        prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status: "OPEN" } // Re-open if it was closed? Or just update updatedAt
        })
    ]);

    revalidatePath(`/support/${ticketId}`);
    return { success: true };
}

// --- Admin Actions ---

export async function getAllSupportTickets() {
    await ensureAdmin();
    return prisma.supportTicket.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
            user: {
                select: { name: true, email: true }
            },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1
            }
        }
    });
}

export async function sendAdminReply(ticketId: string, content: string) {
    const session = await ensureAdmin();
    const adminId = session.user.id;

    await prisma.$transaction([
        prisma.supportMessage.create({
            data: {
                ticketId,
                senderId: adminId,
                content,
                isAdmin: true,
            }
        }),
        prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status: "OPEN" } // Keep or change status
        })
    ]);

    revalidatePath(`/admin/support/${ticketId}`);
    revalidatePath(`/support/${ticketId}`);
    return { success: true };
}

export async function closeTicket(ticketId: string) {
    await ensureAdmin();
    await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: "CLOSED" }
    });
    revalidatePath("/admin/support");
    return { success: true };
}

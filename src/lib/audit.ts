import { prisma } from "@/lib/prisma";

/**
 * Logs a sensitive action for audit purposes.
 */
export async function logActivity(adminId: string, action: string, details?: any) {
    try {
        await prisma.adminLog.create({
            data: {
                adminId,
                action,
                details: details ? JSON.stringify(details) : null,
            }
        });
    } catch (error) {
        console.error("Audit log failed:", error);
    }
}

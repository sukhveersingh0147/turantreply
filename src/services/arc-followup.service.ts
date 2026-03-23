import { prisma } from "@/lib/prisma";
import { getMessageQueue } from "@/lib/queue";

export class ArcFollowupService {
    /**
     * Schedules a set of ARC follow-ups for a lead.
     * Cancels any existing pending ARC follow-ups for this lead first.
     */
    static async scheduleFollowups(leadId: string, businessId: string, from: string, phoneNumberId: string, waToken: string) {
        const queue = getMessageQueue();
        if (!queue) {
            console.warn("[ARC_FOLLOWUP] Skipping schedule: Queue unavailable (Redis not configured)");
            return;
        }

        const business = await prisma.business.findUnique({
            where: { id: businessId },
        });

        if (!business) return;

        // Schedule first nudge based on business interval
        const delayHours = business.followUpInterval || 24;
        await queue.add(
            "arc-followup",
            {
                leadId,
                businessId,
                from,
                phoneNumberId,
                waToken,
                type: "SMART_ACTION",
            },
            {
                delay: delayHours * 60 * 60 * 1000,
                jobId: `smart-action-${leadId}`,
            }
        );
    }

    /**
     * Schedules a feedback request after an appointment ends.
     */
    static async schedulePostAppointmentFollowup(appointment: any, leadPhone: string, phoneNumberId: string, waToken: string) {
        const queue = getMessageQueue();
        if (!queue) return;

        const now = new Date();
        const endTime = new Date(appointment.endTime || appointment.startTime);
        
        // Send 2 hours after end time, or in 5 minutes if it already passed
        let delay = (endTime.getTime() - now.getTime()) + (2 * 60 * 60 * 1000);
        if (delay < 0) delay = 5 * 60 * 1000;

        await queue.add(
            "arc-followup",
            {
                leadId: appointment.leadId,
                businessId: appointment.businessId,
                from: leadPhone,
                phoneNumberId,
                waToken,
                appointmentId: appointment.id,
                type: "POST_APPOINTMENT_FEEDBACK",
            },
            {
                delay,
                jobId: `feedback-${appointment.id}`,
            }
        );
        console.log(`[ARC_FOLLOWUP] Scheduled feedback for ${leadPhone} in ${Math.round(delay/1000/60)}m`);
    }

    /**
     * Cancels all pending ARC follow-ups for a lead (e.g., when they reply or convert).
     */
    static async cancelFollowups(leadId: string) {
        const queue = getMessageQueue();
        if (!queue) return; // Silent skip

        await Promise.all([
            queue.remove(`smart-action-${leadId}`),
            queue.remove(`arc-1d-${leadId}`), // Cleanup legacy
            queue.remove(`arc-1h-${leadId}`), // Cleanup legacy
        ]);
    }
}

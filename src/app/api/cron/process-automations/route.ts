import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

/**
 * CRON JOB: Process Lead Recovery and Follow-up Sequences
 * This endpoint should be called periodically (e.g., every 5-15 minutes).
 * Secure it with a secret token in the query params.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    // In a real app, use an env variable for this
    if (token !== "replyflow_cron_secret_123") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const stats = {
        recoverySent: 0,
        followUpsSent: 0,
        errors: [] as string[]
    };

    try {
        // 1. PROCESS LEAD RECOVERY
        // Find businesses with recovery enabled
        const businessesWithRecovery = await prisma.business.findMany({
            where: {
                recoverySettings: { isEnabled: true }
            },
            include: { recoverySettings: true }
        });

        for (const business of businessesWithRecovery) {
            if (!business.recoverySettings || !business.waToken || !business.waPhoneNumberId) continue;

            const waitTime = business.recoverySettings.waitTimeMinutes;
            const threshold = new Date(now.getTime() - waitTime * 60 * 1000);

            // Find leads that:
            // - Haven't been updated in waitTime minutes
            // - Haven't had a recovery message sent since their last update
            // - Are not paused
            const leadsToRecover = await prisma.lead.findMany({
                where: {
                    businessId: business.id,
                    isAiPaused: false,
                    updatedAt: { lte: threshold },
                    recoverySentAt: null, // Only send once per 'stale' period
                }
            });

            for (const lead of leadsToRecover) {
                try {
                    await sendWhatsAppMessage(
                        business.waPhoneNumberId,
                        business.waToken,
                        lead.phone,
                        business.recoverySettings.message
                    );

                    // Track message in database
                    await prisma.message.create({
                        data: {
                            businessId: business.id,
                            leadId: lead.id,
                            message: business.recoverySettings.message,
                            sender: "BUSINESS",
                            senderType: "AUTOMATION"
                        }
                    });

                    // Update lead status
                    await prisma.lead.update({
                        where: { id: lead.id },
                        data: {
                            recoverySentAt: now,
                            status: "RECOVERING"
                        }
                    });

                    stats.recoverySent++;
                } catch (err: any) {
                    stats.errors.push(`Recovery error for lead ${lead.phone}: ${err.message}`);
                }
            }
        }

        // 2. PROCESS FOLLOW-UP SEQUENCES
        // Find leads whose next follow-up date is in the past
        const leadsForFollowUp = await prisma.lead.findMany({
            where: {
                nextFollowUpDate: { lte: now },
                enrolledSequenceId: { not: null },
                isAiPaused: false
            },
            include: {
                business: true,
            }
        });

        for (const lead of leadsForFollowUp) {
            try {
                const sequence = await prisma.followUpSequence.findUnique({
                    where: { id: lead.enrolledSequenceId! },
                    include: { steps: { orderBy: { order: 'asc' } } }
                });

                if (!sequence || !sequence.isActive || !lead.business.waToken || !lead.business.waPhoneNumberId) {
                    // Clear follow-up if sequence is gone or inactive
                    await prisma.lead.update({
                        where: { id: lead.id },
                        data: { enrolledSequenceId: null, nextFollowUpDate: null }
                    });
                    continue;
                }

                const currentStep = sequence.steps[lead.currentStepIndex];
                if (!currentStep) {
                    // Sequence finished
                    await prisma.lead.update({
                        where: { id: lead.id },
                        data: { enrolledSequenceId: null, nextFollowUpDate: null }
                    });
                    continue;
                }

                // Send the message
                await sendWhatsAppMessage(
                    lead.business.waPhoneNumberId,
                    lead.business.waToken,
                    lead.phone,
                    currentStep.message
                );

                // Track message
                await prisma.message.create({
                    data: {
                        businessId: lead.businessId,
                        leadId: lead.id,
                        message: currentStep.message,
                        sender: "BUSINESS",
                        senderType: "AUTOMATION"
                    }
                });

                // Calculate next follow-up date
                const nextStepIndex = lead.currentStepIndex + 1;
                const nextStep = sequence.steps[nextStepIndex];
                let nextDate = null;

                if (nextStep) {
                    // Calculate days from current step
                    const daysUntilNext = nextStep.dayDelay - currentStep.dayDelay;
                    nextDate = new Date(now.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
                }

                // Update lead
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: {
                        currentStepIndex: nextStepIndex,
                        nextFollowUpDate: nextDate,
                        enrolledSequenceId: nextStep ? lead.enrolledSequenceId : null // Clear if no more steps
                    }
                });

                stats.followUpsSent++;
            } catch (err: any) {
                stats.errors.push(`Follow-up error for lead ${lead.phone}: ${err.message}`);
            }
        }

        return NextResponse.json({ success: true, stats });
    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { prisma } from "@/lib/prisma";

export class AppointmentService {
    /**
     * Books an appointment for a lead.
     */
    static async bookAppointment(leadId: string, businessId: string, startTime: Date, title?: string, description?: string) {
        // 1. Create the appointment
        const appointment = await prisma.appointment.create({
            data: {
                leadId,
                businessId,
                startTime,
                title: title || "AI Booked Appointment",
                description: description || "Automatically scheduled by TurantReply AI.",
                status: "SCHEDULED",
                source: "AI",
            }
        });

        // 2. Update the lead to CONVERTED
        await prisma.lead.update({
            where: { id: leadId },
            data: {
                status: "CONVERTED",
                leadType: "Appointment booked",
                appointmentTime: startTime,
            }
        });

        // 3. Create a notification for the business owner
        const business = await prisma.business.findUnique({
            where: { id: businessId },
            select: { userId: true }
        });

        if (business) {
            await prisma.notification.create({
                data: {
                    userId: business.userId,
                    businessId: businessId,
                    title: "📅 New Appointment Booked",
                    message: `A new appointment has been scheduled for ${startTime.toLocaleString()}.`,
                    type: "SUCCESS",
                    link: "/appointments",
                }
            });
        }

        return appointment;
    }

    /**
     * Lists upcoming appointments for a business.
     */
    static async getUpcomingAppointments(businessId: string) {
        return await prisma.appointment.findMany({
            where: {
                businessId,
                startTime: { gte: new Date() },
                status: "SCHEDULED"
            },
            include: { lead: true },
            orderBy: { startTime: "asc" }
        });
    }
}

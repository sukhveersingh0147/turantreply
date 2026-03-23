import { getAppointmentsData, getBookingResources } from "@/app/actions/appointments";
import CalendarClient from "@/components/dashboard/CalendarClient";

export default async function CalendarPage() {
    const [appointments, resources] = await Promise.all([
        getAppointmentsData(),
        getBookingResources()
    ]);

    return (
        <CalendarClient 
            initialAppointments={appointments} 
            resources={resources} 
        />
    );
}

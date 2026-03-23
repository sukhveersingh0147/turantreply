import { getAppointmentsData } from "@/app/actions/appointments";
import AppointmentsClient from "@/components/dashboard/AppointmentsClient";

export default async function AppointmentsPage() {
    const initialData = await getAppointmentsData();
    return <AppointmentsClient initialData={initialData} />;
}

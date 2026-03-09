import { getLeadsData } from "@/app/actions/leads";
import LeadsClient from "@/components/dashboard/LeadsClient";

export default async function LeadsPage() {
    const initialData = await getLeadsData();

    return <LeadsClient initialData={initialData} />;
}


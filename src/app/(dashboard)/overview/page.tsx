import { auth } from "@/auth";
import { redirect } from "next/navigation";
import OverviewClient from "@/components/dashboard/OverviewClient";

export default async function OverviewPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    return <OverviewClient />;
}

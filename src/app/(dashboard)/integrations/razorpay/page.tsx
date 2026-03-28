import { auth } from "@/auth";
import { getBusinessSettings } from "@/app/actions/settings";
import RazorpaySetupClient from "@/components/dashboard/RazorpaySetupClient";
import { redirect } from "next/navigation";

export default async function RazorpayIntegrationPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const business = await getBusinessSettings();

    return (
        <main className="p-4 sm:p-6 lg:p-8">
            <RazorpaySetupClient business={business} />
        </main>
    );
}

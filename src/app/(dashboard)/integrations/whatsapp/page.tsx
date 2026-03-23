import { auth } from "@/auth";
import { getBusinessSettings } from "@/app/actions/settings";
import { redirect } from "next/navigation";
import WhatsAppSetupClient from "@/components/dashboard/WhatsAppSetupClient";

export default async function WhatsAppSetupPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const business = await getBusinessSettings();

    return (
        <div className="container mx-auto px-4 py-8">
            <WhatsAppSetupClient business={business} />
        </div>
    );
}

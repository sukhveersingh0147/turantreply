import { auth } from "@/auth";
import { getBusinessSettings } from "@/app/actions/settings";
import IntegrationsClient from "@/components/dashboard/IntegrationsClient";
import { redirect } from "next/navigation";

export default async function IntegrationsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const business = await getBusinessSettings();

    return (
        <main className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white font-[Outfit] tracking-tight">
                    Unified <span className="text-gradient">Integrations</span>
                </h1>
                <p className="text-white/40 mt-1 font-medium">Connect WhatsApp and your favorite business tools.</p>
            </div>
            <IntegrationsClient business={business} />
        </main>
    );
}

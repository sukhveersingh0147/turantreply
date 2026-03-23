import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFlows } from "@/app/actions/automation";
import { getAccessibleBusiness } from "@/app/actions/settings";
import AutomationClient from "@/components/dashboard/AutomationClient";

export default async function AutomationPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const [flows, business] = await Promise.all([
        getFlows(),
        getAccessibleBusiness()
    ]);

    if (business?.plan === "FREE") {
        redirect("/settings?tab=billing");
    }

    const initialSettings = {
        aiActionMode: business?.aiActionMode || "SUGGEST",
        followUpInterval: business?.followUpInterval || 24,
        maxFollowUps: business?.maxFollowUps || 2,
        aiPersonalization: business?.aiPersonalization ?? true,
    };

    return <AutomationClient initialFlows={flows} initialSettings={initialSettings} />;
}

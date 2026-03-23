import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCampaigns } from "@/app/actions/campaign";
import CampaignsClient from "@/components/dashboard/CampaignsClient";

export default async function CampaignsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const { getInventory } = await import("@/app/actions/inventory");
    const { getCoupons } = await import("@/app/actions/coupons");
    const { getAccessibleBusiness } = await import("@/app/actions/settings");
    
    const business = await getAccessibleBusiness();
    if (business?.plan === "FREE") {
        redirect("/settings?tab=billing");
    }

    const campaigns = await getCampaigns();
    const items = await getInventory();
    const coupons = await getCoupons();

    return <CampaignsClient initialCampaigns={campaigns} items={items} coupons={coupons} business={business} />;
}

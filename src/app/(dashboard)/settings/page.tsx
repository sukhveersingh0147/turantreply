import { auth } from "@/auth";
import { getBusinessSettings } from "@/app/actions/settings";
import SettingsClient from "@/components/dashboard/SettingsClient";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const business = await getBusinessSettings();
    let team = [];
    if (business) {
        try {
            const { getTeamMembers } = await import("@/app/actions/settings");
            team = await getTeamMembers();
        } catch (error) {
            console.error("Error fetching team members:", error);
        }
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-black font-[Outfit]">Settings</h1>
                <p className="text-sm text-white/40">Manage your business profile and team</p>
            </div>

            <SettingsClient business={business} user={session.user} initialTeam={team} />
        </div>
    );
}


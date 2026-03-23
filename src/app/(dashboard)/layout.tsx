import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";
import { getBusinessSettings } from "@/app/actions/settings";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const business = await getBusinessSettings();

    return (
        <DashboardLayoutClient user={session.user} business={business}>
            {children}
        </DashboardLayoutClient>
    );
}

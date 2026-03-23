import { SetupWizard } from "@/components/dashboard/SetupWizard";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SetupPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id }
    });

    if (business?.isSetupComplete) {
        redirect("/overview");
    }

    return (
        <main className="min-h-screen bg-[#060a0f] selection:bg-[#25D366]/30">
            <SetupWizard />
        </main>
    );
}

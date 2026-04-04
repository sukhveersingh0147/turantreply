import VerticalOnboarding from "@/components/dashboard/VerticalOnboarding";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SetupPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (user?.onboardingCompleted) {
        redirect("/overview");
    }

    return (
        <main className="min-h-screen bg-[#0f0f0f] selection:bg-[#25D366]/30 flex items-center justify-center">
            <div className="w-full">
                <VerticalOnboarding />
            </div>
        </main>
    );
}

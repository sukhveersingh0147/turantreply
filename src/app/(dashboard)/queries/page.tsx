import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InquiryList from "@/components/dashboard/InquiryList";

export default async function QueriesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
    });

    if (!business) redirect("/setup");

    // Fetch inquiries (could be expanded to include whatsapp leads with pending queries)
    const inquiries = await prisma.inquiry.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black font-[Outfit] text-white tracking-tight">
                    Customer <span className="text-gradient">Queries</span>
                </h1>
                <p className="text-white/40 mt-1 font-medium">
                    Manage pending questions and messages from your customers.
                </p>
            </div>

            <InquiryList initialInquiries={inquiries} />
        </div>
    );
}

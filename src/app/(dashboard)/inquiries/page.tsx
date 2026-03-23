import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInquiries } from "@/app/actions/marketing";
import InquiryList from "@/components/dashboard/InquiryList";
import { Mail, Shield } from "lucide-react";

export const metadata = {
    title: "Support Inquiries — Admin Dashboard",
};

export default async function InquiriesPage() {
    const session = await auth();

    // Secure the page for admin/support_admin only
    if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
        redirect("/overview");
    }

    const inquiries = await getInquiries();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20">
                        <Mail className="w-6 h-6 text-[#25D366]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black font-[Outfit]">Support Inquiries</h1>
                        <p className="text-sm text-white/40 mt-0.5 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            Admin Access · Manage contact form submissions
                        </p>
                    </div>
                </div>
                <div className="hidden sm:block text-right">
                    <p className="text-xs text-white/30 font-medium">Total Submissions</p>
                    <p className="text-xl font-black font-[Outfit] text-[#25D366]">{inquiries.length}</p>
                </div>
            </div>

            <InquiryList initialInquiries={inquiries} />
        </div>
    );
}

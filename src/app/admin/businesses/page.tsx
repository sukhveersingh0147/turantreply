import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    Search,
    Building2,
    User,
    MessageSquare,
    Zap,
    ExternalLink,
    Eye,
    Power,
    Shield,
    Tag,
} from "lucide-react";
import { toggleBusinessStatus } from "@/app/actions/admin";

export default async function AdminBusinessesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const session = await auth();
    if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
        redirect("/overview");
    }

    const query = typeof params.q === 'string' ? params.q : "";

    const businesses = await prisma.business.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { user: { name: { contains: query, mode: 'insensitive' } } },
            ]
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                }
            },
            _count: {
                select: {
                    leads: true,
                    messages: true,
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black font-[Outfit]">Business Monitoring</h1>
                <p className="text-sm text-white/40 mt-1">Monitor all active businesses and their automation performance</p>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <form className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 flex-1 max-w-md">
                    <Search className="w-4 h-4 text-white/30" />
                    <input
                        name="q"
                        defaultValue={query}
                        placeholder="Search by business or owner name..."
                        className="bg-transparent text-sm text-white/70 placeholder:text-white/30 outline-none flex-1"
                    />
                </form>
            </div>

            {/* Businesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {businesses.map((business: any) => (
                    <div key={business.id} className="glass-card border border-white/5 p-5 flex flex-col gap-5 hover:border-white/10 transition-colors group">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-white/90">{business.name}</h3>
                                    <div className="flex items-center gap-1 text-[10px] text-white/30 italic">
                                        <Tag className="w-2.5 h-2.5" />
                                        {business.industry || "General"}
                                    </div>
                                </div>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border tracking-widest
                                ${business.plan === "PRO" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                    business.plan === "ENTERPRISE" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                        "bg-white/5 text-white/40 border-white/10"}`}>
                                {business.plan}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/[0.03]">
                            <div className="space-y-1">
                                <div className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">Owner</div>
                                <div className="text-[11px] text-white/70 truncate flex items-center gap-1">
                                    <User className="w-2.5 h-2.5 text-white/20" />
                                    {business.user?.name || "No User"}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">Status</div>
                                <div className={`text-[11px] font-bold flex items-center gap-1 
                                    ${business.subscriptionStatus === "ACTIVE" ? "text-[#25D366]" : "text-red-400"}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${business.subscriptionStatus === "ACTIVE" ? "bg-[#25D366] shadow-[0_0_8px_#25D366]" : "bg-red-400"}`} />
                                    {business.subscriptionStatus}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-white/20 font-bold uppercase">Leads</span>
                                    <span className="font-bold text-white/70 flex items-center gap-1 text-[11px]">
                                        <Zap className="w-3 h-3 text-yellow-400" />
                                        {business._count.leads}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-white/20 font-bold uppercase">Msgs</span>
                                    <span className="font-bold text-white/70 flex items-center gap-1 text-[11px]">
                                        <MessageSquare className="w-3 h-3 text-cyan-400" />
                                        {business._count.messages}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <form action={async () => { "use server"; await toggleBusinessStatus(business.id, business.subscriptionStatus); }}>
                                    <button
                                        className={`p-2 rounded-lg border transition-colors
                                            ${business.subscriptionStatus === "ACTIVE"
                                                ? "text-red-400 border-red-500/10 hover:bg-red-500/10"
                                                : "text-[#25D366] border-[#25D366]/10 hover:bg-[#25D366]/10"}`}
                                        title={business.subscriptionStatus === "ACTIVE" ? "Disable Business" : "Enable Business"}
                                    >
                                        <Power className="w-3.5 h-3.5" />
                                    </button>
                                </form>
                                <button className="p-2 rounded-lg border border-white/5 text-white/40 hover:text-white hover:bg-white/5 transition-colors" title="View Business Dashboard">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-2 rounded-lg border border-purple-500/10 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 transition-colors" title="Impersonate (Login as Business)">
                                    <Eye className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {businesses.length === 0 && (
                <div className="py-20 text-center text-white/20 text-sm">
                    No businesses found matching your search.
                </div>
            )}
        </div>
    );
}

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Users, DollarSign, Clock, CheckCircle2, AlertCircle, ArrowUpRight, Search, Building2, Globe, CreditCard, Check, X } from "lucide-react";
import { updateAffiliateStatus, processPayout, approveAffiliate, rejectAffiliate, fulfillPayoutRequest } from "@/app/actions/admin";
import { ReferralCodeEditor } from "@/components/admin/ReferralCodeEditor";
import Link from "next/link";

export default async function AdminAffiliatesPage() {
    const session = await auth();
    if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
        redirect("/overview");
    }

    const affiliates = await (prisma.affiliate as any).findMany({
        include: {
            user: {
                select: { name: true, email: true }
            },
            commissions: {
                where: { status: "PENDING" },
                select: { amount: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    const payoutRequests = await (prisma.payoutRequest as any).findMany({
        where: { status: "PENDING" },
        include: {
            affiliate: {
                include: { user: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    const pendingApps = affiliates.filter((a: any) => a.status === "PENDING");
    const activePartners = affiliates.filter((a: any) => a.status === "ACTIVE" || a.status === "DISABLED");

    const stats = {
        totalAffiliates: activePartners.length,
        totalEarnings: activePartners.reduce((sum: number, a: any) => sum + a.earningsTotal, 0),
        pendingPayouts: activePartners.reduce((sum: number, a: any) => sum + (a.earningsTotal - a.earningsPaid), 0),
        pendingApplications: pendingApps.length,
    };

    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-[Outfit]">Affiliate <span className="text-gradient">Management</span></h1>
                    <p className="text-white/40 mt-1">Review applications and manage partner performance.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 border-white/10">
                    <span className="text-white/40 text-xs uppercase font-bold tracking-widest">Active Partners</span>
                    <div className="flex items-center gap-3 mt-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="text-2xl font-black">{stats.totalAffiliates}</span>
                    </div>
                </div>
                <div className="glass-card p-6 border-white/10">
                    <span className="text-white/40 text-xs uppercase font-bold tracking-widest">Pending Payouts</span>
                    <div className="flex items-center gap-3 mt-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <span className="text-2xl font-black">₹{stats.pendingPayouts.toFixed(2)}</span>
                    </div>
                </div>
                <div className="glass-card p-6 border-white/10">
                    <span className="text-white/40 text-xs uppercase font-bold tracking-widest">Total Commission</span>
                    <div className="flex items-center gap-3 mt-2">
                        <DollarSign className="w-5 h-5 text-[#25D366]" />
                        <span className="text-2xl font-black">₹{stats.totalEarnings.toFixed(2)}</span>
                    </div>
                </div>
                <div className="glass-card p-6 border-orange-500/20 bg-orange-500/5">
                    <span className="text-orange-400 text-xs uppercase font-bold tracking-widest">Pending Applications</span>
                    <div className="flex items-center gap-3 mt-2">
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                        <span className="text-2xl font-black">{stats.pendingApplications}</span>
                    </div>
                </div>
            </div>

            {/* Pending Applications Section */}
            {pendingApps.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold font-[Outfit] flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-400" /> New Applications
                    </h2>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {pendingApps.map((app: any) => (
                            <div key={app.id} className="glass-card p-6 border-[#25D366]/20 bg-[#25D366]/5 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 flex gap-2">
                                    <form action={async () => {
                                        "use server";
                                        await approveAffiliate(app.id);
                                    }}>
                                        <button className="p-2 bg-[#25D366] text-black rounded-lg hover:scale-110 transition-transform shadow-lg shadow-[#25D366]/20">
                                            <Check className="w-5 h-5" />
                                        </button>
                                    </form>
                                    <form action={async () => {
                                        "use server";
                                        await rejectAffiliate(app.id);
                                    }}>
                                        <button className="p-2 bg-red-500 text-white rounded-lg hover:scale-110 transition-transform shadow-lg shadow-red-500/20">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-[#25D366]" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{app.companyName || 'N/A'}</h3>
                                            <p className="text-xs text-white/40">{app.user.name} • {app.user.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest flex items-center gap-1">
                                                <Globe className="w-3 h-3" /> Website
                                            </span>
                                            <p className="text-sm truncate text-blue-400 hover:underline cursor-pointer">
                                                {app.website || 'No website provided'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest flex items-center gap-1">
                                                <CreditCard className="w-3 h-3" /> Payout UPI
                                            </span>
                                            <p className="text-sm font-mono text-white/80">{app.upiId || 'N/A'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-[10px] text-white/20 pt-2 border-t border-white/5">
                                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payout Requests Section */}
            {payoutRequests.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold font-[Outfit] flex items-center gap-2 text-yellow-400">
                        <DollarSign className="w-5 h-5" /> Pending Withdrawals
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {payoutRequests.map((req: any) => (
                            <div key={req.id} className="glass-card p-6 border-yellow-500/20 bg-yellow-500/5 relative group">
                                <div className="absolute top-4 right-4">
                                    <form action={async () => {
                                        "use server";
                                        await fulfillPayoutRequest(req.id);
                                    }}>
                                        <button className="bg-[#25D366] text-black text-[10px] font-black px-3 py-1.5 rounded-lg hover:scale-105 transition-transform uppercase shadow-lg shadow-[#25D366]/20">
                                            Mark as Paid
                                        </button>
                                    </form>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">₹{req.amount.toFixed(2)}</p>
                                            <p className="text-[10px] text-white/40">{req.affiliate.companyName || req.affiliate.user.name}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                                        <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Transfer to UPI</p>
                                        <p className="text-sm font-mono text-[#25D366]">{req.upiId}</p>
                                    </div>
                                    <p className="text-[10px] text-white/20">Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="space-y-4">
                <h2 className="text-xl font-bold font-[Outfit]">Active Partners</h2>
                <div className="glass-card border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-xs text-white/30 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Partner</th>
                                    <th className="px-6 py-4">Ref Code</th>
                                    <th className="px-6 py-4">UPI ID</th>
                                    <th className="px-6 py-4">Total Earned</th>
                                    <th className="px-6 py-4">Unpaid</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {activePartners.length > 0 ? activePartners.map((aff: any) => (
                                    <tr key={aff.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white/90">{aff.companyName || aff.user.name}</span>
                                                <span className="text-[10px] text-white/30 lowercase">{aff.user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 truncate">
                                            <ReferralCodeEditor 
                                                affiliateId={aff.id} 
                                                initialCode={aff.referralCode} 
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-xs text-white/40 font-mono">
                                            {aff.upiId || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white/80">
                                            ₹{aff.earningsTotal.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-black ${(aff.earningsTotal - aff.earningsPaid) > 0 ? "text-yellow-400" : "text-white/20"}`}>
                                                ₹{(aff.earningsTotal - aff.earningsPaid).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${aff.status === "ACTIVE" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-red-500/10 text-red-500"}`}>
                                                {aff.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {(aff.earningsTotal - aff.earningsPaid) > 0 && (
                                                    <form action={async () => {
                                                        "use server";
                                                        await processPayout(aff.id);
                                                    }}>
                                                        <button className="text-[10px] font-bold bg-[#25D366] text-black px-3 py-1 rounded-md hover:scale-105 transition-transform uppercase">
                                                            Pay Now
                                                        </button>
                                                    </form>
                                                )}
                                                <form action={async () => {
                                                    "use server";
                                                    await updateAffiliateStatus(aff.id, aff.status === "ACTIVE" ? "DISABLED" : "ACTIVE");
                                                }}>
                                                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 transition-colors" title="Toggle Status">
                                                        <AlertCircle className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-white/20 italic">No active partners found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

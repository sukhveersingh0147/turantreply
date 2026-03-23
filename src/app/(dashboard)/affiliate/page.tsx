import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Zap, Users, DollarSign, ExternalLink, ArrowUpRight, Clock, CheckCircle2, CreditCard, TrendingUp } from "lucide-react";
import Link from "next/link";
import { applyForAffiliateProgram, requestPayout } from "@/app/actions/affiliate";
import CopyReferralLink from "@/components/affiliate/CopyReferralLink";

export default async function AffiliatePage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            referredUsers: {
                orderBy: { createdAt: "desc" },
                take: 10,
                include: { business: true }
            },
            affiliate: {
                include: {
                    payoutRequests: {
                        orderBy: { createdAt: "desc" },
                        take: 5
                    },
                    commissions: {
                        take: 10,
                        orderBy: { createdAt: "desc" },
                        include: { user: true }
                    }
                }
            }
        } as any
    }) as any;

    if (!user) redirect("/login");

    const affiliate = user.affiliate;
    const isPending = affiliate?.status === "PENDING";
    const isActive = affiliate?.status === "ACTIVE";

    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://turantreply.com'}/signup?ref=${affiliate?.referralCode || ''}`;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black font-[Outfit] tracking-tight">
                        Affiliate <span className="text-gradient">Program</span>
                    </h1>
                    <p className="text-sm text-white/50 mt-1">Earn 30% recurring commission for every customer you refer.</p>
                </div>
                {isActive && (
                     <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Link:</span>
                        <code className="text-[#25D366] font-mono text-xs truncate max-w-[200px]">
                            {referralLink}
                        </code>
                        <CopyReferralLink link={referralLink} />
                     </div>
                )}
            </div>

            {!affiliate ? (
                /* Application Form */
                <div className="glass-card relative overflow-hidden p-6 sm:p-10 border-white/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#25D366]/10 blur-[100px] -mr-32 -mt-32" />
                    
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col items-center text-center space-y-4 mb-8 sm:mb-10">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center">
                                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white/20" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black font-[Outfit]">Apply for Agency Partner</h2>
                            <p className="text-sm text-white/60 max-w-xl">
                                Join our partner network and earn 30% recurring commission. Please provide your business details for approval.
                            </p>
                        </div>

                        <form action={async (formData) => {
                            "use server";
                            await applyForAffiliateProgram(formData);
                        }} className="space-y-6 bg-white/5 p-6 sm:p-8 rounded-3xl border border-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5">Agency / Company Name</label>
                                        <input name="companyName" placeholder="e.g. Acme Marketing" className="input-dark w-full" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5">Website / Profile URL (Optional)</label>
                                        <input name="website" placeholder="https://youragency.com" className="input-dark w-full" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#25D366] uppercase tracking-widest mb-1.5">UPI ID (For Payouts)</label>
                                        <input name="upiId" placeholder="username@upi" className="input-dark w-full border-[#25D366]/20 bg-[#25D366]/5 focus:border-[#25D366]" required />
                                        <p className="text-[10px] text-white/30 mt-1">Direct UPI payouts in India.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2">
                                <button className="btn-primary w-full sm:w-auto px-10">
                                    Submit Application
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : isPending ? (
                /* Pending State */
                <div className="glass-card p-8 sm:p-12 border-white/10 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center animate-pulse">
                        <Clock className="w-10 h-10 text-yellow-400" />
                    </div>
                    <div className="max-w-md space-y-2">
                        <h2 className="text-2xl font-bold font-[Outfit]">Application Under Review</h2>
                        <p className="text-sm text-white/40">
                            Thank you for applying! Our team is reviewing your agency details. You will receive an email once approved.
                        </p>
                    </div>
                    <Link href="/overview" className="btn-primary">
                        Go back to Dashboard
                    </Link>
                </div>
            ) : (
                /* Affiliate Dashboard Stats */
                <div className="space-y-6 sm:space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[
                            { label: "Total Earnings", value: `₹${(affiliate.earningsTotal || 0).toLocaleString()}`, icon: TrendingUp, color: "text-[#25D366]", bg: "bg-[#25D366]/10" },
                            { label: "Current Balance", value: `₹${(affiliate.earningsTotal - affiliate.earningsPaid).toLocaleString()}`, icon: CreditCard, color: "text-blue-400", bg: "bg-blue-500/10" },
                            { label: "Total Referrals", value: (affiliate.referralsCount || 0).toString(), icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
                            { label: "Commission Rate", value: `${affiliate.commissionRate}%`, icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card border border-white/5 p-5 sm:p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center border border-white/5`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black font-[Outfit] mb-1 tracking-tight">
                                    {stat.value}
                                </div>
                                <div className="text-xs sm:text-sm text-white/40 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Referral Link Card */}
                        <div className="glass-card border border-white/5 p-5 sm:p-6">
                            <h2 className="text-lg font-bold font-[Outfit] mb-4">Your Referral Link</h2>
                            <p className="text-sm text-white/50 mb-4 leading-relaxed">
                                Share this link with your audience. Every time they upgrade to a paid plan, you earn {affiliate.commissionRate}% commission!
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                    <code className="text-xs text-[#25D366] font-medium truncate flex-1">
                                        {referralLink}
                                    </code>
                                    <div className="shrink-0 border-l border-white/10 pl-3">
                                        <CopyReferralLink link={referralLink} />
                                    </div>
                                </div>
                                <p className="text-[10px] text-white/30 text-center italic">
                                    Tip: Use a URL shortener like Bitly for cleaner social sharing.
                                </p>
                            </div>
                        </div>

                        {/* Payout Card */}
                        <div className="glass-card border border-white/5 p-5 sm:p-6">
                            <h2 className="text-lg font-bold font-[Outfit] mb-4">Request Payout</h2>
                            <p className="text-sm text-white/40 mb-5 leading-relaxed">
                                Withdraw your earnings once you reach at least ₹500. Payouts are processed via UPI.
                            </p>
                            <div className="space-y-4">
                                <div className="p-4 bg-[#25D366]/5 border border-[#25D366]/10 rounded-xl">
                                    <label className="block text-[10px] font-black text-[#25D366] uppercase tracking-widest mb-1">Available for Withdrawal</label>
                                    <span className="text-2xl font-black font-[Outfit]">₹{(affiliate.earningsTotal - affiliate.earningsPaid).toLocaleString()}</span>
                                </div>

                                {affiliate.payoutRequests.some((r: any) => r.status === "PENDING") ? (
                                    <div className="p-4 bg-yellow-400/5 border border-yellow-400/10 rounded-xl flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-yellow-400" />
                                        <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">A payout request is currently pending review.</span>
                                    </div>
                                ) : (
                                    <form action={async () => {
                                        "use server";
                                        await requestPayout();
                                    }}>
                                        <button
                                            type="submit"
                                            disabled={(affiliate.earningsTotal - affiliate.earningsPaid) < 500}
                                            className={`btn-primary btn-full-mobile ${(affiliate.earningsTotal - affiliate.earningsPaid) < 500 ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
                                        >
                                            {(affiliate.earningsTotal - affiliate.earningsPaid) < 500 ? 'Min ₹500 to Withdraw' : 'Request Payout Now'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pending/Recent Payout Requests */}
                    {affiliate.payoutRequests.length > 0 && (
                        <div className="glass-card border border-white/5 p-5 sm:p-6 space-y-4">
                            <h3 className="font-bold text-lg font-[Outfit] flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#25D366]" /> Payout History
                            </h3>
                            <div className="space-y-3">
                                {affiliate.payoutRequests.map((req: any) => (
                                    <div key={req.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${req.status === 'PAID' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                {req.status === 'PAID' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm sm:text-base font-black">₹{req.amount.toLocaleString()}</p>
                                                <p className="text-[10px] text-white/30 uppercase tracking-wider">{req.upiId}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${req.status === 'PAID' ? 'bg-[#25D366]/20 text-[#25D366]' : 'bg-yellow-400/20 text-yellow-400'}`}>
                                                {req.status}
                                            </span>
                                            <p className="text-[8px] text-white/20 mt-1 uppercase">{new Date(req.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Commissions Table */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass-card border border-white/5 overflow-hidden">
                            <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="font-bold font-[Outfit]">Recent Commissions</h3>
                                <Link href="/affiliate/commissions" className="text-[10px] font-black text-white/30 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest">
                                    View Full Report <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="overflow-x-auto scrollbar-hide">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 text-[10px] text-white/30 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4 font-black">Client</th>
                                            <th className="px-6 py-4 font-black hidden sm:table-cell">Date</th>
                                            <th className="px-6 py-4 font-black text-right">Commission</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {affiliate.commissions.length > 0 ? affiliate.commissions.map((comm: any) => (
                                            <tr key={comm.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white/90 group-hover:text-[#25D366] transition-colors">
                                                            {comm.user.email.split('@')[0].slice(0, 3)}***@{comm.user.email.split('@')[1]}
                                                        </span>
                                                        <span className="text-[10px] text-white/30 sm:hidden">{new Date(comm.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-white/30 hidden sm:table-cell">
                                                    {new Date(comm.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-black text-white">₹{comm.amount.toLocaleString()}</span>
                                                        <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 rounded-full ${comm.status === 'PAID' ? 'bg-blue-400/10 text-blue-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                                                            {comm.status}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-white/20 italic text-xs uppercase tracking-widest">No commissions yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Referrals Table */}
                        <div className="glass-card border border-white/5 overflow-hidden">
                            <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="font-bold font-[Outfit]">My Referrals</h3>
                                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                                    Total: {affiliate.referralsCount}
                                </div>
                            </div>
                            <div className="overflow-x-auto scrollbar-hide">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 text-[10px] text-white/30 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4 font-black">User</th>
                                            <th className="px-6 py-4 font-black hidden sm:table-cell">Signed Up</th>
                                            <th className="px-6 py-4 font-black text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {user.referredUsers && user.referredUsers.length > 0 ? user.referredUsers.map((refUser: any) => (
                                            <tr key={refUser.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white/90 group-hover:text-[#25D366] transition-colors">
                                                            {refUser.email.split('@')[0].slice(0, 3)}***@{refUser.email.split('@')[1]}
                                                        </span>
                                                        <span className="text-[10px] text-white/30 sm:hidden">{new Date(refUser.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-white/30 hidden sm:table-cell">
                                                    {new Date(refUser.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-black text-white text-xs">{refUser.business?.plan || 'FREE'}</span>
                                                        <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 rounded-full ${refUser.business?.plan !== 'FREE' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-white/10 text-white/40'}`}>
                                                            {refUser.business?.plan !== 'FREE' ? 'PAID' : 'FREE'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-white/20 italic text-xs uppercase tracking-widest">No referrals yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

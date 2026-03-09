import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Users,
    TrendingUp,
    Calendar,
    Search,
    Filter,
} from "lucide-react";
import { AdminChart } from "@/components/admin/AdminChart";

export default async function AdminSubscriptionsPage() {
    const session = await auth();
    if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
        redirect("/overview");
    }

    const businesses = await prisma.business.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                }
            }
        },
        orderBy: { lastPayment: "desc" }
    });

    // Aggregates
    const planCounts = {
        FREE: businesses.filter((b: { plan: string }) => b.plan === "FREE").length,
        PRO: businesses.filter((b: { plan: string }) => b.plan === "PRO").length,
        ENTERPRISE: businesses.filter((b: { plan: string }) => b.plan === "ENTERPRISE").length,
    };

    const mrr = (planCounts.PRO * 29) + (planCounts.ENTERPRISE * 99);
    const activeSubs = planCounts.PRO + planCounts.ENTERPRISE;

    const planData = [
        { name: "Free", value: planCounts.FREE },
        { name: "Pro", value: planCounts.PRO },
        { name: "Enterprise", value: planCounts.ENTERPRISE },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black font-[Outfit]">Subscription Management</h1>
                    <p className="text-sm text-white/40 mt-1">Revenue tracking and plan distribution</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors">Export Report</button>
                    <button className="bg-[#25D366] text-black px-4 py-2 rounded-xl text-xs font-black hover:bg-[#20bd5c] transition-colors">Configure Plans</button>
                </div>
            </div>

            {/* Revenue Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card border border-white/5 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-[#25D366]/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-[#25D366]" />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[#25D366] font-bold">
                            <ArrowUpRight className="w-3 h-3" />
                            +8.2%
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-black font-[Outfit] tracking-tight">${mrr.toLocaleString()}</div>
                        <div className="text-[10px] text-white/30 uppercase font-black mt-1">Monthly Recurring Revenue (MRR)</div>
                    </div>
                </div>

                <div className="glass-card border border-white/5 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <CreditCard className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[#25D366] font-bold">
                            <ArrowUpRight className="w-3 h-3" />
                            +3 new
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-black font-[Outfit] tracking-tight">{activeSubs}</div>
                        <div className="text-[10px] text-white/30 uppercase font-black mt-1">Active Paid Subscriptions</div>
                    </div>
                </div>

                <div className="glass-card border border-white/5 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold">
                            <ArrowDownRight className="w-3 h-3" />
                            -1.2%
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-black font-[Outfit] tracking-tight">2.4%</div>
                        <div className="text-[10px] text-white/30 uppercase font-black mt-1">Average Churn Rate</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plan Distribution */}
                <div className="glass-card border border-white/5 p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-sm text-white/70 flex items-center gap-2 mb-6">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            Plan Distribution
                        </h3>
                        <div className="space-y-4 mt-8">
                            {planData.map((plan) => {
                                const percentage = businesses.length > 0 ? (plan.value / businesses.length) * 100 : 0;
                                return (
                                    <div key={plan.name} className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-white/50">{plan.name}</span>
                                            <span>{plan.value} users ({percentage.toFixed(0)}%)</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${plan.name === 'Enterprise' ? 'bg-purple-500' : plan.name === 'Pro' ? 'bg-orange-500' : 'bg-white/20'}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-[10px] text-white/30 font-bold uppercase mb-2">Plan Conversion</div>
                        <div className="text-sm font-bold text-[#25D366]">18.5% of users upgrade to PRO</div>
                    </div>
                </div>

                {/* Recent Billing Actions */}
                <div className="lg:col-span-2 glass-card border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-white/70 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            Recent Billing Activity
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Business</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Plan</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Last Payment</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {businesses.filter((b: { plan: string, lastPayment: Date | null }) => b.plan !== 'FREE' || b.lastPayment).slice(0, 8).map((biz: any) => (
                                    <tr key={biz.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-bold text-white/80">{biz.name}</div>
                                            <div className="text-[10px] text-white/20">{biz.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border
                                                ${biz.plan === "PRO" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
                                                {biz.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[11px] text-white/40">
                                            {biz.lastPayment ? new Date(biz.lastPayment).toLocaleDateString() : "Never"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                                                ${biz.subscriptionStatus === "ACTIVE" ? "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                                {biz.subscriptionStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {businesses.filter((b: { plan: string }) => b.plan !== 'FREE').length === 0 && (
                            <div className="py-20 text-center text-white/20 text-xs italic">No active paid subscriptions found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

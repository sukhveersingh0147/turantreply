import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    BarChart3,
    TrendingUp,
    Users,
    MessageSquare,
    Zap,
    PieChart,
    Calendar,
    ArrowUpRight,
} from "lucide-react";
import { AdminChart } from "@/components/admin/AdminChart";

export default async function AdminAnalyticsPage() {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin" && (session?.user as any)?.role !== "support_admin") {
        redirect("/overview");
    }

    // High level stats
    const [userCount, bizCount, leadCount, msgCount] = await Promise.all([
        prisma.user.count(),
        prisma.business.count(),
        prisma.lead.count(),
        prisma.message.count(),
    ]);

    // Mock data for the analytics view
    const acquisitionData = [
        { name: "Week 1", value: 12 },
        { name: "Week 2", value: 24 },
        { name: "Week 3", value: 18 },
        { name: "Week 4", value: bizCount > 30 ? bizCount : 32 },
    ];

    const conversionData = [
        { name: "Direct", value: 45 },
        { name: "Referral", value: 25 },
        { name: "Organic", value: 30 },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black font-[Outfit]">Advanced Analytics</h1>
                <p className="text-sm text-white/40 mt-1">Deep dive into platform growth and user behavior</p>
            </div>

            {/* Growth Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 glass-card border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-sm text-white/70 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#25D366]" />
                            Business Acquisition Trend
                        </h3>
                        <div className="flex items-center gap-2 border border-white/10 bg-white/5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <Calendar className="w-3 h-3" />
                            Last 30 Days
                        </div>
                    </div>
                    <AdminChart data={acquisitionData} type="area" dataKey="value" color="#25D366" />
                </div>

                <div className="glass-card border border-white/5 p-6 space-y-8 flex flex-col justify-center">
                    <div className="space-y-1">
                        <div className="text-[10px] text-white/30 uppercase font-black tracking-widest">Avg. Customer LTV</div>
                        <div className="text-2xl font-black font-[Outfit] text-white/90">$142.50</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] text-white/30 uppercase font-black tracking-widest">CAC / Acquisition</div>
                        <div className="text-2xl font-black font-[Outfit] text-white/90">$18.20</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] text-white/30 uppercase font-black tracking-widest">Payback Period</div>
                        <div className="text-2xl font-black font-[Outfit] text-white/90">1.4 Months</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Metrics */}
                <div className="glass-card border border-white/5 p-6">
                    <h3 className="font-bold text-sm text-white/70 flex items-center gap-2 mb-6">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        Platform Engagement score
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <div className="text-[9px] text-white/30 font-black uppercase">DAU (Daily Active)</div>
                            <div className="text-lg font-black font-[Outfit] text-white/90">24%</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <div className="text-[9px] text-white/30 font-black uppercase">MAU (Monthly Active)</div>
                            <div className="text-lg font-black font-[Outfit] text-white/90">78%</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <div className="text-[9px] text-white/30 font-black uppercase">Retention (D30)</div>
                            <div className="text-lg font-black font-[Outfit] text-white/90">62%</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <div className="text-[9px] text-white/30 font-black uppercase">Stickiness</div>
                            <div className="text-lg font-black font-[Outfit] text-white/90">31%</div>
                        </div>
                    </div>
                </div>

                {/* Conversion Sources */}
                <div className="glass-card border border-white/5 p-6">
                    <h3 className="font-bold text-sm text-white/70 flex items-center gap-2 mb-6">
                        <PieChart className="w-4 h-4 text-purple-400" />
                        Traffic & Conversion Sources
                    </h3>
                    <div className="flex flex-col gap-4">
                        {conversionData.map((source) => (
                            <div key={source.name} className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-white/40">{source.name}</span>
                                    <span className="text-white/70">{source.value}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${source.name === 'Direct' ? 'from-blue-500 to-indigo-500' : source.name === 'Referral' ? 'from-purple-500 to-pink-500' : 'from-[#25D366] to-cyan-500'}`}
                                        style={{ width: `${source.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                        <button className="text-[10px] font-black uppercase tracking-widest text-[#25D366]/60 hover:text-[#25D366] transition-colors flex items-center justify-center gap-2 mx-auto">
                            View Full Traffic Report
                            <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

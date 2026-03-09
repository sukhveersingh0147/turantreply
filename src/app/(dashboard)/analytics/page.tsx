import {
    Users,
    TrendingUp,
    RefreshCcw,
    MessageCircle,
    BarChart3,
    ArrowUp,
    Zap,
} from "lucide-react";
import { getAnalyticsData } from "@/app/actions/analytics";

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Zap className="w-8 h-8 text-white/20" />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-[Outfit]">No Analytics Available</h2>
                    <p className="text-sm text-white/40 mt-1">Complete your business setup to start tracking performance.</p>
                </div>
            </div>
        );
    }

    const { stats, weeklyData, topQueries } = data;
    const maxLeads = Math.max(...weeklyData.map((d) => d.leads), 1);

    const statCards = [
        { label: "Total Leads", value: stats.totalLeads.toLocaleString(), change: "+100%", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { label: "Recovered Leads", value: stats.recoveredLeads.toLocaleString(), change: "+24%", icon: RefreshCcw, color: "text-[#25D366]", bg: "bg-[#25D366]/10", border: "border-[#25D366]/20" },
        { label: "Messages Sent", value: stats.totalMessages.toLocaleString(), change: "+12%", icon: MessageCircle, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        { label: "AI Reply Rate", value: `${stats.aiReplyRate}%`, change: "+5%", icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black font-[Outfit]">Analytics</h1>
                <p className="text-sm text-white/40">Real-time performance insights for your business</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className={`stat-card border ${stat.border}`}>
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-9 h-9 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <div className="flex items-center gap-0.5 text-xs font-semibold text-[#25D366]">
                                <ArrowUp className="w-3 h-3" />
                                {stat.change}
                            </div>
                        </div>
                        <div className="text-2xl font-black font-[Outfit]">{stat.value}</div>
                        <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Weekly Chart + Top Queries */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <div className="lg:col-span-2 glass-card border border-white/5 p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-bold font-[Outfit]">Weekly Lead Activity</h2>
                        <div className="flex items-center gap-3 text-[10px]">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" /><span className="text-white/40">Leads</span></div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#25D366]" /><span className="text-white/40">Recovered</span></div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-400" /><span className="text-white/40">Converted</span></div>
                        </div>
                    </div>

                    <div className="flex items-end gap-3 h-48">
                        {weeklyData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex items-end gap-0.5 h-36">
                                    <div
                                        className="flex-1 bg-blue-500/30 border border-blue-500/20 rounded-t-md transition-all"
                                        style={{ height: `${(d.leads / maxLeads) * 100}%` }}
                                    />
                                    <div
                                        className="flex-1 bg-[#25D366]/30 border border-[#25D366]/20 rounded-t-md transition-all"
                                        style={{ height: `${(d.recovered / maxLeads) * 100}%` }}
                                    />
                                    <div
                                        className="flex-1 bg-purple-500/30 border border-purple-500/20 rounded-t-md transition-all"
                                        style={{ height: `${(d.converted / maxLeads) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-white/30">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Queries */}
                <div className="glass-card border border-white/5 p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <BarChart3 className="w-4 h-4 text-[#25D366]" />
                        <h2 className="font-bold font-[Outfit]">Top Customer Queries</h2>
                    </div>
                    {topQueries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 opacity-20">
                            <BarChart3 className="w-8 h-8 mb-2" />
                            <span className="text-xs">No data yet</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {topQueries.map((q, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-white/70 truncate mr-2">{q.query}</span>
                                        <span className="text-xs font-semibold text-white/50">{q.count}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-full"
                                            style={{ width: `${q.pct}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* AI Performance */}
            <div className="glass-card border border-white/5 p-5">
                <h2 className="font-bold font-[Outfit] mb-4">AI Response Analytics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "AI Replies Sent", value: stats.totalMessages.toLocaleString(), sub: "Lifetime" },
                        { label: "Avg Response Time", value: "0.2s", sub: "Instant AI" },
                        { label: "Sales Conversion", value: `${stats.conversionRate}%`, sub: "Leads → Customers" },
                        { label: "Automation Health", value: "98%", sub: "Service uptime" },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                            <div className="text-xl font-black text-[#25D366] font-[Outfit]">{item.value}</div>
                            <div className="text-xs font-medium text-white/70 mt-0.5">{item.label}</div>
                            <div className="text-[10px] text-white/30 mt-0.5">{item.sub}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { 
    TrendingUp, 
    Users, 
    MessageSquare, 
    DollarSign, 
    ArrowUpRight, 
    Calendar,
    Target,
    Activity,
    Loader2,
    RefreshCcw,
    User
} from "lucide-react";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { getAnalyticsData } from "@/app/actions/analytics";
import { toast } from "sonner";

export default function AnalyticsClient() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<any>(null);

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        
        try {
            const result = await getAnalyticsData();
            if (result) setData(result);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
            toast.error("Failed to refresh analytics");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Auto-refresh every 60 seconds
        const interval = setInterval(() => fetchData(true), 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-[#25D366]" />
            </div>
        );
    }

    const { stats, weeklyData, topQueries, recentActivity, topItems } = data || {};

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black font-[Outfit]">Sales & ROI Analytics</h1>
                    <p className="text-white/40 text-sm">Real-time performance tracking of your AI Sales Assistant.</p>
                </div>
                <button 
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-bold disabled:opacity-50"
                >
                    <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Leads", val: stats?.totalLeads || 0, icon: Users, color: "text-blue-400" },
                    { label: "AI Conversations", val: stats?.totalMessages || 0, icon: MessageSquare, color: "text-purple-400" },
                    { label: "AI Response Rate", val: `${stats?.aiReplyRate || 0}%`, icon: Activity, color: "text-green-400" },
                    { label: "Conversion Rate", val: `${stats?.conversionRate || 0}%`, icon: Target, color: "text-orange-400" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card border border-white/5 p-6 card-hover">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-white/30 text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
                        <p className="text-2xl font-black font-[Outfit] mt-1">{stat.val}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <div className="glass-card border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-white/80">Lead Growth</h3>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">Daily lead acquisition (Last 7 Days)</p>
                        </div>
                        <Calendar className="w-4 h-4 text-white/20" />
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyData}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#25D366" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#25D366" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis 
                                    dataKey="day" 
                                    stroke="#ffffff20" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="#ffffff20" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip 
                                    contentStyle={{ background: '#0a0f14', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    itemStyle={{ color: '#25d366' }}
                                />
                                <Area type="monotone" dataKey="leads" stroke="#25D366" fillOpacity={1} fill="url(#colorLeads)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Performing Specialized Items */}
                <div className="glass-card border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-white/80">Top Performing Items</h3>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">Most popular Products & Services</p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-white/20" />
                    </div>
                    <div className="space-y-4">
                        {topItems && topItems.length > 0 ? topItems.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] font-bold text-sm">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white/80">{item.name}</h4>
                                        <span className="text-[10px] text-[#25D366] font-bold uppercase tracking-widest bg-[#25D366]/5 px-2 py-0.5 rounded-full">{item.type}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-white/80">₹{item.price}</p>
                                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Popular Demand</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-white/20 text-sm italic">
                                No sales data yet. AI is still learning!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Customer Activity */}
                <div className="lg:col-span-2 glass-card border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-white/80">Recent Activity</h3>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">Live feed of WhatsApp leads</p>
                        </div>
                        <Activity className="w-4 h-4 text-white/20" />
                    </div>
                    <div className="space-y-4">
                        {recentActivity && recentActivity.length > 0 ? recentActivity.map((act: any, i: number) => (
                            <div key={i} className="flex items-start justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.07] transition-all cursor-pointer">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                        <User className="w-4 h-4 text-white/40" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-white/90">{act.name || "Unknown Customer"}</h4>
                                            <span className="text-[9px] text-[#25D366] font-black tracking-tight">{act.phone}</span>
                                        </div>
                                        <p className="text-xs text-white/50 mt-1 italic">"{act.query?.substring(0, 60)}..."</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] bg-white/5 text-white/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                                        {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div className="mt-1">
                                        <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${
                                            act.status === 'CONVERTED' ? 'bg-[#25D366]/20 text-[#25D366]' :
                                            act.status === 'HOT' ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10 text-white/40'
                                        }`}>
                                            {act.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-white/20 text-sm italic">
                                Waiting for incoming requests...
                            </div>
                        )}
                    </div>
                </div>

                {/* Popular Queries */}
                <div className="glass-card border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-white/80">Hot Intent</h3>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">Most common customer queries</p>
                        </div>
                        <Target className="w-4 h-4 text-white/20" />
                    </div>
                    <div className="space-y-6">
                        {topQueries && topQueries.length > 0 ? topQueries.map((q: any, i: number) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/70 font-bold truncate max-w-[70%]">{q.query}</span>
                                    <span className="text-[#25D366] font-black">{q.pct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#25D366]" style={{ width: `${q.pct}%` }} />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-white/20 text-sm italic">
                                No queries tracked yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

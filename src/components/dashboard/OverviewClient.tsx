"use client";
import { fetcher, apiFetch } from "@/lib/api";

import useSWR from "swr";
import { 
    Users, 
    MessageCircle, 
    Calendar, 
    Zap, 
    ShieldAlert, 
    Clock, 
    Tag, 
    ArrowRight 
} from "lucide-react";
import { PageSkeleton } from "@/components/ui/skeletons";
import InsightPanel from "@/components/dashboard/InsightPanel";
import AIActivityLog from "@/components/dashboard/AIActivityLog";
import QuickActionsPanel from "@/components/overview/QuickActionsPanel";
import VerticalBadge from "@/components/overview/VerticalBadge";
import SeedingIndicator from "@/components/overview/SeedingIndicator";


export default function OverviewClient() {
    const { data, error, isLoading } = useSWR("/dashboard/overview", url => apiFetch(url).then(res => res.json()), {
        refreshInterval: 30000, // Refresh every 30 seconds
    });

    if (error || data?.error) return (
        <div className="p-8 text-center glass-card border-red-500/20 bg-red-500/5 rounded-3xl">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-500 mb-2">Dashboard Error</h2>
            <p className="text-white/40 mb-6">{data?.error || "Failed to load dashboard data. Please try again."}</p>
            <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
            >
                Refresh Page
            </button>
        </div>
    );
    if (isLoading || !data) return <PageSkeleton rows={5} />;

    const dailyLimit = data.plan === "PRO" ? 999999 : (data.plan === "GROWTH" ? 100 : 30);
    const limitReached = data.trialConversationsToday >= dailyLimit && data.plan !== "PRO";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {limitReached && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-red-500">Daily AI Limit Reached</h3>
                            <p className="text-xs text-red-500/60 font-medium">Your {data.plan} plan limit of {dailyLimit} daily replies is exhausted.</p>
                        </div>
                    </div>
                    <a href="/settings?tab=billing" className="px-6 py-2 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all">
                        Upgrade Now
                    </a>
                </div>
            )}

            {/* Page header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black font-[Outfit]">{data.businessName} Dashboard</h1>
                        <VerticalBadge businessType={data.businessType} />
                    </div>
                    <p className="text-sm text-white/40 mt-0.5">
                        Overview & Real-time AI Performance · {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl border bg-white/5 border-white/10">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Current Plan:</span>
                            <span className="text-xs font-bold text-[#25D366]">{data.plan}</span>
                        </div>
                        <div className="w-32 mt-2">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter text-white/40 mb-1">
                                <span>Daily Usage</span>
                                <span className={limitReached ? "text-red-400" : "text-[#25D366]"}>
                                    {data.plan === "PRO" ? "∞ (Unlimited)" : `${data.trialConversationsToday}/${dailyLimit}`}
                                </span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${limitReached ? "bg-red-500" : "bg-[#25D366]"}`}
                                    style={{ width: `${data.plan === "PRO" ? 100 : Math.min((data.trialConversationsToday / dailyLimit) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* High Level Insights */}
            <InsightPanel 
                businessType={data.businessType}
                stats={{
                    hotLeads: data.stats?.hotLeads ?? 0,
                    pendingReplies: data.stats?.pendingReplies ?? 0,
                    followUpsSent: data.stats?.appointmentsBooked ?? 0,
                    conversions: data.stats?.conversions ?? 0,
                    revenue: data.stats?.revenue ?? 0
                }} 
            />

            {/* Quick Actions Section */}
            <QuickActionsPanel businessType={data.businessType} />

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Leads */}
                <div className="lg:col-span-2 glass-card border border-white/5 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold font-[Outfit]">Recent Lead Activity</h2>
                        <a href="/leads" className="text-xs text-[#25D366] hover:underline">
                            View all
                        </a>
                    </div>
                    {data.recentLeads.length > 0 ? (
                        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                            <table className="w-full text-sm min-w-[300px]">
                                <thead>
                                    <tr className="border-b border-white/5 text-left">
                                        <th className="py-2 text-xs text-white/40 font-medium pb-3">Lead</th>
                                        <th className="py-2 text-xs text-white/40 font-medium pb-3">Activity</th>
                                        <th className="text-center py-2 text-xs text-white/40 font-medium pb-3">Score</th>
                                        <th className="text-center py-2 text-xs text-white/40 font-medium pb-3">Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {data.recentLeads.map((lead: any, i: number) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                                                        {lead.name.split(" ").map((n: string) => n[0]).join("")}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-white/80">{lead.name}</div>
                                                        <div className="text-[10px] text-white/30">{lead.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex flex-col gap-1 max-w-[300px]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-[#25D366] uppercase tracking-tighter">Query:</span>
                                                        <p className="text-[11px] text-white/70 line-clamp-1 italic">"{lead.query}"</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center">
                                                <span className={`text-sm font-bold ${lead.score >= 80 ? "text-[#25D366]" : lead.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                                                    {lead.score}
                                                </span>
                                            </td>
                                            <td className="py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${lead.status === 'NEW' ? 'text-blue-400 border-blue-500/20' : 'text-[#25D366] border-[#25D366]/20'}`}>
                                                        {lead.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-right">
                                                <a href={`/inbox?phone=${lead.phone}`} className="p-2 rounded-lg bg-white/5 text-white/20 hover:text-[#25D366] opacity-0 group-hover:opacity-100 transition-all">
                                                    <MessageCircle className="w-4 h-4" />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-white/30 text-sm italic">
                            No recent activity found.
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3">
                    <AIActivityLog />
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="glass-card border border-white/5 p-5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-[#25D366]" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold font-[Outfit]">Upcoming Events</h2>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Next 5 scheduled</p>
                        </div>
                    </div>
                    <a href="/appointments" className="text-xs text-[#25D366] hover:underline font-bold">View all</a>
                </div>

                {data.upcomingAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.upcomingAppointments.map((booking: any) => (
                            <div key={booking.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-3 hover:bg-white/[0.05] transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[#25D366]">
                                            {booking.type === 'RENTAL' ? <Tag className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white/90">{booking.item}</div>
                                            <div className="text-[10px] text-white/30 truncate max-w-[120px]">For: {booking.customer}</div>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-[#25D366]/15 text-[#25D366] uppercase tracking-tighter">
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <span className="text-[10px] font-bold text-white/70">{new Date(booking.start).toLocaleDateString()} at {new Date(booking.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <ArrowRight className="w-3 h-3 text-white/10" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center glass-card border-dashed border-white/10 bg-white/5 rounded-3xl">
                        <Calendar className="w-8 h-8 text-white/10 mx-auto mb-3" />
                        <p className="text-sm text-white/30 italic font-medium">No upcoming bookings found.</p>
                    </div>
                )}
            </div>
            <SeedingIndicator />
        </div>
    );
}

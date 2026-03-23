import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SubscriptionService } from "@/services/subscription.service";
import {
    Users,
    MessageCircle,
    TrendingUp,
    RefreshCcw,
    Zap,
    ArrowUp,
    ArrowDown,
    Bot,
    Clock,
    Package,
    ShoppingCart,
    Wallet,
    Calendar,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Bell,
    Sparkles,
    Megaphone,
    Tag,
    ShieldAlert,
} from "lucide-react";
import InsightPanel from "@/components/dashboard/InsightPanel";
import AIActivityLog from "@/components/dashboard/AIActivityLog";
import { getAIInsights } from "@/app/actions/ai-engine";

async function getDashboardData() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const { getAccessibleBusiness } = await import("@/app/actions/settings");
    
    // Step 1: Get business and check subscription in parallel
    const [business] = await Promise.all([
        getAccessibleBusiness(),
        SubscriptionService.checkAndExpireSubscription(session.user.id)
    ]);

    if (!business) return null;

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    // Step 2: Run all independent data fetches in parallel
    const [
        businessWithCounts,
        hotLeads,
        appointmentsBooked,
        leadsToday,
        pendingReplies,
        conversions,
        orders,
        recentSuggestions,
        recentLeadsDb,
        upcomingAppointments,
        businessWithDailyUsed
    ] = await Promise.all([
        prisma.business.findUnique({
            where: { id: business.id },
            include: { _count: { select: { leads: true, messages: true } } }
        }),
        // @ts-ignore
        prisma.lead.count({ where: { businessId: business.id, leadType: "Hot lead" } }),
        // @ts-ignore
        prisma.lead.count({ where: { businessId: business.id, leadType: "Appointment booked" } }),
        prisma.lead.count({ where: { businessId: business.id, createdAt: { gte: startOfToday } } }),
        prisma.lead.count({
            where: {
                businessId: business.id,
                status: { not: "CONVERTED" },
                messages: { some: { senderType: "CUSTOMER" } }
            }
        }),
        prisma.lead.count({ where: { businessId: business.id, status: "CONVERTED" } }),
        prisma.order.findMany({
            where: { businessId: business.id, status: { not: "CANCELLED" } },
            select: { totalAmount: true }
        }),
        // @ts-ignore
        prisma.suggestion.findMany({
            where: { businessId: business.id, status: "PENDING" },
            take: 5,
            orderBy: { createdAt: "desc" }
        }),
        prisma.lead.findMany({
            where: { businessId: business.id },
            orderBy: { updatedAt: "desc" },
            take: 5,
        }),
        (prisma as any).appointment.findMany({
            where: { businessId: business.id },
            include: { item: true, lead: true },
            orderBy: { startTime: "asc" },
            take: 5,
        }),
        prisma.business.findUnique({
            where: { id: business.id },
            select: { trialConversationsToday: true }
        })
    ]);

    const trialConversationsToday = businessWithDailyUsed?.trialConversationsToday || 0;

    const totalLeads = (businessWithCounts as any)?._count?.leads || 0;
    const totalMessages = (businessWithCounts as any)?._count?.messages || 0;
    
    // ROI Calculations
    const hoursSaved = Math.round((totalMessages * 2) / 60);

    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
        totalLeads,
        hotLeads,
        appointmentsBooked,
        leadsToday,
        pendingReplies,
        conversions,
        revenue,
        suggestions: recentSuggestions,
        totalMessages,
        hoursSaved,
        estimatedValue: revenue || (totalLeads * 500),
        // @ts-ignore
        businessType: business.businessType || "OTHER",
        businessName: business.name,
        plan: business.plan,
        subscriptionStatus: business.subscriptionStatus,
        subscriptionExpiresAt: business.subscriptionExpiresAt,
        aiRepliesUsed: business.aiRepliesUsed,
        monthlyLimit: business.monthlyLimit,
        recentLeads: recentLeadsDb.map(l => ({
            name: l.name || "Anonymous",
            phone: l.phone,
            query: l.lastQuery || "No recent query",
            status: l.status,
            score: l.score,
            // @ts-ignore
            type: l.leadType || "NEW",
            time: "Recently",
        })),
        upcomingAppointments: upcomingAppointments.map((a: any) => ({
            id: a.id,
            customer: a.lead?.name || "Anonymous",
            item: a.item?.name || "Special Service",
            start: a.startTime,
            end: a.endTime,
            status: a.status,
            type: a.item?.type || "AD-HOC"
        })),
        trialConversationsToday
    };
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        NEW: "bg-blue-500/15 text-blue-400 border-blue-500/20",
        RECOVERING: "bg-orange-500/15 text-orange-400 border-orange-500/20",
        ENGAGED: "bg-purple-500/15 text-purple-400 border-purple-500/20",
        CONVERTED: "bg-[#25D366]/15 text-[#25D366] border-[#25D366]/20",
    };
    return (
        <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[status] ?? "bg-white/10 text-white/50"}`}
        >
            {status}
        </span>
    );
}

function ScoreBadge({ score }: { score: number }) {
    const color =
        score >= 80
            ? "text-[#25D366]"
            : score >= 60
                ? "text-yellow-400"
                : "text-red-400";
    return <span className={`text-sm font-bold ${color}`}>{score}</span>;
}

// Removed DailyBrief and SuggestionsPanel in favor of InsightPanel and AIActivityLog

export default async function OverviewPage() {
    const data = (await getDashboardData()) as any;

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Zap className="w-8 h-8 text-white/20" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold font-[Outfit]">No Business Found</h2>
                    <p className="text-sm text-white/40 mt-1">Please complete your business profile in settings to start using Turant Reply AI.</p>
                </div>
                <a href="/settings" className="px-6 py-2 bg-[#25D366] text-black font-bold rounded-xl hover:bg-[#128C7E] transition-colors">
                    Go to Settings
                </a>
            </div>
        );
    }
    const { getPlanFeatures } = await import("@/lib/plans");
    const features = getPlanFeatures(data.plan);

    const quickActions = [
        { label: "Flow Builder", href: "/automation", icon: Zap, color: "text-yellow-400", enabled: features.canUseCustomFlows },
        { label: "Marketing Hub", href: "/campaigns", icon: Megaphone, color: "text-[#25D366]", enabled: features.canUseCampaigns },
        { label: "Send Broadcast", href: "/broadcast", icon: MessageCircle, color: "text-purple-400", enabled: features.canUseBroadcast },
        { label: "Unified Catalog", href: "/catalog", icon: Package, color: "text-blue-400", enabled: true },
    ];

    const dailyLimit = features.dailyLimit || 30;
    const limitReached = data.trialConversationsToday >= dailyLimit;

    return (
        <div className="space-y-8">
            {limitReached && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-red-500">Daily AI Limit Reached</h3>
                            <p className="text-xs text-red-500/60 font-medium">Your {data.plan} plan limit of {dailyLimit} daily replies is exhausted. Upgrade for more capacity.</p>
                        </div>
                    </div>
                    <a href="/settings?tab=billing" className="px-6 py-2 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                        Upgrade Now
                    </a>
                </div>
            )}

            {/* Page header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-2xl font-black font-[Outfit]">{data.businessName} Dashboard</h1>
                    <p className="text-sm text-white/40 mt-0.5">
                        {data.businessType} Mode · {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                {/* ... existing plan info ... */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl border bg-white/5 border-white/10">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Current Plan:</span>
                            <span className="text-xs font-bold text-[#25D366]">{data.plan}</span>
                        </div>
                        <div className="w-32 mt-2">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter text-white/40 mb-1">
                                <span>Daily Usage</span>
                                <span className={data.trialConversationsToday >= dailyLimit && data.plan !== "PRO" ? "text-red-400" : "text-[#25D366]"}>
                                    {data.plan === "PRO" ? "∞ (Unlimited)" : `${data.trialConversationsToday}/${dailyLimit}`}
                                </span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${data.trialConversationsToday >= dailyLimit && data.plan !== "PRO" ? "bg-red-500" : "bg-[#25D366]"}`}
                                    style={{ width: `${data.plan === "PRO" ? 0 : Math.min((data.trialConversationsToday / dailyLimit) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* High Level Insights */}
            <InsightPanel stats={{
                hotLeads: data.hotLeads,
                pendingReplies: data.pendingReplies,
                followUpsSent: data.appointmentsBooked,
                conversions: data.conversions,
                revenue: data.revenue
            }} />


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
                                    <tr className="border-b border-white/5">
                                        <th className="text-left py-2 text-xs text-white/40 font-medium pb-3">
                                            Lead
                                        </th>
                                        <th className="text-left py-2 text-xs text-white/40 font-medium pb-3">
                                            Last Interaction (Query & Response)
                                        </th>
                                        <th className="text-center py-2 text-xs text-white/40 font-medium pb-3">
                                            Score
                                        </th>
                                        <th className="text-center py-2 text-xs text-white/40 font-medium pb-3">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {data.recentLeads.map((lead: any, i: number) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40 group-hover:border-[#25D366]/40 transition-colors">
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
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">AI:</span>
                                                        <p className="text-[10px] text-white/40 line-clamp-1">Item successfully matched and details sent.</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center">
                                                <ScoreBadge score={lead.score} />
                                            </td>
                                            <td className="py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <StatusBadge status={lead.status} />
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{lead.type}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-right">
                                                <a href={`/inbox?phone=${lead.phone}`} className="p-2 rounded-lg bg-white/5 text-white/20 hover:text-[#25D366] hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                                                    <MessageCircle className="w-4 h-4" />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-white/30 text-sm">
                            No recent {data.businessType.toLowerCase()} activity found.
                        </div>
                    )}
                </div>

                {/* AI Activity Log / Suggestions */}
                <div className="lg:col-span-3">
                    <AIActivityLog />
                </div>
            </div>

            {/* Upcoming Bookings / Rentals */}
            <div className="glass-card border border-white/5 p-5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-[#25D366]" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold font-[Outfit]">Upcoming Bookings & Rentals</h2>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Next 5 scheduled events</p>
                        </div>
                    </div>
                    <a href="/calendar" className="text-xs text-[#25D366] hover:underline font-bold">View full schedule</a>
                </div>

                {data.upcomingAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.upcomingAppointments.map((booking: any) => (
                            <div key={booking.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-3 group hover:bg-white/[0.05] transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                                            {booking.type === 'RENTAL' ? <Tag className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white/90">{booking.item}</div>
                                            <div className="text-[10px] text-white/30 truncate max-w-[120px]">For: {booking.customer}</div>
                                        </div>
                                    </div>
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${booking.status === 'SCHEDULED' ? 'bg-[#25D366]/15 text-[#25D366]' : 'bg-white/10 text-white/40'}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-white/20 uppercase font-black tracking-widest">Starts</span>
                                        <span className="text-[10px] font-bold text-white/70">{new Date(booking.start).toLocaleDateString()} {new Date(booking.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <ArrowRight className="w-3 h-3 text-white/10" />
                                    <div className="flex flex-col text-right">
                                        <span className="text-[9px] text-white/20 uppercase font-black tracking-widest">Ends</span>
                                        <span className="text-[10px] font-bold text-white/70">{booking.end ? `${new Date(booking.end).toLocaleDateString()} ${new Date(booking.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '—'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center glass-card border-dashed border-white/10 bg-white/5 rounded-3xl">
                        <Calendar className="w-8 h-8 text-white/10 mx-auto mb-3" />
                        <p className="text-sm text-white/30 italic font-medium">No upcoming bookings found. AI is ready to schedule them for you!</p>
                    </div>
                )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, i) => (
                    <a
                        key={i}
                        href={action.enabled ? action.href : "/settings"}
                        className={`glass-card border border-white/5 p-4 sm:p-6 flex flex-col items-center gap-3 text-center transition-all group ${!action.enabled ? 'opacity-50 grayscale cursor-pointer hover:grayscale-0 hover:bg-white/5' : 'hover:scale-[1.02] hover:bg-white/5'}`}
                    >
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors relative`}>
                            <action.icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
                            {!action.enabled && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border-2 border-[#060a0f]">
                                    <Sparkles className="w-2 h-2 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs sm:text-sm font-bold text-white/60 group-hover:text-white transition-colors">
                                {action.label}
                            </span>
                            {!action.enabled && (
                                <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter mt-0.5">Upgrade to Unlock</span>
                            )}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

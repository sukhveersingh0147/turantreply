import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
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
} from "lucide-react";

async function getDashboardData() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
        include: {
            _count: {
                select: {
                    leads: true,
                    messages: true,
                }
            }
        }
    });

    if (!business) {
        return null;
    }

    const recoveredLeads = await prisma.lead.count({
        where: { businessId: business.id, status: "Recovered" }
    });

    const recentLeadsDb = await prisma.lead.findMany({
        where: { businessId: business.id },
        orderBy: { updatedAt: "desc" },
        take: 5,
    });

    const totalLeads = business._count.leads;
    const totalMessages = business._count.messages;
    const conversionRate = totalLeads > 0 ? (recoveredLeads / totalLeads) * 100 : 0;

    return {
        totalLeads,
        recoveredLeads,
        totalMessages,
        conversionRate,
        recentLeads: recentLeadsDb.map(l => ({
            name: l.name || "Anonymous",
            phone: l.phone,
            query: l.lastQuery || "No recent query",
            status: l.status,
            score: l.score,
            time: "Just now",
        }))
    };
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        NEW: "bg-blue-500/15 text-blue-400 border-blue-500/20",
        Recovered: "bg-[#25D366]/15 text-[#25D366] border-[#25D366]/20",
        Converted: "bg-purple-500/15 text-purple-400 border-purple-500/20",
        "Follow-up": "bg-orange-500/15 text-orange-400 border-orange-500/20",
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

export default async function OverviewPage() {
    const data = await getDashboardData();

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Zap className="w-8 h-8 text-white/20" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold font-[Outfit]">No Business Found</h2>
                    <p className="text-sm text-white/40 mt-1">Please complete your business profile in settings to start using ReplyFlow AI.</p>
                </div>
                <a href="/settings" className="px-6 py-2 bg-[#25D366] text-black font-bold rounded-xl hover:bg-[#128C7E] transition-colors">
                    Go to Settings
                </a>
            </div>
        );
    }

    const stats = [
        {
            label: "Total Leads",
            value: data.totalLeads.toLocaleString(),
            change: "+0%",
            up: true,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
        },
        {
            label: "Recovered Leads",
            value: data.recoveredLeads.toLocaleString(),
            change: "+0%",
            up: true,
            icon: RefreshCcw,
            color: "text-[#25D366]",
            bg: "bg-[#25D366]/10",
            border: "border-[#25D366]/20",
        },
        {
            label: "Messages Sent",
            value: data.totalMessages.toLocaleString(),
            change: "+0%",
            up: true,
            icon: MessageCircle,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
        },
        {
            label: "Conversion Rate",
            value: `${data.conversionRate.toFixed(1)}%`,
            change: "0%",
            up: true,
            icon: TrendingUp,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black font-[Outfit]">Dashboard Overview</h1>
                    <p className="text-sm text-white/40 mt-0.5">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · AI is actively monitoring WhatsApp
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 px-4 py-2 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                    <span className="text-sm font-semibold text-[#25D366]">
                        AI Engine Live
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div
                        key={stat.label}
                        className={`stat-card border ${stat.border}`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-9 h-9 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <div
                                className={`flex items-center gap-0.5 text-xs font-semibold ${stat.up ? "text-[#25D366]" : "text-red-400"
                                    }`}
                            >
                                {stat.up ? (
                                    <ArrowUp className="w-3 h-3" />
                                ) : (
                                    <ArrowDown className="w-3 h-3" />
                                )}
                                {stat.change}
                            </div>
                        </div>
                        <div className="text-2xl font-black font-[Outfit] mb-0.5">
                            {stat.value}
                        </div>
                        <div className="text-xs text-white/40">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Leads */}
                <div className="lg:col-span-2 glass-card border border-white/5 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold font-[Outfit]">Recent Leads</h2>
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
                                        <th className="text-left py-2 text-xs text-white/40 font-medium pb-3 hidden sm:table-cell">
                                            Query
                                        </th>
                                        <th className="text-center py-2 text-xs text-white/40 font-medium pb-3">
                                            Score
                                        </th>
                                        <th className="text-center py-2 text-xs text-white/40 font-medium pb-3">
                                            Status
                                        </th>
                                        <th className="text-right py-2 text-xs text-white/40 font-medium pb-3 hidden sm:table-cell">
                                            Time
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {data.recentLeads.map((lead, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#25D366]/30 to-[#128C7E]/20 flex items-center justify-center text-[10px] font-bold text-[#25D366]">
                                                        {lead.name.split(" ").map((n) => n[0]).join("")}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">{lead.name}</div>
                                                        <div className="text-[10px] text-white/30">{lead.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-white/50 text-xs hidden sm:table-cell max-w-[150px] truncate">
                                                {lead.query}
                                            </td>
                                            <td className="py-3 text-center">
                                                <ScoreBadge score={lead.score} />
                                            </td>
                                            <td className="py-3 text-center">
                                                <StatusBadge status={lead.status} />
                                            </td>
                                            <td className="py-3 text-right text-xs text-white/30 hidden sm:table-cell">
                                                {lead.time}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-white/30 text-sm">
                            No leads found yet. Connect your WhatsApp to start recovering leads!
                        </div>
                    )}
                </div>

                {/* Activity Feed */}
                <div className="glass-card border border-white/5 p-4 sm:p-5">
                    <h2 className="text-base font-bold font-[Outfit] mb-4">Live Activity</h2>
                    <div className="space-y-4">
                        {[
                            {
                                icon: Zap,
                                color: "text-yellow-400",
                                bg: "bg-yellow-500/10",
                                text: "System standby. Watching for messages...",
                                time: "Now",
                            }
                        ].map((activity, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className={`w-7 h-7 rounded-lg ${activity.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <activity.icon className={`w-3.5 h-3.5 ${activity.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white/70 leading-relaxed">
                                        {activity.text}
                                    </p>
                                    <p className="text-[10px] text-white/30 mt-0.5">
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Automation Rules", href: "/automation", icon: Zap, color: "text-yellow-400" },
                    { label: "Send Broadcast", href: "/broadcast", icon: MessageCircle, color: "text-purple-400" },
                    { label: "Analytics", href: "/analytics", icon: TrendingUp, color: "text-blue-400" },
                    { label: "Settings", href: "/settings", icon: Users, color: "text-[#25D366]" },
                ].map((action, i) => (
                    <a
                        key={i}
                        href={action.href}
                        className="glass-card border border-white/5 p-4 flex flex-col items-center gap-2 text-center card-hover group"
                    >
                        <action.icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">
                            {action.label}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
}

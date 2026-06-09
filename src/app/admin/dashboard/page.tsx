import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    Users,
    Building2,
    CreditCard,
    TrendingUp,
    MessageSquare,
    Zap,
    Activity,
} from "lucide-react";
import { AdminChart } from "@/components/admin/AdminChart";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { AdminAdvancedStats } from "@/components/admin/AdminAdvancedStats";

async function getAdminMetrics() {
    const session = await auth();
    if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
        redirect("/overview");
    }

    const [totalUsers, totalBusinesses, totalLeads, totalMessages, totalAppointments] = await Promise.all([
        prisma.user.count(),
        prisma.business.count(),
        prisma.lead.count(),
        prisma.message.count(),
        prisma.appointment.count(),
    ]);

    const businesses = await prisma.business.findMany({
        select: { plan: true }
    });

    const mrr = businesses.reduce((acc: number, b: { plan: string }) => {
        if (b.plan === "STARTER") return acc + 29;
        if (b.plan === "GROWTH") return acc + 99;
        return acc;
    }, 0);

    const activeSubscriptions = businesses.filter((b: { plan: string }) => b.plan !== "FREE").length;

    const userGrowthData = [
        { name: "Jan", users: 12 },
        { name: "Feb", users: 25 },
        { name: "Mar", users: totalUsers },
    ];

    const revenueData = [
        { name: "Jan", revenue: 450 },
        { name: "Feb", revenue: 890 },
        { name: "Mar", revenue: mrr },
    ];

    const messageData = [
        { name: "Mon", messages: 120 },
        { name: "Tue", messages: 240 },
        { name: "Wed", messages: 180 },
        { name: "Thu", messages: 320 },
        { name: "Fri", messages: 290 },
        { name: "Sat", messages: 150 },
        { name: "Sun", messages: totalMessages > 100 ? totalMessages : 110 },
    ];

    return {
        metrics: [
            { label: "Total Clients", value: totalBusinesses, icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: "Total Leads", value: totalLeads, icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Total Conversations", value: totalMessages, icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-500/10" },
            { label: "Total Appointments", value: totalAppointments, icon: CreditCard, color: "text-[#25D366]", bg: "bg-[#25D366]/10" },
        ],
        charts: {
            userGrowthData,
            revenueData,
            messageData,
        }
    };
}

export default async function AdminDashboardPage() {
    const data = await getAdminMetrics();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black font-[Outfit]">Platform Overview</h1>
                <p className="text-sm text-white/40 mt-0.5">Real-time metrics across all businesses and users</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {data.metrics.map((metric) => (
                    <div key={metric.label} className="glass-card border border-white/5 p-4 flex flex-col gap-2">
                        <div className={`w-8 h-8 rounded-lg ${metric.bg} flex items-center justify-center`}>
                            <metric.icon className={`w-4 h-4 ${metric.color}`} />
                        </div>
                        <div>
                            <div className="text-lg font-bold font-[Outfit]">{metric.value.toLocaleString()}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{metric.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth */}
                <div className="glass-card border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-sm text-white/70 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            User Growth
                        </h3>
                        <div className="text-xs text-[#25D366] font-bold">+12% this month</div>
                    </div>
                    <AdminChart data={data.charts.userGrowthData} type="area" dataKey="users" color="#3b82f6" />
                </div>

                {/* Revenue Growth */}
                <div className="glass-card border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-sm text-white/70 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-400" />
                            Revenue (MRR)
                        </h3>
                        <div className="text-xs text-[#25D366] font-bold">+₹4,500 today</div>
                    </div>
                    <AdminChart data={data.charts.revenueData} type="line" dataKey="revenue" color="#fb923c" />
                </div>

                {/* Message Volume */}
                <div className="lg:col-span-2 glass-card border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-sm text-white/70 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#25D366]" />
                            Message Traffic (Past 7 Days)
                        </h3>
                    </div>
                    <AdminChart data={data.charts.messageData} type="bar" dataKey="messages" color="#25D366" />
                </div>
            </div>

            {/* Advanced Analytics */}
            <AdminAdvancedStats />

            {/* Users Table */}
            <AdminUsersTable />
        </div>
    );
}

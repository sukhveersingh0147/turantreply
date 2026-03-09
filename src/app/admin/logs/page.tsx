import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    Clock,
    Shield,
    User,
    Zap,
    AlertCircle,
    Mail,
    Search,
} from "lucide-react";

export default async function AdminLogsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const session = await auth();
    if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
        redirect("/overview");
    }

    const query = typeof params.q === 'string' ? params.q : "";

    const logs = await prisma.adminLog.findMany({
        where: {
            OR: [
                { action: { contains: query, mode: 'insensitive' } },
                { details: { contains: query, mode: 'insensitive' } },
                { admin: { name: { contains: query, mode: 'insensitive' } } },
            ]
        },
        include: {
            admin: {
                select: {
                    name: true,
                    email: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 50
    });

    const getActionColor = (action: string) => {
        if (action.includes("SUSPEND") || action.includes("DELETE")) return "text-red-400 bg-red-500/10 border-red-500/20";
        if (action.includes("ACTIVATE") || action.includes("PLAN")) return "text-[#25D366] bg-[#25D366]/10 border-[#25D366]/20";
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    };

    const getActionIcon = (action: string) => {
        if (action.includes("USER")) return User;
        if (action.includes("PLAN")) return Zap;
        if (action.includes("SYSTEM")) return AlertCircle;
        return Shield;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black font-[Outfit]">Audit Logs</h1>
                <p className="text-sm text-white/40 mt-1">Full transparency report of all administrative actions</p>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <form className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 flex-1 max-w-md">
                    <Search className="w-4 h-4 text-white/30" />
                    <input
                        name="q"
                        defaultValue={query}
                        placeholder="Search logs by action, admin, or details..."
                        className="bg-transparent text-sm text-white/70 placeholder:text-white/30 outline-none flex-1"
                    />
                </form>
            </div>

            {/* Logs List */}
            <div className="glass-card border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-bold font-[Outfit] text-white/40 uppercase tracking-widest">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-bold font-[Outfit] text-white/40 uppercase tracking-widest">Admin</th>
                                <th className="px-6 py-4 text-xs font-bold font-[Outfit] text-white/40 uppercase tracking-widest">Action</th>
                                <th className="px-6 py-4 text-xs font-bold font-[Outfit] text-white/40 uppercase tracking-widest">Target ID</th>
                                <th className="px-6 py-4 text-xs font-bold font-[Outfit] text-white/40 uppercase tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {logs.map((log: any) => {
                                const Icon = getActionIcon(log.action);
                                return (
                                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-white/40 text-[11px]">
                                                <Clock className="w-3 h-3 text-white/20" />
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-400 border border-blue-500/20">
                                                    {log.admin.name?.[0] || log.admin.email[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white/80 text-xs">{log.admin.name}</div>
                                                    <div className="text-[10px] text-white/20">{log.admin.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black border uppercase tracking-wider ${getActionColor(log.action)}`}>
                                                <Icon className="w-2.5 h-2.5" />
                                                {log.action.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-[10px] text-white/30">
                                            {log.targetId || "SYSTEM"}
                                        </td>
                                        <td className="px-6 py-4 text-white/60 text-xs italic">
                                            {log.details || "No additional details"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {logs.length === 0 && (
                    <div className="py-20 text-center text-white/20 text-sm">
                        No activity logs found.
                    </div>
                )}
            </div>
        </div>
    );
}

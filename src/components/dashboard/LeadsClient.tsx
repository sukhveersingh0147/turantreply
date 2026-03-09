"use client";

import { useState } from "react";
import { Search, Filter, Phone, MessageCircle, Star, RefreshCcw, ShieldAlert, Bot } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
    NEW: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    Recovered: "bg-[#25D366]/15 text-[#25D366] border-[#25D366]/20",
    Converted: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    "Follow-up": "bg-orange-500/15 text-orange-400 border-orange-500/20",
};

export default function LeadsClient({ initialData }: { initialData: any }) {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const filters = ["All", "NEW", "Recovered", "Follow-up", "Converted"];

    const filtered = initialData.leads.filter(
        (l: any) =>
            (activeFilter === "All" || l.status === activeFilter) &&
            (l.name.toLowerCase().includes(search.toLowerCase()) ||
                l.phone.includes(search))
    );

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black font-[Outfit]">Leads CRM</h1>
                    <p className="text-sm text-white/40 mt-0.5">
                        {initialData.stats.total} total leads · {initialData.stats.newToday} new today
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/20 px-3 py-1.5 rounded-full">
                        <RefreshCcw className="w-3 h-3" />
                        Lead Recovery Active
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-white/30" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or phone..."
                        className="bg-transparent text-sm text-white/70 placeholder:text-white/30 outline-none flex-1"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <Filter className="w-4 h-4 text-white/30 flex-shrink-0" />
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${activeFilter === f
                                ? "bg-[#25D366]/15 text-[#25D366] border-[#25D366]/30"
                                : "text-white/40 border-white/10 hover:text-white hover:border-white/20"
                                }`}
                        >
                            {f === "NEW" ? "New" : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leads Table */}
            <div className="glass-card border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                {["Lead", "Query", "Last Message", "Score", "Status", "Actions"].map((h) => (
                                    <th key={h} className="text-left px-4 py-3 text-xs text-white/40 font-medium whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {filtered.map((lead: any) => (
                                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/10 border border-[#25D366]/20 flex items-center justify-center text-[10px] font-bold text-[#25D366]">
                                                {lead.name.split(" ").map((n: string) => n[0]).join("")}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="font-semibold text-sm">{lead.name}</div>
                                                    {lead.isAiPaused && (
                                                        <ShieldAlert className="w-3 h-3 text-orange-400" />
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-white/30">{lead.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-white/50 max-w-[150px] truncate hidden md:table-cell">
                                        {lead.query}
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-white/40 max-w-[200px] truncate hidden lg:table-cell">
                                        {lead.lastMsg}
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400" />
                                            <span className={`text-sm font-bold ${lead.score >= 80 ? "text-[#25D366]" : lead.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                                                {lead.score}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[lead.status] ?? "bg-white/10 text-white/50"}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-1">
                                            <Link
                                                href="/conversations"
                                                className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                                                title="View Chat"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                            </Link>
                                            <button className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                                                <Phone className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="py-12 text-center text-white/30 text-sm">
                        No leads found matching your filters.
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Phone, MessageCircle, Star, RefreshCcw, ShieldAlert, Bot, Loader2, Tag, Globe, MoreVertical, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toggleAiPause } from "@/app/actions/leads";
import { exportLeadsToCSV, importLeadsFromCSV } from "@/app/actions/sync";
import { toast } from "sonner";
import { FileDown, Table, Upload } from "lucide-react";

const stageColors: Record<string, string> = {
    NEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    HOT: "bg-red-500/10 text-red-400 border-red-500/20",
    CUSTOMER: "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20",
    FOLLOW_UP: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export default function LeadsClient({ initialData }: { initialData: any }) {
    const searchParams = useSearchParams();
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [leads, setLeads] = useState(initialData.leads);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const handleExport = async () => {
        try {
            const csv = await exportLeadsToCSV();
            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.setAttribute("hidden", "");
            a.setAttribute("href", url);
            a.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success("Leads exported successfully! You can now upload this to Google Sheets.");
        } catch (error) {
            toast.error("Failed to export leads");
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const csvText = event.target?.result as string;
            const loadingToast = toast.loading("Importing leads...");
            try {
                const result = await importLeadsFromCSV(csvText);
                toast.dismiss(loadingToast);
                toast.success(`Successfully imported ${result.count} leads!`);
                window.location.reload();
            } catch (error: any) {
                toast.dismiss(loadingToast);
                toast.error(error.message || "Failed to import CSV");
            }
        };
        reader.readAsText(file);
    };

    useEffect(() => {
        const phone = searchParams.get("phone");
        if (phone) setSearch(phone);
    }, [searchParams]);

    const handleToggleAi = async (leadId: string) => {
        setTogglingId(leadId);
        setLeads((prev: any) => prev.map((l: any) => 
            l.id === leadId ? { ...l, isAiPaused: !l.isAiPaused } : l
        ));

        try {
            const newState = await toggleAiPause(leadId);
            toast.success(`AI ${newState ? "paused" : "resumed"} for this lead`);
        } catch (error) {
            setLeads((prev: any) => prev.map((l: any) => 
                l.id === leadId ? { ...l, isAiPaused: !l.isAiPaused } : l
            ));
            toast.error("Failed to update AI status");
        } finally {
            setTogglingId(null);
        }
    };

    const filters = ["All", "NEW", "HOT", "CUSTOMER", "FOLLOW_UP"];

    const filtered = leads.filter(
        (l: any) =>
            (activeFilter === "All" || l.stage === activeFilter) &&
            (l.name.toLowerCase().includes(search.toLowerCase()) ||
             l.phone.includes(search) ||
             l.interest.toLowerCase().includes(search.toLowerCase()) ||
             l.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase())))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-[Outfit] text-white tracking-tight">
                        Universal <span className="text-gradient">Leads CRM</span>
                    </h1>
                    <p className="text-white/40 mt-1 font-medium">
                        {initialData.stats.total} total contacts · {initialData.stats.newToday} new today
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3 backdrop-blur-md">
                        <div className="flex -space-x-2">
                             {[1,2,3].map(i => (
                                 <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0a0f14] bg-white/10 flex items-center justify-center text-[8px] font-bold overflow-hidden">
                                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="avatar" />
                                 </div>
                             ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">Team Active</span>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="glass-card border border-white/5 p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-2xl px-4 py-2.5 flex-1 focus-within:border-[#25D366]/40 transition-all">
                        <Search className="w-4 h-4 text-white/20" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, phone, tags or interest..."
                            className="bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none flex-1"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar md:pb-0">
                        {filters.map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`flex-shrink-0 text-[10px] uppercase tracking-widest font-black px-4 py-2 rounded-xl border transition-all ${activeFilter === f
                                    ? "bg-[#25D366]/20 text-[#25D366] border-[#25D366]/40 shadow-[0_0_20px_rgba(37,211,102,0.1)]"
                                    : "bg-white/5 text-white/40 border-white/5 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 md:flex-none" />
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            id="leads-import"
                            hidden
                            accept=".csv"
                            onChange={handleImport}
                        />
                        <button 
                            onClick={() => document.getElementById('leads-import')?.click()}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-lg active:scale-95"
                        >
                            <Upload className="w-4 h-4 text-[#25D366]" />
                            Import CSV
                        </button>
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-lg active:scale-95"
                        >
                            <Table className="w-4 h-4 text-[#25D366]" />
                            Sync to Sheets (CSV)
                        </button>
                    </div>
                </div>
            </div>

            {/* Leads Inventory */}
            <div className="space-y-4">
                {/* Desktop View */}
                <div className="hidden lg:block glass-card border border-white/5 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-widest text-white/30 font-black">Contact</th>
                                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-widest text-white/30 font-black">Stage & Source</th>
                                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-widest text-white/30 font-black">Interest & Tags</th>
                                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-widest text-white/30 font-black text-center">Score</th>
                                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-widest text-white/30 font-black">AI Mode</th>
                                <th className="text-right px-6 py-4 text-[10px] uppercase tracking-widest text-white/30 font-black">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {filtered.map((lead: any) => (
                                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/10 border border-[#25D366]/20 flex items-center justify-center text-xs font-black text-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.1)]">
                                                {lead.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white/90">{lead.name}</div>
                                                <div className="text-[10px] text-white/20 font-black tracking-widest mt-0.5">{lead.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${stageColors[lead.stage]}`}>
                                                {lead.stage}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/40">
                                                {lead.source === "WhatsApp" ? (
                                                    <MessageCircle className="w-3 h-3 text-[#25D366]" />
                                                ) : (
                                                    <Globe className="w-3 h-3 text-blue-400" />
                                                )}
                                                {lead.source}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1 max-w-[220px]">
                                            <div className="flex items-start gap-1.5 group/query">
                                                <User className="w-3 h-3 text-white/20 mt-0.5" />
                                                <div className="text-[10px] text-white/70 line-clamp-1 group-hover/query:line-clamp-none transition-all">{lead.query}</div>
                                            </div>
                                            <div className="flex items-start gap-1.5 group/response">
                                                <Bot className="w-3 h-3 text-[#25D366]/40 mt-0.5" />
                                                <div className="text-[10px] text-[#25D366]/60 line-clamp-1 group-hover/response:line-clamp-none transition-all italic">{lead.lastMsg}</div>
                                            </div>
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {lead.tags.map((tag: string) => (
                                                    <span key={tag} className="text-[8px] font-black uppercase tracking-tighter bg-white/5 text-white/40 px-1.5 py-0.5 rounded border border-white/5">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full border border-white/5">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className={`text-xs font-black ${lead.score >= 80 ? "text-[#25D366]" : lead.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                                                {lead.score}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${lead.isAiPaused ? "bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-[#25D366] shadow-[0_0_10px_rgba(37,211,102,0.5)]"}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${lead.isAiPaused ? "text-red-400/60" : "text-[#25D366]/60"}`}>
                                                {lead.isAiPaused ? "Manual Only" : "Auto-Pilot"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <Link
                                                href={`/conversations?leadId=${lead.id}`}
                                                className="p-2 rounded-xl bg-white/5 text-white/40 hover:bg-[#25D366]/20 hover:text-[#25D366] transition-all"
                                                title="View Chat"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                            <button 
                                                onClick={() => handleToggleAi(lead.id)}
                                                className={`p-2 rounded-xl transition-all ${lead.isAiPaused ? "bg-orange-500/10 text-orange-400" : "bg-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-400"}`}
                                            >
                                                {togglingId === lead.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile & Tablet Card Grid */}
                <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((lead: any) => (
                        <div key={lead.id} className="glass-card border border-white/5 p-5 space-y-5 relative overflow-hidden group">
                           {lead.score >= 90 && (
                               <div className="absolute top-0 right-0 bg-[#25D366] text-black text-[8px] font-black px-2 py-1 rounded-bl-xl tracking-tighter uppercase">
                                   High Priority
                               </div>
                           )}
                           
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/10 border border-[#25D366]/20 flex items-center justify-center text-sm font-black text-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.1)]">
                                    {lead.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                         <div className="font-black text-white text-lg leading-tight">{lead.name}</div>
                                         <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className={`text-xs font-black ${lead.score >= 80 ? "text-[#25D366]" : "text-white/40"}`}>
                                                {lead.score}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-white/20 font-black tracking-widest mt-1 uppercase flex items-center gap-2">
                                        {lead.phone} 
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <span className="text-[#25D366]/40">{lead.source}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/[0.03]">
                                <div>
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Intelligent Stage</p>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${stageColors[lead.stage]}`}>
                                        {lead.stage}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">AI Engine Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${lead.isAiPaused ? "bg-red-500 animate-pulse" : "bg-[#25D366]"}`} />
                                        <span className={`text-[10px] font-bold ${lead.isAiPaused ? "text-red-400" : "text-[#25D366]"}`}>
                                            {lead.isAiPaused ? "Paused" : "Active"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-black/40 rounded-xl p-3 border border-white/5 space-y-2">
                                    <div className="flex gap-2">
                                        <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <User className="w-3 h-3 text-white/40" />
                                        </div>
                                        <p className="text-[10px] font-medium text-white/80 leading-relaxed italic">"{lead.query}"</p>
                                    </div>
                                    <div className="flex gap-2 border-t border-white/5 pt-2">
                                        <div className="w-5 h-5 rounded-md bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-3 h-3 text-[#25D366]" />
                                        </div>
                                        <p className="text-[10px] font-medium text-[#25D366]/70 leading-relaxed italic">"{lead.lastMsg}"</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {lead.tags.map((tag: string) => (
                                        <span key={tag} className="text-[9px] font-black uppercase tracking-tighter bg-white/5 text-white/40 px-2 py-1 rounded-lg border border-white/5">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 flex items-center gap-2">
                                <Link
                                    href={`/conversations?leadId=${lead.id}`}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-black py-3 rounded-2xl text-xs font-black shadow-[0_5px_15px_rgba(37,211,102,0.3)] active:scale-95 transition-all"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    OPEN CONVERSATION
                                </Link>
                                <button 
                                    onClick={() => handleToggleAi(lead.id)}
                                    className={`p-3 rounded-2xl bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 active:scale-95 transition-all`}
                                >
                                    {togglingId === lead.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="py-20 text-center glass-card border border-white/5 bg-white/[0.01]">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <Search className="w-6 h-6 text-white/10" />
                        </div>
                        <h3 className="text-white/40 font-black text-lg">No leads found</h3>
                        <p className="text-white/20 text-xs mt-1 max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

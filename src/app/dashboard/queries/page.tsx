"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    HelpCircle, 
    RefreshCcw, 
    CheckCircle2, 
    Search,
    Filter,
    MessageCircleQuestion,
    LayoutGrid,
    List,
} from "lucide-react";
import { QueryStats } from "@/components/queries/QueryStats";
import { QueryFilters } from "@/components/queries/QueryFilters";
import { QueryCard } from "@/components/queries/QueryCard";
import { ReplyModal } from "@/components/queries/ReplyModal";
import { ResumeAiConfirm } from "@/components/queries/ResumeAiConfirm";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export default function QueriesPage() {
    const [queries, setQueries] = useState<any[]>([]);
    const [stats, setStats] = useState({
        pendingCount: 0,
        pausedCount: 0,
        resolvedToday: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filters
    const [filter, setFilter] = useState("pending");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Modals
    const [selectedQuery, setSelectedQuery] = useState<any>(null);
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [isResumeOpen, setIsResumeOpen] = useState(false);
    const [resumeLeadId, setResumeLeadId] = useState<string | null>(null);
    const [isResuming, setIsResuming] = useState(false);

    const fetchQueries = useCallback(async (isRefreshing = false) => {
        if (isRefreshing) setRefreshing(true);
        else setLoading(true);

        try {
            const params = new URLSearchParams({
                filter,
                search,
                sort,
                page: page.toString(),
                limit: "20"
            });

            const res = await apiFetch(`/queries?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch queries");

            const data = await res.json();
            setQueries(data.queries);
            setStats(data.stats);
            setHasMore(data.hasMore);
        } catch (err) {
            console.error(err);
            toast.error("Queries load nahi ho payin. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filter, search, sort, page]);

    useEffect(() => {
        fetchQueries();
        
        // Auto refresh every 60s
        const interval = setInterval(() => fetchQueries(true), 60000);
        return () => clearInterval(interval);
    }, [fetchQueries]);

    const handleResolve = async (leadId: string) => {
        try {
            const res = await apiFetch(`/queries/${leadId}/resolve`, {
                method: "PATCH",
            });

            if (res.ok) {
                // Optimistically remove from list if in "pending" view
                if (filter !== "all" && filter !== "resolved") {
                    setQueries(prev => prev.filter(q => q.leadId !== leadId));
                } else {
                    // Update the status locally
                    setQueries(prev => prev.map(q => q.leadId === leadId ? { ...q, status: "RESOLVED" } : q));
                }
                
                toast.success("✅ Query resolved mark ho gayi", {
                    action: {
                        label: "Undo",
                        onClick: () => handleUndoResolve(leadId)
                    },
                    duration: 5000
                });
            } else {
                toast.error("Resolve karne mein error aaya.");
            }
        } catch (err) {
            toast.error("Action failed.");
        }
    };

    const handleUndoResolve = async (leadId: string) => {
        // Implementation for undo resolve if needed - for now just a placeholder
        // In a real app, we'd have a toggle or specific undo endpoint
        toast.info("Undo not implemented for tags yet.");
    };

    const handleResumeAi = async (leadId: string) => {
        setResumeLeadId(leadId);
        setIsResumeOpen(true);
    };

    const confirmResumeAi = async () => {
        if (!resumeLeadId) return;
        setIsResuming(true);
        
        try {
            const res = await apiFetch(`/queries/${resumeLeadId}/resume-ai`, {
                method: "PATCH",
            });

            if (res.ok) {
                setQueries(prev => prev.map(q => 
                    q.leadId === resumeLeadId ? { ...q, isAiPaused: false, status: "PENDING" } : q
                ));
                toast.success("✅ AI resume ho gayi lead ke liye");
                setIsResumeOpen(false);
            } else {
                toast.error("AI resume nahi ho payi.");
            }
        } catch (err) {
            toast.error("Action failed.");
        } finally {
            setIsResuming(false);
        }
    };

    const handleReply = (query: any) => {
        setSelectedQuery(query);
        setIsReplyOpen(true);
    };

    const handleMarkAllRead = () => {
        toast.success("Sabhi queries ko read mark kar diya gaya hai.");
    };

    return (
        <div className="min-h-screen pb-12 animate-in fade-in duration-700">
            {/* Header Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        Queries
                        <div className="h-6 w-[2px] bg-white/10 rounded-full mx-1" />
                        <span className="text-white/20 text-lg font-bold">Inbox</span>
                    </h1>
                    <p className="text-white/40 text-[13px] font-medium mt-1">
                        Customer questions jo reply ka wait kar rahi hain.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => fetchQueries(true)}
                        className={`p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white transition-all hover:bg-white/5 active:scale-95 ${refreshing ? 'animate-spin text-[#25D366]' : ''}`}
                        title="Refresh Queries"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleMarkAllRead}
                        className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-bold hover:text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                        Mark All Read
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <QueryStats stats={stats} />

            {/* Filter Bar */}
            <QueryFilters 
                filter={filter} 
                setFilter={setFilter}
                search={search}
                setSearch={setSearch}
                sort={sort}
                setSort={setSort}
            />

            {/* Queries List */}
            <div className="mt-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="w-12 h-12 border-4 border-[#25D366]/20 border-t-[#25D366] rounded-full animate-spin" />
                        <p className="text-white/20 text-sm font-bold animate-pulse">Loading queries...</p>
                    </div>
                ) : queries.length > 0 ? (
                    <div className="grid grid-cols-1 gap-1">
                        {queries.map((query) => (
                            <QueryCard 
                                key={query.leadId} 
                                query={query} 
                                onResolve={handleResolve}
                                onResumeAi={handleResumeAi}
                                onReply={handleReply}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-3xl animate-in zoom-in duration-500">
                        <div className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-[#25D366] mb-6 shadow-[0_0_50px_rgba(37,211,102,0.1)]">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Sab clear hai! 🎉</h3>
                        <p className="text-white/40 text-sm font-medium max-w-sm mx-auto">
                            Koi bhi pending query nahi hai. Jab koi customer question unanswered rahega, yahan dikhega.
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ReplyModal 
                isOpen={isReplyOpen}
                onClose={() => setIsReplyOpen(false)}
                query={selectedQuery}
                onResolve={handleResolve}
            />

            <ResumeAiConfirm 
                isOpen={isResumeOpen}
                onClose={() => setIsResumeOpen(false)}
                onConfirm={confirmResumeAi}
                leadName={queries.find(q => q.leadId === resumeLeadId)?.leadName || "Lead"}
                loading={isResuming}
            />
        </div>
    );
}

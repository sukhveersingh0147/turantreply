"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    Clock, 
    Calendar, 
    CheckCircle, 
    Bot, 
    BellRing,
    Plus,
    RefreshCcw,
    History,
    Zap,
    Search,
    Filter
} from "lucide-react";
import { ReminderStats } from "@/components/reminders/ReminderStats";
import { ReminderCard } from "@/components/reminders/ReminderCard";
import { RuleCard } from "@/components/reminders/RuleCard";
import { SendReminderModal } from "@/components/reminders/SendReminderModal";
import { CreateReminderModal } from "@/components/reminders/CreateReminderModal";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export default function RemindersPage() {
    const [activeTab, setActiveTab] = useState<"queue" | "history" | "rules">("queue");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const [data, setData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        dueToday: 0,
        thisWeek: 0,
        sentThisMonth: 0,
        activeRules: 0
    });

    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSendOpen, setIsSendOpen] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState<any>(null);

    const fetchData = useCallback(async (isRefreshing = false) => {
        if (isRefreshing) setRefreshing(true);
        else setLoading(true);

        try {
            const apiPath = activeTab === "rules" ? "/reminders/rules" : `/reminders?tab=${activeTab}&filter=${filter}&page=${page}`;
            const res = await apiFetch(apiPath);
            if (!res.ok) throw new Error("Failed to fetch");

            const json = await res.json();
            
            if (activeTab === "rules") {
                setData(json.rules || []);
            } else {
                setData(json.reminders || []);
                setStats(json.stats);
                setHasMore(json.hasMore);
            }
        } catch (err) {
            console.error(err);
            toast.error("Data load nahi ho paya.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab, filter, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = async (id: string, action: "SENT" | "SKIP") => {
        try {
            const res = await apiFetch("/reminders", {
                method: "PATCH",
                body: JSON.stringify({ id, action })
            });

            if (res.ok) {
                setData(prev => prev.filter(r => r.id !== id));
                toast.success(action === "SENT" ? "✅ WhatsApp khul gaya! Message bhej do." : "Reminder skip kar diya gaya.");
                
                // Refresh stats
                fetchData(true);
            }
        } catch (err) {
            toast.error("Action failed.");
        }
    };

    const handleRuleToggle = async (id: string, isActive: boolean) => {
        try {
            const res = await apiFetch(`/reminders/rules/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ isActive })
            });
            if (res.ok) {
                setData(prev => prev.map(r => r.id === id ? { ...r, isActive } : r));
                toast.success(isActive ? "Rule enabled" : "Rule disabled");
            }
        } catch (err) {
            toast.error("Toggle failed.");
        }
    };

    const handleRuleDelete = async (id: string) => {
        if (!confirm("Delete this rule?")) return;
        try {
            const res = await apiFetch(`/reminders/rules/${id}`, { method: "DELETE" });
            if (res.ok) {
                setData(prev => prev.filter(r => r.id !== id));
                toast.success("Rule deleted");
            }
        } catch (err) {
            toast.error("Delete failed.");
        }
    };

    const handleRuleCreate = async (ruleData: any) => {
        try {
            const res = await apiFetch("/reminders/rules", {
                method: "POST",
                body: JSON.stringify(ruleData)
            });
            if (res.ok) {
                toast.success("Automation rule create ho gaya!");
                fetchData(true);
            }
        } catch (err) {
            toast.error("Create failed.");
        }
    };

    return (
        <div className="min-h-screen pb-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        Reminders
                        <div className="h-6 w-[2px] bg-white/10 rounded-full mx-1" />
                        <span className="text-white/20 text-lg font-bold">Queue</span>
                    </h1>
                    <p className="text-white/40 text-[13px] font-medium mt-1">
                        Scheduled messages aur upcoming alerts — sab ek jagah.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                         onClick={() => fetchData(true)}
                        className={`p-3 rounded-xl border border-white/10 text-white/40 hover:text-white transition-all hover:bg-white/5 ${refreshing ? 'animate-spin text-[#25D366]' : ''}`}
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setIsCreateOpen(true)}
                        className="px-6 py-3 rounded-xl bg-[#25D366] text-black text-sm font-black flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_8px_20px_rgba(37,211,102,0.2)]"
                    >
                        <Plus className="w-4 h-4" />
                        Create Reminder
                    </button>
                </div>
            </div>

            {/* Stats */}
            <ReminderStats stats={stats} />

            {/* Tabs & View Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setActiveTab("queue")}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                            activeTab === "queue" ? "text-[#25D366]" : "text-white/20 hover:text-white/40"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Upcoming Queue
                        </div>
                        {activeTab === "queue" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#25D366]" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab("history")}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                            activeTab === "history" ? "text-white" : "text-white/20 hover:text-white/40"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4" />
                            Sent History
                        </div>
                        {activeTab === "history" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab("rules")}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                            activeTab === "rules" ? "text-purple-400" : "text-white/20 hover:text-white/40"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Automation Rules
                        </div>
                        {activeTab === "rules" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-400" />}
                    </button>
                </div>

                {activeTab !== "rules" && (
                    <div className="flex items-center gap-2 pb-4">
                         {["all", "today", "tomorrow", "this_week"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                                    filter === f ? "bg-white/10 text-white border-white/20" : "text-white/20 border-transparent hover:text-white/40"
                                }`}
                            >
                                {f.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* List Content */}
            <div className="mt-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-12 h-12 border-4 border-[#25D366]/20 border-t-[#25D366] rounded-full animate-spin" />
                        <p className="text-white/20 text-sm font-bold">Loading {activeTab}...</p>
                    </div>
                ) : data.length > 0 ? (
                    <div className="space-y-1">
                        {activeTab === "rules" ? (
                            data.map(rule => (
                                <RuleCard 
                                    key={rule.id} 
                                    rule={rule} 
                                    onToggle={handleRuleToggle} 
                                    onEdit={(r) => toast.info("Edit workflow for rules coming soon!")}
                                    onDelete={handleRuleDelete}
                                />
                            ))
                        ) : (
                            data.map(reminder => (
                                <ReminderCard 
                                    key={reminder.id} 
                                    reminder={reminder} 
                                    onSend={(r) => { setSelectedReminder(r); setIsSendOpen(true); }}
                                    onSkip={(id) => handleAction(id, "SKIP")}
                                    onEdit={(r) => toast.info("Manual edit coming soon!")}
                                    isHistory={activeTab === "history"}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/10 mb-6">
                            <BellRing className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">No {activeTab} found</h3>
                        <p className="text-white/40 text-sm font-medium max-w-sm mx-auto">
                            {activeTab === "queue" 
                                ? "Abhi koi upcoming reminder nahi hai. Appointments add karein ya automation rules set karein!"
                                : "History empty hai. Queue se reminders send karein!"}
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <SendReminderModal 
                isOpen={isSendOpen}
                onClose={() => setIsSendOpen(false)}
                reminder={selectedReminder}
                onConfirm={(id) => handleAction(id, "SENT")}
            />

            <CreateReminderModal 
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onOneTimeCreate={(d) => toast.info("One-time individual schedule coming soon!")}
                onRuleCreate={handleRuleCreate}
            />
        </div>
    );
}

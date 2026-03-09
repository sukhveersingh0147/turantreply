"use client";

import { useState, useEffect } from "react";
import { Zap, Plus, Trash2, Edit, Clock, MessageCircle, X, Loader2 } from "lucide-react";

interface AutomationRule {
    id: string;
    triggerKeyword: string;
    responseMessage: string;
    isActive: boolean;
    matchCount: number;
}

const followUps = [
    { id: 1, name: "New Lead Sequence", day1: "Hi! Just checking in — still interested in a free trial? 😊", day3: "Don't miss out! Our trial is completely FREE. Book your spot today.", day7: "Last chance! Your free trial offer expires soon. Reply YES to book.", active: true, leads: 34 },
    { id: 2, name: "Discount Follow-up", day1: "Hi! We have 20% off on annual memberships this month only!", day3: "Reminder: The 20% discount ends Sunday. Lock in your savings!", day7: "Final day for 20% off. Act now!", active: false, leads: 12 },
];

export default function AutomationPage() {
    const [tab, setTab] = useState<"rules" | "followups" | "recovery">("rules");
    const [rules, setRules] = useState<AutomationRule[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [sequences, setSequences] = useState<any[]>([]);
    const [recovery, setRecovery] = useState<any>(null);
    const [isLoadingRules, setIsLoadingRules] = useState(true);
    const [isLoadingSequences, setIsLoadingSequences] = useState(false);
    const [isLoadingRecovery, setIsLoadingRecovery] = useState(false);
    const [isSavingRecovery, setIsSavingRecovery] = useState(false);

    useEffect(() => {
        if (tab === "rules") fetchRules();
        if (tab === "followups") fetchSequences();
        if (tab === "recovery") fetchRecovery();
    }, [tab]);

    async function fetchRules() {
        setIsLoadingRules(true);
        try {
            const res = await fetch("/api/automation");
            const data = await res.json();
            if (Array.isArray(data)) setRules(data);
        } catch (error) {
            console.error("Failed to fetch rules:", error);
        } finally {
            setIsLoadingRules(false);
        }
    }

    async function fetchSequences() {
        setIsLoadingSequences(true);
        try {
            const res = await fetch("/api/automation/sequences");
            const data = await res.json();
            if (Array.isArray(data)) setSequences(data);
        } catch (error) {
            console.error("Failed to fetch sequences:", error);
        } finally {
            setIsLoadingSequences(false);
        }
    }

    async function fetchRecovery() {
        setIsLoadingRecovery(true);
        try {
            const res = await fetch("/api/automation/recovery");
            const data = await res.json();
            setRecovery(data);
        } catch (error) {
            console.error("Failed to fetch recovery:", error);
        } finally {
            setIsLoadingRecovery(false);
        }
    }

    async function handleSaveRecovery(e: React.FormEvent) {
        e.preventDefault();
        setIsSavingRecovery(true);
        try {
            const res = await fetch("/api/automation/recovery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(recovery),
            });
            if (res.ok) alert("Recovery settings saved!");
        } catch (error) {
            console.error("Failed to save recovery:", error);
        } finally {
            setIsSavingRecovery(false);
        }
    }

    async function toggleSequence(id: string, currentStatus: boolean) {
        try {
            const res = await fetch(`/api/automation/sequences/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            if (res.ok) {
                setSequences(sequences.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
            }
        } catch (error) {
            console.error("Failed to toggle sequence:", error);
        }
    }

    async function deleteSequence(id: string) {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/automation/sequences/${id}`, { method: "DELETE" });
            if (res.ok) setSequences(sequences.filter(s => s.id !== id));
        } catch (error) {
            console.error("Failed to delete sequence:", error);
        }
    }

    // Modal Form state for Keyword Rule
    const [newKeyword, setNewKeyword] = useState("");
    const [newResponse, setNewResponse] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    async function handleAddRule(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/automation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    triggerKeyword: newKeyword,
                    responseMessage: newResponse,
                }),
            });
            if (res.ok) {
                const newRule = await res.json();
                setRules([newRule, ...rules]);
                setShowAddModal(false);
                setNewKeyword("");
                setNewResponse("");
            }
        } catch (error) {
            console.error("Failed to add rule:", error);
        } finally {
            setIsSaving(false);
        }
    }

    async function toggleRule(id: string, currentStatus: boolean) {
        try {
            const res = await fetch(`/api/automation/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            if (res.ok) {
                setRules(rules.map(r => r.id === id ? { ...r, isActive: !currentStatus } : r));
            }
        } catch (error) {
            console.error("Failed to toggle rule:", error);
        }
    }

    async function deleteRule(id: string) {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/automation/${id}`, { method: "DELETE" });
            if (res.ok) setRules(rules.filter(r => r.id !== id));
        } catch (error) {
            console.error("Failed to delete rule:", error);
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black font-[Outfit]">Automation</h1>
                    <p className="text-sm text-white/40">Manage keyword triggers, multi-step follow-ups, and lead recovery</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    New {tab === "rules" ? "Rule" : "Sequence"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl w-fit">
                {[
                    { key: "rules", label: "Keyword Rules" },
                    { key: "followups", label: "Follow-up Sequences" },
                    { key: "recovery", label: "Lead Recovery" },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key as typeof tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key
                            ? "bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/20"
                            : "text-white/40 hover:text-white"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Keyword Rules */}
            {tab === "rules" && (
                <div className="space-y-3">
                    {isLoadingRules ? (
                        <div className="flex flex-col items-center justify-center py-20 text-white/20">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p className="text-sm">Loading your rules...</p>
                        </div>
                    ) : rules.length === 0 ? (
                        <div className="glass-card border border-white/5 p-12 text-center">
                            <Zap className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white/40">No automation rules yet</h3>
                            <p className="text-sm text-white/30 mb-6">Create your first rule to auto-reply to common questions</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                            >
                                Get Started
                            </button>
                        </div>
                    ) : (
                        rules.map((rule) => (
                            <div key={rule.id} className="glass-card border border-white/5 p-4 flex items-start gap-4">
                                <div className={`w-9 h-9 rounded-xl ${rule.isActive ? "bg-[#25D366]/15 border border-[#25D366]/20" : "bg-white/5 border border-white/5"} flex items-center justify-center flex-shrink-0`}>
                                    <Zap className={`w-4 h-4 ${rule.isActive ? "text-[#25D366]" : "text-white/30"}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-xs font-semibold text-white/50">Trigger keyword:</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${rule.isActive ? "bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20" : "bg-white/5 text-white/30 border border-white/5"}`}>
                                            &quot;{rule.triggerKeyword}&quot;
                                        </span>
                                        <span className="text-[10px] text-white/30">{rule.matchCount} matches</span>
                                    </div>
                                    <p className="text-sm text-white/70 leading-relaxed">{rule.responseMessage}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <div
                                        onClick={() => toggleRule(rule.id, rule.isActive)}
                                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${rule.isActive ? "bg-[#25D366]" : "bg-white/10"
                                            }`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${rule.isActive ? "left-5" : "left-0.5"}`} />
                                    </div>
                                    <button
                                        onClick={() => deleteRule(rule.id)}
                                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Follow-up Sequences */}
            {tab === "followups" && (
                <div className="space-y-4">
                    {isLoadingSequences ? (
                        <div className="flex flex-col items-center justify-center py-20 text-white/20">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p className="text-sm">Loading sequences...</p>
                        </div>
                    ) : sequences.length === 0 ? (
                        <div className="glass-card border border-white/5 p-12 text-center text-white/30">
                            No sequences found.
                        </div>
                    ) : (
                        sequences.map((seq) => (
                            <div key={seq.id} className="glass-card border border-white/5 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold font-[Outfit]">{seq.name}</h3>
                                        <div
                                            onClick={() => toggleSequence(seq.id, seq.isActive)}
                                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${seq.isActive ? "bg-[#25D366]" : "bg-white/10"
                                                }`}
                                        >
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${seq.isActive ? "left-5" : "left-0.5"}`} />
                                        </div>
                                    </div>
                                    <button onClick={() => deleteSequence(seq.id)} className="text-white/20 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {seq.steps.map((step: any, i: number) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-3.5 h-3.5 text-orange-400" />
                                                <span className="text-xs font-semibold text-orange-400">Day {step.dayDelay}</span>
                                            </div>
                                            <p className="text-xs text-white/60 leading-relaxed">{step.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Lead Recovery */}
            {tab === "recovery" && (
                <div className="space-y-4">
                    {isLoadingRecovery ? (
                        <div className="flex flex-col items-center justify-center py-20 text-white/20">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p className="text-sm">Loading recovery settings...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveRecovery} className="glass-card border border-[#25D366]/20 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 border border-[#25D366]/20 flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                                </div>
                                <div>
                                    <h3 className="font-bold font-[Outfit]">Lead Recovery Engine</h3>
                                    <p className="text-xs text-white/40">Automatically recover unanswered leads</p>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    <div
                                        onClick={() => setRecovery({ ...recovery, isEnabled: !recovery?.isEnabled })}
                                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${recovery?.isEnabled ? "bg-[#25D366]" : "bg-white/10"
                                            }`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${recovery?.isEnabled ? "left-5" : "left-0.5"}`} />
                                    </div>
                                    <span className={`text-xs font-semibold ${recovery?.isEnabled ? "text-[#25D366]" : "text-white/20"}`}>
                                        {recovery?.isEnabled ? "Active" : "Disabled"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs font-medium text-white/50 block mb-2">Response Time Window</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={recovery?.waitTimeMinutes || 30}
                                            onChange={(e) => setRecovery({ ...recovery, waitTimeMinutes: e.target.value })}
                                            className="input-dark w-20"
                                        />
                                        <span className="text-sm text-white/40">minutes</span>
                                    </div>
                                    <p className="text-[10px] text-white/30 mt-1">If no reply within this window, recovery triggers</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-white/50 block mb-2">Recovery Message</label>
                                <textarea
                                    value={recovery?.message || ""}
                                    onChange={(e) => setRecovery({ ...recovery, message: e.target.value })}
                                    className="input-dark h-28 resize-none font-sans text-sm"
                                    placeholder="Type the message to send to inactive leads..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSavingRecovery}
                                className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSavingRecovery ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Recovery Settings"}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Add Rule Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card border border-white/10 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold font-[Outfit]">Create Automation Rule</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddRule} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-white/50 block mb-1.5 uppercase tracking-wider">Trigger Keyword</label>
                                <input
                                    required
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    placeholder="e.g. price, timing, trial"
                                    className="input-dark w-full"
                                />
                                <p className="text-[10px] text-white/30 mt-1.5">When a customer sends a message containing this word, the automation triggers.</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-white/50 block mb-1.5 uppercase tracking-wider">Response Message</label>
                                <textarea
                                    required
                                    value={newResponse}
                                    onChange={(e) => setNewResponse(e.target.value)}
                                    placeholder="Type the auto-reply message..."
                                    className="input-dark w-full h-32 resize-none"
                                />
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Create Rule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Radio, Users, Clock, Send, CheckCircle, Loader2 } from "lucide-react";

interface BroadcastRecord {
    id: string;
    name: string;
    content: string;
    status: string;
    sentCount: number;
    createdAt: string;
}

export default function BroadcastPage() {
    const [msg, setMsg] = useState(
        "Hi {{name}} 👋\n\nWe have an exciting offer this week — 20% OFF on all memberships!\n\nOffer valid till Sunday. Reply YES to grab it! 🎉"
    );
    const [selectedSegment, setSelectedSegment] = useState("all");
    const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [broadcastName, setBroadcastName] = useState("");

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    async function fetchBroadcasts() {
        try {
            const res = await fetch("/api/broadcast");
            const data = await res.json();
            if (Array.isArray(data)) {
                setBroadcasts(data);
            }
        } catch (error) {
            console.error("Failed to fetch broadcasts:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSendBroadcast() {
        if (!broadcastName) {
            alert("Please enter a name for this broadcast");
            return;
        }
        if (!confirm(`Are you sure you want to send this broadcast to the ${selectedSegment} segment?`)) return;

        setIsSending(true);
        try {
            const res = await fetch("/api/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: broadcastName,
                    content: msg,
                    segment: selectedSegment,
                }),
            });
            if (res.ok) {
                const newBroadcast = await res.json();
                setBroadcasts([newBroadcast, ...broadcasts]);
                setBroadcastName("");
                alert("Broadcast sent successfully!");
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || "Failed to send broadcast"}`);
            }
        } catch (error) {
            console.error("Failed to send broadcast:", error);
            alert("An error occurred while sending the broadcast.");
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-black font-[Outfit]">Broadcast Messaging</h1>
                <p className="text-sm text-white/40">Send bulk WhatsApp messages to your leads</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Compose */}
                <div className="glass-card border border-white/5 p-6 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                            <Radio className="w-4.5 h-4.5 text-purple-400" />
                        </div>
                        <h2 className="font-bold font-[Outfit]">New Broadcast</h2>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-xs font-medium text-white/50 block mb-2">Broadcast Name (Internal Only)</label>
                        <input
                            value={broadcastName}
                            onChange={(e) => setBroadcastName(e.target.value)}
                            className="input-dark w-full"
                            placeholder="e.g. Weekend Offer March 2026"
                        />
                    </div>

                    {/* Segment */}
                    <div>
                        <label className="text-xs font-medium text-white/50 block mb-2">Target Audience</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { key: "all", label: "All Leads", count: "Total" },
                                { key: "new", label: "New Leads", count: "Status: NEW" },
                            ].map((seg) => (
                                <button
                                    key={seg.key}
                                    onClick={() => setSelectedSegment(seg.key)}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left text-xs transition-all ${selectedSegment === seg.key
                                        ? "bg-purple-500/15 border-purple-500/30 text-purple-400"
                                        : "bg-white/[0.03] border-white/5 text-white/50 hover:border-white/15"
                                        }`}
                                >
                                    <span className="font-medium">{seg.label}</span>
                                    <span className="font-bold text-[10px] opacity-50">{seg.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-white/50">Message</label>
                            <span className="text-[10px] text-white/30">Use {"{{name}}"} for personalization</span>
                        </div>
                        <textarea
                            value={msg}
                            onChange={(e) => setMsg(e.target.value)}
                            className="input-dark h-36 resize-none text-xs font-mono"
                            placeholder="Type your broadcast message..."
                        />
                    </div>

                    {/* Schedule */}
                    <div>
                        <label className="text-xs font-medium text-white/50 block mb-2">Schedule (Optional)</label>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 flex-1 opacity-50 cursor-not-allowed">
                                <Clock className="w-3.5 h-3.5 text-white/30" />
                                <span className="text-xs text-white/60">Scheduled broadcasts coming soon...</span>
                            </div>
                        </div>
                    </div>

                    {/* Send */}
                    <button
                        onClick={handleSendBroadcast}
                        disabled={isSending}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Broadcast Now
                    </button>

                    <p className="text-[10px] text-white/30 text-center">
                        ⚠️ Only use approved WhatsApp message templates for broadcasts
                    </p>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                    {/* Phone preview */}
                    <div className="glass-card border border-white/5 p-5">
                        <h3 className="text-sm font-semibold mb-3 text-white/60">Preview</h3>
                        <div className="bg-[#0b1d14] rounded-xl p-4">
                            <div className="max-w-[80%] bg-[#1a2e1f] border border-[#25D366]/10 rounded-xl rounded-tl-none px-3 py-2">
                                <div className="flex items-center gap-1 mb-1">
                                    <Radio className="w-3 h-3 text-purple-400" />
                                    <span className="text-[9px] text-purple-400 font-semibold">Broadcast</span>
                                </div>
                                <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed">
                                    {msg.replace("{{name}}", "Rahul")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Past broadcasts */}
                    <div className="glass-card border border-white/5 p-5 max-h-[500px] overflow-y-auto">
                        <h3 className="font-bold font-[Outfit] mb-4">Past Broadcasts</h3>
                        <div className="space-y-3">
                            {isLoading ? (
                                <div className="flex flex-col items-center py-10 opacity-20">
                                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                    <span className="text-xs">Loading history...</span>
                                </div>
                            ) : broadcasts.length === 0 ? (
                                <div className="text-center py-10 opacity-30">
                                    <p className="text-xs italic">No past broadcasts found</p>
                                </div>
                            ) : (
                                broadcasts.map((b) => (
                                    <div key={b.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">{b.name}</span>
                                            <span className="text-[10px] text-white/30">{new Date(b.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs">
                                            <div className="flex items-center gap-1 text-white/40">
                                                <Users className="w-3 h-3" />
                                                {b.sentCount} sent
                                            </div>
                                            <div className="flex items-center gap-1 text-[#25D366]">
                                                <CheckCircle className="w-3 h-3" />
                                                {b.status}
                                            </div>
                                        </div>
                                        <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style={{ width: "100%" }} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

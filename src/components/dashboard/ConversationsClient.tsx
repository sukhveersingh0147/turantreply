"use client";

import { useState, useEffect } from "react";
import { Bot, Zap, RefreshCcw, Clock, ShieldAlert, Loader2, Send } from "lucide-react";
import { getConversationMessages, toggleAiPause } from "@/app/actions/conversations";

const statusColors: Record<string, string> = {
    NEW: "bg-blue-500/15 text-blue-400",
    Recovered: "bg-[#25D366]/15 text-[#25D366]",
    Converted: "bg-purple-500/15 text-purple-400",
    "Follow-up": "bg-orange-500/15 text-orange-400",
};

export default function ConversationsClient({ initialConversations }: { initialConversations: any[] }) {
    const [selected, setSelected] = useState<any>(initialConversations[0] || null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selected) {
            loadMessages(selected.id);
            // Polling for new messages every 5 seconds
            const interval = setInterval(() => loadMessages(selected.id, true), 5000);
            return () => clearInterval(interval);
        }
    }, [selected]);

    async function loadMessages(leadId: string, silent = false) {
        if (!silent) setLoading(true);
        try {
            const msgs = await getConversationMessages(leadId);
            setMessages(msgs);
        } catch (error) {
            console.error("Failed to load messages:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    }

    async function handleToggleAi() {
        if (!selected) return;
        try {
            const result = await toggleAiPause(selected.id, !selected.isAiPaused);
            setSelected({ ...selected, isAiPaused: result.isAiPaused });
        } catch (error) {
            alert("Failed to toggle AI status");
        }
    }

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="glass-card border border-white/5 overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]">
            {/* Conversation list */}
            <div className={`border-r border-white/5 flex flex-col flex-shrink-0 w-full md:w-72 ${selected ? "hidden md:flex" : "flex"}`}>
                <div className="p-3 border-b border-white/5">
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                        <Bot className="w-3.5 h-3.5 text-white/30" />
                        <input placeholder="Search..." className="bg-transparent text-xs text-white/60 outline-none flex-1 placeholder:text-white/30" />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1">
                    {initialConversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => setSelected(conv)}
                            className={`w-full p-3.5 flex items-start gap-3 border-b border-white/[0.04] text-left transition-colors ${selected?.id === conv.id ? "bg-[#25D366]/5 border-l-2 border-l-[#25D366]" : "hover:bg-white/[0.02]"
                                }`}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/10 flex items-center justify-center text-[10px] font-bold text-[#25D366] flex-shrink-0">
                                {conv.name.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold truncate">{conv.name}</span>
                                    <span className="text-[10px] text-white/30 flex-shrink-0">{getTimeAgo(conv.time)}</span>
                                </div>
                                <p className="text-[10px] text-white/40 truncate mt-0.5">{conv.lastMsg}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${statusColors[conv.status] ?? "bg-white/10 text-white/50"}`}>{conv.status}</span>
                                    {conv.unread > 0 && (
                                        <span className="text-[9px] font-bold bg-[#25D366] text-white w-4 h-4 rounded-full flex items-center justify-center">{conv.unread}</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                    {initialConversations.length === 0 && (
                        <div className="p-8 text-center text-white/20 text-xs">
                            No conversations yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat window */}
            <div className={`flex-1 flex flex-col min-w-0 ${selected ? "flex" : "hidden md:flex"}`}>
                {selected ? (
                    <>
                        {/* Chat header */}
                        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                            <button
                                className="md:hidden text-white/50 hover:text-white mr-1 p-1"
                                onClick={() => setSelected(null)}
                            >
                                ←
                            </button>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/10 flex items-center justify-center text-[10px] font-bold text-[#25D366]">
                                {selected.name.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                            <div>
                                <div className="text-sm font-semibold">{selected.name}</div>
                                <div className="text-[10px] text-white/40">{selected.phone}</div>
                            </div>
                            <div className="ml-auto flex items-center gap-3">
                                <button
                                    onClick={handleToggleAi}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${selected.isAiPaused
                                            ? "bg-orange-500/15 border-orange-500/20 text-orange-400"
                                            : "bg-[#25D366]/15 border-[#25D366]/20 text-[#25D366]"
                                        }`}
                                >
                                    {selected.isAiPaused ? <ShieldAlert className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                                    {selected.isAiPaused ? "AI PAUSED (Human Mode)" : "AI ACTIVE"}
                                </button>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[selected.status] ?? "bg-white/10 text-white/50"}`}>
                                    {selected.status}
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b1d14]/30">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <RefreshCcw className="w-6 h-6 text-[#25D366] animate-spin" />
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={msg.id || i} className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[70%] rounded-xl px-3 py-2 ${msg.sender === "customer"
                                            ? "bg-[#005c4b] text-white rounded-tr-none"
                                            : "bg-[#1a2e1f] text-white/90 rounded-tl-none border border-[#25D366]/10"
                                            }`}>
                                            {msg.sender === "ai" && msg.aiLabel && (
                                                <div className="flex items-center gap-1 mb-1">
                                                    {msg.aiLabel === "AI Reply" ? <Bot className="w-3 h-3 text-[#25D366]" /> : <Zap className="w-3 h-3 text-yellow-400" />}
                                                    <span className="text-[9px] text-[#25D366] font-semibold">{msg.aiLabel}</span>
                                                </div>
                                            )}
                                            <p className="text-xs leading-relaxed">{msg.msg}</p>
                                            <p className="text-[9px] text-white/30 mt-1 text-right">{formatTime(msg.time)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                            {messages.length === 0 && !loading && (
                                <div className="flex items-center justify-center h-full text-white/20 text-sm">
                                    No message history found.
                                </div>
                            )}
                        </div>

                        {/* Reply bar */}
                        <div className="p-3 border-t border-white/5">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                                <input
                                    placeholder="Type a reply or let AI handle it..."
                                    className="bg-transparent text-sm text-white/60 placeholder:text-white/30 outline-none flex-1"
                                />
                                <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-1.5 text-xs text-[#25D366] bg-[#25D366]/10 px-3 py-1.5 rounded-lg hover:bg-[#25D366]/20 transition-colors">
                                        <Bot className="w-3.5 h-3.5" />
                                        AI Reply
                                    </button>
                                    <button className="text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                        Send
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2 px-1">
                                <button className="flex items-center gap-1 text-[10px] text-white/30 hover:text-[#25D366] transition-colors">
                                    <RefreshCcw className="w-3 h-3" />
                                    Trigger Recovery
                                </button>
                                <button className="flex items-center gap-1 text-[10px] text-white/30 hover:text-orange-400 transition-colors">
                                    <Clock className="w-3 h-3" />
                                    Schedule Follow-up
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/20 p-8 text-center">
                        <MessageCircle className="w-12 h-12 mb-4 opacity-10" />
                        <h3 className="font-bold text-lg mb-1">No conversation selected</h3>
                        <p className="text-xs max-w-xs">Select a lead from the left to view the message history and automation status.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function MessageCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
    )
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Zap, RefreshCcw, Clock, ShieldAlert, Loader2, Send, ChevronLeft, Check, CheckCheck, ThumbsUp, XCircle, BrainCircuit } from "lucide-react";
import { getConversationMessages, toggleAiPause, handleSuggestion } from "@/app/actions/conversations";

const stageColors: Record<string, string> = {
    NEW: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    HOT: "bg-red-500/15 text-red-400 border-red-500/20",
    CUSTOMER: "bg-[#25D366]/15 text-[#25D366] border-[#25D366]/20",
    FOLLOW_UP: "bg-orange-500/15 text-orange-400 border-orange-500/20",
};

export default function ConversationsClient({ initialConversations }: { initialConversations: any[] }) {
    const [conversations, setConversations] = useState(initialConversations);
    const [selected, setSelected] = useState<any>(initialConversations[0] || null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (selected) {
            loadMessages(selected.id);
            const interval = setInterval(() => loadMessages(selected.id, true), 5000);
            return () => clearInterval(interval);
        }
    }, [selected]);

    useEffect(() => {
        scrollToBottom(messages.length <= 10 ? "auto" : "smooth");
    }, [messages]);

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
            const updated = { ...selected, isAiPaused: result.isAiPaused };
            setSelected(updated);
            setConversations(conversations.map(c => c.id === selected.id ? updated : c));
        } catch (error) {
            alert("Failed to toggle AI status");
        }
    }

    async function onApproveSuggestion(suggestionId: string, content: string) {
        try {
            await handleSuggestion(suggestionId, "APPROVED", content);
            setReplyText(content);
            // In a real app, this might auto-send
            const updatedSelected = {
                ...selected,
                suggestions: selected.suggestions.filter((s: any) => s.id !== suggestionId)
            };
            setSelected(updatedSelected);
            setConversations(conversations.map(c => c.id === selected.id ? updatedSelected : c));
        } catch (error) {
            console.error("Failed to handle suggestion:", error);
        }
    }

    async function onIgnoreSuggestion(suggestionId: string) {
        try {
            await handleSuggestion(suggestionId, "IGNORED");
            const updatedSelected = {
                ...selected,
                suggestions: selected.suggestions.filter((s: any) => s.id !== suggestionId)
            };
            setSelected(updatedSelected);
            setConversations(conversations.map(c => c.id === selected.id ? updatedSelected : c));
        } catch (error) {
            console.error("Failed to ignore suggestion:", error);
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
        <div className="glass-card border border-white/5 overflow-hidden flex h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] min-h-[500px] mb-20 md:mb-0">
            {/* Conversation list */}
            <div className={`border-r border-white/5 flex flex-col flex-shrink-0 w-full md:w-80 lg:w-96 ${selected ? "hidden md:flex" : "flex"}`}>
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2 bg-black/20 border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-[#25D366]/40 transition-all">
                        <Search className="w-4 h-4 text-white/30" />
                        <input placeholder="Search conversations..." className="bg-transparent text-sm text-white/60 outline-none flex-1 placeholder:text-white/20" />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => setSelected(conv)}
                            className={`w-full p-4 flex items-start gap-3.5 border-b border-white/[0.04] text-left transition-all relative ${selected?.id === conv.id ? "bg-[#25D366]/5" : "hover:bg-white/[0.02]"
                                }`}
                        >
                            {selected?.id === conv.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#25D366]" />}
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/10 flex items-center justify-center text-sm font-bold text-[#25D366] flex-shrink-0 animate-pulse-subtle border border-[#25D366]/10">
                                {conv.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 py-0.5">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold truncate text-white/90">{conv.name}</span>
                                    <span className="text-[10px] text-white/20 font-medium">{getTimeAgo(conv.time)}</span>
                                </div>
                                <p className="text-xs text-white/40 truncate leading-snug">{conv.lastMsg}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${stageColors[conv.leadStage] ?? "bg-white/5 text-white/30 border-white/5"}`}>{conv.leadStage}</span>
                                    {conv.unread > 0 && (
                                        <span className="text-[10px] font-bold bg-[#25D366] text-black w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(37,211,102,0.3)]">{conv.unread}</span>
                                    )}
                                    {conv.suggestions?.length > 0 && (
                                        <div className="flex items-center gap-1 text-[#25D366]">
                                            <BrainCircuit className="w-3 h-3" />
                                            <span className="text-[9px] font-bold">DRAFT READY</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                    {conversations.length === 0 && (
                        <div className="p-12 text-center">
                            <MessageCircle className="w-12 h-12 text-white/5 mx-auto mb-4" />
                            <p className="text-white/20 text-sm font-medium">No conversations yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat window */}
            <div className={`flex-1 flex flex-col min-w-0 bg-[#070a0d] ${selected ? "flex" : "hidden md:flex"}`}>
                {selected ? (
                    <>
                        {/* Chat header */}
                        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3.5 bg-[#0a0f14]/80 backdrop-blur-xl z-10 shadow-lg">
                            <button
                                className="md:hidden text-white/40 hover:text-white p-2 -ml-2 transition-colors"
                                onClick={() => setSelected(null)}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/10 border border-[#25D366]/20 flex items-center justify-center text-xs font-black text-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.1)]">
                                {selected.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <div className="text-base font-black text-white truncate leading-tight">{selected.name}</div>
                                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none mt-1">{selected.phone}</div>
                            </div>
                            <div className="ml-auto flex items-center gap-3">
                                <div className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${stageColors[selected.leadStage]}`}>
                                    {selected.leadStage}
                                </div>
                                <button
                                    onClick={handleToggleAi}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${selected.isAiPaused
                                            ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                                            : "bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366]"
                                        }`}
                                >
                                    {selected.isAiPaused ? <ShieldAlert className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{selected.isAiPaused ? "AI PAUSED" : "AI ACTIVE"}</span>
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('/chat-bg.png')] bg-repeat opacity-95 custom-scrollbar">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="bg-[#25D366]/10 p-4 rounded-3xl border border-[#25D366]/20">
                                        <RefreshCcw className="w-8 h-8 text-[#25D366] animate-spin" />
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={msg.id || i} className={`flex ${msg.sender === "customer" ? "justify-start" : "justify-end"}`}>
                                        <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-2xl transition-all relative group ${msg.sender === "customer"
                                            ? "bg-[#1f2c33] text-white rounded-tl-none border border-white/5"
                                            : "bg-[#005c4b] text-white/95 rounded-tr-none border border-[#25D366]/20"
                                            }`}>
                                            {msg.aiLabel && (
                                                <div className="flex items-center gap-1.5 mb-2 border-b border-white/5 pb-1.5">
                                                    <Bot className="w-3.5 h-3.5 text-[#25D366]" />
                                                    <span className="text-[10px] text-[#25D366] font-black uppercase tracking-widest">{msg.aiLabel}</span>
                                                </div>
                                            )}
                                            <p className="text-[13px] sm:text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.msg}</p>
                                            <div className="flex items-center justify-end gap-1.5 mt-2">
                                                <p className="text-[9px] text-white/30 font-bold uppercase">{formatTime(msg.time)}</p>
                                                {msg.sender !== "customer" && <CheckCheck className="w-3.5 h-3.5 text-[#34b7f1]" />}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                            {messages.length === 0 && !loading && (
                                <div className="flex flex-col items-center justify-center h-full text-white/10 space-y-4">
                                    <MessageCircle className="w-16 h-16 opacity-5" />
                                    <p className="text-sm font-bold uppercase tracking-widest">Start the conversation</p>
                                </div>
                            )}
                        </div>

                        {/* AI Suggestions Panel */}
                        {selected.suggestions?.length > 0 && (
                            <div className="px-6 py-4 bg-[#0a0f14] border-t border-[#25D366]/20 animate-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg bg-[#25D366]/10">
                                        <BrainCircuit className="w-4 h-4 text-[#25D366]" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">Proactive Suggestions</span>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                    {selected.suggestions.map((suggestion: any) => (
                                        <div key={suggestion.id} className="min-w-[280px] bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col hover:border-[#25D366]/30 transition-all group">
                                            <p className="text-xs text-white/70 italic mb-3 line-clamp-3 leading-relaxed">"{suggestion.content}"</p>
                                            <div className="flex items-center gap-2 mt-auto">
                                                <button 
                                                    onClick={() => onApproveSuggestion(suggestion.id, suggestion.content)}
                                                    className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-black py-2 rounded-xl text-[10px] font-black transition-all border border-[#25D366]/20"
                                                >
                                                    USE DRAFT
                                                </button>
                                                <button 
                                                    onClick={() => onIgnoreSuggestion(suggestion.id)}
                                                    className="p-2 text-white/20 hover:text-red-400 transition-colors"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reply bar */}
                        <div className="p-4 sm:p-6 border-t border-white/5 bg-[#0a0f14]/95">
                            <div className="flex items-center gap-3 sm:gap-4 bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-2 sm:py-3 shadow-inner focus-within:border-[#25D366]/30 transition-all">
                                <textarea
                                    rows={1}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type a message..."
                                    className="bg-transparent text-sm text-white/90 placeholder:text-white/20 outline-none flex-1 py-1.5 resize-none max-h-32 custom-scrollbar"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            // handleSendMessage();
                                        }
                                    }}
                                />
                                <button className="p-2.5 sm:p-3 rounded-2xl bg-[#25D366] text-black hover:bg-[#128C7E] transition-all shadow-[0_5px_15px_rgba(37,211,102,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mt-4 px-2">
                                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-[#25D366] transition-colors group">
                                    <RefreshCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                                    Regenerate Response
                                </button>
                                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-orange-400 transition-colors">
                                    <Clock className="w-3.5 h-3.5" />
                                    Schedule
                                </button>
                                <div className="ml-auto flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">System Live</span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/20 p-12 text-center bg-[#070a0d]">
                        <div className="w-24 h-24 rounded-full bg-white/[0.02] flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                            <MessageCircle className="w-10 h-10 opacity-10" />
                        </div>
                        <h3 className="font-black text-2xl text-white/40 mb-3 font-[Outfit] tracking-tight">Select a conversation</h3>
                        <p className="text-xs max-w-xs leading-relaxed text-white/20 font-medium italic">"Real-time customer engagement powered by the TurantReply AI Engine."</p>
                    </div>
                )}
            </div>

            {/* Lead Details Sidebar (Desktop Only) */}
            {selected && (
                <div className="hidden lg:flex w-80 border-l border-white/5 flex-col bg-[#0a0f14]/50 backdrop-blur-md animate-in slide-in-from-right-4 duration-300">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Customer Intel</h3>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-purple-500/20 to-blue-500/10 border border-white/10 flex items-center justify-center text-2xl font-black text-white/90 mb-4 shadow-2xl">
                                {selected.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                            </div>
                            <h2 className="text-lg font-black text-white leading-tight">{selected.name}</h2>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{selected.phone}</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {/* Journey Summary */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Lead Journey</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                                <div>
                                    <div className="text-[8px] font-black text-white/20 uppercase mb-1">Current Stage</div>
                                    <div className={`inline-block px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${stageColors[selected.leadStage]}`}>
                                        {selected.leadStage}
                                    </div>
                                </div>
                                {selected.extractedInterest && (
                                    <div>
                                        <div className="text-[8px] font-black text-white/20 uppercase mb-1">Interest</div>
                                        <div className="text-xs font-medium text-white/70 leading-relaxed">{selected.extractedInterest}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity / Context */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">System Context</span>
                            </div>
                            <div className="space-y-2">
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] mt-1.5" />
                                    <div>
                                        <div className="text-[9px] font-black text-white/90 uppercase">Lead Created</div>
                                        <div className="text-[8px] text-white/20 mt-0.5">{new Date(selected.createdAt || Date.now()).toLocaleString()}</div>
                                    </div>
                                </div>
                                {selected.isAiPaused && (
                                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-3">
                                        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                                        <div>
                                            <div className="text-[9px] font-black text-red-400 uppercase">AI Manually Paused</div>
                                            <div className="text-[8px] text-red-400/40 mt-0.5">Human agent handling now</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 space-y-3">
                            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all">
                                View Full Lead Profile
                            </button>
                            <button className="w-full py-3 rounded-xl border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/5 transition-all">
                                Blacklist Number
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Search(props: any) {
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
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
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

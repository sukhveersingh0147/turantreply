"use client";

import React, { useState } from "react";
import { 
    Clock, 
    MoreHorizontal, 
    CheckCircle, 
    Play, 
    MessageCircle, 
    Eye,
    Bot,
    ExternalLink,
    AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface QueryCardProps {
    query: any;
    onResolve: (leadId: string) => void;
    onResumeAi: (leadId: string) => void;
    onReply: (query: any) => void;
}

export function QueryCard({
    query,
    onResolve,
    onResumeAi,
    onReply
}: QueryCardProps) {
    const [isResolving, setIsResolving] = useState(false);
    const [isResuming, setIsResuming] = useState(false);

    const handleResolve = async () => {
        setIsResolving(true);
        await onResolve(query.leadId);
        setIsResolving(false);
    };

    const handleResumeAi = async () => {
        setIsResuming(true);
        await onResumeAi(query.leadId);
        setIsResuming(false);
    };

    const getScoreBadge = (score: number) => {
        if (score > 70) return { label: "Hot", icon: "🔥", color: "bg-red-500/10 text-red-400 border-red-500/20" };
        if (score > 40) return { label: "Warm", icon: "⚡", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
        return { label: "Cold", icon: "🌱", color: "bg-stone-500/10 text-stone-400 border-stone-500/20" };
    };

    const getStatusPill = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]";
            case "PAUSED": return "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]";
            case "RESOLVED": return "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]";
            default: return "bg-white/5 text-white/40 border-white/10";
        }
    };

    const score = getScoreBadge(query.score);

    return (
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-bottom-4 duration-500 mb-4">
            {/* Top Bar */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#25D366]/20 to-transparent border border-white/10 flex items-center justify-center text-white font-black text-lg shadow-inner">
                        {query.leadName[0].toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">{query.leadName}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-black uppercase tracking-tighter ${score.color}`}>
                                {score.icon} {score.label}
                            </span>
                        </div>
                        <p className="text-[11px] text-white/30 font-medium">{query.phone}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full border font-black uppercase tracking-widest ${getStatusPill(query.status)}`}>
                            {query.status}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5 text-white/20">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-bold">
                                {formatDistanceToNow(new Date(query.lastInteraction), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6">
                {/* Last Message Bubble */}
                <div className="mb-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-[#1c1c1c] border border-white/10 p-4 rounded-xl rounded-tl-none max-w-[85%] relative shadow-lg">
                            <div className="absolute -left-2 top-0 w-0 h-0 border-t-[8px] border-t-[#1c1c1c] border-l-[8px] border-l-transparent" />
                            <p className="text-[13px] text-white/80 leading-relaxed whitespace-pre-wrap line-clamp-3">
                                {query.lastCustomerMessage?.message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Attempt Context */}
                {query.lastAiAttempt && (
                    <div className="mb-4 p-3 bg-white/[0.02] border border-dashed border-white/10 rounded-xl flex items-start gap-3">
                        <Bot className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-[#25D366] uppercase tracking-widest mb-1 leading-none">AI ne try kiya:</p>
                            <p className="text-[11px] text-white/40 italic leading-snug truncate">
                                "{query.lastAiAttempt}"
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onReply(query)}
                        className="h-10 px-4 rounded-xl bg-[#25D366] text-black text-xs font-black shadow-[0_4px_12px_rgba(37,211,102,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Reply on WhatsApp
                    </button>
                    
                    <button 
                        onClick={handleResolve}
                        disabled={isResolving || query.status === "RESOLVED"}
                        className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-bold hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isResolving ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CheckCircle className={`w-4 h-4 ${query.status === "RESOLVED" ? "text-green-500" : ""}`} />
                        )}
                        Mark Resolved
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {query.isAiPaused && (
                        <button 
                            onClick={() => onResumeAi(query.leadId)}
                            className="h-10 px-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-all flex items-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Resume AI
                        </button>
                    )}
                    
                    <a 
                        href={`/dashboard/conversations?leadId=${query.leadId}`}
                        target="_blank"
                        className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all flex items-center justify-center group/view"
                        title="View Conversation"
                    >
                        <Eye className="w-4 h-4 group-hover/view:scale-110 transition-transform" />
                    </a>
                </div>
            </div>
        </div>
    );
}

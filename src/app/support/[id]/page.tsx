"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { LifeBuoy, Send, ArrowLeft, Loader2, User, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import { getTicketDetails, sendUserMessage } from "@/app/actions/support";
import { toast } from "sonner";

export default function TicketDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadTicket();
    }, [id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [ticket?.messages]);

    const loadTicket = async () => {
        try {
            const data = await getTicketDetails(id);
            setTicket(data);
        } catch (error) {
            console.error("Error loading ticket:", error);
            toast.error("Failed to load ticket");
            router.push("/support");
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || sending) return;

        setSending(true);
        try {
            const result = await sendUserMessage(id, message.trim());
            if (result.success) {
                setMessage("");
                loadTicket();
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-[#25D366] animate-spin" />
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                    <Link href="/support" className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold font-[Outfit] text-white/90">{ticket.subject}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                ticket.status === "OPEN" ? "bg-[#25D366]/15 text-[#25D366]" : "bg-white/10 text-white/40"
                            }`}>
                                {ticket.status}
                            </span>
                            <span className="text-[10px] text-white/30 truncate max-w-[150px]">Ticket ID: #{ticket.id.substring(0, 8)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar py-4"
            >
                {ticket.messages.map((msg: any) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className={`flex gap-3 max-w-[85%] ${msg.isAdmin ? "flex-row" : "flex-row-reverse"}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/5 ${
                                msg.isAdmin ? "bg-blue-500/10 text-blue-400" : "bg-[#25D366]/10 text-[#25D366]"
                            }`}>
                                {msg.isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                            <div className="space-y-1">
                                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                    msg.isAdmin 
                                        ? "bg-white/5 border border-white/5 text-white/80 rounded-tl-none" 
                                        : "bg-[#25D366] text-black font-medium border border-[#25D366]/20 rounded-tr-none shadow-[0_0_20px_rgba(37,211,102,0.1)]"
                                }`}>
                                    {msg.content}
                                </div>
                                <div className={`flex items-center gap-2 px-1 ${msg.isAdmin ? "justify-start" : "justify-end"}`}>
                                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                                        {msg.isAdmin ? "Support Agent" : "You"}
                                    </span>
                                    <span className="text-[9px] text-white/20">•</span>
                                    <span className="text-[9px] text-white/20">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            {ticket.status !== "CLOSED" && (
                <form 
                    onSubmit={handleSendMessage}
                    className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl shadow-2xl relative group"
                >
                    <div className="flex items-end gap-3">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Type your message here..."
                            className="flex-1 bg-transparent border-none focus:ring-0 outline-none p-1 text-sm text-white/80 placeholder:text-white/20 min-h-[44px] max-h-[120px] resize-none"
                        />
                        <button
                            type="submit"
                            disabled={!message.trim() || sending}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                message.trim() && !sending 
                                    ? "bg-[#25D366] text-black shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:scale-105 active:scale-95" 
                                    : "bg-white/5 text-white/20"
                            }`}
                        >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                    
                    {/* Character limit or helper text */}
                    <div className="mt-2 flex items-center justify-between px-1">
                        <span className="text-[9px] text-white/10 font-bold uppercase tracking-widest">
                            Press Enter to send, Shift + Enter for new line
                        </span>
                    </div>
                </form>
            )}
            
            {ticket.status === "CLOSED" && (
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-center">
                    <p className="text-xs text-red-500/60 font-medium">This ticket has been closed. If you still need help, please create a new ticket.</p>
                </div>
            )}
        </div>
    );
}

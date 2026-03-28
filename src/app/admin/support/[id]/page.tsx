"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { LifeBuoy, Send, ArrowLeft, Loader2, User, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { getTicketDetails, sendAdminReply, closeTicket } from "@/app/actions/support";
import { toast } from "sonner";

export default function AdminTicketDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState("");
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
            router.push("/admin/support");
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || sending) return;

        setSending(true);
        try {
            await sendAdminReply(id, reply.trim());
            setReply("");
            loadTicket();
            toast.success("Reply sent");
        } catch (error) {
            console.error("Error sending reply:", error);
            toast.error("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    const handleCloseTicket = async () => {
        try {
            await closeTicket(id);
            toast.success("Ticket closed");
            loadTicket();
        } catch (error) {
            console.error("Error closing ticket:", error);
            toast.error("Failed to close ticket");
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
        <div className="max-w-6xl mx-auto space-y-6 flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-6">
                    <Link href="/admin/support" className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black font-[Outfit] text-white/90">{ticket.subject}</h1>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                ticket.status === "OPEN" ? "bg-[#25D366]/15 text-[#25D366]" : "bg-white/10 text-white/40"
                            }`}>
                                {ticket.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-white/40">
                                <User className="w-3.5 h-3.5 text-[#25D366]" />
                                <span className="font-bold underline">{ticket.user.name}</span>
                                <span>({ticket.user.email})</span>
                            </div>
                            <span className="text-white/10">|</span>
                            <span className="text-[10px] text-white/20 font-black tracking-widest uppercase">ID: {ticket.id}</span>
                        </div>
                    </div>
                </div>

                {ticket.status === "OPEN" && (
                    <button
                        onClick={handleCloseTicket}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-sm hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                    >
                        <XCircle className="w-4 h-4" />
                        Close Ticket
                    </button>
                )}
                {ticket.status === "CLOSED" && (
                     <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 text-white/40 border border-white/10 font-bold text-sm opacity-50">
                        <CheckCircle2 className="w-4 h-4" />
                        Resolved
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Chat Section */}
                <div className="lg:col-span-3 flex flex-col h-full space-y-4">
                    <div 
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar py-4"
                    >
                        {ticket.messages.map((msg: any) => (
                            <div 
                                key={msg.id} 
                                className={`flex ${!msg.isAdmin ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div className={`flex gap-3 max-w-[85%] ${!msg.isAdmin ? "flex-row" : "flex-row-reverse"}`}>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 ${
                                        msg.isAdmin ? "bg-blue-500/10 text-blue-400" : "bg-[#25D366]/10 text-[#25D366]"
                                    }`}>
                                        {msg.isAdmin ? <ShieldCheck className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className={`px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed shadow-xl ${
                                            !msg.isAdmin 
                                                ? "bg-white/5 border border-white/5 text-white/80 rounded-tl-none" 
                                                : "bg-blue-600 text-white font-medium border border-blue-500/20 rounded-tr-none"
                                        }`}>
                                            {msg.content}
                                        </div>
                                        <div className={`flex items-center gap-2 px-1 ${!msg.isAdmin ? "justify-start" : "justify-end"}`}>
                                            <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">
                                                {msg.isAdmin ? "Admin (You)" : ticket.user.name}
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

                    {/* Input Section */}
                    {ticket.status !== "CLOSED" && (
                        <form 
                            onSubmit={handleSendReply}
                            className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl shadow-2xl relative"
                        >
                            <div className="flex items-end gap-3">
                                <textarea
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendReply(e);
                                        }
                                    }}
                                    placeholder="Type your reply to the user..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none p-1 text-sm text-white/80 placeholder:text-white/20 min-h-[44px] max-h-[120px] resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!reply.trim() || sending}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                        reply.trim() && !sending 
                                            ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95 px-8 aspect-auto uppercase font-black text-xs" 
                                            : "bg-white/5 text-white/20"
                                    }`}
                                >
                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Send Reply</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Sidebar Stats / Info */}
                <div className="hidden lg:block space-y-6">
                    <div className="glass-card border border-white/5 p-5 space-y-4">
                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Customer Profile</h4>
                        <div className="space-y-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/30 font-bold uppercase mb-1">Full Name</span>
                                <span className="text-sm text-white/80 font-medium">{ticket.user.name}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/30 font-bold uppercase mb-1">Email Address</span>
                                <span className="text-sm text-white/80 font-medium">{ticket.user.email}</span>
                            </div>
                            <div className="pt-2">
                                <button className="w-full py-2 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black uppercase text-white/40 hover:text-white hover:bg-white/10 transition-all tracking-widest">
                                    View Full User Logs
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card border border-white/5 p-5 space-y-4">
                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Ticket Stats</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/30 font-bold uppercase">Messages</span>
                                <span className="text-xs text-white/80 font-medium">{ticket.messages.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/30 font-bold uppercase">Created</span>
                                <span className="text-xs text-white/80 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/30 font-bold uppercase">Status</span>
                                <span className="text-[10px] font-black text-[#25D366] uppercase">{ticket.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

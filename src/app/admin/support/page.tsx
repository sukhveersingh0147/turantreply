"use client";

import React, { useState, useEffect } from "react";
import { LifeBuoy, Search, Filter, MessageCircle, Clock, User, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getAllSupportTickets } from "@/app/actions/support";
import { toast } from "sonner";

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const data = await getAllSupportTickets();
            setTickets(data);
        } catch (error) {
            console.error("Error loading tickets:", error);
            toast.error("Failed to load tickets");
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = 
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
            ticket.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black font-[Outfit] tracking-tight">Support Management</h1>
                <p className="text-sm text-white/40 mt-1">Manage user support requests and provide assistance.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by subject, name or email..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-[#25D366] outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {["ALL", "OPEN", "CLOSED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                                statusFilter === status 
                                    ? "bg-[#25D366] text-black border-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.2)]" 
                                    : "bg-white/5 text-white/40 border-white/5 hover:border-white/10"
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#25D366] animate-spin" />
                </div>
            ) : filteredTickets.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredTickets.map((ticket) => (
                        <Link
                            key={ticket.id}
                            href={`/admin/support/${ticket.id}`}
                            className="glass-card border border-white/5 p-6 hover:bg-white/[0.03] transition-all group relative overflow-hidden"
                        >
                            {/* Status Accent */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                ticket.status === "OPEN" ? "bg-[#25D366]" : "bg-white/10"
                            }`} />

                            <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-6 flex-1">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 flex-shrink-0 ${
                                        ticket.status === "OPEN" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-white/5 text-white/20"
                                    }`}>
                                        <LifeBuoy className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg text-white/90 group-hover:text-[#25D366] transition-colors truncate">
                                                {ticket.subject}
                                            </h3>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                                ticket.status === "OPEN" ? "bg-[#25D366]/15 text-[#25D366]" : "bg-white/10 text-white/40"
                                            }`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs">
                                            <div className="flex items-center gap-1.5 text-white/40">
                                                <User className="w-3.5 h-3.5" />
                                                <span className="font-medium">{ticket.user.name || "Unknown"}</span>
                                                <span className="text-white/10">({ticket.user.email})</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-white/40">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>Updated {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {ticket.messages?.[0] && (
                                        <div className="hidden lg:block text-right">
                                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">Last Message</p>
                                            <p className="text-xs text-white/60 line-clamp-1 max-w-[200px] italic">
                                                "{ticket.messages[0].content}"
                                            </p>
                                        </div>
                                    )}
                                    <ArrowRight className="w-6 h-6 text-white/10 group-hover:text-[#25D366] group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center glass-card border-dashed border-white/10 bg-white/5 rounded-3xl">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <MessageCircle className="w-8 h-8 text-white/10" />
                    </div>
                    <p className="text-sm text-white/30 italic font-medium">No pending support tickets found.</p>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { LifeBuoy, Plus, MessageCircle, Clock, CheckCircle2, AlertCircle, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getSupportTickets, createSupportTicket } from "@/app/actions/support";
import { toast } from "sonner";

export default function SupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ subject: "", message: "" });

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const data = await getSupportTickets();
            setTickets(data);
        } catch (error) {
            console.error("Error loading tickets:", error);
            toast.error("Failed to load tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject || !formData.message) return;

        setSubmitting(true);
        try {
            await createSupportTicket(formData.subject, formData.message);
            toast.success("Ticket created successfully");
            setShowCreateModal(false);
            setFormData({ subject: "", message: "" });
            loadTickets();
        } catch (error) {
            console.error("Error creating ticket:", error);
            toast.error("Failed to create ticket");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/overview" className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black font-[Outfit]">Contact Support</h1>
                        <p className="text-sm text-white/40 mt-1">Need help? Create a ticket and our team will get back to you.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#25D366] text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all"
                >
                    <Plus className="w-4 h-4" />
                    New Ticket
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#25D366] animate-spin" />
                </div>
            ) : tickets.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {tickets.map((ticket) => (
                        <Link
                            key={ticket.id}
                            href={`/support/${ticket.id}`}
                            className="glass-card border border-white/5 p-5 hover:bg-white/[0.03] transition-all group"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 ${
                                        ticket.status === "OPEN" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-white/5 text-white/20"
                                    }`}>
                                        <LifeBuoy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white/90 group-hover:text-[#25D366] transition-colors">{ticket.subject}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] text-white/30 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(ticket.updatedAt).toLocaleDateString()}
                                            </span>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                                ticket.status === "OPEN" ? "bg-[#25D366]/15 text-[#25D366]" : "bg-white/10 text-white/40"
                                            }`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-[#25D366] group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center glass-card border-dashed border-white/10 bg-white/5 rounded-3xl">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <MessageCircle className="w-8 h-8 text-white/10" />
                    </div>
                    <p className="text-sm text-white/30 italic font-medium">No support tickets found.</p>
                </div>
            )}

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card border border-white/10 w-full max-w-lg p-6 sm:p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black font-[Outfit]">Create New Ticket</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Subject</label>
                                <input
                                    autoFocus
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#25D366] outline-none transition-all"
                                    placeholder="Briefly describe the issue..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#25D366] outline-none transition-all min-h-[150px]"
                                    placeholder="Provide more details..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !formData.subject || !formData.message}
                                className="w-full py-3.5 rounded-xl bg-[#25D366] text-black font-black text-sm hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Ticket"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

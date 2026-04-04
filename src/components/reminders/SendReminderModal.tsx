"use client";

import React, { useState, useEffect } from "react";
import { X, Send, MessageCircle, ExternalLink, Info } from "lucide-react";

interface SendReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    reminder: any;
    onConfirm: (id: string, message: string) => void;
}

function fillTemplate(template: string, data: Record<string, string>): string {
    return Object.entries(data).reduce(
        (msg, [key, val]) => msg.replace(new RegExp(`\\[${key}\\]`, 'g'), val || ""),
        template
    );
}

export function SendReminderModal({
    isOpen,
    onClose,
    reminder,
    onConfirm
}: SendReminderModalProps) {
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (isOpen && reminder) {
            const data = {
                Name: reminder.customerName || "Customer",
                Date: reminder.metadata?.date || "",
                Time: reminder.metadata?.time || "",
                Service: reminder.metadata?.service || "Service"
            };
            setMessage(fillTemplate(reminder.message, data));
        }
    }, [isOpen, reminder]);

    if (!isOpen || !reminder) return null;

    const handleSend = () => {
        const encodedMsg = encodeURIComponent(message);
        const waUrl = `https://wa.me/${reminder.phone}?text=${encodedMsg}`;
        window.open(waUrl, "_blank");
        
        onConfirm(reminder.id, message);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-white">Reminder Bhejein?</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Receiver Info */}
                    <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-0.5">To Customer</p>
                            <p className="text-sm font-bold text-white">{reminder.customerName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-0.5">Phone</p>
                            <p className="text-sm font-bold text-white/60">{reminder.phone}</p>
                        </div>
                    </div>

                    {/* Message Textarea */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between px-1 mb-2">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Message Preview (Editable)</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-400/5 px-2 py-0.5 rounded-full">
                                <Info className="w-3 h-3" />
                                Variables auto-filled
                            </div>
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#25D366]/50 focus:bg-[#25D366]/5 transition-all resize-none font-medium leading-relaxed"
                        />
                    </div>

                    {/* Info Alert */}
                    <div className="mb-8 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3 text-[11px] text-white/40 leading-relaxed font-medium">
                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        "Confirm" karne pe WhatsApp khul jayega. Bhejne ke baad yeh reminder History tab mein chala jayega.
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-xl bg-white/5 text-white/60 text-sm font-bold hover:bg-white/10 hover:text-white transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={!message.trim()}
                            className="flex-[2] px-6 py-4 rounded-xl bg-[#25D366] text-black text-sm font-black disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,211,102,0.2)]"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Send via WhatsApp →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { X, Send, MessageCircle, ExternalLink } from "lucide-react";

interface ReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    query: any;
    businessType?: string;
    onResolve: (leadId: string) => void;
}

const quickReplies: Record<string, string[]> = {
    salon: [
        "Slot available hai! Kab aana chahenge? 📅",
        "Yeh service ₹[price] mein available hai.",
        "Aaj full booked hain — kal ke liye book karein?",
        "Appointment ke liye naam aur preferred time batayein.",
    ],
    gym: [
        "Free trial book karein — kab available hain? 💪",
        "Membership plans: Monthly ₹1500, Quarterly ₹3999",
        "Aaj evening slot available hai — aayenge?",
        "Personal trainer ke liye alag package hai.",
    ],
    coaching: [
        "FREE demo class available hai! Kab suit karta hai? 📚",
        "Fee structure bhej raha/rahi hun abhi.",
        "Batch timing: [time] — interested hain?",
        "Admission ke liye naam aur class batayein.",
    ],
    realestate: [
        "Budget aur location preference batayein — best options bhejta hun 🏠",
        "Is property ki site visit book karein?",
        "Naya listing aaya hai — details bhejun?",
        "Agent se directly baat karein: [phone]",
    ],
    restaurant: [
        "Table available hai! Date aur guests batayein 🍽️",
        "Aaj ka special: [dish] — interested?",
        "Reservation confirm karte hain — kab aana hai?",
        "Catering ke liye minimum 20 log chahiye.",
    ],
    other: [
        "Zaroor! Thoda aur detail batayein. 😊",
        "Main abhi check karta/karti hun.",
        "Haan available hai — kab chahiye?",
        "Appointment book karein — Reply BOOK",
    ]
};

export function ReplyModal({
    isOpen,
    onClose,
    query,
    businessType = "other",
    onResolve
}: ReplyModalProps) {
    const [message, setMessage] = useState("");
    const [templates, setTemplates] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            const vertical = businessType?.toLowerCase() || "other";
            setTemplates(quickReplies[vertical] || quickReplies.other);
            setMessage("");
        }
    }, [isOpen, businessType]);

    if (!isOpen || !query) return null;

    const handleSend = () => {
        const encodedMsg = encodeURIComponent(message);
        const waUrl = `https://wa.me/${query.phone}?text=${encodedMsg}`;
        window.open(waUrl, "_blank");
        
        // Auto mark as resolved
        onResolve(query.leadId);
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
                        <h3 className="text-lg font-black text-white">WhatsApp pe Reply Karein</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Customer Message */}
                    <div className="mb-6">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 px-1">Customer ka Message</p>
                        <div className="bg-[#1c1c1c] border border-white/10 rounded-xl rounded-tl-none p-4 text-white text-[13px] relative">
                            <div className="absolute -left-2 top-0 w-0 h-0 border-t-[8px] border-t-[#1c1c1c] border-l-[8px] border-l-transparent" />
                            {query.lastCustomerMessage?.message}
                        </div>
                    </div>

                    {/* Quick Replies */}
                    <div className="mb-6">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 px-1">Quick Templates</p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {templates.map((tpl, i) => (
                                <button
                                    key={i}
                                    onClick={() => setMessage(tpl)}
                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/60 hover:text-white hover:bg-[#25D366]/10 hover:border-[#25D366]/30 transition-all whitespace-nowrap"
                                >
                                    {tpl}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Textarea */}
                    <div className="mb-6">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#25D366]/50 focus:bg-[#25D366]/5 transition-all resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl bg-white/5 text-white/60 text-sm font-bold hover:bg-white/10 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={!message.trim()}
                            className="flex-[2] px-6 py-3 rounded-xl bg-[#25D366] text-black text-sm font-black disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

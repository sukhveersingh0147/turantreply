"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
    Trash2,
    Mail,
    MessageSquare,
    User,
    Building2,
    Calendar,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { deleteInquiry } from "@/app/actions/marketing";

export default function InquiryList({ initialInquiries }: { initialInquiries: any[] }) {
    const [inquiries, setInquiries] = useState(initialInquiries);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this inquiry?")) return;

        const result = await deleteInquiry(id);
        if (result.success) {
            toast.success("Inquiry deleted");
            setInquiries(prev => prev.filter(i => i.id !== id));
        } else {
            toast.error(result.error || "Failed to delete");
        }
    };

    if (inquiries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-white/30 border border-dashed border-white/10 rounded-2xl">
                <Mail className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">No inquiries found yet.</p>
                <p className="text-sm">Messages from the contact form will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {inquiries.map((inquiry) => (
                <div
                    key={inquiry.id}
                    className="glass-card border border-white/5 overflow-hidden transition-all duration-300"
                >
                    <div
                        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                        onClick={() => toggleExpand(inquiry.id)}
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-[#25D366]" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-white text-sm sm:text-base truncate">
                                    {inquiry.subject}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40 mt-0.5">
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {inquiry.name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {inquiry.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(inquiry.createdAt), "MMM d, HH:mm")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 ml-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(inquiry.id);
                                }}
                                className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                                <Trash2 className="w-4.5 h-4.5" />
                            </button>
                            {expandedIds.includes(inquiry.id) ? (
                                <ChevronUp className="w-5 h-5 text-white/20" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-white/20" />
                            )}
                        </div>
                    </div>

                    {expandedIds.includes(inquiry.id) && (
                        <div className="px-4 pb-5 pt-0 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                            <div className="mt-4 space-y-4">
                                {inquiry.companyName && (
                                    <div className="flex items-start gap-2">
                                        <Building2 className="w-4 h-4 text-white/30 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Company</p>
                                            <p className="text-sm text-white/70">{inquiry.companyName}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 text-[#25D366] mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Message</p>
                                        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                                            {inquiry.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

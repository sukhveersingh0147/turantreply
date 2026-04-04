"use client";

import React, { useState } from "react";
import { 
    Clock, 
    Send, 
    Trash2, 
    Edit3, 
    Calendar, 
    RefreshCw, 
    CreditCard, 
    AlertTriangle, 
    ExternalLink,
    CheckCircle2
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface ReminderCardProps {
    reminder: any;
    onSend: (reminder: any) => void;
    onSkip: (id: string) => void;
    onEdit: (reminder: any) => void;
    isHistory?: boolean;
}

export function ReminderCard({
    reminder,
    onSend,
    onSkip,
    onEdit,
    isHistory = false
}: ReminderCardProps) {
    const [isSkipping, setIsSkipping] = useState(false);

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "APPOINTMENT": return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: Calendar };
            case "FOLLOWUP":    return { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20",    icon: RefreshCw };
            case "PAYMENT":     return { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   icon: CreditCard };
            case "EXPIRY":      return { bg: "bg-orange-500/10",  text: "text-orange-400",  border: "border-orange-500/20",  icon: AlertTriangle };
            default:            return { bg: "bg-purple-500/10",  text: "text-purple-400",  border: "border-purple-500/20",  icon: Send };
        }
    };

    const styles = getTypeStyles(reminder.type);

    return (
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-bottom-4 duration-500 mb-4">
            <div className="p-5 flex flex-col md:flex-row md:items-center gap-6">
                {/* Left side: Icon & Info */}
                <div className="flex items-center gap-4 md:w-1/4">
                    <div className={`w-12 h-12 rounded-xl border ${styles.border} ${styles.bg} flex items-center justify-center text-xl shrink-0`}>
                        <styles.icon className={`w-6 h-6 ${styles.text}`} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm truncate">{reminder.customerName}</h4>
                        <p className="text-[11px] text-white/30 font-medium">{reminder.phone}</p>
                    </div>
                </div>

                {/* Middle: Message & Time */}
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white/70 line-clamp-2 mb-2 leading-relaxed">
                        {reminder.message}
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-white/20">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold">
                                {format(new Date(reminder.scheduledAt), 'dd MMM, p')}
                            </span>
                        </div>
                        <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                             {reminder.sourceType}
                        </div>
                    </div>
                </div>

                {/* Right side: Actions */}
                <div className="flex items-center justify-end gap-2 md:w-1/4">
                    {!isHistory ? (
                        <>
                            {isSkipping ? (
                                <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
                                    <button 
                                        onClick={() => { onSkip(reminder.id); setIsSkipping(false); }}
                                        className="h-9 px-4 rounded-xl bg-red-500/10 text-red-400 text-[11px] font-black hover:bg-red-500/20 transition-all"
                                    >
                                        Yes, Skip
                                    </button>
                                    <button 
                                        onClick={() => setIsSkipping(false)}
                                        className="h-9 px-4 rounded-xl bg-white/5 text-white/60 text-[11px] font-bold hover:text-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => onSend(reminder)}
                                        className="h-10 px-4 rounded-xl bg-[#25D366] text-black text-xs font-black shadow-[0_4px_12px_rgba(37,211,102,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        <Send className="w-3.5 h-3.5 fill-current" />
                                        Send Now
                                    </button>
                                    <button 
                                        onClick={() => onEdit(reminder)}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setIsSkipping(true)}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/20 hover:text-red-400 hover:bg-red-400/5 transition-all group/trash"
                                    >
                                        <Trash2 className="w-4 h-4 group-hover/trash:scale-110" />
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className={`px-4 py-1.5 rounded-xl border flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${
                            reminder.status === "SENT" 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-white/5 text-white/40 border-white/10"
                        }`}>
                            {reminder.status === "SENT" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                            {reminder.status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

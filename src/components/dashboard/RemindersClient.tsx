"use client";

import React, { useState } from "react";
import { 
    Clock, 
    Bell, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight, 
    Calendar,
    MessageSquare,
    User,
    RefreshCw,
    X,
    Check
} from "lucide-react";
import { format } from "date-fns";

export default function RemindersClient({ initialReminders }: { initialReminders: any[] }) {
    const [reminders, setReminders] = useState(initialReminders);

    const getStatusColor = (type: string) => {
        switch (type) {
            case "APPOINTMENT": return "text-[#25D366] bg-[#25D366]/10 border-[#25D366]/20";
            case "FEEDBACK": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
            case "NUDGE": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
            default: return "text-white/40 bg-white/5 border-white/10";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-[Outfit] text-white tracking-tight">
                        Smart <span className="text-gradient">Reminders</span>
                    </h1>
                    <p className="text-white/40 mt-1 font-medium">
                        Automated WhatsApp messages scheduled for your customers.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {reminders.map((reminder) => (
                    <div key={reminder.id} className="glass-card border border-white/5 p-5 group hover:border-[#25D366]/20 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            {/* Time & Status */}
                            <div className="min-w-[140px]">
                                <div className="flex items-center gap-2 text-[#25D366] mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-bold tracking-tight">
                                        {format(new Date(reminder.time), "HH:mm, MMM d")}
                                    </span>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getStatusColor(reminder.type)}`}>
                                    {reminder.type}
                                </span>
                            </div>

                            {/* Customer */}
                            <div className="flex items-center gap-3 min-w-[200px]">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold text-white/30 border border-white/10 group-hover:border-[#25D366]/30 transition-colors">
                                    {reminder.customerName[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white leading-tight">{reminder.customerName}</div>
                                    <div className="text-[10px] text-white/30 font-medium">{reminder.customerPhone}</div>
                                </div>
                            </div>

                            {/* Message Context */}
                            <div className="flex-1">
                                <div className="flex items-start gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                                    <MessageSquare className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                                    <p className="text-xs text-white/60 leading-relaxed italic line-clamp-2">
                                        "{reminder.message}"
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all border border-white/10 hover:border-[#25D366]/20">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all border border-white/10 hover:border-red-400/20">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {reminders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
                        <Bell className="w-16 h-16 text-white/5 mb-6 animate-pulse" />
                        <h3 className="text-xl font-black text-white/40 tracking-tight">No active reminders</h3>
                        <p className="text-sm text-white/20 max-w-sm mx-auto mt-2 italic">
                            Automated reminders and follow-ups will appear here as they are scheduled by the AI.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

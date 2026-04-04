"use client";

import React from "react";
import { Clock, Calendar, CheckCircle, Bot } from "lucide-react";

interface ReminderStatsProps {
    stats: {
        dueToday: number;
        thisWeek: number;
        sentThisMonth: number;
        activeRules: number;
    };
}

export function ReminderStats({ stats }: ReminderStatsProps) {
    const items = [
        {
            label: "Due Today",
            value: stats.dueToday,
            subtext: "Aaj bhejne wale",
            icon: Clock,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20"
        },
        {
            label: "This Week",
            value: stats.thisWeek,
            subtext: "Scheduled reminders",
            icon: Calendar,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20"
        },
        {
            label: "Sent This Month",
            value: stats.sentThisMonth,
            subtext: "Successfully delivered",
            icon: CheckCircle,
            color: "text-green-400",
            bg: "bg-green-400/10",
            border: "border-green-400/20"
        },
        {
            label: "Auto Rules",
            value: stats.activeRules,
            subtext: "Automation active",
            icon: Bot,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
            border: "border-purple-400/20"
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {items.map((item, idx) => (
                <div 
                    key={idx}
                    className={`p-6 rounded-2xl border ${item.border} ${item.bg} backdrop-blur-sm shadow-lg group transition-all hover:scale-105`}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">
                                {item.label}
                            </p>
                            <h3 className={`text-3xl font-black ${item.color} mb-1 transition-transform group-hover:scale-110 origin-left`}>
                                {item.value}
                            </h3>
                            <p className="text-white/30 text-[11px] font-medium">
                                {item.subtext}
                            </p>
                        </div>
                        <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${item.color}`}>
                            <item.icon className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

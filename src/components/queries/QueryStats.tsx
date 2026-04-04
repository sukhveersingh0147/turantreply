"use client";

import React from "react";
import { HelpCircle, AlertCircle, CheckCircle } from "lucide-react";

interface QueryStatsProps {
    stats: {
        pendingCount: number;
        pausedCount: number;
        resolvedToday: number;
    };
}

export function QueryStats({ stats }: QueryStatsProps) {
    const statItems = [
        {
            icon: HelpCircle,
            label: "Pending Replies",
            value: stats.pendingCount,
            subtext: "Reply nahi hui queries",
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20"
        },
        {
            icon: AlertCircle,
            label: "AI Paused Leads",
            value: stats.pausedCount,
            subtext: "Human attention needed",
            color: "text-red-400",
            bg: "bg-red-400/10",
            border: "border-red-400/20"
        },
        {
            icon: CheckCircle,
            label: "Resolved Today",
            value: stats.resolvedToday,
            subtext: "Aaj handle ki gayi",
            color: "text-green-400",
            bg: "bg-green-400/10",
            border: "border-green-400/20"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {statItems.map((item, idx) => (
                <div 
                    key={idx}
                    className={`p-6 rounded-2xl border ${item.border} ${item.bg} backdrop-blur-sm shadow-lg group transition-all hover:scale-105`}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-white/40 text-[13px] font-bold uppercase tracking-widest mb-1">
                                {item.label}
                            </p>
                            <h3 className={`text-4xl font-black ${item.color} mb-1 transition-transform group-hover:scale-110 origin-left`}>
                                {item.value}
                            </h3>
                            <p className="text-white/60 text-xs font-medium">
                                {item.subtext}
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${item.color}`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

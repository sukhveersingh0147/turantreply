"use client";

import React from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import { motion } from "framer-motion";

interface StatsProps {
  stats: {
    todayCount: number;
    pendingCount: number;
    completedThisMonth: number;
    cancelledThisMonth: number;
  };
}

export default function AppointmentStats({ stats }: StatsProps) {
  const items = [
    {
      label: "Today's Appointments",
      value: stats.todayCount,
      icon: Calendar,
      color: "text-[#25D366]",
      bg: "bg-[#25D366]/10",
      border: "border-[#25D366]/20",
    },
    {
      label: "Pending Confirmation",
      value: stats.pendingCount,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Completed This Month",
      value: stats.completedThisMonth,
      icon: CheckCircle2,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Cancelled / No-show",
      value: stats.cancelledThisMonth,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`p-6 rounded-2xl bg-[#111111] border ${item.border} flex flex-col gap-1`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-xl ${item.bg}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <span className="text-2xl font-black font-[Outfit] text-white">
              {item.value}
            </span>
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
            {item.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

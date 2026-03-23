"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  MessageSquare, 
  TrendingUp, 
  Zap,
  ArrowRight,
  Target,
  ShoppingCart
} from 'lucide-react';
import { getAIInsights } from '@/app/actions/ai-engine';

export default function InsightPanel({ 
  stats = {
    hotLeads: 0,
    pendingReplies: 0,
    followUpsSent: 0,
    conversions: 0,
    revenue: 0
  }
}: { 
  stats?: {
    hotLeads: number;
    pendingReplies: number;
    followUpsSent: number;
    conversions: number | string;
    revenue: number;
  }
}) {
  const displayStats = [
    { 
      label: 'Revenue / Bookings', 
      value: `₹${stats.revenue.toLocaleString()}`, 
      icon: <ShoppingCart className="w-5 h-5 text-emerald-500" />, 
      color: 'from-emerald-500/10 to-teal-500/10',
      description: 'Direct sales value'
    },
    { 
      label: 'Hot Leads', 
      value: stats.hotLeads || 0, 
      icon: <Flame className="w-5 h-5 text-orange-500" />, 
      color: 'from-orange-500/10 to-red-500/10',
      description: 'High intent customers'
    },
    { 
      label: 'Pending Replies', 
      value: stats.pendingReplies || 0, 
      icon: <MessageSquare className="w-5 h-5 text-blue-500" />, 
      color: 'from-blue-500/10 to-indigo-500/10',
      description: 'Awaiting your response'
    },
    { 
      label: 'Smart Follow-ups', 
      value: stats.followUpsSent || 0, 
      icon: <Zap className="w-5 h-5 text-purple-500" />, 
      color: 'from-purple-500/10 to-fuchsia-500/10',
      description: 'AI automated nudges'
    },
    { 
      label: 'Conversations Today', 
      value: stats.conversions || 0, 
      icon: <Target className="w-5 h-5 text-[#25D366]" />, 
      color: 'from-emerald-500/10 to-[#25D366]/10',
      description: 'Conversion opportunities'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {displayStats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`relative group glass-card border-white/5 p-5 rounded-3xl transition-all overflow-hidden`}
        >
          {/* Background Gradient Blobs */}
          <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full blur-2xl opacity-40 group-hover:scale-150 transition-transform duration-500`} />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:border-white/20 transition-colors">
                {stat.icon}
              </div>
              <TrendingUp className="w-4 h-4 text-[#25D366] opacity-30 group-hover:opacity-100 transition-opacity" />
            </div>

            <div>
              <div className="text-3xl font-black font-[Outfit] text-white mb-0.5 tracking-tight group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
              <div className="text-sm font-bold text-white/50">{stat.label}</div>
              <p className="text-[10px] text-white/20 mt-1 flex items-center gap-1 uppercase tracking-widest font-black">
                {stat.description}
                <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

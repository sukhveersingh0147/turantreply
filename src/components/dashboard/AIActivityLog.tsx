"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  User, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  XCircle,
  Zap,
  Tag,
  Bell
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getAIActivityLog, approveAISuggestion } from '@/app/actions/ai-engine';
import { toast } from 'sonner';

export default function AIActivityLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await getAIActivityLog();
    if (res.success) {
      setLogs(res.logs);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const res = await approveAISuggestion(id);
    if (res.success) {
      toast.success("Action approved!");
      fetchLogs();
    } else {
      toast.error(res.error || "Failed to approve");
    }
  };

  if (loading) return (
    <div className="p-8 flex justify-center items-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-8 h-8 text-blue-500 opacity-50" />
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-[#25D366]/10 rounded-xl border border-[#25D366]/20">
          <Sparkles className="w-5 h-5 text-[#25D366]" />
        </div>
        <div>
          <h2 className="text-lg font-black font-[Outfit] text-white tracking-tight">AI Activity Log</h2>
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Intelligent actions performed by your AI Engine</p>
        </div>
      </div>

      <div className="glass-card border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Lead</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Action Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Message / Action</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-white/20">
                    <Zap className="w-10 h-10 mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-medium italic">No AI actions logged yet.</p>
                  </td>
                </tr>
              ) : logs.map((log) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={log.id} 
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center group-hover:border-[#25D366]/40 transition-colors">
                        <User className="w-4 h-4 text-white/40" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{log.lead?.name || log.lead?.phone || 'Unknown'}</div>
                        <div className="text-[10px] text-white/30 truncate max-w-[120px] uppercase font-black tracking-tighter">{log.lead?.leadType || 'NEW'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getTypeStyles(log.type)}`}>
                      {getTypeIcon(log.type)}
                      {log.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-[11px] text-white/70 line-clamp-2 italic font-medium">"{log.content}"</div>
                      {log.reasoning && (
                        <div className="mt-2 flex items-center gap-1.5 text-[9px] text-[#25D366] font-black bg-[#25D366]/10 border border-[#25D366]/20 px-2 py-0.5 rounded-full w-fit uppercase tracking-tighter">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {log.reasoning}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.status === 'PENDING' ? (
                      <button 
                        onClick={() => handleApprove(log.id)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#25D366] hover:bg-[#25D366]/10 border border-[#25D366]/20 px-4 py-2 rounded-xl transition-all active:scale-95"
                      >
                        <Zap className="w-3 h-3" />
                        Approve
                      </button>
                    ) : (
                      <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${getStatusStyles(log.status)}`}>
                        {getStatusIcon(log.status)}
                        {log.status.replace('_', ' ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-white/30 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'FOLLOW_UP': return <Clock className="w-3 h-3" />;
    case 'OFFER': return <Tag className="w-3 h-3" />;
    case 'PRIORITIZE': return <Zap className="w-3 h-3" />;
    case 'REMINDER': return <Bell className="w-3 h-3" />;
    default: return <MessageSquare className="w-3 h-3" />;
  }
}

function getTypeStyles(type: string) {
  switch (type) {
    case 'FOLLOW_UP': return 'bg-amber-50 text-amber-600 border border-amber-100';
    case 'OFFER': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    case 'PRIORITIZE': return 'bg-purple-50 text-purple-600 border border-purple-100';
    case 'REMINDER': return 'bg-blue-50 text-blue-600 border border-blue-100';
    default: return 'bg-gray-50 text-gray-600 border border-gray-100';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'AUTO_EXECUTED': return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
    case 'APPROVED': return <CheckCircle2 className="w-3 h-3 text-blue-500" />;
    case 'IGNORED': return <XCircle className="w-3 h-3 text-gray-400" />;
    default: return <HelpCircle className="w-3 h-3 text-amber-500" />;
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'AUTO_EXECUTED': return 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100';
    case 'APPROVED': return 'text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100';
    default: return 'text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100';
  }
}

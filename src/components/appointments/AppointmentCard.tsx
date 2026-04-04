"use client";

import React from "react";
import { 
  MessageSquare, 
  Clock, 
  ChevronRight,
  User,
  Calendar,
  MoreVertical
} from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";

interface CardProps {
  appt: any;
  onEdit: (appt: any) => void;
  onSendReminder: (appt: any) => void;
  onViewDetail: (appt: any) => void;
}

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  if (isToday(d)) return `Aaj, ${format(d, "h:mm a")}`;
  if (isTomorrow(d)) return `Kal, ${format(d, "h:mm a")}`;
  return format(d, "d MMM • h:mm a");
};

export default function AppointmentCard({ 
  appt, 
  onEdit, 
  onSendReminder,
  onViewDetail 
}: CardProps) {
  return (
    <div 
      onClick={() => onViewDetail(appt)}
      className="md:hidden p-5 rounded-2xl bg-[#111111] border border-white/5 active:scale-[0.98] transition-all mb-3 relative overflow-hidden"
    >
      {/* Status Bar */}
      <div className={`absolute left-0 top-0 w-1 h-full ${
        appt.status === "SCHEDULED" ? "bg-amber-500" :
        appt.status === "COMPLETED" ? "bg-[#25D366]" : "bg-red-500"
      }`} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#25D366] font-black text-sm border border-white/10">
            {appt.lead?.name?.[0] || "?"}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white capitalize">{appt.lead?.name || "Unknown"}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                   appt.status === "SCHEDULED" ? "bg-amber-500/10 text-amber-500" :
                   appt.status === "COMPLETED" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-red-500/10 text-red-500"
               }`}>{appt.status}</span>
               <span className="text-[9px] text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">{appt.source}</span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-700" />
      </div>

      <div className="space-y-3 mb-5 pl-1">
        <div className="flex items-center gap-2 text-zinc-400">
          <Calendar className="w-3.5 h-3.5 text-[#25D366]" />
          <span className="text-xs font-bold">{formatDate(appt.startTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-3.5 h-3.5 rounded-sm bg-zinc-800" />
          <span className="text-xs text-zinc-300 font-medium line-clamp-1">
            {appt.item?.name || appt.title || "General Service"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-white/5">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            window.open(`https://wa.me/91${appt.lead?.phone}`, "_blank");
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chat
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSendReminder(appt);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/5 text-[#25D366] hover:bg-[#25D366]/10 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <Clock className="w-3.5 h-3.5" />
          Remind
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(appt);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-zinc-400"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// Fixed missing Edit2 import in previous thought or code block
import { Edit2 } from "lucide-react";

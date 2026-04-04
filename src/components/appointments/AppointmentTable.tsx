"use client";

import React from "react";
import { 
  MessageSquare, 
  Edit2, 
  MoreVertical, 
  CheckCircle2, 
  XSquare,
  Clock,
  ExternalLink
} from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";

interface TableProps {
  appointments: any[];
  onEdit: (appt: any) => void;
  onStatusUpdate: (id: string, status: string) => void;
  onSendReminder: (appt: any) => void;
}

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  if (isToday(d)) return `Aaj, ${format(d, "h:mm a")}`;
  if (isTomorrow(d)) return `Kal, ${format(d, "h:mm a")}`;
  return format(d, "d MMM • h:mm a");
};

export default function AppointmentTable({ 
  appointments, 
  onEdit, 
  onStatusUpdate,
  onSendReminder 
}: TableProps) {
  return (
    <div className="hidden md:block w-full overflow-x-auto rounded-2xl border border-white/5 bg-[#111111]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.02]">
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Customer</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Service / Title</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Date & Time</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Source</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {appointments.map((appt) => (
            <tr key={appt.id} className="group hover:bg-white/[0.02] transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#25D366]/20 to-transparent flex items-center justify-center text-[#25D366] font-black text-sm border border-[#25D366]/10">
                    {appt.lead?.name?.[0] || "?"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white capitalize">{appt.lead?.name || "Unknown"}</h4>
                    <p className="text-[11px] text-zinc-500">+{appt.lead?.phone}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-zinc-300 font-medium">
                  {appt.item?.name || appt.title || "General Service"}
                </span>
                {appt.item?.category && (
                    <span className="ml-2 text-[10px] text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {appt.item.category}
                    </span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm text-white font-bold">{formatDate(appt.startTime)}</span>
                  <span className="text-[10px] text-zinc-500 capitalize">{appt.source === "AI" ? "AI Selected" : "Manually Set"}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter border ${
                   appt.source === "AI" 
                    ? "bg-[#14532d20] text-[#4ade80] border-[#14532d20]" 
                    : appt.source === "MANUAL"
                    ? "bg-[#1e3a8a20] text-[#60a5fa] border-[#1e3a8a20]"
                    : "bg-[#3B076420] text-[#c084fc] border-[#3B076420]"
                }`}>
                  {appt.source}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter flex items-center gap-1.5 w-fit ${
                  appt.status === "SCHEDULED" 
                    ? "bg-amber-500/10 text-amber-500" 
                    : appt.status === "COMPLETED"
                    ? "bg-[#25D366]/10 text-[#25D366]"
                    : "bg-red-500/10 text-red-500"
                }`}>
                  <div className={`w-1 h-1 rounded-full ${
                    appt.status === "SCHEDULED" ? "bg-amber-500" :
                    appt.status === "COMPLETED" ? "bg-[#25D366]" : "bg-red-500"
                  }`} />
                  {appt.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => window.open(`https://wa.me/91${appt.lead?.phone}`, "_blank")}
                    className="p-2 rounded-lg hover:bg-[#25D366]/10 text-zinc-500 hover:text-[#25D366] transition-all"
                    title="WhatsApp Chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onEdit(appt)}
                    className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-all"
                    title="Edit Appointment"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onSendReminder(appt)}
                    className="p-2 rounded-lg hover:bg-blue-500/10 text-zinc-500 hover:text-blue-400 transition-all"
                    title="Send Reminder"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

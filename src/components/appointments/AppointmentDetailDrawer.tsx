"use client";

import React from "react";
import { 
  X, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XSquare, 
  Edit2, 
  Calendar,
  User,
  Phone,
  Tag,
  FileText,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onEdit: (appt: any) => void;
  onSendReminder: (appt: any) => void;
  onStatusUpdate: (id: string, status: string) => void;
}

export default function AppointmentDetailDrawer({ 
  isOpen, 
  onClose, 
  appointment,
  onEdit,
  onSendReminder,
  onStatusUpdate
}: DrawerProps) {
  if (!appointment) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-[120] md:hidden"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-[#0a0f14] border-t border-white/10 rounded-t-[3rem] z-[130] md:hidden overflow-hidden flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
             {/* Handle */}
             <div className="w-full flex justify-center py-4">
                <div className="w-12 h-1.5 rounded-full bg-zinc-800" />
             </div>

             <div className="flex-1 overflow-y-auto px-8 pb-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] p-[1.5px]">
                         <div className="w-full h-full rounded-[14px] bg-[#0a0f14] flex items-center justify-center text-xl font-black text-white">
                            {appointment.lead?.name?.[0] || "?"}
                         </div>
                      </div>
                      <div>
                         <h2 className="text-xl font-black font-[Outfit] text-white capitalize">{appointment.lead?.name}</h2>
                         <p className="text-xs text-zinc-500 font-bold">+{appointment.lead?.phone}</p>
                      </div>
                   </div>
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap gap-2 mb-8">
                   <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${
                      appointment.status === "SCHEDULED" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      appointment.status === "COMPLETED" ? "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                   }`}>
                      {appointment.status}
                   </span>
                   <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest bg-white/5 text-zinc-400 border border-white/5">
                      {appointment.source}
                   </span>
                </div>

                {/* Details Grid */}
                <div className="space-y-6 pt-4 border-t border-white/5 mb-10">
                   <div className="flex items-start gap-4">
                      <Calendar className="w-5 h-5 text-[#25D366]" />
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Date & Time</p>
                         <p className="text-sm font-bold text-white">{format(new Date(appointment.startTime), "EEEE, d MMMM • h:mm a")}</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-4">
                      <Tag className="w-5 h-5 text-[#25D366]" />
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Service / Title</p>
                         <p className="text-sm font-bold text-white">{appointment.item?.name || appointment.title || "General Service"}</p>
                      </div>
                   </div>

                   {appointment.description && (
                      <div className="flex items-start gap-4">
                         <FileText className="w-5 h-5 text-[#25D366]" />
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Notes</p>
                            <p className="text-sm text-zinc-400 leading-relaxed">{appointment.description}</p>
                         </div>
                      </div>
                   )}
                </div>

                {/* Lead Info - Mini Module */}
                <div className="p-6 rounded-3xl bg-[#111111] border border-white/5 mb-10">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-white">Lead Insights</h3>
                      <button className="text-[10px] font-black uppercase tracking-widest text-[#25D366] flex items-center gap-1">
                         View Full Profile <ChevronRight className="w-3 h-3" />
                      </button>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Stage</p>
                         <p className="text-xs font-bold text-zinc-300 capitalize">{appointment.lead?.leadStage || "New"}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Last Interaction</p>
                         <p className="text-xs font-bold text-zinc-300">{appointment.lead?.lastInteraction ? format(new Date(appointment.lead.lastInteraction), "d MMM") : "Never"}</p>
                      </div>
                   </div>
                </div>

                {/* Actions Footer */}
                <div className="space-y-4">
                   <button 
                      onClick={() => onSendReminder(appointment)}
                      className="w-full py-4 rounded-2xl bg-[#25D366]/10 text-[#25D366] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                   >
                      <Clock className="w-4 h-4" />
                      Send WhatsApp Reminder
                   </button>
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => onStatusUpdate(appointment.id, "COMPLETED")}
                        className="py-4 rounded-2xl bg-[#25D366] text-black font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                      >
                         <CheckCircle2 className="w-4 h-4" />
                         Done
                      </button>
                      <button 
                        onClick={() => onEdit(appointment)}
                        className="py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                      >
                         <Edit2 className="w-4 h-4" />
                         Edit
                      </button>
                   </div>
                   <button 
                      onClick={() => onStatusUpdate(appointment.id, "CANCELLED")}
                      className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
                   >
                      <XSquare className="w-4 h-4" />
                      Cancel Appointment
                   </button>
                </div>
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

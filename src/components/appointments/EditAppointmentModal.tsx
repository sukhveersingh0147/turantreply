"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock, Trash2, Tag, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, setHours, setMinutes } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment: any;
  items: any[];
}

export default function EditAppointmentModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  appointment,
  items 
}: EditAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("09:00");
  const [status, setStatus] = useState("SCHEDULED");
  const [title, setTitle] = useState("");
  const [itemId, setItemId] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (appointment) {
      const d = new Date(appointment.startTime);
      setDate(d);
      setTime(format(d, "HH:mm"));
      setStatus(appointment.status);
      setTitle(appointment.title || "");
      setItemId(appointment.itemId || "");
      setDescription(appointment.description || "");
    }
  }, [appointment]);

  const timeSlots = [];
  for (let h = 9; h <= 21; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;

    setLoading(true);
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const startTime = setMinutes(setHours(new Date(date), hours), minutes);
      
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || items.find(i => i.id === itemId)?.name || "Appointment",
          itemId: itemId || null,
          startTime: startTime.toISOString(),
          status,
          description
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Failed to update appointment", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Failed to cancel appointment", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] font-black border border-[#25D366]/10">
                {appointment.lead?.name?.[0] || "?"}
             </div>
             <div>
                <h2 className="text-xl font-black font-[Outfit] text-white underline underline-offset-4 decoration-[#25D366]/30 decoration-2">
                  {appointment.lead?.name}
                </h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-1">Manage Appointment</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-8">
           {/* Status Toggles */}
           <div className="mb-8">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#25D366] mb-4 block">Update Status</label>
              <div className="grid grid-cols-3 gap-3">
                 {[
                   { id: "SCHEDULED", label: "Scheduled", color: "amber-500", icon: Clock },
                   { id: "COMPLETED", label: "Completed", color: "[#25D366]", icon: CheckCircle2 },
                   { id: "CANCELLED", label: "Cancelled", color: "red-500", icon: AlertCircle },
                 ].map((s) => (
                   <button
                     key={s.id}
                     type="button"
                     onClick={() => setStatus(s.id)}
                     className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                       status === s.id 
                        ? `bg-${s.color}/10 border-${s.color}/30 text-${s.color} shadow-[0_0_15px_rgba(0,0,0,0.3)]` 
                        : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
                     }`}
                   >
                     <s.icon className="w-3.5 h-3.5" />
                     {s.label}
                   </button>
                 ))}
              </div>
           </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side: Date & Time */}
            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#25D366] mb-3 block">Reschedule Date</label>
                  <div className="p-2 bg-[#111111] border border-white/5 rounded-2xl inline-block custom-datepicker">
                     <DayPicker
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        modifiersClassNames={{
                          selected: "bg-[#25D366] text-black font-black rounded-lg",
                          today: "text-[#25D366] font-black underline",
                        }}
                        styles={{
                          caption: { color: 'white' },
                          head_cell: { color: '#71717a' },
                          cell: { color: 'white' },
                          nav_button: { color: '#25D366' }
                        }}
                     />
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#25D366] mb-3 block">Reschedule Time</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#25D366] transition-colors" />
                    <select 
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-[#111111] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#25D366] outline-none transition-all appearance-none"
                    >
                      {timeSlots.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
               </div>
            </div>

            {/* Right side: Details */}
            <div className="space-y-6">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#25D366] block">Appointment Details</label>
                  
                  <div className="relative group">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#25D366] transition-colors" />
                    <select 
                      value={itemId}
                      onChange={(e) => setItemId(e.target.value)}
                      className="w-full bg-[#111111] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#25D366] outline-none transition-all appearance-none"
                    >
                      <option value="">Select Service (Optional)</option>
                      {items.map(i => (
                        <option key={i.id} value={i.id}>{i.name} (₹{i.price})</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative group">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#25D366] transition-colors" />
                    <input
                      type="text"
                      placeholder="Appointment Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#111111] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#25D366] outline-none transition-all"
                    />
                  </div>

                  <div className="relative group">
                    <textarea
                      placeholder="Notes / Instructions"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-white focus:border-[#25D366] outline-none transition-all min-h-[100px] resize-none"
                    />
                  </div>

                  {/* Info Badge */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                     <p className="text-[10px] text-zinc-500 leading-relaxed">
                        Customer: <span className="text-white">+{appointment.lead?.phone}</span><br />
                        Source: <span className="text-white">{appointment.source}</span><br />
                        Last Contact: <span className="text-white">{appointment.lead?.lastInteraction ? format(new Date(appointment.lead.lastInteraction), "d MMM, h:mm a") : "N/A"}</span>
                     </p>
                  </div>
               </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
             <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 rounded-xl bg-red-500/5 text-red-500 font-bold hover:bg-red-500/10 transition-all flex items-center gap-2"
             >
                <Trash2 className="w-4 h-4" />
                Cancel Appointment
             </button>
             
             <div className="flex items-center gap-4">
                <button
                   type="button"
                   onClick={onClose}
                   className="px-6 py-3 rounded-xl bg-white/5 text-zinc-400 font-bold hover:bg-white/10 transition-all"
                >
                   Close
                </button>
                <button
                   type="submit"
                   disabled={loading || !date}
                   className="px-8 py-3 rounded-xl bg-[#25D366] text-black font-black uppercase tracking-widest hover:bg-[#128C7E] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(37,211,102,0.2)]"
                >
                   {loading ? "Updating..." : "Save Changes"}
                </button>
             </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

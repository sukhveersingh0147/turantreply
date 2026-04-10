"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { X, Calendar as CalendarIcon, Clock, Phone, User, Tag, FileText } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, addMinutes, setHours, setMinutes } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  items: any[]; // Business services/items
}

export default function NewAppointmentModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  items 
}: NewAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("09:00");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [itemId, setItemId] = useState("");
  const [description, setDescription] = useState("");

  const timeSlots = [];
  for (let h = 9; h <= 21; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !phone || !name) return;

    setLoading(true);
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const startTime = setMinutes(setHours(new Date(date), hours), minutes);
      
      const res = await apiFetch("/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name,
          title: title || items.find(i => i.id === itemId)?.name || "Appointment",
          itemId: itemId || null,
          startTime: startTime.toISOString(),
          description
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Failed to create appointment", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          <div>
            <h2 className="text-xl font-black font-[Outfit] text-white">Add New Appointment</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-black mt-1">Manual Booking</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side: Date & Time */}
            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#25D366] mb-3 block">Select Date</label>
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
                          caption: { color: 'white', fontWeight: 'bold' },
                          head_cell: { color: '#71717a', fontSize: '12px' },
                          cell: { color: 'white' },
                          nav_button: { color: '#25D366' }
                        }}
                     />
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#25D366] mb-3 block">Select Time</label>
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

            {/* Right side: Customer Info */}
            <div className="space-y-6">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#25D366] block">Customer Details</label>
                  
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#25D366] transition-colors" />
                    <input
                      type="tel"
                      placeholder="Phone (e.g. 9876543210)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#111111] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#25D366] outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#25D366] transition-colors" />
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#111111] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#25D366] outline-none transition-all"
                      required
                    />
                  </div>

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

                  {!itemId && (
                    <div className="relative group">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#25D366] transition-colors" />
                      <input
                        type="text"
                        placeholder="Appointment Title (if no service)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[#111111] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#25D366] outline-none transition-all"
                      />
                    </div>
                  )}

                  <div className="relative group">
                    <textarea
                      placeholder="Notes / Instructions (Optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-white focus:border-[#25D366] outline-none transition-all min-h-[100px] resize-none"
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-end gap-4">
             <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-white/5 text-zinc-400 font-bold hover:bg-white/10 transition-all"
             >
                Cancel
             </button>
             <button
                type="submit"
                disabled={loading || !date || !phone || !name}
                className="px-8 py-3 rounded-xl bg-[#25D366] text-black font-black uppercase tracking-widest hover:bg-[#128C7E] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(37,211,102,0.2)]"
             >
                {loading ? "Creating..." : "Create Appointment"}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

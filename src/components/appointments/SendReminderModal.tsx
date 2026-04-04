"use client";

import React, { useState, useEffect } from "react";
import { X, MessageSquare, Send, Clock, Calendar, User, Zap } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  businessName: string;
}

export default function SendReminderModal({ 
  isOpen, 
  onClose, 
  appointment,
  businessName 
}: SendReminderModalProps) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (appointment) {
      const dateStr = format(new Date(appointment.startTime), "d MMM");
      const timeStr = format(new Date(appointment.startTime), "h:mm a");
      const serviceName = appointment.item?.name || appointment.title || "appointment";
      
      const defaultMessage = `⏰ Reminder: Kal aapka appointment hai!\n\nHi ${appointment.lead?.name || "Customer"}! ${businessName} mein ${dateStr} ko ${timeStr} baje milte hain.\n\nService: ${serviceName}\n\nReschedule karna ho toh reply karein. 😊`;
      
      setMessage(defaultMessage);
    }
  }, [appointment, businessName]);

  const handleSend = () => {
    const phone = appointment.lead?.phone;
    if (!phone) return;

    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    onClose();
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-[#0a0f14] border border-[#25D366]/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(37,211,102,0.1)]"
      >
        {/* Glow Header */}
        <div className="px-8 py-8 border-b border-white/5 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#25D366] to-transparent opacity-50" />
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] border border-[#25D366]/20 shadow-[0_0_20px_rgba(37,211,102,0.1)]">
                 <Zap className="w-6 h-6 fill-[#25D366]/20" />
              </div>
              <div>
                 <h2 className="text-xl font-black font-[Outfit] text-white">Send WhatsApp Reminder</h2>
                 <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-1">One-Click Engagement</p>
              </div>
           </div>
           <button onClick={onClose} className="absolute right-6 top-8 p-2 hover:bg-white/5 rounded-xl transition-all">
             <X className="w-5 h-5 text-zinc-500" />
           </button>
        </div>

        <div className="p-8">
           <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                 <User className="w-3.5 h-3.5 text-[#25D366]" />
                 Sending to: <span className="text-white font-black">{appointment.lead?.name}</span> (+{appointment.lead?.phone})
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                 <Clock className="w-3.5 h-3.5 text-[#25D366]" />
                 Time: <span className="text-white font-black">{format(new Date(appointment.startTime), "d MMM, h:mm a")}</span>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Edit Message</label>
              <div className="relative">
                 <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#111111]/50 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-[#25D366] outline-none transition-all min-h-[220px] resize-none leading-relaxed font-medium"
                 />
                 {/* WhatsApp Style Mockup Decor */}
                 <div className="absolute bottom-4 right-4 text-[10px] text-zinc-600 font-bold">
                    {message.length} chars
                 </div>
              </div>
           </div>

           <div className="mt-8 flex flex-col gap-4">
              <button
                 onClick={handleSend}
                 className="w-full py-4 rounded-2xl bg-[#25D366] text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#128C7E] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(37,211,102,0.2)]"
              >
                 <Send className="w-5 h-5" />
                 Send via WhatsApp
              </button>
              
              <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                 <MessageSquare className="w-3 h-3" />
                 This will open WhatsApp Web/App in a new tab
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

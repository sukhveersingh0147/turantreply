"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Bot, 
  LayoutDashboard, 
  ArrowRight,
  Package,
  MessageSquare
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CompletionScreenProps {
  setupData: any;
}

export default function CompletionScreen({ setupData }: CompletionScreenProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 max-w-2xl mx-auto">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-24 h-24 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-8 border border-[#25D366]/20 relative"
      >
        <CheckCircle2 className="w-12 h-12 text-[#25D366]" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-[#25D366]/20 rounded-full blur-xl"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl sm:text-5xl font-black font-[Outfit] mb-4"
      >
        🎉 {setupData.businessName} Ready Hai!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-white/40 mb-12 text-lg"
      >
        Aapka personalized AI dashboard setup ho gaya hai.
      </motion.p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-12">
        {[
          { icon: Bot, label: "AI Assistant", desc: "Configured for your business", color: "text-[#25D366]" },
          { icon: Package, label: `${setupData.catalogItems?.length || 5} Services`, desc: "Added to your catalog", color: "text-blue-400" },
          { icon: Zap, label: "Auto-replies", desc: "Working for common queries", color: "text-yellow-400" },
          { icon: MessageSquare, label: "WhatsApp Ready", desc: "Personalized templates set", color: "text-purple-400" }
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-3 text-center"
          >
            <item.icon className={`w-6 h-6 ${item.color}`} />
            <div>
              <div className="text-sm font-bold text-white/90">{item.label}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-black">{item.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Business Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full p-6 rounded-3xl bg-gradient-to-br from-[#25D366]/5 to-transparent border border-[#25D366]/20 mb-12"
      >
        <div className="flex items-center gap-2 mb-3 justify-center">
          <Sparkles className="w-4 h-4 text-[#25D366]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">AI Business Summary</span>
        </div>
        <p className="text-zinc-300 italic text-sm leading-relaxed">
          "{setupData.businessSummary || `${setupData.businessName} is ready to serve customers in ${setupData.location} with professional WhatsApp automation.`}"
        </p>
      </motion.div>

      {/* Final Action */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/overview?setup=complete")}
        className="group relative flex items-center gap-3 px-10 py-5 rounded-3xl bg-[#25D366] text-black font-black text-xl hover:shadow-[0_0_50px_rgba(37,211,102,0.4)] transition-all"
      >
        Dashboard Dekho <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </motion.button>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-[10px] uppercase font-black tracking-[0.2em] text-white/20"
      >
        Aap kabhi bhi settings mein yeh sab change kar sakte hain
      </motion.p>
    </div>
  );
}

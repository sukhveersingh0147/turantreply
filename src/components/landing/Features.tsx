"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  RotateCcw, 
  Send, 
  Bot, 
  BarChart, 
  Smartphone,
  Target,
  Calendar,
  Bell,
  Tags,
  HelpCircle,
  Lightbulb
} from "lucide-react";

const standardFeatures = [
    { icon: Zap, title: "Instant Auto-Reply", desc: "Response in 0.3s" },
    { icon: RotateCcw, title: "Lead Recovery Engine", desc: "Never miss a lead" },
    { icon: Send, title: "Broadcast Campaigns", desc: "Mass messaging" },
    { icon: Bot, title: "AI Conversations", desc: "Human-like chat" },
    { icon: BarChart, title: "Analytics Dashboard", desc: "Track conversions" },
    { icon: Smartphone, title: "WhatsApp Cloud API", desc: "Official connection" }
];

const exclusiveFeatures = [
  {
    icon: Target,
    title: "Industry Pre-Loaded Setup",
    desc: "Salon select karo → appointment templates, service catalog, AI prompts — sab ready. Zero configuration. 60 seconds.",
    badge: "EXCLUSIVE"
  },
  {
    icon: Calendar,
    title: "Appointment & Booking Management",
    desc: "WhatsApp se aaye appointments directly dashboard mein track hoti hain. Confirm, reschedule, cancel — sab ek jagah.",
    badge: "EXCLUSIVE"
  },
  {
    icon: Bell,
    title: "Smart No-Show Prevention",
    desc: "Appointment se 24hr aur 1hr pehle automatic reminder. No-shows 60% tak kam.",
    badge: "EXCLUSIVE"
  },
  {
    icon: Tags,
    title: "Vertical-Specific Contact Tags",
    desc: "Salon mein: VIP Client, Lapsed. Gym mein: Active, Expiring. Automatic segmentation — teri industry ke hisaab se.",
    badge: "EXCLUSIVE"
  },
  {
    icon: HelpCircle,
    title: "Queries Dashboard",
    desc: "Jo questions AI answer nahi kar paya — ek jagah collect hote hain. Kabhi koi query miss nahi hoti.",
    badge: "EXCLUSIVE"
  },
  {
    icon: Lightbulb,
    title: "Quick Actions Panel",
    desc: "'Aaj ka offer bhejo', 'Pending reminders send karo' — one-click actions for your business type.",
    badge: "EXCLUSIVE"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 md:py-32 bg-[#0a0a0a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Part A: Standard Features */}
        <div className="mb-32">
          <div className="text-center mb-20 fade-up">
            <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-4">
              Sab kuch jo competitors dete hain
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              Everything you expect from a premium WhatsApp automation platform.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {standardFeatures.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, borderColor: "rgba(37,211,102,0.3)" }}
                className="p-6 md:p-8 rounded-2xl bg-[#111111] border border-white/5 flex flex-col items-center text-center group transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#25D366]/20 group-hover:text-[#25D366] transition-colors">
                  <f.icon className="w-6 h-6 text-zinc-400 group-hover:text-inherit" />
                </div>
                <h4 className="text-base font-bold text-white mb-2 font-[Outfit] group-hover:text-[#25D366] transition-colors">{f.title}</h4>
                <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors uppercase tracking-widest font-bold">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Part B: Exclusive Features */}
        <div>
          <div className="text-center mb-20 fade-up">
            <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-4">
              Yeh features sirf TurantReply mein
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              WATI, AiSensy, Interakt — kisi mein nahi milega. Built for speed, built for India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exclusiveFeatures.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#25D366]/10 hover:border-[#25D366]/40 transition-all shadow-xl group relative overflow-hidden"
              >
                <span className="absolute top-4 right-4 text-[10px] font-black text-[#25D366] bg-[#25D366]/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                  {f.badge}
                </span>
                <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center mb-8 border border-[#25D366]/20 group-hover:scale-110 transition-transform">
                  <f.icon className="w-7 h-7 text-[#25D366]" />
                </div>
                <h3 className="text-xl font-black mb-4 font-[Outfit] text-white tracking-tight leading-tight group-hover:text-[#25D366] transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                  {f.desc}
                </p>

                {/* Subtle light effect on card top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#25D366]/20 to-transparent" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

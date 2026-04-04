"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Store, Smartphone, Bot, ChevronRight } from "lucide-react";

const steps = [
  {
    number: "Step 1",
    icon: Store,
    title: "Apna business type select karo",
    desc: "Salon, Gym, Coaching, Real Estate, Restaurant, ya Other — ek click mein",
    time: "< 30 seconds",
    color: "from-emerald-500/20 to-teal-500/10",
  },
  {
    number: "Step 2",
    icon: Smartphone,
    title: "WhatsApp connect karo",
    desc: "Meta Cloud API se directly connect — koi technical knowledge nahi chahiye",
    time: "< 5 minutes",
    color: "from-blue-500/20 to-indigo-500/10",
  },
  {
    number: "Step 3",
    icon: Bot,
    title: "AI kaam pe lag jaata hai",
    desc: "Appointments book hona shuru, queries answer hona shuru, leads recover hona shuru — automatically",
    time: "Immediately",
    color: "from-[#25D366]/20 to-[#128C7E]/10",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-[#0a0a0a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 fade-up">
          <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-4">
            3 steps mein setup — 10 minutes se bhi kam
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            Bas. Koi training nahi. Koi configuration nahi. Koi IT team nahi.
          </p>
        </div>

        <div className="relative">
          {/* Dotted Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 border-t-2 border-dotted border-zinc-800 -translate-y-1/2 -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${s.color} border border-white/5 flex items-center justify-center mb-8 relative group-hover:scale-110 transition-all duration-300`}>
                  <s.icon className="w-10 h-10 text-white group-hover:text-[#25D366]" />
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-black text-white">
                    {i + 1}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 mb-4 tracking-widest uppercase">
                  Time: {s.time}
                </div>
                <h3 className="text-xl font-bold mb-4 font-[Outfit] group-hover:text-[#25D366] transition-colors">{s.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px]">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
            <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-[#25D366] font-black group"
            >
                Start Setup Now <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

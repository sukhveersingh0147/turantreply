"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, ShieldCheck, CreditCard, Flag, Clock, RotateCcw } from "lucide-react";

const FinalCTA = () => {
  const trustBadges = [
    { icon: ShieldCheck, text: "Secure" },
    { icon: CreditCard, text: "No Credit Card" },
    { icon: Flag, text: "Made in India" },
    { icon: Clock, text: "10 Min Setup" },
    { icon: RotateCcw, text: "Cancel Anytime" },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#0a0a0a]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[#25D366]/5 blur-[150px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-12 md:p-24 rounded-[3rem] bg-[#111111] border border-[#25D366]/20 text-center relative overflow-hidden shadow-2xl shadow-[#25D366]/5">
          {/* Subtle noise/grain effect could go here */}
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-black font-[Outfit] mb-6 leading-tight">
              Ready hai? Apna business <br />
              <span className="text-[#25D366]">WhatsApp pe automate karo.</span>
            </h2>
            
            <p className="text-xl text-zinc-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              10 minutes mein setup. 14 din free. No credit card.
            </p>

            <div className="flex flex-col items-center gap-8">
              <Link
                href="/signup"
                className="group relative px-12 py-6 bg-white text-black font-black text-xl rounded-2xl hover:scale-105 transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                Abhi Start Karo — Free <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-white/5 mt-8 w-full">
                {trustBadges.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-zinc-500 group">
                    <b.icon className="w-4 h-4 group-hover:text-[#25D366] transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Decorative Corner Orbs */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#25D366]/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#25D366]/10 blur-[100px] rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;

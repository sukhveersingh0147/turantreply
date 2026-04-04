"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { PricingCards } from "./PricingCards";

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-[#0a0a0a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 fade-up">
          <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-4">
            Simple pricing. No hidden fees.
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            14 din free trial — no credit card required
          </p>
        </div>

        <PricingCards />

        {/* Global Footer info for Pricing */}
        <div className="mt-20 pt-12 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-center gap-12 text-center md:text-left">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                 <ShieldCheck className="w-6 h-6 text-[#25D366]" />
              </div>
              <div>
                 <div className="text-sm font-black text-white font-[Outfit] tracking-widest uppercase">100% Safe Payments</div>
                 <div className="text-xs text-zinc-500">Fast & Secure Processing with PayU</div>
              </div>
           </div>
           
           <div className="flex items-center gap-4 px-8 py-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">🔒 Secure payments via PayU • Autopay enabled — cancel anytime from dashboard</span>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

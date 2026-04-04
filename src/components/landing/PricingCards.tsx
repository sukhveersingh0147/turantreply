"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

export interface PricingCardsProps {
  vertical?: string;
  verticalTitle?: string;
}

const plans = [
  {
    name: "STARTER",
    price: "999",
    period: "/month",
    badge: "Perfect for starting out",
    features: [
      { name: "1,000 monthly conversations", included: true },
      { name: "Appointment management", included: true },
      { name: "10 automation rules", included: true },
      { name: "Industry pre-loaded setup", included: true },
      { name: "Basic analytics", included: true },
      { name: "Lead recovery", included: true },
      { name: "Query dashboard", included: true },
      { name: "Broadcast messaging", included: false },
      { name: "Advanced analytics", included: false },
      { name: "Follow-up sequences", included: false },
    ],
    cta: "Start Free Trial",
    sub: "No card required • Cancel anytime",
    popular: false,
  },
  {
    name: "GROWTH",
    price: "2,999",
    period: "/month",
    badge: "Most Popular",
    features: [
      { name: "5,000 monthly conversations", included: true },
      { name: "Everything in Starter", included: true },
      { name: "Unlimited automations", included: true },
      { name: "Broadcast messaging", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Follow-up sequences", included: true },
      { name: "Priority support", included: true },
      { name: "All 6 vertical templates", included: true },
      { name: "Multi-business dashboard", included: false },
      { name: "White-label", included: false },
    ],
    cta: "Start Free Trial",
    sub: "No card required • Cancel anytime",
    popular: true,
  },
  {
    name: "AGENCY",
    price: "9,999",
    period: "/month",
    badge: "For agencies & large businesses",
    features: [
      { name: "Unlimited conversations", included: true },
      { name: "Everything in Growth", included: true },
      { name: "Multi-business dashboard", included: true },
      { name: "White-label option", included: true },
      { name: "Custom integrations", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "API access", included: true },
      { name: "Priority WhatsApp support", included: true },
    ],
    cta: "Contact Sales",
    sub: "Custom onboarding included",
    popular: false,
  },
];

export const PricingCards = ({ vertical, verticalTitle }: PricingCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      {plans.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className={`p-8 rounded-3xl bg-[#111111] border-2 flex flex-col relative transition-all duration-300 ${
            p.popular 
              ? "border-[#25D366] shadow-[0_0_40px_rgba(37,211,102,0.15)] scale-105 z-10" 
              : "border-white/5"
          }`}
        >
          {p.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#25D366] text-black text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-[#25D366]/20 animate-pulse">
              Best Value
            </div>
          )}
          
          <div className="mb-8">
            <div className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-2">{p.name}</div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-black text-white font-[Outfit]">₹{p.price}</span>
              <span className="text-zinc-500 text-lg">{p.period}</span>
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${p.popular ? "text-[#25D366]" : "text-zinc-500"}`}>
              {p.badge}
            </div>
          </div>

          <div className="flex-1 space-y-4 mb-8 pt-8 border-t border-zinc-800">
            {p.features.map((f, fi) => (
              <div key={fi} className="flex items-center gap-3">
                {f.included ? (
                  <CheckCircle2 className={`w-4 h-4 ${p.popular ? "text-[#25D366]" : "text-zinc-400"}`} />
                ) : (
                  <XCircle className="w-4 h-4 text-zinc-600" />
                )}
                <span className={`text-sm ${f.included ? "text-white" : "text-zinc-600 line-through"}`}>
                  {f.name}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <Link
              href={p.name === "AGENCY" ? "/contact" : `/signup?plan=${p.name.toLowerCase()}${vertical ? `&vertical=${vertical}` : ""}`}
              className={`w-full py-4 text-center block rounded-xl font-black transition-all ${
                p.popular 
                  ? "bg-[#25D366] text-black hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]" 
                  : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {p.name === "AGENCY" ? "Contact Sales" : (verticalTitle ? `Start ${verticalTitle} Free Trial` : p.cta)}
            </Link>
            <div className="text-[10px] text-center text-zinc-500 font-bold mt-4 uppercase tracking-widest leading-tight">
              {p.sub}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

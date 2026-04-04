"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronRight } from "lucide-react";

const testimonials = [
  {
    stars: 5,
    quote: "TurantReply ne humara salon completely badal diya. Pehle har din 5-6 appointments miss hoti thi. Ab ek bhi miss nahi hoti. Sirf pehle hafte mein ₹18,000 extra revenue!",
    name: "Priya Sharma",
    role: "Owner, GlowUp Beauty Salon",
    location: "Jaipur",
    businessBadge: "💇 Salon",
    resultBadge: "+₹18,000 first week",
  },
  {
    stars: 5,
    quote: "Gym ke liye yeh perfect hai. Membership renewal reminders automatically jaate hain, trial bookings khud ho jaati hain. Mujhe sirf training pe dhyan dena hai!",
    name: "Rohit Verma",
    role: "Owner, PowerFit Gym",
    location: "Delhi",
    businessBadge: "💪 Gym",
    resultBadge: "40% better retention",
  },
  {
    stars: 5,
    quote: "Real estate mein speed sabse important hai. Koi bhi inquiry aaye — 0.3 second mein reply ho jaata hai. 3 deals close ki sirf isliye kyunki hum pehle respond karte hain.",
    name: "Amit Gupta",
    role: "Director, HomeQuest Realty",
    location: "Mumbai",
    businessBadge: "🏠 Real Estate",
    resultBadge: "3 extra deals/month",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 md:py-32 bg-[#0a0a0a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 fade-up">
          <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-4">
            Real businesses, real results
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            Join 2,400+ businesses across India already using TurantReply.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-[#111111] border-l-4 border-l-[#25D366] border border-white/5 relative group"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                ))}
              </div>
              
              <Quote className="absolute top-8 right-8 w-12 h-12 text-white/5 group-hover:text-[#25D366]/10 transition-colors" />

              <p className="text-lg text-white font-medium mb-8 leading-relaxed font-[Outfit]">
                "{t.quote}"
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white text-xs">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{t.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{t.role} • {t.location}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="text-[10px] font-black bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full uppercase">
                    {t.businessBadge}
                  </span>
                  <span className="text-[10px] font-black bg-[#25D366]/10 text-[#25D366] px-3 py-1 rounded-full uppercase">
                    {t.resultBadge}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
            <button className="text-zinc-500 font-bold text-sm tracking-widest uppercase hover:text-white transition-colors">
                Join 2,400+ businesses already using TurantReply →
            </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

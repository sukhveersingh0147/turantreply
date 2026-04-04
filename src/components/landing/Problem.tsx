"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, Banknote, ArrowRight } from "lucide-react";

const Problem = () => {
  const problems = [
    {
      icon: Clock,
      stat: "67%",
      label: "WhatsApp inquiries ka reply 1+ ghante baad aata hai",
      subtext: "Tab tak customer competitor ke paas ja chuka hota hai",
      color: "from-orange-500/20 to-red-500/10",
    },
    {
      icon: Calendar,
      stat: "40%",
      label: "Appointments manually manage karne se miss hoti hain",
      subtext: "No-shows se direct revenue loss hota hai",
      color: "from-red-500/20 to-orange-500/10",
    },
    {
      icon: Banknote,
      stat: "₹50,000+",
      label: "Average monthly loss missed leads ki wajah se",
      subtext: "Sirf isliye ki koi reply karne wala nahi tha",
      color: "from-orange-500/20 to-red-500/10",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 fade-up">
          <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-4">
            Har din kitne customers miss ho rahe hain?
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            Traditional WhatsApp tools are too slow. TurantReply is built for speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className={`p-8 rounded-2xl bg-gradient-to-br ${p.color} border border-white/5 relative overflow-hidden group`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#25D366]/20 transition-colors">
                <p.icon className="w-6 h-6 text-orange-500 group-hover:text-[#25D366]" />
              </div>
              <div className="text-4xl font-black text-white mb-2 font-[Outfit] group-hover:text-[#25D366] transition-colors">{p.stat}</div>
              <div className="text-lg font-bold text-white mb-3 group-hover:text-[#25D366]/80 transition-colors">{p.label}</div>
              <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                {p.subtext}
              </p>
              
              {/* Subtle background glow on hover */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="inline-flex items-center gap-2 text-[#25D366] font-black group">
            TurantReply yeh sab automatically handle karta hai 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Problem;

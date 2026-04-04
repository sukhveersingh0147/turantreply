"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronRight, CheckCircle2, Rocket } from "lucide-react";

// Number counter component
const Counter = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const Hero = () => {
  const [chatStep, setChatStep] = useState(0);

  // Chat animation loop
  useEffect(() => {
    const timers = [
      setTimeout(() => setChatStep(1), 1000), // First message
      setTimeout(() => setChatStep(2), 2500), // AI Reply
      setTimeout(() => setChatStep(3), 4000), // Customer confirms
      setTimeout(() => setChatStep(4), 5500), // AI Final confirmation
      setTimeout(() => setChatStep(0), 10000), // Reset
    ];
    return () => timers.forEach(clearTimeout);
  }, [chatStep === 0]);

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex flex-col justify-center">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-[#25D366]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-[#25D366]/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-bold mb-8">
              <span className="flex h-2 w-2 rounded-full bg-[#25D366] animate-pulse" />
              🇮🇳 Made for Indian Businesses • 6 Industries Supported
            </div>

            <h1 className="text-5xl sm:text-7xl font-black font-[Outfit] leading-[1.1] mb-6">
              WhatsApp pe aao, <br />
              <span className="text-[#25D366] glow-text-green">Business badhao.</span>
            </h1>

            <p className="text-xl text-zinc-400 mb-10 max-w-xl leading-relaxed">
              India ka pehla WhatsApp assistant jo teri industry samajhta hai. 
              Salon ho, Gym ho, Coaching ho ya Real Estate — dashboard 
              <span className="text-white font-bold"> 60 seconds mein ready.</span> Zero setup.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-[#25D366] text-black font-black rounded-xl hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Apna Dashboard Setup Karo <ChevronRight className="w-5 h-5" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-bold rounded-xl border border-[#27272a] hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-current" /> Live Demo Dekho
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-[#27272a]">
              <div>
                <div className="text-2xl font-black text-white mb-1">
                  <Counter end={2400} />+
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Businesses</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white mb-1">
                  <Counter end={98} />%
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Lead Recovery</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white mb-1">
                  60s
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Setup Time</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white mb-1">
                  ₹0
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Setup Cost</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Chat Animation */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-full max-w-[400px] mx-auto bg-[#0a0a0a] rounded-[2.5rem] border-[8px] border-[#1a1a1a] shadow-2xl relative overflow-hidden aspect-[9/18]"
            >
              {/* Phone Status Bar */}
              <div className="bg-[#1a1a1a] h-6 flex justify-center items-center py-4">
                <div className="w-20 h-4 bg-black rounded-full" />
              </div>

              {/* Chat Header */}
              <div className="bg-[#128C7E] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">TurantReply Assistant</div>
                  <div className="text-white/70 text-[10px]">Online • Business Account</div>
                </div>
              </div>

              {/* Chat Content */}
              <div className="p-4 flex flex-col gap-4 h-full bg-[#0a0a0a] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-5">
                <AnimatePresence mode="popLayout">
                  {chatStep >= 1 && (
                    <motion.div
                      key="hero-chat-1"
                      initial={{ opacity: 0, x: -20, y: 10 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      className="max-w-[80%] bg-[#262626] text-white p-3 rounded-2xl rounded-tl-none text-sm self-start shadow-md"
                    >
                      Hi, appointment available hai kal?
                      <div className="text-[10px] text-white/40 mt-1 text-right">10:00 AM</div>
                    </motion.div>
                  )}

                  {chatStep >= 2 && (
                    <motion.div
                      key="hero-chat-2"
                      initial={{ opacity: 0, x: 20, y: 10 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      className="max-w-[80%] bg-[#056162] text-white p-3 rounded-2xl rounded-tr-none text-sm self-end shadow-md"
                    >
                      Namaste! 😊 Haan, kal ke slots available hain:<br />
                      - 10:00 AM<br />
                      - 2:00 PM<br />
                      - 4:30 PM<br /><br />
                      Konsa time suit karega?
                      <div className="text-[10px] text-white/60 mt-1 text-right font-bold">AI Assistant • 10:01 AM</div>
                    </motion.div>
                  )}

                  {chatStep >= 3 && (
                    <motion.div
                      key="hero-chat-3"
                      initial={{ opacity: 0, x: -20, y: 10 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      className="max-w-[80%] bg-[#262626] text-white p-3 rounded-2xl rounded-tl-none text-sm self-start shadow-md"
                    >
                      2 PM
                      <div className="text-[10px] text-white/40 mt-1 text-right">10:02 AM</div>
                    </motion.div>
                  )}

                  {chatStep >= 4 && (
                    <motion.div
                      key="hero-chat-4"
                      initial={{ opacity: 0, x: 20, y: 10 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      className="max-w-[80%] bg-[#056162] text-white p-3 rounded-2xl rounded-tr-none text-sm self-end shadow-md"
                    >
                      ✅ Perfect! Aapka appointment confirm ho gaya 2:00 PM ke liye.<br /><br />
                      Reminder bhej denge 1 ghante pehle! 🎉
                      <div className="text-[10px] text-white/60 mt-1 text-right font-bold">AI Assistant • 10:02 AM</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* AI Badge Overlay */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full px-4">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-[#25D366]/10 border border-[#25D366]/30 backdrop-blur-md px-4 py-2 rounded-full flex items-center justify-center gap-2 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                  <span className="text-[10px] font-bold text-[#25D366] uppercase tracking-tighter">
                    ⚡ Responded in 0.3s • Powered by TurantReply AI
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Decorative Orbs behind phone */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#25D366]/20 blur-3xl rounded-full -z-10 animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#25D366]/10 blur-3xl rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

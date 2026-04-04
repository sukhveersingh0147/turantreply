"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Kya mujhe WhatsApp Business account chahiye?",
    answer: "Haan, WhatsApp Business number chahiye. Setup mein hum aapko step-by-step guide karte hain — sirf 5 minute lagते hain."
  },
  {
    question: "Industry templates kaise kaam karte hain?",
    answer: "Signup ke waqt apna business type select karo. Immediately aapka dashboard pre-loaded ho jaata hai — service catalog, message templates, automation rules, AI prompts — sab aapki industry ke liye ready."
  },
  {
    question: "Kya existing WhatsApp number use kar sakte hain?",
    answer: "Bilkul. Aapka existing WhatsApp Business number TurantReply se connect ho sakta hai via Meta WhatsApp Cloud API."
  },
  {
    question: "PayU autopay kaise kaam karta hai?",
    answer: "First payment ke time ek baar authorize karo. Uske baad har month automatic deduct hota hai. Dashboard se kabhi bhi cancel kar sakte hain."
  },
  {
    question: "Kya AI Hindi mein baat kar sakta hai?",
    answer: "Haan! AI Hindi, Hinglish, aur English — teeno mein respond karta hai. Aap apni preferred language Settings mein set kar sakte hain."
  },
  {
    question: "Free trial mein kya milta hai?",
    answer: "14 din ke liye Growth plan ke saare features free milte hain. No credit card required. Trial khatam hone pe automatically free plan pe aao ya upgrade karo."
  }
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 md:py-32 bg-[#0a0a0a] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 fade-up">
          <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-4">
            Aksar pooche jaane wale sawaal
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            Everything you need to know about TurantReply.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <button
                onClick={() => toggleFAQ(i)}
                className={`w-full p-6 md:p-8 rounded-2xl text-left transition-all duration-300 border flex items-center justify-between gap-4 ${
                  activeIndex === i
                    ? "bg-[#111111] border-[#25D366]/30 shadow-[0_0_30px_rgba(37,211,102,0.05)]"
                    : "bg-[#0a0a0a] border-white/5 hover:border-[#25D366]/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-4">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                      activeIndex === i ? "border-[#25D366]/40 text-[#25D366]" : "border-white/10 text-zinc-600"
                   }`}>
                      <HelpCircle className="w-4 h-4" />
                   </div>
                   <span className={`text-lg font-bold font-[Outfit] transition-colors ${
                      activeIndex === i ? "text-[#25D366]" : "text-white"
                   }`}>
                      {f.question}
                   </span>
                </div>
                <div className={`shrink-0 transition-transform duration-300 ${activeIndex === i ? "rotate-90" : ""}`}>
                  {activeIndex === i ? (
                    <Minus className="w-5 h-5 text-[#25D366]" />
                  ) : (
                    <Plus className="w-5 h-5 text-zinc-600" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {activeIndex === i && (
                  <motion.div
                    key="faq-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-8 text-zinc-500 leading-relaxed pt-0">
                      <div className="h-px w-full bg-zinc-800 mb-6" />
                      {f.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

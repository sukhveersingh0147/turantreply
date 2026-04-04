"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Play, 
  ShieldCheck, 
  ChevronRight,
  MessageCircle,
  Zap,
  HelpCircle,
  Plus,
  Minus,
  Star
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { PricingCards } from "./PricingCards";

interface VerticalPageProps {
  vertical: string;
  emoji: string;
  title: string;
  headline: string;
  subheadline: string;
  metaTitle: string;
  metaDescription: string;
  chatMessages: {
    sender: "customer" | "ai";
    message: string;
    delay: number;
  }[];
  problems: {
    icon: string;
    stat: string;
    label: string;
    subtext: string;
  }[];
  exclusiveFeatures: {
    icon: string;
    title: string;
    description: string;
  }[];
  benefits: {
    icon: string;
    title: string;
    description: string;
    result: string;
  }[];
  testimonial: {
    quote: string;
    name: string;
    role: string;
    location: string;
    result: string;
  };
  faqs: {
    question: string;
    answer: string;
  }[];
  ctaText: string;
  ctaSubtext: string;
}

export function VerticalPage(props: VerticalPageProps) {
  const [chatStep, setChatStep] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Chat animation loop
  useEffect(() => {
    if (props.chatMessages.length === 0) return;

    const timers = props.chatMessages.map((msg, index) => {
      return setTimeout(() => setChatStep(index + 1), msg.delay);
    });

    const resetTimer = setTimeout(() => setChatStep(0), 8000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(resetTimer);
    };
  }, [chatStep === 0, props.chatMessages]);

  const allFaqs = [
    ...props.faqs,
    {
      question: "PayU autopay kaise kaam karta hai?",
      answer: "Pehli payment pe ek baar authorize karo. Uske baad har month automatic deduct. Dashboard se kabhi bhi cancel kar sakte hain."
    },
    {
      question: "Kya free trial mein card chahiye?",
      answer: "Bilkul nahi. 14 din ke liye Growth plan ke saare features free milte hain. No credit card, no commitment."
    }
  ];

  const getStep3Desc = () => {
    switch (props.vertical) {
      case "salon": return "Appointments book hona shuru, no-shows kam hona shuru";
      case "gym": return "Trial bookings aana shuru, renewals automatic hona shuru";
      case "coaching": return "Demo class inquiries handle hona shuru, fee reminders auto-jaana shuru";
      case "realestate": return "Property inquiries 0.3s mein reply hona shuru, leads qualify hona shuru";
      case "restaurant": return "Table bookings confirm hona shuru, daily specials broadcast hona shuru";
      default: return "AI kaam pe lag jaata hai aur aapka business automate hota hai";
    }
  };

  const renderHeadline = (text: string) => {
    const parts = text.split("\\n");
    return (
      <>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {part.split(" ").map((word, j) => {
              const isGreen = word.toLowerCase().includes("khud") || 
                              word.toLowerCase().includes("reply") || 
                              word.toLowerCase().includes("automate");
              return (
                <span key={j} className={isGreen ? "text-[#25D366] glow-text-green" : ""}>
                  {word}{" "}
                </span>
              );
            })}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <div className="bg-[#0a0a0a] text-white selection:bg-[#25D366]/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-20 flex flex-col justify-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-[#25D366]/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-[#25D366]/5 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-bold mb-8">
                {props.emoji} {props.title} ke liye specially banaya gaya
              </div>
              
              <h1 className="text-5xl sm:text-7xl font-black font-[Outfit] leading-[1.1] mb-6 whitespace-pre-line">
                {renderHeadline(props.headline)}
              </h1>

              <p className="text-xl text-zinc-400 mb-10 max-w-xl leading-relaxed">
                {props.subheadline}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                <Link
                  href={`/signup?vertical=${props.vertical}`}
                  className="w-full sm:w-auto px-8 py-4 bg-[#25D366] text-black font-black rounded-xl hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  {props.ctaText} <ChevronRight className="w-5 h-5" />
                </Link>
                <a 
                  href="#demo"
                  className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-bold rounded-xl border border-[#27272a] hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" /> Pehle demo dekho
                </a>
              </div>

              <div className="flex flex-wrap gap-6 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#25D366]" /> 14 din free</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#25D366]" /> No credit card</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#25D366]" /> 60 sec setup</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#25D366]" /> Made for India</div>
              </div>
            </motion.div>

            <div className="relative hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[380px] mx-auto bg-[#0a0a0a] rounded-[2.5rem] border-[8px] border-[#1a1a1a] shadow-2xl relative overflow-hidden aspect-[9/18]"
              >
                <div className="bg-[#128C7E] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                    {props.emoji}
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{props.title} Assistant</div>
                    <div className="text-white/70 text-[10px]">Online • Business Account</div>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-4 h-full bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-5">
                  <AnimatePresence mode="popLayout">
                    {props.chatMessages.map((msg, i) => (
                      chatStep > i && (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: msg.sender === "customer" ? -20 : 20, y: 10 }}
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-md ${
                            msg.sender === "customer" 
                              ? "bg-[#262626] text-white self-start rounded-tl-none" 
                              : "bg-[#056162] text-white self-end rounded-tr-none"
                          }`}
                        >
                          {msg.message.split("\n").map((line, li) => (
                             <React.Fragment key={li}>{line}<br/></React.Fragment>
                          ))}
                          <div className="text-[9px] text-white/40 mt-1 text-right">
                            {msg.sender === "ai" ? "AI Assistant • " : ""}10:{10 + i} AM
                          </div>
                        </motion.div>
                      )
                    ))}
                  </AnimatePresence>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full px-4">
                  <div className="bg-[#25D366]/10 border border-[#25D366]/30 backdrop-blur-md px-4 py-2 rounded-full flex items-center justify-center gap-2 shadow-lg">
                    <Zap className="w-3 h-3 text-[#25D366]" />
                    <span className="text-[9px] font-black text-[#25D366] uppercase tracking-tighter">
                      ⚡ 0.3s Instant Response
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-16">
            {props.title} mein yeh problems toh hain na?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {props.problems.map((prob, i) => (
              <div key={i} className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-all text-center group">
                <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all">{prob.icon}</div>
                <div className="text-4xl font-black text-red-500 font-[Outfit] mb-2">{prob.stat}</div>
                <div className="text-lg font-bold text-white mb-2">{prob.label}</div>
                <p className="text-sm text-zinc-500">{prob.subtext}</p>
              </div>
            ))}
          </div>
          <p className="text-[#25D366] font-bold text-lg animate-pulse">
            TurantReply yeh sab automatically handle karta hai — {props.title} ke liye →
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-16">
            {props.title} ke liye setup karna kitna easy hai
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
             {/* Connection lines */}
             <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-white/5 -z-10" />
             
             {[
               { icon: "🏪", title: "Business type select karo", desc: `${props.title} choose karo — dashboard 60 seconds mein ready`, time: "< 30 seconds" },
               { icon: "📱", title: "WhatsApp connect karo", desc: "Existing number connect karo — koi technical knowledge nahi chahiye", time: "< 5 minutes" },
               { icon: "🤖", title: "AI kaam pe lag jaata hai", desc: getStep3Desc(), time: "Immediately" }
             ].map((step, i) => (
               <div key={i} className="flex flex-col items-center">
                 <div className="w-20 h-20 rounded-3xl bg-[#111111] border border-white/10 flex items-center justify-center text-3xl mb-6 shadow-xl relative">
                    {step.icon}
                    <div className="absolute -top-3 -right-3 px-2 py-1 bg-[#25D366] text-black text-[10px] font-black rounded-lg">
                      {step.time}
                    </div>
                 </div>
                 <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                 <p className="text-sm text-zinc-500 max-w-[250px] mx-auto">{step.desc}</p>
                 <div className="mt-4 text-[#25D366] text-xs font-black uppercase tracking-widest">Step 0{i+1}</div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Exclusive Features */}
      <section className="py-24 bg-[#0d0d0d] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-4">
              Sirf {props.title} ke liye — kisi aur tool mein nahi
             </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {props.exclusiveFeatures.map((feat, i) => (
              <div key={i} className="p-8 rounded-3xl bg-[#111111] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-4 right-4 bg-[#25D366]/20 text-[#25D366] text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">EXCLUSIVE</div>
                <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-2xl mb-6 border border-[#25D366]/20 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feat.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section id="demo" className="py-24 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-16">
            Dekho kaise kaam karta hai — {props.title} ke liye
          </h2>
          
          <div className="rounded-[2.5rem] bg-[#111111] border-2 border-[#25D366]/20 p-8 md:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               {/* Mobile Preview */}
               <div className="w-full max-w-[300px] mx-auto bg-[#0a0a0a] rounded-[2rem] border-[6px] border-[#1a1a1a] aspect-[9/16] overflow-hidden flex flex-col shadow-2xl scale-90">
                  <div className="bg-[#128C7E] p-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">{props.emoji}</div>
                    <div className="text-white font-bold text-[10px]">{props.title} Assistant</div>
                  </div>
                  <div className="p-3 flex flex-col gap-3 flex-1 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-5">
                    {props.chatMessages.map((msg, i) => (
                      chatStep > i && (
                        <div key={i} className={`p-2 rounded-xl text-[10px] ${msg.sender === "customer" ? "bg-[#262626] self-start" : "bg-[#056162] self-end"}`}>
                           {msg.message}
                        </div>
                      )
                    ))}
                  </div>
               </div>

               {/* Explainer Labels */}
               <div className="text-left space-y-8">
                  {[
                    { label: "Customer ne inquiry bheji", color: "white" },
                    { label: "TurantReply ne 0.3s mein reply kiya", color: "#25D366" },
                    { label: "Customer ne slot choose kiya", color: "white" },
                    { label: "Appointment automatically confirm hua", color: "#25D366" },
                    { label: "No human involvement needed ✅", color: "white" }
                  ].map((explainer, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center text-xs font-black">
                        {i + 1}
                      </div>
                      <p className={`text-lg font-bold`} style={{ color: explainer.color }}>{explainer.label}</p>
                    </motion.div>
                  ))}
               </div>
            </div>
          </div>
          <p className="mt-12 text-zinc-500 font-bold italic">
            Yeh 24/7 hota hai — raat ko bhi, Sunday ko bhi, holidays pe bhi.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-[#0d0d0d] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-16">
            {props.title} ke liye kya fark padega
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {props.benefits.map((ben, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                <div className="text-4xl mb-6">{ben.icon}</div>
                <h3 className="text-xl font-bold mb-4">{ben.title}</h3>
                <p className="text-zinc-500 mb-6 text-sm">{ben.description}</p>
                <div className="text-2xl font-black text-[#25D366] font-[Outfit]">{ben.result}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="p-12 md:p-16 rounded-[2.5rem] bg-[#111111] border-l-8 border-[#25D366] shadow-2xl relative">
              <div className="flex gap-1 mb-8 text-yellow-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <blockquote className="text-2xl md:text-3xl font-bold font-[Outfit] italic text-white leading-relaxed mb-12">
                "{props.testimonial.quote}"
              </blockquote>
              <div className="flex items-center justify-between gap-6 flex-wrap">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#25D366]/20 flex items-center justify-center text-xl font-black text-[#25D366]">
                      {props.testimonial.name[0]}
                    </div>
                    <div>
                       <div className="text-lg font-bold text-white">{props.testimonial.name}</div>
                       <div className="text-sm text-zinc-500">{props.testimonial.role} • {props.testimonial.location}</div>
                    </div>
                 </div>
                 <div className="px-4 py-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-black rounded-full">
                    {props.testimonial.result}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-[#0d0d0d] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-4">
            {props.title} ke liye kitna lagega?
          </h2>
          <p className="text-zinc-500 mb-20">14 din free — no credit card required</p>
          
          <PricingCards vertical={props.vertical} verticalTitle={props.title} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-16 text-center">
             {props.title} owners ke common sawaal
           </h2>
           <div className="space-y-4">
             {allFaqs.map((faq, i) => (
               <div key={i} className="group">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className={`w-full p-6 md:p-8 rounded-2xl text-left transition-all border flex items-center justify-between gap-4 ${
                      activeFaq === i ? "bg-[#111111] border-[#25D366]/30" : "bg-transparent border-white/5 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                          activeFaq === i ? "border-[#25D366]/40 text-[#25D366]" : "border-white/10 text-zinc-600"
                        }`}>
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <span className={`text-lg font-bold font-[Outfit] ${activeFaq === i ? "text-[#25D366]" : "text-white"}`}>{faq.question}</span>
                    </div>
                    {activeFaq === i ? <Minus className="w-5 h-5 text-[#25D366]" /> : <Plus className="w-5 h-5 text-zinc-600" />}
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        key="faq-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                         <div className="p-8 text-zinc-500 pt-0 text-sm leading-relaxed whitespace-pre-line">
                            <div className="h-px bg-white/5 w-full mb-6" />
                            {faq.answer}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-[#111111] to-[#0a0a0a] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
           <h2 className="text-4xl md:text-6xl font-black font-[Outfit] mb-8">
             Ready hai? Apna <span className="text-[#25D366]">{props.title}</span> business WhatsApp pe automate karo.
           </h2>
           <p className="text-zinc-500 text-lg mb-12">
             60 seconds mein setup. 14 din free. No credit card.
           </p>
           <Link
              href={`/signup?vertical=${props.vertical}`}
              className="px-12 py-5 bg-[#25D366] text-black font-black rounded-2xl hover:shadow-[0_0_50px_rgba(37,211,102,0.4)] transition-all hover:-translate-y-2 text-xl inline-block"
            >
              {props.ctaText}
            </Link>
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
               <span>🔒 Secure</span>
               <span>✅ No Credit Card</span>
               <span>🇮🇳 Made in India</span>
               <span>⚡ 60 Sec Setup</span>
            </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#25D366]/5 blur-[100px] rounded-full -z-10" />
      </section>

      <Footer />
    </div>
  );
}

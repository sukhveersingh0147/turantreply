"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, 
  Dumbbell, 
  GraduationCap, 
  Home, 
  Utensils, 
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  MessageCircle,
  BarChart3
} from "lucide-react";

const verticals = [
  {
    id: "salon",
    name: "Salon",
    icon: Scissors,
    title: "Salon & Beauty ke liye ready features:",
    features: [
      "Appointment booking automation",
      "Pre-loaded salon service catalog",
      "No-show reminder sequences",
      "Festival offer templates (Diwali, Eid, etc.)",
      "Client win-back campaigns",
      "AI trained on salon queries",
      "Birthday & anniversary messages",
      "Review collection automation"
    ],
    chat: {
      customer: "Facial available hai aaj?",
      ai: "Haan! 😊 Aaj ke available slots:\n• 11 AM • 2 PM • 5 PM\nKonsa time suit karega?"
    }
  },
  {
    id: "gym",
    name: "Gym",
    icon: Dumbbell,
    title: "Gym & Fitness ke liye ready features:",
    features: [
      "Trial session automation",
      "Membership renewal reminders",
      "Progress tracking via WhatsApp",
      "New batch announcements",
      "Personal training lead capture",
      "Gym rules & FAQ bot",
      "Member attendance alerts",
      "Supplement store catalog"
    ],
    chat: {
      customer: "Membership kitne ki hai?",
      ai: "💪 Hamare plans:\n• Monthly: ₹1,500\n• Quarterly: ₹3,999\n• Annual: ₹9,999\nFREE trial bhi available hai!\nBook karein? 🏋️"
    }
  },
  {
    id: "coaching",
    name: "Coaching",
    icon: GraduationCap,
    title: "Coaching & Education ke liye ready features:",
    features: [
      "Demo class registration",
      "Fee payment reminders",
      "Doubt solving assistant",
      "Exam schedule broadcasts",
      "Parent communication bot",
      "Course material sharing",
      "Attendance notifications",
      "Result announcements"
    ],
    chat: {
      customer: "Demo class kab hai?",
      ai: "📚 Next demo class:\nKal - Saturday 10 AM\nSubject: Mathematics\nFREE hai! Name register karein?"
    }
  },
  {
    id: "realestate",
    name: "Real Estate",
    icon: Home,
    title: "Real Estate ke liye ready features:",
    features: [
      "Property catalog sharing",
      "Site visit scheduling",
      "Lead qualification bot",
      "Project brochure automation",
      "Price list broadcasts",
      "Client follow-up sequences",
      "Rental query handling",
      "Maintenance request bot"
    ],
    chat: {
      customer: "2BHK available hai Jaipur mein?",
      ai: "🏠 Haan! 3 options hain aapke budget mein:\n1. Vaishali Nagar - ₹45L\n2. Mansarovar - ₹52L\n3. Jagatpura - ₹38L\nSite visit book karein?"
    }
  },
  {
    id: "restaurant",
    name: "Restaurant",
    icon: Utensils,
    title: "Restaurant & Cafe ke liye ready features:",
    features: [
      "Table reservation system",
      "Digital menu sharing",
      "Order status updates",
      "Special offer broadcasts",
      "Feedback collection script",
      "Location & hours bot",
      "Party booking queries",
      "Chef's special updates"
    ],
    chat: {
      customer: "Table available hai Saturday 8 baje?",
      ai: "🍽️ Saturday 8 PM ke liye:\nKitne guests honge?\nKoi special occasion? 🎂"
    }
  },
  {
    id: "other",
    name: "Other",
    icon: Layers,
    title: "Every business ke liye ready features:",
    features: [
      "24/7 AI customer support",
      "Custom lead recovery",
      "Smart broadcast engine",
      "Automated follow-ups",
      "Payment link generation",
      "Customer tagging & CRM",
      "Team collaboration tools",
      "Detailed ROI analytics"
    ],
    chat: {
      customer: "Price list bhejo",
      ai: "Zaroor! 😊 Humari services:\n[Your catalog automatically here]\nKoi specific query hai?"
    }
  }
];

const VerticalSelector = () => {
  const [activeTab, setActiveTab] = useState(verticals[0]);

  return (
    <section id="verticals" className="py-24 md:py-32 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#25D366]/5 blur-[150px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-4">
            Apna business choose karo — dekho exactly kya milega
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            India ka pehla WhatsApp tool jo teri industry ke liye pre-configured hai
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex overflow-x-auto pb-4 mb-12 gap-2 no-scrollbar justify-start md:justify-center">
          {verticals.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveTab(v)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all border ${
                activeTab.id === v.id
                  ? "bg-[#25D366] text-black border-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.3)]"
                  : "bg-white/5 text-zinc-500 border-white/5 hover:border-zinc-700 hover:text-white"
              }`}
            >
              <v.icon className="w-4 h-4" />
              {v.name}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-[#111111] p-8 md:p-16 rounded-3xl border border-white/5 shadow-2xl relative"
          >
            {/* Left Side: Features */}
            <div>
              <h3 className="text-2xl font-black mb-8 font-[Outfit] text-white">
                {activeTab.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTab.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                    <span className="text-zinc-400 text-sm leading-tight">{f}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12 pt-8 border-t border-zinc-800/50">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] text-black font-black rounded-xl hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] transition-all hover:-translate-y-1"
                >
                  Mera {activeTab.name} Dashboard Setup Karo <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right Side: Chat Preview */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-[320px] bg-[#0a0a0a] rounded-3xl border-[6px] border-[#1a1a1a] shadow-xl overflow-hidden aspect-[9/16] relative flex flex-col">
                <div className="bg-[#128C7E] p-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <activeTab.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-white font-bold text-xs">{activeTab.name} Assistant</div>
                </div>
                <div className="p-4 flex flex-col gap-4 flex-1 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-5">
                  <div className="max-w-[85%] bg-[#262626] text-white p-3 rounded-2xl rounded-tl-none text-xs self-start shadow-sm">
                    {activeTab.chat.customer}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-[85%] bg-[#056162] text-white p-3 rounded-2xl rounded-tr-none text-xs self-end shadow-sm"
                  >
                    {activeTab.chat.ai.split('\n').map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))}
                  </motion.div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-[#25D366]/10 border border-[#25D366]/20 p-2 rounded-lg text-center backdrop-blur-sm">
                   <p className="text-[8px] font-bold text-[#25D366] uppercase tracking-wider">⚡ AI Responded Automatically</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default VerticalSelector;

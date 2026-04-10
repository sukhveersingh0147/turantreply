"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight,
  Loader2,
  Lock
} from "lucide-react";
import { toast } from "sonner";

const businessTypes = [
  {
    id: "salon",
    icon: "💇",
    title: "Salon & Beauty",
    description: "Appointments, offers, client reminders",
    tags: ["Booking", "Reminders", "Offers"]
  },
  {
    id: "gym",
    icon: "💪",
    title: "Gym & Fitness",
    description: "Memberships, trials, renewals",
    tags: ["Trials", "Renewals", "Campaigns"]
  },
  {
    id: "coaching",
    icon: "📚",
    title: "Coaching & Tuition",
    description: "Demo classes, fee reminders, batches",
    tags: ["Demos", "Fee Reminders", "Batches"]
  },
  {
    id: "realestate",
    icon: "🏠",
    title: "Real Estate",
    description: "Property enquiries, site visits, follow-ups",
    tags: ["Inquiries", "Site Visits", "Follow-ups"]
  },
  {
    id: "restaurant",
    icon: "🍽️",
    title: "Restaurant & Cafe",
    description: "Menu, reservations, daily offers",
    tags: ["Reservations", "Menu", "Daily Offers"]
  },
  {
    id: "other",
    icon: "🏢",
    title: "Other Business",
    description: "Koi bhi doosra business — apne hisaab se customize karo",
    tags: ["Custom", "Flexible", "Any Industry"]
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = async () => {
    if (!selectedType) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: selectedType,
          businessName: selectedType === "other" ? businessName : undefined,
          onboardingCompleted: true
        })
      });

      if (!res.ok) throw new Error("Failed to save onboarding data");

      // Update session to reflect completion
      await update({ onboardingCompleted: true });

      // Save to localStorage as requested
      localStorage.setItem("businessType", selectedType);
      localStorage.setItem("onboardingCompleted", "true");

      toast.success("Dashboard configuration started!");
      router.push(`/onboarding/business-details?type=${selectedType}`);
    } catch (error) {
      console.error(error);
      toast.error("Kuch toh gadbad ho gayi. Dobara try karein?");
    } finally {
      setIsLoading(false);
    }
  };

  const skipOnboarding = async () => {
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingCompleted: true })
      });
      if (res.ok) {
        await update({ onboardingCompleted: true });
        router.replace("/overview");
      }
    } catch (e) {
      router.replace("/overview");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center max-w-4xl mx-auto py-12 px-4"
    >
      {/* Top Section */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20">
              <Rocket className="w-6 h-6 text-[#25D366]" />
            </div>
            <span className="text-2xl font-black font-[Outfit] text-[#25D366]">Turant<span className="text-white">Reply</span></span>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] font-black uppercase tracking-widest mb-6">
           Step 1 of 2
        </div>

        <h1 className="text-3xl md:text-5xl font-black font-[Outfit] mb-4 text-balance">
           Aapka business kaunsa hai?
        </h1>
        <p className="text-zinc-500 max-w-xl text-balance leading-relaxed">
           Hum aapka dashboard isi hisaab se pre-configure kar denge — templates, automations, AI prompts — sab ready in 60 seconds.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8">
        {businessTypes.map((type, i) => (
          <motion.button
            key={type.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedType(type.id)}
            className={`text-left p-6 rounded-2xl border transition-all relative overflow-hidden group ${
              selectedType === type.id
                ? "border-[#25D366] bg-gradient-to-br from-[#0a1a0f] to-[#111111] shadow-[0_0_20px_rgba(37,211,102,0.15)] ring-1 ring-[#25D366]"
                : "border-[#27272a] bg-[#111111] hover:border-zinc-700 hover:-translate-y-0.5"
            }`}
          >
            {selectedType === type.id && (
              <div className="absolute top-4 right-4">
                <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
              </div>
            )}
            
            <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">{type.icon}</div>
            <h3 className={`text-lg font-bold mb-2 font-[Outfit] ${selectedType === type.id ? "text-white" : "text-zinc-300"}`}>
              {type.title}
            </h3>
            <p className="text-xs text-zinc-500 mb-4 line-clamp-2 leading-relaxed">
              {type.description}
            </p>
            
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {type.tags.map(tag => (
                <span key={tag} className="text-[8px] font-black uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded-full text-zinc-500">
                  {tag}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Other Business Input */}
      <AnimatePresence>
        {selectedType === "other" && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full mb-8 overflow-hidden"
          >
            <div className="p-1">
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">
                   Aapka business kya karta hai?
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Car Service Center, Boutique, Clinic..."
                  className="w-full bg-[#111111] border border-[#27272a] rounded-xl px-4 py-4 text-white focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] outline-none transition-all placeholder:text-zinc-700"
                  autoFocus
                />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex flex-col items-center w-full gap-4">
        <button
          onClick={handleSetup}
          disabled={!selectedType || isLoading}
          className={`w-full sm:w-auto sm:min-w-[300px] py-4 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
            selectedType && !isLoading
              ? "bg-[#25D366] text-black hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:-translate-y-0.5"
              : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Setting up your dashboard...
            </>
          ) : (
            <>
              Setup My Dashboard <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        <button 
          onClick={skipOnboarding}
          className="text-zinc-500 hover:text-white text-xs font-bold transition-colors py-2 flex items-center gap-1 group"
        >
          Skip for now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center gap-1.5 text-zinc-600 mt-4">
          <Lock className="w-3 h-3" />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Takes less than 60 seconds</span>
        </div>
      </div>
    </motion.div>
  );
}

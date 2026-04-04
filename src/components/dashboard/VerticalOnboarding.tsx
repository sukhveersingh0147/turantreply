"use client";

import { useState, useEffect } from "react";
import { 
    Scissors, 
    Dumbbell, 
    GraduationCap, 
    Home, 
    Utensils, 
    Layers, 
    Check, 
    Loader2, 
    Sparkles, 
    ArrowRight,
    Rocket,
    Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { VERTICAL_TEMPLATES, VerticalType } from "@/lib/vertical-templates";

const VERTICALS = [
    { id: "salon", name: "Salon & Beauty", icon: Scissors, color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20" },
    { id: "gym", name: "Gym & Fitness", icon: Dumbbell, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
    { id: "coaching", name: "Coaching & Tuition", icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { id: "realestate", name: "Real Estate", icon: Home, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    { id: "restaurant", name: "Restaurant & Cafe", icon: Utensils, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
    { id: "other", name: "Other Business", icon: Layers, color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20" },
];

export default function VerticalOnboarding() {
    const [step, setStep] = useState(1);
    const [selectedVertical, setSelectedVertical] = useState<VerticalType | "">("");
    const [businessName, setBusinessName] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const router = useRouter();

    const messages = [
        "Analyzing industry best practices...",
        "Training AI on your business vertical...",
        "Pre-loading WhatsApp message templates...",
        "Configuring automated booking flows...",
        "Seeding your dashboard with smart data...",
        "Finalizing your 60-second setup...",
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (loading) {
            let i = 0;
            setLoadingMessage(messages[0]);
            interval = setInterval(() => {
                i++;
                if (i < messages.length) {
                    setLoadingMessage(messages[i]);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const handleLaunch = async () => {
        if (!selectedVertical || !businessName) {
            toast.error("Please select a vertical and enter your business name.");
            return;
        }

        setLoading(true);
        try {
            // Step 5: Auto-seed API call
            const response = await fetch("/api/vertical-setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vertical: selectedVertical, businessName }),
            });

            if (!response.ok) throw new Error("Setup failed");

            // Wait for animation to feel "premium"
            await new Promise((resolve) => setTimeout(resolve, 8000));

            toast.success("Dashboard Ready! Welcome aboard.");
            router.push("/overview");
        } catch (error) {
            toast.error("Something went wrong during setup.");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in duration-700">
                <div className="relative mb-12">
                    <div className="w-24 h-24 rounded-full border-4 border-[#25D366]/20 border-t-[#25D366] animate-spin" />
                    <Rocket className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#25D366] animate-pulse" />
                </div>
                <h2 className="text-3xl font-black font-[Outfit] mb-4">Setting up your AI Dashboard</h2>
                <p className="text-[#25D366] font-mono text-sm tracking-tighter uppercase animate-pulse">
                    {loadingMessage}
                </p>
                <div className="mt-12 max-w-sm w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#25D366] h-full transition-all duration-[8000ms] ease-linear w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] font-bold uppercase tracking-widest mb-6">
                    <Zap className="w-3 h-3 fill-current" /> Zero Manual Setup
                </div>
                <h1 className="text-4xl sm:text-6xl font-black font-[Outfit] mb-4">
                    {step === 1 ? "Choose your industry" : "What's your business name?"}
                </h1>
                <p className="text-white/40 max-w-xl mx-auto text-sm sm:text-base">
                    {step === 1 
                        ? "Select the category that best fits your business. We'll pre-configure your dashboard instantly." 
                        : "Tell us what your customers call you. We'll use this for your AI's branding."}
                </p>
            </div>

            {step === 1 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {VERTICALS.map((v) => (
                        <button
                            key={v.id}
                            onClick={() => {
                                setSelectedVertical(v.id as VerticalType);
                                setStep(2);
                            }}
                            className={`group relative flex flex-col p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 text-left ${
                                selectedVertical === v.id 
                                    ? `bg-white/5 border-[#25D366] shadow-[0_0_40px_rgba(37,211,102,0.15)]` 
                                    : `bg-white/5 border-white/5 hover:border-white/10`
                            }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl ${v.bg} flex items-center justify-center mb-6 border ${v.border} group-hover:scale-110 transition-transform duration-500`}>
                                <v.icon className={`w-7 h-7 ${v.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 font-[Outfit]">{v.name}</h3>
                            <p className="text-xs text-white/40 leading-relaxed">
                                {VERTICAL_TEMPLATES[v.id as VerticalType]?.description || "Pre-loaded automation and templates."}
                            </p>
                            <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-[#25D366] opacity-0 group-hover:opacity-100 transition-opacity">
                                Select <ArrowRight className="w-3 h-3" />
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="max-w-md mx-auto">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#25D366]/10 blur-3xl rounded-full" />
                        
                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Business Name</label>
                                <input 
                                    autoFocus
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="e.g. Royal Salon & Spa"
                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]/20 outline-none transition-all placeholder:text-white/10 text-lg font-medium"
                                />
                            </div>

                            <button
                                onClick={handleLaunch}
                                disabled={!businessName || businessName.length < 3}
                                className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-[#25D366] text-black font-black text-lg hover:shadow-[0_0_50px_rgba(37,211,102,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-30 disabled:hover:translate-y-0"
                            >
                                Launch My Dashboard <Sparkles className="w-5 h-5 fill-current" />
                            </button>

                            <button 
                                onClick={() => setStep(1)}
                                className="w-full text-center text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-widest pt-2 transition-colors"
                            >
                                Back to industries
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">WhatsApp Linked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">AI Pre-trained</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

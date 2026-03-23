"use client";

import { useState } from "react";
import { 
    BookOpen, 
    ChevronRight, 
    Lightbulb, 
    PlayCircle, 
    Zap, 
    Target, 
    BarChart3,
    X,
    MessageSquare,
    Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
    title: string;
    description: string;
    icon: any;
}

interface SetupGuideProps {
    title: string;
    description: string;
    steps: Step[];
    type: "AUTOMATION" | "CAMPAIGN";
}

export default function SetupGuide({ title, description, steps, type }: SetupGuideProps) {
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) return (
        <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-[#25D366] text-black shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 border-4 border-black/20"
        >
            <BookOpen className="w-5 h-5" />
        </button>
    );

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass-card border border-[#25D366]/20 bg-[#25D366]/5 p-6 mb-8 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-2">
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.3)]">
                                <Zap className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black font-[Outfit] text-white underline decoration-[#25D366]/30 underline-offset-4">{title}</h2>
                                <p className="text-xs text-white/40 font-medium mt-1">{description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                            {steps.map((step, idx) => {
                                const Icon = step.icon;
                                return (
                                    <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[#25D366]/20 transition-all group/step">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#25D366] group-hover/step:scale-110 transition-transform">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Step 0{idx + 1}</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-white/90 mb-1">{step.title}</h3>
                                        <p className="text-[11px] text-white/40 leading-relaxed font-medium">{step.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="w-full md:w-64 space-y-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <h4 className="text-[10px] font-black text-[#25D366] uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Lightbulb className="w-3 h-3" /> Pro Tip
                            </h4>
                            <p className="text-[11px] text-white/60 leading-relaxed italic">
                                {type === "AUTOMATION" 
                                    ? "Combine 'Keyword' triggers with 'Lead Stage' filters to create highly targeted responses that feel personal."
                                    : "A/B test different initial hooks. Our data shows that starting with a question increases reply rates by 35%."}
                            </p>
                        </div>
                        <button className="w-full py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                            <PlayCircle className="w-4 h-4" /> Watch Tutorial
                        </button>
                    </div>
                </div>

                <div className="absolute -bottom-6 -left-6 opacity-5 rotate-12">
                    <BookOpen className="w-32 h-32 text-[#25D366]" />
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

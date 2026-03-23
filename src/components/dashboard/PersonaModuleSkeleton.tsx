"use client";
import { useSearchParams } from "next/navigation";
import { Bot } from "lucide-react";

export default function PersonaModuleSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black font-[Outfit] text-white italic tracking-tighter uppercase">Module Under Development</h1>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[10px] font-black text-[#25D366] uppercase tracking-widest">
                    <Bot className="w-3.5 h-3.5" />
                    AI Ready
                </div>
            </div>

            <div className="glass-card border border-white/5 p-12 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-white/5 rounded-full">
                    <Bot className="w-12 h-12 text-[#25D366] animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-white">This module is coming soon!</h2>
                <p className="text-white/40 max-w-md">
                    We are building a highly specialized Experience for your business persona. 
                    The AI is already capable of handling these requests in the background.
                </p>
            </div>
        </div>
    );
}

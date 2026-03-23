import React from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, PartyPopper, Sparkles } from "lucide-react";

export default function PaymentSuccessPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#060a0f] text-white flex items-center justify-center">
            <div className="max-w-md w-full px-4 text-center">
                <div className="relative mb-8 inline-block">
                    <div className="absolute inset-0 bg-[#25D366]/20 blur-3xl rounded-full animate-pulse" />
                    <div className="relative w-24 h-24 rounded-full bg-[#25D366]/10 border-2 border-[#25D366]/30 flex items-center justify-center mx-auto">
                        <CheckCircle className="w-12 h-12 text-[#25D366]" />
                    </div>
                </div>

                <div className="space-y-4 mb-10">
                    <h1 className="text-4xl font-black font-[Outfit] text-gradient">Payment Successful 🎉</h1>
                    <p className="text-white/60 text-lg">
                        Your subscription has been activated successfully. Welcome to the premium club!
                    </p>
                </div>

                <div className="glass-card p-6 border border-white/5 bg-white/[0.02] mb-10 text-left">
                    <h2 className="text-sm font-bold text-[#25D366] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Next Steps
                    </h2>
                    <ul className="space-y-3 text-sm text-white/50">
                        <li className="flex gap-3">
                            <span className="w-5 h-5 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                            Head to your dashboard to see your new plan.
                        </li>
                        <li className="flex gap-3">
                            <span className="w-5 h-5 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                            Set up your AI configurations if you haven't already.
                        </li>
                        <li className="flex gap-3">
                            <span className="w-5 h-5 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                            Start automating your WhatsApp sales!
                        </li>
                    </ul>
                </div>

                <Link 
                    href="/overview" 
                    className="group block w-full py-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold transition-all hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:-translate-y-1 active:scale-95"
                >
                    <span className="flex items-center justify-center gap-2">
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </Link>
            </div>
        </main>
    );
}

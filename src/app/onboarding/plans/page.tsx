"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { processMockPayment } from "@/app/actions/onboarding";
import { CheckCircle2, Zap } from "lucide-react";

export default function PlansPage() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { update } = useSession();

    const handleSelectPlan = (plan: "STARTER" | "GROWTH" | "PRO") => {
        startTransition(async () => {
            try {
                const res = await processMockPayment(plan);
                if (res?.success) {
                    await update({ plan });
                    router.push("/onboarding/wizard");
                }
            } catch (error) {
                console.error(error);
                alert("Something went wrong");
            }
        });
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-4xl w-full text-center mb-16">
                <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-[#25D366]/20 blur-xl rounded-full animate-pulse" />
                    <Zap className="w-8 h-8 text-[#25D366] relative z-10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4 font-[Outfit]">Choose Your Plan to Continue</h1>
                <p className="text-zinc-500 text-lg max-w-xl mx-auto">You must select a plan to activate your account and start your automated WhatsApp onboarding.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full items-start">
                {/* Starter Plan */}
                <div className="p-8 rounded-3xl bg-[#111111] border-2 border-white/5 flex flex-col relative transition-all duration-300 hover:scale-105">
                    <div className="mb-8">
                        <div className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-2">Starter</div>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-5xl font-black text-white font-[Outfit]">₹999</span>
                            <span className="text-zinc-500 text-lg">/month</span>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Perfect for starting out</div>
                    </div>
                    <div className="flex-1 space-y-4 mb-8 pt-8 border-t border-zinc-800">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                            <span className="text-sm text-white">100 AI Conversations</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                            <span className="text-sm text-white">Basic AI Personality</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                            <span className="text-sm text-white">Calendar Integration</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                            <span className="text-sm text-white">Limited Broadcasts</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleSelectPlan("STARTER")}
                        disabled={isPending}
                        className="w-full py-4 text-center block rounded-xl font-black transition-all bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
                    >
                        {isPending ? "Processing..." : "Select Starter (Mock)"}
                    </button>
                </div>

                {/* Growth Plan */}
                <div className="p-8 rounded-3xl bg-[#111111] border-2 border-[#25D366] shadow-[0_0_40px_rgba(37,211,102,0.15)] flex flex-col relative transition-all duration-300 scale-105 z-10">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#25D366] text-black text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-[#25D366]/20 animate-pulse">
                        Best Value
                    </div>
                    <div className="mb-8">
                        <div className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-2">Growth</div>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-5xl font-black text-white font-[Outfit]">₹2,499</span>
                            <span className="text-zinc-500 text-lg">/month</span>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#25D366]">Most Popular</div>
                    </div>
                    <div className="flex-1 space-y-4 mb-8 pt-8 border-t border-zinc-800">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                            <span className="text-sm text-white">500 AI Conversations</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                            <span className="text-sm text-white">Advanced AI Personality</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                            <span className="text-sm text-white">Calendar Integration</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                            <span className="text-sm text-white">Unlimited Broadcasts</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleSelectPlan("GROWTH")}
                        disabled={isPending}
                        className="w-full py-4 text-center block rounded-xl font-black transition-all bg-[#25D366] text-black hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] disabled:opacity-50"
                    >
                        {isPending ? "Processing..." : "Select Growth (Mock)"}
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="p-8 rounded-3xl bg-[#111111] border-2 border-white/5 flex flex-col relative transition-all duration-300 hover:scale-105">
                    <div className="mb-8">
                        <div className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-2">Pro</div>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-5xl font-black text-white font-[Outfit]">₹4,999</span>
                            <span className="text-zinc-500 text-lg">/month</span>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">For scaling businesses</div>
                    </div>
                    <div className="flex-1 space-y-4 mb-8 pt-8 border-t border-zinc-800">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                            <span className="text-sm text-white">Unlimited Conversations</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                            <span className="text-sm text-white">Custom AI Voice</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                            <span className="text-sm text-white">Priority Support</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleSelectPlan("PRO")}
                        disabled={isPending}
                        className="w-full py-4 text-center block rounded-xl font-black transition-all bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
                    >
                        {isPending ? "Processing..." : "Select Pro (Mock)"}
                    </button>
                </div>
            </div>

            <button 
                onClick={() => handleSelectPlan("STARTER")}
                disabled={isPending}
                className="mt-12 text-sm text-zinc-500 hover:text-white transition-colors underline underline-offset-4"
            >
                Skip for now (Dev Testing)
            </button>
        </div>
    );
}

import React from "react";
import Link from "next/link";
import { XCircle, RefreshCcw, MessageCircle, AlertTriangle } from "lucide-react";

export default function PaymentFailurePage() {
    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#060a0f] text-white flex items-center justify-center">
            <div className="max-w-md w-full px-4 text-center">
                <div className="relative mb-8 inline-block">
                    <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full" />
                    <div className="relative w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center mx-auto">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <div className="space-y-4 mb-10">
                    <h1 className="text-4xl font-black font-[Outfit]">Payment Failed</h1>
                    <p className="text-white/60 text-lg">
                        Oops! Your transaction couldn't be processed. Don't worry, no funds were deducted from your account.
                    </p>
                </div>

                <div className="glass-card p-6 border border-white/5 bg-white/[0.01] mb-10 text-left">
                    <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2 font-[Outfit]">
                        <AlertTriangle className="w-4 h-4" />
                        Possible Reasons
                    </h2>
                    <ul className="space-y-3 text-sm text-white/40 list-disc list-inside">
                        <li>Insufficient funds in your account.</li>
                        <li>Transaction declined by your bank.</li>
                        <li>Temporary network issues with the payment gateway.</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <Link 
                        href="/pricing" 
                        className="group block w-full py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-all flex items-center justify-center gap-3"
                    >
                        <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        Try Again
                    </Link>
                    
                    <a 
                        href="/contact" 
                        className="block w-full py-4 rounded-xl border border-white/5 text-white/60 hover:text-white transition-all text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Contact Support for help
                    </a>
                </div>
            </div>
        </main>
    );
}

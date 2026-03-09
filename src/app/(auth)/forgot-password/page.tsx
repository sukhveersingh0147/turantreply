import { type Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Forgot Password — ReplyFlow AI",
};

export default function ForgotPasswordPage() {
    return (
        <main className="min-h-screen bg-[#060a0f] bg-grid flex items-center justify-center px-4 py-20">
            <div className="fixed glow-orb w-96 h-96 bg-[#25D366]/15 top-0 left-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" fill="white" />
                        </div>
                        <span className="text-2xl font-bold font-[Outfit]">
                            Reply<span className="text-gradient">Flow</span>{" "}
                            <span className="text-[#25D366]">AI</span>
                        </span>
                    </Link>
                    <h1 className="text-3xl font-black font-[Outfit] mb-2">Reset password</h1>
                    <p className="text-sm text-white/50">
                        Enter your email and we&apos;ll send you a reset link
                    </p>
                </div>

                <div className="glass-card border border-white/10 p-8">
                    <form className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-white/60 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="arjun@yourbusiness.com"
                                className="input-dark"
                                autoComplete="email"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] transition-all"
                        >
                            Send Reset Link
                        </button>
                    </form>

                    <div className="mt-4 p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20">
                        <p className="text-xs text-[#25D366] leading-relaxed">
                            ✅ Check your inbox for a reset link. It expires in 15 minutes.
                        </p>
                    </div>
                </div>

                <div className="text-center mt-5">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to login
                    </Link>
                </div>
            </div>
        </main>
    );
}

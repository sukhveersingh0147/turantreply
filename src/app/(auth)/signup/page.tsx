"use client";

import React, { useActionState, Suspense } from "react";
import { register } from "@/app/actions/auth";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SignupForm() {
    const searchParams = useSearchParams();
    const plan = searchParams?.get("plan");
    const vertical = searchParams?.get("vertical");
    const ref = searchParams?.get("ref");
    const [state, action, isPending] = useActionState(register, null);

    // Sync referral code to cookie for Google Sign-in to pickup
    const [referralCode, setReferralCode] = React.useState(ref || "");

    React.useEffect(() => {
        if (referralCode) {
            document.cookie = `referral_code=${referralCode}; path=/; max-age=3600; SameSite=Lax`;
        }
    }, [referralCode]);

    return (
        <div className="w-full max-w-md relative z-10 pt-10">
            {/* Logo */}
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg border border-white/5">
                        <img src="/turantreply-removebg.png" alt="Turant Reply Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-2xl font-bold font-[Outfit]">
                        Turant<span className="text-gradient">Reply</span>
                    </span>
                </Link>
                <h1 className="text-3xl font-black font-[Outfit] mb-2">
                    {plan ? `Start with ${plan}` : "Create your free account"}
                </h1>
                <p className="text-sm text-white/50">
                    Free Forever · No credit card required
                </p>
            </div>

            {/* Card */}
            <div className="glass-card border border-white/10 p-8">
                <form action={action} className="space-y-5">
                    {/* Hidden fields */}
                    <input type="hidden" name="plan" value={plan || ""} />
                    <input type="hidden" name="vertical" value={vertical || ""} />

                    <button
                        type="button"
                        onClick={() => {
                            // Cookie is already set by useEffect
                            signIn("google", { redirectTo: "/overview" });
                        }}
                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-xs text-white/30">Or continue with email</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {state?.error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center">
                            {state.error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-white/60 mb-1.5">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="Arjun"
                                className="input-dark w-full"
                                autoComplete="given-name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-white/60 mb-1.5">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Sharma"
                                className="input-dark w-full"
                                autoComplete="family-name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5">
                            Work Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="arjun@yourbusiness.com"
                            className="input-dark w-full"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5">
                            Business Name
                        </label>
                        <input
                            type="text"
                            name="companyName"
                            placeholder="FitZone Gym"
                            className="input-dark w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5">
                            WhatsApp Number
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-white/40 font-medium text-sm">
                                +91
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="9876543210"
                                className="input-dark w-full !pl-14 group-focus-within:border-[#25D366] transition-all"
                                autoComplete="tel"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Min. 8 characters"
                            className="input-dark w-full"
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />
                    </div>

                    <div className="pt-2 border-t border-white/5">
                        <label className="block text-[10px] font-bold text-[#25D366] uppercase tracking-widest mb-1.5">
                            Referral Code (Optional)
                        </label>
                        <input
                            type="text"
                            name="ref"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value)}
                            placeholder="e.g. ref-xyz123"
                            className="input-dark w-full border-[#25D366]/20 bg-[#25D366]/5 focus:border-[#25D366] transition-all"
                        />
                        <p className="text-[10px] text-white/30 mt-1">If you were referred by an agency, enter their code here.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {isPending ? "Creating Account..." : "Create Free Account →"}
                    </button>

                    <p className="text-center text-xs text-white/30">
                        By signing up, you agree to our{" "}
                        <Link href="/terms" className="text-[#25D366] hover:underline">
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-[#25D366] hover:underline">
                            Privacy Policy
                        </Link>
                    </p>
                </form>
            </div>

            <p className="text-center text-sm text-white/40 mt-5">
                Already have an account?{" "}
                <Link href="/login" className="text-[#25D366] font-medium hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}

export default function SignupPage() {
    return (
        <main className="min-h-screen bg-[#060a0f] bg-grid flex items-center justify-center px-4 py-20">
            {/* Glow orbs */}
            <div className="fixed glow-orb w-96 h-96 bg-[#25D366]/15 top-0 left-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="absolute top-8 left-0 right-0 z-20 px-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-md border border-white/5">
                            <img src="/turantreply-removebg.png" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-bold font-[Outfit]">
                            Turant<span className="text-gradient">Reply</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-white/40 hidden sm:inline">Already have an account?</span>
                        <Link href="/login" className="text-sm font-semibold text-[#25D366] hover:underline">
                            Login
                        </Link>
                    </div>
                </div>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <SignupForm />
            </Suspense>
        </main>
    );
}

import React from "react";
import { auth } from "@/auth";
import { getPlanDetails } from "@/config/subscription";
import { getBusinessForCheckout } from "@/app/actions/billing";
import CheckoutButton from "@/components/payments/CheckoutButton";
import { CheckCircle2, ShieldCheck, Lock, CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ plan?: string }>;
}) {
    const params = await searchParams;
    const session = await auth();
    if (!session?.user) {
        redirect(`/login?callbackUrl=/checkout?plan=${params.plan || "STARTER"}`);
    }

    const planKey = params.plan || "STARTER";
    const plan = getPlanDetails(planKey);
    const business = await getBusinessForCheckout();

    if (!business) {
        redirect("/setup"); // Or handle missing business state
    }

    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#060a0f] text-white">
            <div className="max-w-5xl mx-auto px-4">
                {/* Back button */}
                <Link 
                    href="/pricing" 
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Pricing
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Left Side: Order Summary */}
                    <div className="lg:col-span-3 space-y-8">
                        <div>
                            <h1 className="text-4xl font-black font-[Outfit] mb-2 text-gradient">Secure Checkout</h1>
                            <p className="text-white/40">Confirm your plan and complete your subscription.</p>
                        </div>

                        <div className="glass-card p-8 border border-white/5 bg-[#0a0f14]/50">
                            <h2 className="text-xl font-bold font-[Outfit] mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#25D366]" />
                                Plan Summary
                            </h2>
                            <div className="flex justify-between items-start pb-6 border-b border-white/5">
                                <div>
                                    <h3 className="text-2xl font-black font-[Outfit] text-[#25D366]">{plan.name}</h3>
                                    <p className="text-sm text-white/40 mt-1">Monthly recurring subscription</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black font-[Outfit]">₹{plan.price}</p>
                                    <p className="text-xs text-white/20">per month</p>
                                </div>
                            </div>

                            <div className="py-6 space-y-4">
                                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest">What's included:</h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                                            <CheckCircle2 className="w-4 h-4 text-[#25D366]/60 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Billing Info */}
                        <div className="glass-card p-8 border border-white/5 bg-[#0a0f14]/50">
                            <h2 className="text-xl font-bold font-[Outfit] mb-6 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-blue-400" />
                                Billing Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-xs text-white/30 uppercase tracking-wider mb-1 font-bold">Business Name</p>
                                    <p className="text-lg font-medium">{business.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-white/30 uppercase tracking-wider mb-1 font-bold">Billing Email</p>
                                    <p className="text-lg font-medium">{business.user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Payment Action */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24 space-y-6">
                            <div className="glass-card p-8 border-2 border-[#25D366]/20 bg-[#0a0f14] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/5 blur-3xl -z-10" />
                                
                                <h2 className="text-xl font-bold font-[Outfit] mb-6">Subscription Total</h2>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-white/60">
                                        <span>Subtotal</span>
                                        <span>₹{plan.price}.00</span>
                                    </div>
                                    <div className="flex justify-between text-white/60">
                                        <span>GST (Inclusive)</span>
                                        <span>₹0.00</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                                        <span className="font-bold">Total Amount</span>
                                        <div className="text-right">
                                            <span className="text-3xl font-black font-[Outfit] text-[#25D366]">₹{plan.price}</span>
                                        </div>
                                    </div>
                                </div>

                                <CheckoutButton 
                                    plan={planKey}
                                    price={plan.price}
                                    businessName={business.name}
                                    businessEmail={business.user.email || ""}
                                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-black text-lg hover:shadow-[0_0_40px_rgba(37,211,102,0.4)] transition-all flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Proceed to Payment
                                </CheckoutButton>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center gap-3 text-xs text-white/40 justify-center">
                                        <Lock className="w-3 h-3" />
                                        Secure 256-bit SSL encrypted payment
                                    </div>
                                    <div className="flex justify-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                                        {/* Simple logos placeholder */}
                                        <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center font-bold text-[8px]">VISA</div>
                                        <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center font-bold text-[8px]">MC</div>
                                        <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center font-bold text-[8px]">UPI</div>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Elements */}
                            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                                <h3 className="text-sm font-bold mb-3 flex items-center gap-2 uppercase tracking-widest text-[#25D366]/80">
                                    <ShieldCheck className="w-4 h-4" />
                                    Buyer Guarantee
                                </h3>
                                <p className="text-xs text-white/40 leading-relaxed">
                                    Your satisfaction is our priority. If you encounter any issues with connectivity or AI setup, our priority support is available 24/7 to resolve them within 4 hours.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

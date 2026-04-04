import { type Metadata } from "next";
import Link from "next/link";
import { CheckCircle, X, ArrowRight, Zap } from "lucide-react";

export const metadata: Metadata = {
    title: "Pricing Plans",
    description:
        "Affordable WhatsApp AI automation plans for Indian businesses. Get started for free. Plans for Starter, Growth, and Agencies starting at ₹999/month.",
};

const plans = [
    {
        id: "starter",
        name: "Starter",
        price: 999,
        desc: "Perfect for small businesses starting with WhatsApp automation.",
        color: "border-white/10",
        popular: false,
        features: {
            "Monthly Conversations": "1,000",
            "Appointment Management": true,
            "Automation Rules": "10",
            "Industry Setup": "Pre-loaded",
            "Basic Analytics": true,
            "Lead Recovery": true,
            "Query Dashboard": true,
            "Broadcast Messages": false,
        },
    },
    {
        id: "growth",
        name: "Growth",
        price: 2999,
        desc: "Most popular choice for scaling businesses that need high volume.",
        color: "border-[#25D366]/40",
        popular: true,
        features: {
            "Monthly Conversations": "5,000",
            "Everything in Starter": true,
            "Unlimited Automations": true,
            "Broadcast Messaging": true,
            "Advanced Analytics": true,
            "Follow-up Sequences": true,
            "Priority Support": true,
            "Vertical Templates": "All 6",
        },
    },
    {
        id: "agency",
        name: "Agency",
        price: 9999,
        desc: "Enterprise-grade limits and white-label options for large agencies.",
        color: "border-white/10",
        popular: false,
        features: {
            "Monthly Conversations": "Unlimited",
            "Everything in Growth": true,
            "Multi-business Dashboard": true,
            "White-label Option": true,
            "Custom Integrations": true,
            "Account Manager": true,
            "API Access": true,
            "Priority Support": "WhatsApp",
        },
    },
];

const faqs = [
    {
        q: "Is there a free trial?",
        a: "Yes! You can start for free or try any paid plan with our money-back guarantee.",
    },
    {
        q: "How does autopay work?",
        a: "We use PayU Standing Instructions (SI). Your first payment authorizes the subscription, and thereafter it is automatically deducted every month until you cancel.",
    },
    {
        q: "Can I cancel anytime?",
        a: "Absolutely. You can cancel your subscription directly from the billing settings in your dashboard with one click.",
    },
    {
        q: "Is my payment secure?",
        a: "Yes. All payments are processed via PayU's secure gateway using PCI-DSS compliant infrastructure.",
    },
];

function FeatureCell({
    val,
}: {
    val: string | boolean | undefined;
}) {
    if (val === true)
        return <CheckCircle className="w-5 h-5 text-[#25D366] mx-auto" />;
    if (val === false) return <X className="w-5 h-5 text-white/20 mx-auto" />;
    return <span className="text-sm text-white/70">{val as string}</span>;
}

import { auth } from "@/auth";
import { PayUCheckout } from "@/components/payments/PayUCheckout";
import PricingToasts from "@/components/payments/PricingToasts";
import { prisma } from "@/lib/prisma";

export default async function PricingPage() {
    const session = await auth();
    let business = null;

    if (session?.user?.id) {
        business = await prisma.business.findUnique({
            where: { userId: session.user.id },
            select: { name: true, user: { select: { email: true } } }
        });
    }

    const featureKeys = Object.keys(plans[1].features);

    return (
        <main className="min-h-screen bg-[#060a0f]">
            <PricingToasts />
            {/* Hero */}
            <section className="pt-12 pb-10 sm:pt-16 sm:pb-16 relative overflow-hidden bg-grid">
                <div className="absolute glow-orb w-[500px] h-[500px] bg-[#128C7E]/15 top-0 left-1/2 -translate-x-1/2" />
                <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
                    <span className="badge-live mb-6 inline-flex">
                        💳 Simple & Transparent Pricing
                    </span>
                    <h1 className="text-5xl sm:text-6xl font-black font-[Outfit] mb-4">
                        Plans that scale with{" "}
                        <span className="text-gradient">your growth</span>
                    </h1>
                    <p className="text-lg text-white/50">
                        Zero setup fee. Cancel anytime. Secure payments.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-8 sm:py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative glass-card p-7 border ${plan.color} ${plan.popular ? "ring-1 ring-[#25D366]/50 glow-green" : ""
                                } card-hover flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-xs font-bold px-4 py-1 rounded-full">
                                        ⭐ Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap
                                        className={`w-4 h-4 ${plan.popular ? "text-[#25D366]" : "text-white/40"
                                            }`}
                                    />
                                    <h2 className="text-lg font-bold font-[Outfit]">{plan.name}</h2>
                                </div>
                                <p className="text-xs text-white/40 mb-4 leading-relaxed">{plan.desc}</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl font-black font-[Outfit]">
                                        ₹{plan.price.toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-white/40 text-sm mb-1">/month</span>
                                </div>
                                <p className="text-xs text-white/30 mt-1">
                                    Billed monthly · Secure Autopay
                                </p>
                            </div>

                            <ul className="space-y-3 flex-1 mb-7">
                                {Object.entries(plan.features).map(([key, val]) => (
                                    <li key={key} className="flex items-center gap-2.5 text-sm">
                                        {val === true ? (
                                            <CheckCircle className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                                        ) : val === false ? (
                                            <X className="w-4 h-4 text-white/20 flex-shrink-0" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4 text-[#25D366]/60 flex-shrink-0" />
                                        )}
                                        <span className={val === false ? "text-white/30" : "text-white/70"}>
                                            <span className="text-white/40">{key}:</span>{" "}
                                            {typeof val === "boolean" ? null : val}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {session?.user ? (
                                <div className="space-y-3">
                                    <PayUCheckout
                                        planId={plan.id as any}
                                        buttonLabel={`Buy ${plan.name} Plan`}
                                        className={`w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${plan.popular
                                            ? "bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:-translate-y-0.5"
                                            : "border border-white/15 text-white/70 hover:border-[#25D366]/40 hover:text-white hover:bg-white/5"
                                            }`}
                                    />
                                    <p className="text-[10px] text-center text-white/30">
                                        Secure SI Autopay enabled
                                    </p>
                                </div>
                            ) : (
                                <Link
                                    href={`/signup?plan=${plan.id}`}
                                    className={`block w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${plan.popular
                                        ? "bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:-translate-y-0.5"
                                        : "border border-white/15 text-white/70 hover:border-[#25D366]/40 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    Get Started
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* Trust Badge */}
                <div className="flex items-center justify-center gap-4 mt-12 text-[#71717a] text-xs">
                    <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        <span className="text-lg">🔒</span>
                        <span>Secure payments via PayU</span>
                    </div>
                    <span>•</span>
                    <span>Autopay enabled</span>
                    <span>•</span>
                    <span>Cancel anytime</span>
                </div>

                {/* FAQ */}
                <div className="mt-10 sm:mt-20">
                    <h2 className="text-3xl font-black font-[Outfit] text-center mb-10">
                        Frequently Asked <span className="text-gradient">Questions</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                        {faqs.map((faq, i) => (
                            <div key={i} className="glass-card border border-white/5 p-6">
                                <h3 className="font-semibold mb-2 text-white/90 font-[Outfit]">
                                    {faq.q}
                                </h3>
                                <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center glass-card border border-[#25D366]/20 p-12">
                    <h2 className="text-3xl font-black font-[Outfit] mb-3">
                        Join companies trust <span className="text-gradient">TurantReply</span>
                    </h2>
                    <p className="text-white/40 mb-7 text-sm">
                        Start your 14-day premium experience for free.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold hover:shadow-[0_0_40px_rgba(37,211,102,0.4)] transition-all hover:-translate-y-0.5"
                    >
                        Get Started Free <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </main>
    );
}

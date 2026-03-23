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
        name: "Free Forever",
        price: 0,
        desc: "Perfect for exploring the platform and basic automation needs.",
        color: "border-white/5",
        popular: false,
        features: {
            "Daily AI Limit": "30 Messages",
            "Lead Recovery": "Basic",
            "Inventory Catalog": true,
            "Lead Management": true,
            "Unified Dashboard": true,
            "Broadcast Messages": false,
            "Marketing Campaigns": false,
            "Automation Flows": false,
            "Support": "Community",
        },
    },
    {
        name: "Starter",
        price: 999,
        desc: "Unlock all features with a higher daily message limit for growing businesses.",
        color: "border-white/10",
        popular: false,
        features: {
            "Daily AI Limit": "200 Messages",
            "Lead Recovery": "Advanced",
            "Inventory Catalog": true,
            "Lead Management": true,
            "Unified Dashboard": true,
            "Broadcast Messages": true,
            "Marketing Campaigns": true,
            "Automation Flows": true,
            "Team Support": true,
        },
    },
    {
        name: "Growth",
        price: 2499,
        desc: "For rapidly scaling businesses that need high volume and priority handling.",
        color: "border-[#25D366]/40",
        popular: true,
        features: {
            "Daily AI Limit": "1,000 Messages",
            "Lead Recovery": "Priority",
            "Inventory Catalog": true,
            "Lead Management": true,
            "Unified Dashboard": true,
            "Broadcast Messages": true,
            "Marketing Campaigns": true,
            "Automation Flows": true,
            "Detailed Analytics": true,
        },
    },
    {
        name: "Pro",
        price: 4999,
        desc: "Enterprise-grade limits and dedicated support for large scale operations.",
        color: "border-white/10",
        popular: false,
        features: {
            "Daily AI Limit": "Unlimited",
            "Lead Recovery": "Custom",
            "Inventory Catalog": true,
            "Lead Management": true,
            "Unified Dashboard": true,
            "Broadcast Messages": true,
            "Marketing Campaigns": true,
            "Automation Flows": true,
            "Dedicated Manager": true,
        },
    },
];

const faqs = [
    {
        q: "Is there a free trial?",
        a: "Yes! You can start for free. No credit card required.",
    },
    {
        q: "Can I change my plan later?",
        a: "Absolutely. Upgrade or downgrade anytime from your dashboard. Changes take effect immediately.",
    },
    {
        q: "What is the Lead Recovery Engine?",
        a: "It automatically detects when a customer's message hasn't been replied to within your set time window (e.g. 5 minutes), and sends a recovery message to re-engage the lead.",
    },
    {
        q: "Do I need Meta's verification to use WhatsApp Cloud API?",
        a: "You'll need a Meta Business account and a verified phone number. We guide you step-by-step during onboarding.",
    },
    {
        q: "How is billing handled?",
        a: "We use Razorpay for secure recurring subscriptions. You'll be charged monthly and can cancel anytime.",
    },
    {
        q: "Is my data secure?",
        a: "Yes. Every business's data is strictly isolated. We use JWT auth, webhook signature verification, and enterprise-grade PostgreSQL on Supabase.",
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
import CheckoutButton from "@/components/payments/CheckoutButton";
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

    const featureKeys = Object.keys(plans[0].features);

    return (
        <main className="min-h-screen bg-[#060a0f]">
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
                        Get started for free. No credit card required. Cancel anytime.
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
                                    Billed monthly · Cancel anytime
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
                                    <Link
                                        href={`/checkout?plan=${plan.name.toUpperCase()}`}
                                        className={`block w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${plan.popular
                                            ? "bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:-translate-y-0.5"
                                            : "border border-white/15 text-white/70 hover:border-[#25D366]/40 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        Buy {plan.name} Plan
                                    </Link>
                                    <p className="text-[10px] text-center text-white/30">
                                        Or continue for free
                                    </p>
                                </div>
                            ) : (
                                <Link
                                    href={`/signup?plan=${plan.name.toUpperCase()}`}
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

                {/* Comparison Table */}
                <div className="mt-10 sm:mt-20">
                    <h2 className="text-2xl font-black font-[Outfit] text-center mb-8">
                        Full <span className="text-gradient">Feature Comparison</span>
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-4 px-4 text-white/50 font-medium text-sm w-1/3">
                                        Feature
                                    </th>
                                    {plans.map((p) => (
                                        <th
                                            key={p.name}
                                            className={`text-center py-4 px-4 font-bold font-[Outfit] ${p.popular ? "text-[#25D366]" : "text-white"
                                                }`}
                                        >
                                            {p.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {featureKeys.map((key, ki) => (
                                    <tr
                                        key={key}
                                        className={`border-b border-white/5 ${ki % 2 === 0 ? "bg-white/[0.01]" : ""
                                            }`}
                                    >
                                        <td className="py-3.5 px-4 text-sm text-white/60">{key}</td>
                                        {plans.map((plan) => (
                                            <td key={plan.name} className="py-3.5 px-4 text-center">
                                                <FeatureCell val={plan.features[key as keyof typeof plan.features]} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                        Start your{" "}
                        <span className="text-gradient">free forever</span>
                    </h2>
                    <p className="text-white/40 mb-7 text-sm">
                        No credit card required. Full access. Cancel anytime.
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

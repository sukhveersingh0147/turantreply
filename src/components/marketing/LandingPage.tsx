"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
    ChevronRight,
    MessageCircle,
    Zap,
    TrendingUp,
    Users,
    Bot,
    Bell,
    BarChart3,
    Star,
    CheckCircle,
    ArrowRight,
    ShieldCheck,
    Rocket,
    Play,
    Calendar,
    HelpCircle,
    Clock,
    Scissors,
    Dumbbell,
    GraduationCap,
    Home,
    Utensils,
    Layers,
} from "lucide-react";

// ──────────────────────────────────────────────────────────
// STRUCTURED DATA (SEO)
// ──────────────────────────────────────────────────────────
function StructuredData() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "TurantReply",
        "operatingSystem": "All",
        "applicationCategory": "BusinessApplication",
        "offers": {
            "@type": "Offer",
            "price": "999.00",
            "priceCurrency": "INR"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "3200"
        },
        "description": "India's first industry-specific WhatsApp automation SaaS. Zero manual setup for Salons, Gyms, Coaching, and more.",
        "brand": {
            "@type": "Organization",
            "name": "TurantReply",
            "logo": "/logo-full.png"
        }
    };

    return (
        <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

// ──────────────────────────────────────────────────────────


// ──────────────────────────────────────────────────────────
// VERTICALS SECTION
// ──────────────────────────────────────────────────────────
const verticals = [
    {
        icon: Scissors,
        title: "Salon & Beauty",
        desc: "Automated booking for haircuts, spa, and beauty treatments. Smart reminders for appointments.",
        color: "from-pink-500/20 to-rose-500/10",
        border: "border-pink-500/20",
        iconColor: "text-pink-400",
    },
    {
        icon: Dumbbell,
        title: "Gym & Fitness",
        desc: "Handle trial session bookings, membership queries, and renewal reminders on WhatsApp.",
        color: "from-orange-500/20 to-red-500/10",
        border: "border-orange-500/20",
        iconColor: "text-orange-400",
    },
    {
        icon: GraduationCap,
        title: "Coaching & Tuition",
        desc: "Automate fee reminders, demo class bookings, and student doubt handling instantly.",
        color: "from-blue-500/20 to-indigo-500/10",
        border: "border-blue-500/20",
        iconColor: "text-blue-400",
    },
    {
        icon: Home,
        title: "Real Estate",
        desc: "Send property catalogs, book site visits, and capture lead requirements automatically.",
        color: "from-emerald-500/20 to-teal-500/10",
        border: "border-emerald-500/20",
        iconColor: "text-emerald-400",
    },
    {
        icon: Utensils,
        title: "Restaurant & Cafe",
        desc: "Table reservations, digital menu sharing, and feedback collection via WhatsApp.",
        color: "from-yellow-500/20 to-amber-500/10",
        border: "border-yellow-500/20",
        iconColor: "text-yellow-400",
    },
    {
        icon: Layers,
        title: "Other Business",
        desc: "Fully customizable setup for any industry. Ready to use in under 60 seconds.",
        color: "from-gray-500/20 to-slate-500/10",
        border: "border-gray-500/20",
        iconColor: "text-gray-400",
    },
];

function VerticalsSection() {
    return (
        <section id="verticals" className="py-24 bg-[#0f0f0f]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-4">
                        Built for <span className="text-gradient">Indian Local Businesses</span>
                    </h2>
                    <p className="text-white/50 max-w-2xl mx-auto">
                        Choose your industry and get pre-loaded templates, automations, and AI instructions instantly.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {verticals.map((v, i) => (
                        <div
                            key={i}
                            className={`p-8 rounded-2xl border ${v.border} bg-gradient-to-br ${v.color} hover:scale-[1.02] transition-all duration-300 group cursor-pointer`}
                        >
                            <div className={`w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 border ${v.border}`}>
                                <v.icon className={`w-7 h-7 ${v.iconColor}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 font-[Outfit] text-white">{v.title}</h3>
                            <p className="text-sm text-white/60 leading-relaxed mb-6">{v.desc}</p>
                            <Link href="/signup" className={`text-sm font-bold flex items-center gap-2 ${v.iconColor} group-hover:gap-3 transition-all`}>
                                Launch Now <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ──────────────────────────────────────────────────────────
// CORE FEATURES (Appointments, Queries, Reminders)
// ──────────────────────────────────────────────────────────
const coreFeatures = [
    {
        icon: Calendar,
        title: "Appointments",
        desc: "Turn WhatsApp chats into confirmed bookings. No more manual link sharing or checking calendars.",
        badge: "Industry Pre-loaded",
    },
    {
        icon: HelpCircle,
        title: "Queries",
        desc: "AI handles 90% of customer questions about pricing, services, and location automatically.",
        badge: "Smart AI",
    },
    {
        icon: Clock,
        title: "Reminders",
        desc: "Prevent no-shows with automated WhatsApp reminders sent on Day 1, Day 3, or customized intervals.",
        badge: "Revenue Growth",
    },
];

function CoreFeaturesSection() {
    return (
        <section className="py-24 border-y border-white/5 bg-[#060a0f]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {coreFeatures.map((f, i) => (
                        <div key={i} className="text-center md:text-left">
                            <span className="text-[10px] font-bold text-[#25D366] mb-3 inline-block uppercase tracking-widest">{f.badge}</span>
                            <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-6 mx-auto md:mx-0">
                                <f.icon className="w-6 h-6 text-[#25D366]" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 font-[Outfit]">{f.title}</h3>
                            <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ──────────────────────────────────────────────────────────
// PRICING SECTION
// ──────────────────────────────────────────────────────────
const plans = [
    {
        name: "Starter",
        price: "₹999",
        period: "/month",
        features: ["1,000 Monthly Conversations", "Appointment Management", "Basic Industry Templates", "14-Day Free Trial"],
        cta: "Start Free Trial",
        popular: false,
    },
    {
        name: "Growth",
        price: "₹2,999",
        period: "/month",
        features: ["5,000 Monthly Conversations", "Broadcast Support", "Advanced AI Training", "Automated Reminders", "Phone Support"],
        cta: "Start Free Trial",
        popular: true,
    },
    {
        name: "Agency",
        price: "₹9,999",
        period: "/month",
        features: ["Unlimited Conversations", "Multi-Business Management", "White-label Support", "Dedicated Manager", "PayU Recurring"],
        cta: "Contact Us",
        popular: false,
    },
];

function PricingSection() {
    return (
        <section className="py-24 bg-[#0f0f0f]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl sm:text-5xl font-black font-[Outfit] mb-4">Simple Pricing</h2>
                    <p className="text-white/50">All plans include a 14-day free trial. No card required.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
                    {plans.map((p, i) => (
                        <div
                            key={i}
                            className={`p-8 rounded-2xl border ${p.popular ? "border-[#25D366] bg-[#25D366]/5 relative scale-105" : "border-white/10 bg-white/5"} flex flex-col`}
                        >
                            {p.popular && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#25D366] text-[#0f0f0f] text-[10px] font-bold px-3 py-1 rounded-full uppercase">Most Popular</span>
                            )}
                            <h3 className="text-lg font-bold mb-1">{p.name}</h3>
                            <div className="flex items-end gap-1 mb-6">
                                <span className="text-3xl font-black font-[Outfit]">{p.price}</span>
                                <span className="text-white/40 text-sm mb-1">{p.period}</span>
                            </div>
                            <ul className="space-y-3 mb-8 flex-1">
                                {p.features.map((f, fi) => (
                                    <li key={fi} className="flex items-center gap-2 text-xs text-white/70">
                                        <CheckCircle className="w-3 h-3 text-[#25D366]" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/signup"
                                className={`block w-full text-center py-3 rounded-xl text-sm font-bold transition-all ${p.popular ? "bg-[#25D366] text-[#0f0f0f] hover:bg-[#128C7E]" : "border border-white/10 hover:bg-white/5"}`}
                            >
                                {p.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}



// ──────────────────────────────────────────────────────────
// MAIN PAGE EXPORT
// ──────────────────────────────────────────────────────────
export default function LandingPage({ vertical }: { vertical?: string }) {
    const v = vertical ? verticals.find(v => v.title.toLowerCase().includes(vertical.toLowerCase())) : null;

    return (
        <main className="relative bg-[#0f0f0f] text-white selection:bg-[#25D366] selection:text-[#0f0f0f]">
            <StructuredData />
            <HeroSection vertical={v} />
            <CoreFeaturesSection />
            <PricingSection />
            <CTASection vertical={v} />
        </main>
    );
}

function HeroSection({ vertical }: { vertical?: any }) {
    return (
        <section className="relative flex items-center justify-center overflow-hidden bg-[#0f0f0f] py-24 md:py-32 lg:py-40">
            {/* Glow orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-48 -left-32 w-[600px] h-[600px] bg-[#25D366]/10 blur-[120px] rounded-full opacity-60" />
                <div className="absolute top-1/2 -right-20 w-[400px] h-[400px] bg-[#128C7E]/10 blur-[100px] rounded-full opacity-40" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center justify-center mb-8">
                    <span className="px-4 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-bold tracking-wider uppercase">
                        🚀 {vertical ? `${vertical.title} Special` : "India's First Industry-Specific WhatsApp AI"}
                    </span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8 font-[Outfit]">
                    {vertical ? (
                        <>Complete WhatsApp AI for <br /><span className="text-gradient">your {vertical.title}</span></>
                    ) : (
                        <>Apna business type select karo — <br /><span className="text-gradient">Dashboard 60 seconds mein ready.</span></>
                    )}
                </h1>

                <p className="text-lg sm:text-xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed">
                    {vertical ? vertical.desc : "Zero manual setup needed. Pre-configured WhatsApp automation for your industry. Appointments, queries, and reminders — sab automatic."}
                </p>

                <div className="flex flex-col sm:weights-center justify-center gap-4 mb-20">
                    <Link
                        href="/signup"
                        className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:shadow-[0_0_40px_rgba(37,211,102,0.5)] transition-all duration-300 hover:-translate-y-1"
                    >
                        Sign up for {vertical ? vertical.title : "Free"}
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

function CTASection({ vertical }: { vertical?: any }) {
    return (
        <section className="py-32 bg-[#060a0f]">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <div className="p-12 rounded-3xl border border-[#25D366]/20 bg-gradient-to-b from-[#25D366]/10 to-transparent relative overflow-hidden">
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#25D366]/20 blur-[100px] rounded-full pointer-events-none" />
                    <h2 className="text-4xl font-black font-[Outfit] mb-6 relative z-10">Scale your {vertical?.title || "business"} on autopilot.</h2>
                    <p className="text-lg text-white/60 mb-10 relative z-10 max-w-xl mx-auto">
                        Takes less than 60 seconds to link your {vertical?.title || "business"} and see the magic. Join the fastest growing Indian businesses.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 px-10 py-5 text-lg font-bold text-white rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:shadow-[0_0_50px_rgba(37,211,102,0.4)] transition-all hover:-translate-y-1 relative z-10"
                    >
                        Launch My {vertical?.title || "Business"} <Rocket className="w-6 h-6" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

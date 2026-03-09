"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
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
    RefreshCcw,
    Play,
} from "lucide-react";

// ──────────────────────────────────────────────────────────
// HERO SECTION
// ──────────────────────────────────────────────────────────
function HeroSection() {
    return (
        <section className="relative flex items-center justify-center overflow-hidden bg-grid py-24 md:py-32 lg:py-40">
            {/* Glow orbs */}
            <div className="glow-orb w-[600px] h-[600px] bg-[#25D366]/20 -top-48 -left-32 opacity-60" />
            <div className="glow-orb w-[400px] h-[400px] bg-[#128C7E]/20 top-1/2 -right-20 opacity-40" />
            <div className="glow-orb w-[300px] h-[300px] bg-[#60efff]/10 bottom-20 left-1/3 opacity-30" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Live badge */}
                <div className="inline-flex items-center justify-center mb-8 md:mb-10">
                    <span className="badge-live">🚀 Now Live — WhatsApp AI for Indian Businesses</span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-normal sm:leading-[1.1] mb-8 sm:mb-12 font-[Outfit]">
                    <span className="block mb-2 border-b border-transparent">
                        Stop losing <span className="text-gradient">WhatsApp</span> leads.
                    </span>
                    <span className="block text-white/90 text-3xl sm:text-5xl lg:text-6xl mt-4 sm:mt-2 mb-2">
                        Hire an{" "}
                        <span className="relative inline-block px-1">
                            <span className="text-gradient glow-text-green">AI Sales Employee</span>
                            <svg
                                className="absolute -bottom-1 sm:-bottom-2 left-0 w-full"
                                height="6"
                                viewBox="0 0 300 6"
                                fill="none"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M0 3 Q75 0 150 3 Q225 6 300 3"
                                    stroke="#25D366"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray="300"
                                    strokeDashoffset="0"
                                />
                            </svg>
                        </span>{" "}
                        that
                    </span>
                    <span className="block text-white/90 text-3xl sm:text-5xl lg:text-6xl mt-4 sm:mt-2">
                        replies instantly &{" "}
                        <br className="sm:hidden" />
                        <span className="text-gradient">converts chats into customers.</span>
                    </span>
                </h1>

                {/* Sub-headline */}
                <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-12 md:mb-16 leading-relaxed">
                    ReplyFlow automatically replies to enquiries, recovers missed leads,
                    and follows up with potential customers — 24/7, without any human
                    effort.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-20 sm:mb-24 md:mb-28">
                    <Link
                        href="/signup"
                        className="w-full sm:w-auto text-center group flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:shadow-[0_0_40px_rgba(37,211,102,0.5)] transition-all duration-300 hover:-translate-y-0.5 animate-pulse-glow"
                    >
                        Start Free Trial
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <a
                        href="#how-it-works"
                        className="w-full sm:w-auto text-center flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white/80 rounded-xl border border-white/10 hover:border-[#25D366]/40 hover:text-white hover:bg-white/5 transition-all duration-300"
                    >
                        <Play className="w-4 h-4 text-[#25D366]" />
                        See How it Works
                    </a>
                </div>

                {/* Stats row */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16 mb-24 md:mb-32">
                    {[
                        { value: "2,400+", label: "Businesses using ReplyFlow" },
                        { value: "98%", label: "Lead recovery rate" },
                        { value: "₹0", label: "Setup cost, ever" },
                    ].map((stat, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="text-left">
                                <div className="text-2xl font-black text-[#25D366] font-[Outfit]">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-white/40 font-medium">{stat.label}</div>
                            </div>
                            {i < 2 && (
                                <div className="hidden sm:block w-px h-10 bg-white/10" />
                            )}
                        </div>
                    ))}
                </div>

                {/* WhatsApp Chat Preview Mock */}
                <div className="relative max-w-sm mx-auto animate-float transform scale-85 sm:scale-100 origin-top">
                    <div className="glass-card overflow-hidden shadow-2xl pb-2">
                        {/* Chat header */}
                        <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-semibold text-white">
                                    ReplyFlow AI
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-[#25D366]" />
                                    <span className="text-xs text-white/70">Online · AI Active</span>
                                </div>
                            </div>
                            <MessageCircle className="w-5 h-5 text-white/60" />
                        </div>
                        {/* Messages */}
                        <div className="bg-[#0b1d14] px-4 py-4 space-y-3 min-h-[200px]">
                            <ChatBubble
                                msg="Hi, I wanted to know about your gym membership prices?"
                                time="9:41 AM"
                                isUser
                            />
                            <ChatBubble
                                msg="Hi! 👋 Thanks for reaching out! Our memberships start at just ₹1,500/month. Would you like to book a FREE trial session?"
                                time="9:41 AM"
                                isAI
                                isTyping={false}
                            />
                            <ChatBubble
                                msg="Yes! How do I book?"
                                time="9:42 AM"
                                isUser
                            />
                            <ChatBubble
                                msg="Great! Just reply with your preferred date and I'll get it scheduled for you right away 🎉"
                                time="9:42 AM"
                                isAI
                            />
                        </div>
                        {/* Powered by badge */}
                        <div className="px-4 py-2 bg-[#06100c] flex items-center justify-center gap-2 border-t border-white/5">
                            <Zap className="w-3 h-3 text-[#25D366]" />
                            <span className="text-[10px] text-white/30 font-medium">
                                Powered by ReplyFlow AI — Responded in 0.3s
                            </span>
                        </div>
                    </div>
                    {/* Floating notification */}
                    <div className="absolute -top-4 -right-4 bg-[#25D366] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
                        🎯 Lead Recovered!
                    </div>
                </div>
            </div>
        </section>
    );
}

function ChatBubble({
    msg,
    time,
    isUser,
    isAI,
}: {
    msg: string;
    time: string;
    isUser?: boolean;
    isAI?: boolean;
    isTyping?: boolean;
}) {
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[80%] rounded-xl px-3 py-2 ${isUser
                    ? "bg-[#005c4b] text-white rounded-tr-none"
                    : "bg-[#1a2e1f] text-white/90 rounded-tl-none border border-[#25D366]/10"
                    }`}
            >
                {isAI && (
                    <div className="flex items-center gap-1 mb-1">
                        <Zap className="w-3 h-3 text-[#25D366]" />
                        <span className="text-[10px] text-[#25D366] font-semibold">
                            AI Reply
                        </span>
                    </div>
                )}
                <p className="text-xs leading-relaxed">{msg}</p>
                <p
                    className={`text-[10px] mt-1 ${isUser ? "text-white/50 text-right" : "text-white/30"
                        }`}
                >
                    {time}
                </p>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// TRUSTED BY LOGOS
// ──────────────────────────────────────────────────────────
function TrustedBy() {
    const brands = [
        "FitZone Gym",
        "StyleHouse",
        "AcadeMind",
        "TastyBites",
        "RealEstate Pro",
        "MediCare Clinic",
        "AutoDeals",
        "CloudShop",
    ];
    return (
        <div className="py-16 md:py-24 border-y border-white/5 bg-[#060a0f]">
            <div className="max-w-7xl mx-auto px-4">
                <p className="text-center text-xs text-white/30 uppercase tracking-widest font-semibold mb-8 md:mb-10">
                    Trusted by fast-growing Indian businesses
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-12 gap-y-6">
                    {brands.map((b) => (
                        <span
                            key={b}
                            className="text-xs sm:text-sm font-semibold text-white/20 hover:text-white/50 transition-colors cursor-default tracking-wide"
                        >
                            {b}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// FEATURES OVERVIEW
// ──────────────────────────────────────────────────────────
const features = [
    {
        icon: Zap,
        title: "Instant Auto-Replies",
        desc: "Reply to WhatsApp messages in under a second, 24/7. Never miss a lead again.",
        color: "from-yellow-500/20 to-orange-500/10",
        border: "border-yellow-500/20",
        iconColor: "text-yellow-400",
    },
    {
        icon: RefreshCcw,
        title: "Lead Recovery Engine",
        desc: "Automatically detect unanswered messages and send a recovery message before the lead goes cold.",
        color: "from-[#25D366]/20 to-[#128C7E]/10",
        border: "border-[#25D366]/20",
        iconColor: "text-[#25D366]",
        badge: "Core Feature",
    },
    {
        icon: Bot,
        title: "AI Conversations",
        desc: "GPT-4 powered AI responds like a human, handling FAQs, pricing, and bookings automatically.",
        color: "from-blue-500/20 to-cyan-500/10",
        border: "border-blue-500/20",
        iconColor: "text-blue-400",
    },
    {
        icon: Users,
        title: "Lead CRM",
        desc: "Every WhatsApp enquiry creates a lead with full conversation history, scores, and status.",
        color: "from-purple-500/20 to-pink-500/10",
        border: "border-purple-500/20",
        iconColor: "text-purple-400",
    },
    {
        icon: Bell,
        title: "Follow-up Sequences",
        desc: "Set Day 1, Day 3, Day 7 automated follow-up messages to nurture cold leads automatically.",
        color: "from-orange-500/20 to-red-500/10",
        border: "border-orange-500/20",
        iconColor: "text-orange-400",
    },
    {
        icon: BarChart3,
        title: "Analytics Dashboard",
        desc: "Track recovered leads, conversion rates, top queries, and ROI from your sales dashboard.",
        color: "from-teal-500/20 to-green-500/10",
        border: "border-teal-500/20",
        iconColor: "text-teal-400",
    },
];

function FeaturesOverview() {
    return (
        <section id="features" className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20 md:mb-24">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#25D366] mb-3 block">
                        Everything You Need
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black font-[Outfit] mb-4">
                        One platform. Every tool to{" "}
                        <span className="text-gradient">close more sales</span> on
                        WhatsApp.
                    </h2>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto">
                        ReplyFlow replaces a full sales team with intelligent automation
                        that works while you sleep.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className={`relative glass-card p-6 card-hover bg-gradient-to-br ${f.color} border ${f.border}`}
                        >
                            {f.badge && (
                                <span className="absolute top-4 right-4 text-[10px] font-bold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/20 px-2 py-0.5 rounded-full">
                                    {f.badge}
                                </span>
                            )}
                            <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} border ${f.border} flex items-center justify-center mb-4`}
                            >
                                <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                            </div>
                            <h3 className="text-lg font-bold mb-2 font-[Outfit]">{f.title}</h3>
                            <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/features"
                        className="inline-flex items-center gap-2 text-[#25D366] font-semibold hover:underline text-sm"
                    >
                        See all features <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

// ──────────────────────────────────────────────────────────
// HOW IT WORKS
// ──────────────────────────────────────────────────────────
const steps = [
    {
        num: "01",
        title: "Connect WhatsApp",
        desc: "Link your WhatsApp Business number via Meta Cloud API in under 2 minutes.",
        icon: MessageCircle,
    },
    {
        num: "02",
        title: "Set Your Rules",
        desc: "Define keyword triggers, AI prompts, and follow-up sequences for your business.",
        icon: Zap,
    },
    {
        num: "03",
        title: "AI Goes Live",
        desc: "ReplyFlow monitors every message, replies instantly, and recovers lost leads automatically.",
        icon: Bot,
    },
    {
        num: "04",
        title: "Watch Sales Grow",
        desc: "Track every lead, conversion, and recovered customer in your real-time dashboard.",
        icon: TrendingUp,
    },
];

function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 md:py-32 bg-[#04070a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20 md:mb-28">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#25D366] mb-3 block">
                        Simple Setup
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black font-[Outfit] mb-4">
                        From zero to{" "}
                        <span className="text-gradient">AI-powered sales</span>
                        <br />
                        in 10 minutes
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-16 relative">
                    {/* Connector line */}
                    <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#25D366]/30 to-transparent z-0" />

                    {steps.map((step, i) => (
                        <div key={i} className="relative z-10 text-center group py-8">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-8xl font-black text-[#25D366]/5 font-[Outfit] -z-10 pointer-events-none select-none">
                                {step.num}
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/10 border border-[#25D366]/20 flex items-center justify-center mx-auto mb-5 group-hover:glow-green transition-all">
                                <step.icon className="w-7 h-7 text-[#25D366]" />
                            </div>
                            <h3 className="text-base font-bold mb-2 font-[Outfit]">{step.title}</h3>
                            <p className="text-sm text-white/50 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ──────────────────────────────────────────────────────────
// PRICING PREVIEW
// ──────────────────────────────────────────────────────────
const plans = [
    {
        name: "Starter",
        price: "₹999",
        period: "/month",
        desc: "Perfect for small businesses just starting out",
        features: [
            "500 AI replies/month",
            "100 leads in CRM",
            "5 automation rules",
            "Lead recovery engine",
            "Basic analytics",
        ],
        cta: "Start Free Trial",
        popular: false,
        color: "border-white/10",
    },
    {
        name: "Growth",
        price: "₹2,999",
        period: "/month",
        desc: "For growing businesses scaling their sales",
        features: [
            "5,000 AI replies/month",
            "2,000 leads in CRM",
            "Unlimited automations",
            "Broadcast messaging",
            "Advanced analytics",
            "Follow-up sequences",
        ],
        cta: "Start Free Trial",
        popular: true,
        color: "border-[#25D366]/40",
    },
    {
        name: "Agency",
        price: "₹9,999",
        period: "/month",
        desc: "For agencies managing multiple businesses",
        features: [
            "Unlimited AI replies",
            "Unlimited leads",
            "Multi-business dashboard",
            "White-label option",
            "Priority support",
            "Custom integrations",
            "Dedicated account manager",
        ],
        cta: "Contact Sales",
        popular: false,
        color: "border-white/10",
    },
];

function PricingPreview() {
    return (
        <section id="pricing" className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20 md:mb-24">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#25D366] mb-3 block">
                        Transparent Pricing
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black font-[Outfit] mb-4">
                        Plans that grow{" "}
                        <span className="text-gradient">with your business</span>
                    </h2>
                    <p className="text-lg text-white/50">
                        Start free. No credit card required.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 lg:gap-10 max-w-5xl mx-auto pt-6">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative glass-card p-7 border ${plan.color} ${plan.popular ? "ring-2 ring-[#25D366]/50 glow-green transform md:-translate-y-4" : ""
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
                                <h3 className="text-lg font-bold font-[Outfit] mb-1">
                                    {plan.name}
                                </h3>
                                <p className="text-xs text-white/40 mb-4">{plan.desc}</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl font-black text-white font-[Outfit]">
                                        {plan.price}
                                    </span>
                                    <span className="text-white/40 text-sm mb-1">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((f, fi) => (
                                    <li key={fi} className="flex items-center gap-2 text-sm text-white/70">
                                        <CheckCircle className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/signup"
                                className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${plan.popular
                                    ? "bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:-translate-y-0.5"
                                    : "border border-white/10 text-white/70 hover:border-[#25D366]/40 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-[#25D366] transition-colors"
                    >
                        See full comparison <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

// ──────────────────────────────────────────────────────────
// TESTIMONIALS
// ──────────────────────────────────────────────────────────
const testimonials = [
    {
        name: "Rohit Sharma",
        role: "Owner, FitZone Gym · Mumbai",
        avatar: "RS",
        quote:
            "ReplyFlow recovered 23 leads in the first week alone. My gym enquiries used to just disappear. Now every message gets an instant reply even at 2am!",
        rating: 5,
        metric: "+₹45,000 recovered revenue",
    },
    {
        name: "Priya Menon",
        role: "Founder, StyleHouse Salon · Bangalore",
        avatar: "PM",
        quote:
            "The AI knows exactly how to respond to pricing questions and appointment bookings. It's like hiring a full-time receptionist at ₹999/month.",
        rating: 5,
        metric: "3x more bookings",
    },
    {
        name: "Arjun Gupta",
        role: "Director, AcadeMind Coaching · Delhi",
        avatar: "AG",
        quote:
            "We used to miss at least 40% of WhatsApp enquiries. Now nothing falls through the cracks. The follow-up sequences are gold.",
        rating: 5,
        metric: "40% more conversions",
    },
];

function Testimonials() {
    return (
        <section id="testimonials" className="py-24 md:py-32 bg-[#04070a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20 md:mb-24">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#25D366] mb-3 block">
                        Real Results
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black font-[Outfit] mb-4">
                        Businesses{" "}
                        <span className="text-gradient">love ReplyFlow</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="glass-card p-6 border border-white/5 card-hover"
                        >
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(t.rating)].map((_, ri) => (
                                    <Star
                                        key={ri}
                                        className="w-4 h-4 text-yellow-400"
                                        fill="currentColor"
                                    />
                                ))}
                            </div>

                            <p className="text-sm text-white/70 leading-relaxed mb-6 italic">
                                &ldquo;{t.quote}&rdquo;
                            </p>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-xs font-bold text-white">
                                    {t.avatar}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">{t.name}</div>
                                    <div className="text-xs text-white/40">{t.role}</div>
                                </div>
                            </div>

                            <div className="bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg px-3 py-2">
                                <p className="text-xs font-semibold text-[#25D366]">
                                    📈 {t.metric}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ──────────────────────────────────────────────────────────
// CTA BANNER
// ──────────────────────────────────────────────────────────
function CTASection() {
    return (
        <section className="py-24 md:py-40">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <div className="glass-card p-12 border border-[#25D366]/20 relative overflow-hidden">
                    <div className="glow-orb w-96 h-96 bg-[#25D366]/15 -top-24 left-1/2 -translate-x-1/2" />
                    <div className="relative z-10">
                        <span className="badge-live mb-6 inline-flex">
                            🔥 Join 2,400+ businesses already using ReplyFlow
                        </span>
                        <h2 className="text-4xl sm:text-5xl font-black font-[Outfit] mb-4">
                            Start recovering{" "}
                            <span className="text-gradient">lost leads today</span>
                        </h2>
                        <p className="text-lg text-white/50 max-w-xl mx-auto mb-8">
                            Set up in 10 minutes. No credit card required. Cancel anytime.
                            Your AI sales employee starts working immediately.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/signup"
                                className="flex items-center gap-2 px-8 py-4 text-base font-bold text-white rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:shadow-[0_0_40px_rgba(37,211,102,0.5)] transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <Rocket className="w-5 h-5" />
                                Start Free Trial — It&apos;s Free
                            </Link>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-8">
                            {[
                                "No credit card",
                                "7-day free trial",
                                "Cancel anytime",
                            ].map((t) => (
                                <div
                                    key={t}
                                    className="flex items-center gap-1.5 text-xs text-white/40"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
                                    {t}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ──────────────────────────────────────────────────────────
// MAIN PAGE EXPORT
// ──────────────────────────────────────────────────────────
export default function LandingPage() {
    return (
        <main>
            <HeroSection />
            <TrustedBy />
            <FeaturesOverview />
            <HowItWorks />
            <PricingPreview />
            <Testimonials />
            <CTASection />
        </main>
    );
}

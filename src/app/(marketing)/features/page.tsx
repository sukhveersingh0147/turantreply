import { type Metadata } from "next";
import {
    Zap,
    RefreshCcw,
    Bot,
    Users,
    Bell,
    BarChart3,
    Radio,
    Shield,
    MessageCircle,
    CheckCircle,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Features — ReplyFlow AI",
    description:
        "Explore all features of ReplyFlow AI: instant WhatsApp auto-replies, AI conversations, Lead CRM, Broadcast, Analytics, Lead Recovery Engine, and more.",
};

const features = [
    {
        icon: Zap,
        title: "Instant WhatsApp Auto-Replies",
        desc: "Never let a customer wait. ReplyFlow automatically replies to inbound WhatsApp messages within milliseconds — day or night. Keyword-based triggers let you define exactly what to say for pricing questions, availability enquiries, location requests, and more.",
        points: [
            "Responds in under 1 second",
            "Keyword-based trigger rules",
            "Multi-language support",
            "Rich message formatting",
        ],
        color: "from-yellow-500/15 to-orange-500/5",
        border: "border-yellow-500/20",
        iconBg: "bg-yellow-500/15",
        iconColor: "text-yellow-400",
        badge: null,
    },
    {
        icon: RefreshCcw,
        title: "Lead Recovery Engine",
        desc: "The core differentiator. If a customer sends an enquiry and your team hasn't replied within your defined window (e.g., 5 minutes), ReplyFlow automatically steps in with a friendly recovery message that re-engages the lead before they go cold.",
        points: [
            "Configurable recovery time window",
            "Custom recovery message templates",
            "Lead status auto-updated",
            "Recovery analytics & reports",
        ],
        color: "from-[#25D366]/15 to-[#128C7E]/5",
        border: "border-[#25D366]/25",
        iconBg: "bg-[#25D366]/15",
        iconColor: "text-[#25D366]",
        badge: "⭐ Core Feature",
    },
    {
        icon: Bot,
        title: "AI Conversations (GPT-4)",
        desc: "When no automation rule matches, our GPT-4 powered AI assistant takes over. It has full context of your business, your products, and the conversation history — responding like a trained human sales rep.",
        points: [
            "Powered by OpenAI GPT-4",
            "Business-aware context",
            "Handles complex queries",
            "All AI replies logged",
        ],
        color: "from-blue-500/15 to-cyan-500/5",
        border: "border-blue-500/20",
        iconBg: "bg-blue-500/15",
        iconColor: "text-blue-400",
        badge: "AI Powered",
    },
    {
        icon: Users,
        title: "Lead CRM",
        desc: "Every WhatsApp message automatically creates or updates a lead record in your built-in CRM. Track lead scores, conversation history, contact details, and conversion status — all in one place.",
        points: [
            "Auto lead creation on every message",
            "Lead scoring engine",
            "Full conversation history",
            "Filter, tag, and update status",
        ],
        color: "from-purple-500/15 to-pink-500/5",
        border: "border-purple-500/20",
        iconBg: "bg-purple-500/15",
        iconColor: "text-purple-400",
        badge: null,
    },
    {
        icon: Bell,
        title: "Automated Follow-Up Sequences",
        desc: "Build multi-day follow-up sequences that run automatically. Nurture cold leads with perfectly timed messages on Day 1, Day 3, and Day 7 — without lifting a finger.",
        points: [
            "Multi-day drip sequences",
            "Customizable delay intervals",
            "Runs via background queues",
            "Stop on reply or conversion",
        ],
        color: "from-orange-500/15 to-red-500/5",
        border: "border-orange-500/20",
        iconBg: "bg-orange-500/15",
        iconColor: "text-orange-400",
        badge: null,
    },
    {
        icon: Radio,
        title: "Broadcast Messaging",
        desc: "Send bulk WhatsApp messages to your entire lead list or filtered segments. Announce offers, events, and promotions with just a few clicks using approved message templates.",
        points: [
            "Bulk message to all leads",
            "Segment-based targeting",
            "Template management",
            "Delivery & read tracking",
        ],
        color: "from-teal-500/15 to-green-500/5",
        border: "border-teal-500/20",
        iconBg: "bg-teal-500/15",
        iconColor: "text-teal-400",
        badge: "Growth+",
    },
    {
        icon: BarChart3,
        title: "Analytics Dashboard",
        desc: "Get a real-time view of your WhatsApp sales performance. Track total leads, recovered leads, AI responses, conversion rates, top queries, and revenue impact.",
        points: [
            "Real-time metrics",
            "Recovered leads tracking",
            "Conversion funnel view",
            "Exportable reports",
        ],
        color: "from-indigo-500/15 to-violet-500/5",
        border: "border-indigo-500/20",
        iconBg: "bg-indigo-500/15",
        iconColor: "text-indigo-400",
        badge: null,
    },
    {
        icon: Shield,
        title: "Enterprise Security",
        desc: "Built for multi-tenant SaaS from the ground up. JWT authentication, webhook signature verification, API rate limiting, and strict data isolation ensure your data and your customers' data is always safe.",
        points: [
            "JWT + session-based auth",
            "Webhook HMAC verification",
            "Rate limiting per business",
            "Complete data isolation",
        ],
        color: "from-slate-500/15 to-gray-500/5",
        border: "border-slate-500/20",
        iconBg: "bg-slate-500/15",
        iconColor: "text-slate-400",
        badge: null,
    },
    {
        icon: MessageCircle,
        title: "WhatsApp Cloud API Integration",
        desc: "Directly connected to Meta's official WhatsApp Cloud API. No unofficial tools, no risk of bans. Send and receive messages using Meta's official business messaging infrastructure.",
        points: [
            "Official Meta Cloud API",
            "Webhook-based real-time delivery",
            "Supports templates & media",
            "99.9% uptime SLA",
        ],
        color: "from-emerald-500/15 to-green-500/5",
        border: "border-emerald-500/20",
        iconBg: "bg-emerald-500/15",
        iconColor: "text-emerald-400",
        badge: "Meta Verified",
    },
];

export default function FeaturesPage() {
    return (
        <main className="min-h-screen bg-[#060a0f]">
            {/* Hero */}
            <section className="pt-10 pb-12 sm:pt-16 sm:pb-20 bg-grid relative overflow-hidden">
                <div className="absolute glow-orb w-[500px] h-[500px] bg-[#25D366]/10 top-0 left-1/2 -translate-x-1/2" />
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <span className="badge-live mb-6 inline-flex">
                        🛠️ Full Feature List
                    </span>
                    <h1 className="text-5xl sm:text-6xl font-black font-[Outfit] mb-5">
                        Every tool you need to{" "}
                        <span className="text-gradient">dominate WhatsApp sales</span>
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        ReplyFlow gives you an entire AI sales team in one platform — from
                        instant replies to lead recovery, CRM, analytics, and beyond.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className={`glass-card border ${f.border} bg-gradient-to-br ${f.color} p-8 flex flex-col lg:flex-row gap-8 card-hover`}
                        >
                            {/* Icon + badge */}
                            <div className="flex-shrink-0">
                                <div
                                    className={`w-16 h-16 rounded-2xl ${f.iconBg} border ${f.border} flex items-center justify-center mb-3`}
                                >
                                    <f.icon className={`w-8 h-8 ${f.iconColor}`} />
                                </div>
                                {f.badge && (
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${f.iconBg} ${f.iconColor} border ${f.border}`}>
                                        {f.badge}
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold font-[Outfit] mb-3">
                                    {f.title}
                                </h2>
                                <p className="text-white/60 leading-relaxed mb-5">{f.desc}</p>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {f.points.map((pt, pi) => (
                                        <li
                                            key={pi}
                                            className="flex items-center gap-2 text-sm text-white/70"
                                        >
                                            <CheckCircle className={`w-4 h-4 ${f.iconColor} flex-shrink-0`} />
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-20 text-center glass-card border border-[#25D366]/20 p-12">
                    <h2 className="text-3xl font-black font-[Outfit] mb-4">
                        Ready to put all of this to work?
                    </h2>
                    <p className="text-white/50 mb-8">
                        Start your free 7-day trial. No credit card required.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold hover:shadow-[0_0_40px_rgba(37,211,102,0.4)] transition-all hover:-translate-y-0.5"
                    >
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </main>
    );
}

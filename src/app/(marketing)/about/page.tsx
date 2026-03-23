import React from "react";
import { Users, Target, Rocket, ShieldCheck, Heart, Zap } from "lucide-react";

export const metadata = {
    title: "About Us | Turant Reply",
    description: "Learn about the mission and team behind Turant Reply, India's leading WhatsApp AI sales assistant.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen pt-24 pb-20 bg-[#060a0f] text-white">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute glow-orb w-[500px] h-[500px] bg-[#25D366]/10 -top-20 -left-20" />
                <div className="absolute glow-orb w-[400px] h-[400px] bg-[#128C7E]/10 bottom-0 -right-20" />
                
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-bold tracking-widest uppercase mb-6">
                        Our Story
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black font-[Outfit] mb-8 leading-tight">
                        We are on a mission to <br />
                        <span className="text-gradient">automate India's growth.</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
                        Turant Reply was born from a simple observation: billions of business conversations happen on WhatsApp, but millions of leads are lost because of slow replies. We built an AI that never sleeps, so you never miss a sale.
                    </p>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-20 bg-[#04070a]/50 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="glass-card p-10 border border-white/5 hover:border-[#25D366]/20 transition-all group">
                            <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Target className="w-7 h-7 text-[#25D366]" />
                            </div>
                            <h2 className="text-3xl font-bold font-[Outfit] mb-4">Our Vision</h2>
                            <p className="text-white/60 leading-relaxed text-lg">
                                To be the backbone of small and medium businesses in India, providing enterprise-grade AI automation that's accessible, affordable, and incredibly powerful.
                            </p>
                        </div>
                        <div className="glass-card p-10 border border-white/5 hover:border-[#25D366]/20 transition-all group">
                            <div className="w-14 h-14 rounded-2xl bg-[#128C7E]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Rocket className="w-7 h-7 text-[#128C7E]" />
                            </div>
                            <h2 className="text-3xl font-bold font-[Outfit] mb-4">Our Mission</h2>
                            <p className="text-white/60 leading-relaxed text-lg">
                                To help 1 million Indian businesses scale by automating their sales and support, turning WhatsApp from a manual chat app into a high-performance sales engine.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 max-w-7xl mx-auto px-4">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-black font-[Outfit] mb-4">The Values That Drive Us</h2>
                    <p className="text-white/40 max-w-xl mx-auto">We don't just build software; we build tools that create real impact for real people.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Zap,
                            title: "Speed First",
                            desc: "In business, speed is everything. We prioritize instant responses and lightning-fast execution."
                        },
                        {
                            icon: ShieldCheck,
                            title: "Trust & Security",
                            desc: "Your business data is sacred. We use enterprise-grade security to protect your privacy."
                        },
                        {
                            icon: Heart,
                            title: "Customer Obsessed",
                            desc: "We win when our customers win. Every feature we build is designed to drive your ROI."
                        }
                    ].map((value, i) => (
                        <div key={i} className="text-center p-8 rounded-3xl hover:bg-white/[0.02] transition-colors">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-[#25D366]">
                                <value.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 font-[Outfit]">{value.title}</h3>
                            <p className="text-white/40 leading-relaxed">{value.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team/Join Section */}
            <section className="py-20 bg-gradient-to-b from-transparent to-[#25D366]/5">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="p-12 rounded-[40px] border border-white/10 bg-[#0a0f14] relative overflow-hidden shadow-2xl">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#25D366]/20 blur-[100px]" />
                        <h2 className="text-4xl font-black font-[Outfit] mb-6 relative z-10">Join the AI Revolution</h2>
                        <p className="text-white/60 mb-10 text-lg relative z-10">
                            We're a team of engineers, designers, and enthusiasts dedicated to building the future of conversational commerce. Want to grow your business with us?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                            <a href="/signup" className="btn-primary px-10 py-4 text-lg font-bold">Get Started Now</a>
                            <a href="/contact" className="px-10 py-4 text-lg font-bold border border-white/10 rounded-xl hover:bg-white/5 transition-all">Contact Sales</a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

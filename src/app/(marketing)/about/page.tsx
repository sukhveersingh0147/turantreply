import Link from "next/link";
import { Zap, Target, Lightbulb, Users, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#04070a] py-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black font-[Outfit] text-white mb-6">
                        About <span className="text-gradient">ReplyFlow AI</span>
                    </h1>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
                        We are on a mission to empower small businesses with the power of AI-driven WhatsApp automation.
                    </p>
                </div>

                <div className="space-y-20">
                    {/* Introduction */}
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold font-[Outfit] text-white">Company Introduction</h2>
                            <p className="text-white/70 leading-relaxed text-lg">
                                ReplyFlow AI is a cutting-edge SaaS platform designed specifically for small and medium-sized businesses. We realized that in today&apos;s fast-paced world, WhatsApp has become the primary communication channel for customers, yet most businesses struggle to keep up with the volume of enquiries.
                            </p>
                            <p className="text-white/70 leading-relaxed text-lg">
                                We created ReplyFlow AI to bridge this gap, offering a powerful yet simple tool that automates conversations, captures leads, and ensures no customer query ever goes unanswered.
                            </p>
                        </div>
                        <div className="glass-card border border-white/5 p-8 flex items-center justify-center bg-[#25D366]/5">
                            <Zap className="w-32 h-32 text-[#25D366]" fill="#25D366" />
                        </div>
                    </section>

                    {/* The Problem */}
                    <section className="bg-white/5 rounded-3xl p-10 md:p-16 border border-white/5">
                        <div className="max-w-3xl mx-auto text-center space-y-6">
                            <h2 className="text-3xl font-bold font-[Outfit] text-white">The Problem We Solve</h2>
                            <p className="text-white/70 leading-relaxed text-lg">
                                Every day, thousands of local businesses—from gyms and salons to coaching institutes and clinics—lose potential customers because they can&apos;t reply to WhatsApp messages instantly. Manual communication is slow, inconsistent, and leads often fall through the cracks during busy hours or after-office times.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 pt-4">
                                <span className="px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm border border-red-500/20">Delayed Replies</span>
                                <span className="px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm border border-red-500/20">Lost Enquiries</span>
                                <span className="px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm border border-red-500/20">Manual Overload</span>
                            </div>
                        </div>
                    </section>

                    {/* Our Solution */}
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 glass-card border border-white/5 p-8 grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                                    <div className="w-12 h-1.5 rounded-full bg-[#25D366]/20" />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-6 order-1 md:order-2">
                            <h2 className="text-3xl font-bold font-[Outfit] text-white">Our Solution</h2>
                            <p className="text-white/70 leading-relaxed text-lg">
                                ReplyFlow AI provides an all-in-one automation engine that handles the heavy lifting for you. Our platform uses the official Meta WhatsApp Cloud API to process messages through an intelligent AI engine that understands customer intent.
                            </p>
                            <p className="text-white/70 leading-relaxed text-lg">
                                From instant AI auto-replies to automated multi-day follow-up sequences, we ensure your business stays active 24/7, converting cold enquiries into loyal customers while you focus on providing your service.
                            </p>
                        </div>
                    </section>

                    {/* Mission & Vision */}
                    <section className="grid md:grid-cols-2 gap-8">
                        <div className="glass-card border border-white/10 p-10 space-y-4 bg-gradient-to-br from-[#25D366]/5 to-transparent">
                            <Target className="w-10 h-10 text-[#25D366] mb-2" />
                            <h3 className="text-2xl font-bold text-white font-[Outfit]">Our Mission</h3>
                            <p className="text-white/60 leading-relaxed">
                                Our mission is simple: To help small and medium businesses respond to customers instantly and never lose a single potential lead on WhatsApp. We believe automation shouldn&apos;t be a luxury reserved for big tech companies.
                            </p>
                        </div>
                        <div className="glass-card border border-white/10 p-10 space-y-4">
                            <Lightbulb className="w-10 h-10 text-orange-400 mb-2" />
                            <h3 className="text-2xl font-bold text-white font-[Outfit]">Our Vision</h3>
                            <p className="text-white/60 leading-relaxed">
                                We envision a world where every local business has a &quot;Digital Sales Employee&quot; that handles communication perfectly. We are committed to building the world&apos;s smartest and most accessible communication tools for the next generation of entrepreneurs.
                            </p>
                        </div>
                    </section>

                    {/* Why Choose Us */}
                    <section className="space-y-10">
                        <h2 className="text-3xl font-bold font-[Outfit] text-white text-center">Why Choose ReplyFlow AI</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "24/7 Automation", desc: "Never miss a lead, even while you sleep." },
                                { title: "Time Savings", desc: "Reduce manual chat handling by up to 90%." },
                                { title: "Higher Conversion", desc: "Instant replies increase lead trust and sales." },
                                { title: "Simple Setup", desc: "No coding required. Go live in minutes." }
                            ].map((item, idx) => (
                                <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
                                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                    <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="text-center py-20 border-t border-white/5">
                        <h2 className="text-3xl font-bold font-[Outfit] text-white mb-6">Ready to automate your growth?</h2>
                        <p className="text-white/40 mb-10 max-w-xl mx-auto">
                            Join hundreds of businesses that are already using ReplyFlow AI to power their WhatsApp sales.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold hover:opacity-90 transition-opacity">
                                Start Your Free Trial
                            </Link>
                            <Link href="/contact" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors">
                                Talk to Sales
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

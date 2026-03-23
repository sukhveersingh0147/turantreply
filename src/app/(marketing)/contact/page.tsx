"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, MapPin, Phone, Send, CheckCircle2, LifeBuoy } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSending(false);
        setSent(true);
        toast.success("Message sent successfully! We'll get back to you soon.");
    };

    return (
        <main className="min-h-screen pt-24 pb-20 bg-[#060a0f] text-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-bold tracking-widest uppercase mb-6">
                        Support Center
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black font-[Outfit] mb-6">
                        How can we <span className="text-gradient">help you today?</span>
                    </h1>
                    <p className="text-white/40 max-w-xl mx-auto text-lg leading-relaxed">
                        Whether you have a question about features, pricing, or need a technical demo, our team is ready to answer all your questions.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="glass-card p-8 border border-white/5 bg-[#0a0f14]/50">
                            <h2 className="text-2xl font-bold font-[Outfit] mb-8">Contact Information</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center shrink-0 group-hover:bg-[#25D366] transition-all">
                                        <Mail className="w-5 h-5 text-[#25D366] group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/40 mb-1">Email Us</p>
                                        <p className="text-white font-medium">rs163592@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500 transition-all">
                                        <MessageSquare className="w-5 h-5 text-blue-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/40 mb-1">Live Chat</p>
                                        <p className="text-white font-medium">Available Mon-Fri, 9am - 6pm</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500 transition-all">
                                        <Phone className="w-5 h-5 text-orange-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/40 mb-1">Phone Support</p>
                                        <p className="text-white font-medium">+91 98765 43210</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#25D366]/10 to-transparent border border-[#25D366]/20">
                            <LifeBuoy className="w-8 h-8 text-[#25D366] mb-4" />
                            <h3 className="text-xl font-bold font-[Outfit] mb-2">Help Documentation</h3>
                            <p className="text-sm text-white/60 mb-6 leading-relaxed">
                                Self-help is often the fastest way. Explore our comprehensive setup guides and FAQs.
                            </p>
                            <a href="#" className="inline-flex items-center gap-2 text-[#25D366] font-bold text-sm hover:underline">
                                Visit Help Center <Send className="w-3 h-3" />
                            </a>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="glass-card p-8 md:p-12 border border-white/5 bg-[#0a0f14]/80 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#25D366]/5 blur-[100px] -z-10" />
                            
                            {sent ? (
                                <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
                                    <CheckCircle2 className="w-20 h-20 text-[#25D366] mx-auto mb-6" />
                                    <h2 className="text-4xl font-black font-[Outfit] mb-4">Message Received!</h2>
                                    <p className="text-white/60 text-lg mb-10 max-w-sm mx-auto">
                                        Thank you for reaching out. A support specialist will get back to you within 24 hours.
                                    </p>
                                    <button 
                                        onClick={() => setSent(false)}
                                        className="text-[#25D366] font-bold hover:underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-white/60 ml-1">Full Name</label>
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="John Doe"
                                                className="w-full bg-[#060a0f]/50 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#25D366]/50 transition-all text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-white/60 ml-1">Work Email</label>
                                            <input 
                                                required
                                                type="email" 
                                                placeholder="john@company.com"
                                                className="w-full bg-[#060a0f]/50 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#25D366]/50 transition-all text-white"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-white/60 ml-1">Business Type</label>
                                        <select className="w-full bg-[#060a0f]/50 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#25D366]/50 transition-all text-white appearance-none">
                                            <option>Small Business</option>
                                            <option>Agency</option>
                                            <option>Enterprise</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-white/60 ml-1">How can we help?</label>
                                        <textarea 
                                            required
                                            rows={5}
                                            placeholder="Tell us a bit about what you're looking for..."
                                            className="w-full bg-[#060a0f]/50 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#25D366]/50 transition-all text-white resize-none"
                                        ></textarea>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={sending}
                                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(37,211,102,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {sending ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

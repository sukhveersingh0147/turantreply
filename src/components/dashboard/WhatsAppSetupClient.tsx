"use client";

import { useState } from "react";
import { Smartphone, Shield, Key, Globe, CheckCircle2, ArrowLeft, ExternalLink, Copy, HelpCircle, Zap, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { WhatsAppConnect } from "./WhatsAppConnect";

type ViewMode = "GUIDE" | "FORM";

export default function WhatsAppSetupClient({ business }: { business: any }) {
    const isConnected = !!(business?.waToken && business?.waPhoneNumberId);
    const [view, setView] = useState<ViewMode>(isConnected ? "FORM" : "GUIDE");

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const webhookUrl = "https://www.turantreply.com/api/webhook/whatsapp";

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-12">
                <Link 
                    href="/integrations" 
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Integrations</span>
                </Link>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setView("GUIDE")}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            view === "GUIDE" ? "bg-[#25D366] text-black shadow-lg" : "text-white/40 hover:text-white"
                        }`}
                    >
                        Setup Guide
                    </button>
                    <button
                        onClick={() => setView("FORM")}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            view === "FORM" ? "bg-[#25D366] text-black shadow-lg" : "text-white/40 hover:text-white"
                        }`}
                    >
                        {isConnected ? "Connection Info" : "Connect Now"}
                    </button>
                </div>
            </div>

            {view === "GUIDE" ? (
                <div className="space-y-12">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] font-black uppercase tracking-widest mx-auto">
                            <Zap className="w-3 h-3" /> Quick Launch Guide
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black font-[Outfit] text-white tracking-tight">
                            WhatsApp <span className="text-gradient">Cloud API</span> Setup
                        </h1>
                        <p className="text-white/40 max-w-xl mx-auto font-medium">
                            Follow these 4 professional steps to connect your Meta Business account and enable AI automated replies.
                        </p>
                        <div className="pt-4">
                            <button 
                                onClick={() => setView("FORM")}
                                className="px-8 py-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Skip to Setup <ChevronRight className="w-4 h-4 inline ml-1" />
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {/* Step 1 */}
                        <section className="glass-card border border-white/5 p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                                <Globe className="w-32 h-32 text-white" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row gap-8">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xl shadow-2xl">1</div>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-black text-white font-[Outfit]">Create Meta Developer App</h2>
                                    <p className="text-sm text-white/40 leading-relaxed max-w-2xl">
                                        You need a Meta for Developers account to use the WhatsApp Cloud API. Go to the dashboard and create a new Business app.
                                    </p>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-sm text-white/70">
                                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                                            <span>Go to <a href="https://developers.facebook.com/apps" target="_blank" className="text-[#25D366] hover:underline font-bold">Meta App Dashboard</a>.</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-white/70">
                                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                                            <span>Click "Create App" &rarr; "Other" &rarr; "Business".</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Step 2 */}
                        <section className="glass-card border border-white/5 p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform text-[#25D366]">
                                <Smartphone className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row gap-8">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-black flex items-center justify-center font-black text-xl shadow-2xl">2</div>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-black text-white font-[Outfit]">Add WhatsApp Product</h2>
                                    <p className="text-sm text-white/40 leading-relaxed max-w-2xl">
                                        Activate the WhatsApp Cloud API within your Meta app and retrieve your Phone ID.
                                    </p>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-sm text-white/70">
                                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                                            <span>Scroll down to "Add a product" and find "WhatsApp".</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-white/70">
                                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                                            <span>In "API Setup", copy your <b>Phone Number ID</b> and <b>WABA ID</b>.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Step 3 */}
                        <section className="glass-card border border-white/5 p-8 bg-gradient-to-br from-[#25D366]/5 to-transparent relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform text-[#25D366]">
                                <Key className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row gap-8">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xl shadow-2xl">3</div>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-black text-white font-[Outfit]">Permanent Access Token</h2>
                                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-3 text-xs text-orange-200/80 leading-relaxed">
                                        <Shield className="w-5 h-5 flex-shrink-0 text-orange-500" />
                                        <p>Avoid using "Temporary Tokens" as they expire in 24 hours. Create a System User for a permanent one.</p>
                                    </div>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-sm text-white/70">
                                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                                            <span>Go to <a href="https://business.facebook.com/settings/system-users" target="_blank" className="text-[#25D366] hover:underline font-bold">System Users</a> in Business Settings.</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-white/70">
                                            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                                            <span>Generate token with <b>whatsapp_business_messaging</b> and <b>management</b>.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Step 4 */}
                        <section className="glass-card border border-white/5 p-8 relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col md:flex-row gap-8">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-black flex items-center justify-center font-black text-xl shadow-2xl">4</div>
                                </div>
                                <div className="space-y-6 flex-1">
                                    <h2 className="text-2xl font-black text-white font-[Outfit]">Configure Webhooks</h2>
                                    <div className="p-5 bg-black/40 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 group/code">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] uppercase tracking-widest font-black text-[#25D366] mb-1">Callback Webhook URL</p>
                                            <code className="text-xs text-white/80 font-mono break-all leading-loose">{webhookUrl}</code>
                                        </div>
                                        <button 
                                            onClick={() => copyToClipboard(webhookUrl)}
                                            className="shrink-0 p-4 rounded-xl bg-white/5 hover:bg-[#25D366]/20 hover:text-[#25D366] transition-all flex items-center gap-2 group-hover/code:scale-105"
                                        >
                                            <Copy className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Copy URL</span>
                                        </button>
                                    </div>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-4 text-sm text-white/70">
                                            <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
                                            <span>Edit Webhooks and paste the URL. Use Verify Token: <code className="bg-white/5 px-2 py-0.5 rounded text-[#25D366]">turantreply_verify_token_123</code></span>
                                        </li>
                                        <li className="flex items-center gap-4 text-sm text-white/70">
                                            <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
                                            <span>Finally, click <b>"Manage"</b> and subscribe to <b>messages</b> event.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="pt-20 text-center">
                        <button 
                            onClick={() => setView("FORM")}
                            className="btn-primary px-12 py-5 text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                            I've Finished Setup &rarr; Connect Now
                        </button>
                    </div>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-6 mb-12">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center mx-auto shadow-2xl relative">
                            <div className="absolute inset-0 bg-[#25D366]/20 blur-3xl animate-pulse rounded-full" />
                            <Smartphone className="w-10 h-10 text-[#25D366] relative z-10" />
                        </div>
                        <h1 className="text-4xl font-black font-[Outfit]">Enter Credentials</h1>
                        <p className="text-white/40 font-medium">Link your Meta App securely to activate AI responses.</p>
                    </div>

                    <div className="glass-card border border-white/5 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
                        <WhatsAppConnect business={business} />
                    </div>

                    <div className="pt-8 flex items-center justify-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                         <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Secure 256-bit Connection</span>
                    </div>

                    <div className="mt-12 text-center">
                         <button 
                            onClick={() => setView("GUIDE")}
                            className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase text-white/40 hover:text-white hover:bg-white/10 transition-all tracking-widest"
                         >
                            Need help? Go back to guide
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
}

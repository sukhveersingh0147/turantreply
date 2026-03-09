"use client";

import { useState } from "react";
import { Zap, Bot, CreditCard, Bell, Shield, Phone, Loader2 } from "lucide-react";
import {
    updateBusinessSettings,
    updateWhatsAppSettings,
    updateAISettings
} from "@/app/actions/settings";
import { createCheckoutOrder, verifyPayment } from "@/app/actions/billing";
import { SUBSCRIPTION_PLANS, SubscriptionPlan, getPlanDetails } from "@/config/subscription";
import Script from "next/script";
import { toast } from "sonner";
import { Check } from "lucide-react";

const tabs = [
    { key: "business", label: "Business", icon: Phone },
    { key: "whatsapp", label: "WhatsApp", icon: Zap },
    { key: "ai", label: "AI Engine", icon: Bot },
    { key: "billing", label: "Billing", icon: CreditCard },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "security", label: "Security", icon: Shield },
];

export default function SettingsClient({ business, user }: { business: any; user: any }) {
    const [activeTab, setActiveTab] = useState("business");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Business Form State
    const [businessData, setBusinessData] = useState({
        name: business?.name || "",
        industry: business?.industry || "Fitness & Gym",
        description: business?.description || "",
    });

    // WhatsApp Form State
    const [waData, setWaData] = useState({
        whatsappNumber: business?.whatsappNumber || "",
        waToken: business?.waToken || "",
        waPhoneNumberId: business?.waPhoneNumberId || "",
    });

    // AI Form State
    const [aiData, setAiData] = useState({
        aiSystemPrompt: business?.aiSystemPrompt || "You are a friendly WhatsApp sales assistant...",
        knowledgeBase: business?.knowledgeBase || "",
    });

    const handleSaveBusiness = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await updateBusinessSettings(businessData);
            setMessage({ type: "success", text: "Business profile updated successfully!" });
        } catch (err) {
            setMessage({ type: "error", text: "Failed to update business profile." });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveWhatsApp = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await updateWhatsAppSettings(waData);
            setMessage({ type: "success", text: "WhatsApp settings updated successfully!" });
        } catch (err) {
            setMessage({ type: "error", text: "Failed to update WhatsApp settings." });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAI = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await updateAISettings(aiData);
            setMessage({ type: "success", text: "AI Engine settings updated successfully!" });
        } catch (err) {
            setMessage({ type: "error", text: "Failed to update AI settings." });
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (planKey: SubscriptionPlan) => {
        setLoading(true);
        try {
            const order = await createCheckoutOrder(planKey);

            if ((order as any).isMock) {
                toast.info("Using Test Mode (Placeholder Keys). To test real payments, please update your .env with valid Razorpay keys.", {
                    duration: 5000
                });
                // Optional: Automatically upgrade for testing purposes if it's a mock
                // await verifyPayment({ ...mockData });
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: order.amount,
                currency: order.currency,
                name: "ReplyFlow AI",
                description: `Upgrade to ${planKey} Plan`,
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        const result = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planKey: planKey,
                        });
                        if (result.success) {
                            toast.success("Payment successful! Your plan has been upgraded.");
                            window.location.reload();
                        }
                    } catch (err) {
                        toast.error("Payment verification failed.");
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: "#25D366",
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error("Failed to initiate payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-6">
            {/* Sidebar tabs */}
            <div className="w-48 flex-shrink-0 space-y-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${activeTab === tab.key
                            ? "sidebar-active bg-[#25D366]/10 text-[#25D366]"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <tab.icon className="w-4 h-4 flex-shrink-0" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-xs font-medium border ${message.type === "success"
                        ? "bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366]"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}>
                        {message.text}
                    </div>
                )}

                {activeTab === "business" && (
                    <div className="glass-card border border-white/5 p-6 space-y-5">
                        <h2 className="font-bold font-[Outfit]">Business Profile</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-white/50 block mb-2">Business Name</label>
                                <input
                                    type="text"
                                    value={businessData.name}
                                    onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                                    className="input-dark"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-white/50 block mb-2">Industry</label>
                                <input
                                    type="text"
                                    list="industries"
                                    value={businessData.industry}
                                    onChange={(e) => setBusinessData({ ...businessData, industry: e.target.value })}
                                    className="input-dark w-full"
                                    placeholder="Type or select industry..."
                                />
                                <datalist id="industries">
                                    <option value="Fitness & Gym" />
                                    <option value="Real Estate" />
                                    <option value="Education" />
                                    <option value="Food & Restaurant" />
                                    <option value="Healthcare" />
                                    <option value="Retail" />
                                    <option value="E-commerce" />
                                    <option value="Logistics" />
                                    <option value="Professional Services" />
                                    <option value="Technology" />
                                    <option value="Manufacturing" />
                                    <option value="Tourism & Hospitality" />
                                </datalist>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-white/50 block mb-2">Owner Name</label>
                                <input type="text" value={user?.name || ""} disabled className="input-dark opacity-70 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-white/50 block mb-2">Email Address</label>
                                <input type="email" value={user?.email || ""} disabled className="input-dark opacity-70 cursor-not-allowed" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs font-medium text-white/50 block mb-2">Business Description (AI Context)</label>
                                <textarea
                                    value={businessData.description}
                                    onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                                    className="input-dark h-24 resize-none"
                                    placeholder="Enter a detailed description of your services, pricing, and locations..."
                                />
                                <p className="text-[10px] text-white/30 mt-1">This description is used by the AI to respond intelligently about your business.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveBusiness}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                )}

                {activeTab === "whatsapp" && (
                    <div className="glass-card border border-white/5 p-6 space-y-5">
                        <h2 className="font-bold font-[Outfit]">WhatsApp Cloud API</h2>
                        <div className={`p-4 rounded-xl border ${waData.waToken ? "bg-[#25D366]/10 border-[#25D366]/20" : "bg-yellow-500/10 border-yellow-500/20"}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${waData.waToken ? "bg-[#25D366]" : "bg-yellow-500"}`} />
                                <span className={`text-sm font-semibold ${waData.waToken ? "text-[#25D366]" : "text-yellow-500"}`}>
                                    {waData.waToken ? "Configured" : "Action Required"}
                                </span>
                            </div>
                            <p className="text-xs text-white/50">
                                {waData.waToken ? "WhatsApp API integration is active." : "Please enter your WhatsApp Cloud API credentials below."}
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-white/50 block mb-2">WhatsApp Phone Number</label>
                                <input
                                    type="tel"
                                    value={waData.whatsappNumber}
                                    onChange={(e) => setWaData({ ...waData, whatsappNumber: e.target.value })}
                                    placeholder="+91 98765 43210"
                                    className="input-dark"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-white/50 block mb-2">WhatsApp API Token</label>
                                <input
                                    type="password"
                                    value={waData.waToken}
                                    onChange={(e) => setWaData({ ...waData, waToken: e.target.value })}
                                    placeholder="EAAxxxxxxxxxxxx"
                                    className="input-dark"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-white/50 block mb-2">Phone Number ID</label>
                                <input
                                    type="text"
                                    value={waData.waPhoneNumberId}
                                    onChange={(e) => setWaData({ ...waData, waPhoneNumberId: e.target.value })}
                                    placeholder="1234567890123456"
                                    className="input-dark"
                                />
                            </div>
                        </div>
                        <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                            <p className="text-xs text-white/50 mb-1 font-medium">Webhook URL (copy to Meta Dashboard)</p>
                            <code className="text-xs text-[#25D366] break-all">https://yourdomain.com/api/webhook/whatsapp</code>
                        </div>
                        <button
                            onClick={handleSaveWhatsApp}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-sm font-semibold disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save & Test Connection
                        </button>
                    </div>
                )}

                {activeTab === "ai" && (
                    <div className="glass-card border border-white/5 p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold font-[Outfit]">AI Engine Settings</h2>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[10px] font-bold text-[#25D366]">
                                <Bot className="w-3 h-3" />
                                PLATFORM MANAGED
                            </div>
                        </div>

                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <p className="text-xs text-blue-400 font-medium mb-1">Centralized AI API</p>
                            <p className="text-[11px] text-white/50 leading-relaxed">
                                ReplyFlow manages the OpenAI API keys for all clients. You do NOT need to provide your own API key.
                                Simply customize your AI's personality and business context below.
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-white/50 block mb-2">AI Model</label>
                            <div className="input-dark bg-white/5 flex items-center justify-between opacity-70">
                                <span className="text-xs">GPT-4o Mini (Ultra-fast & Smart)</span>
                                <Shield className="w-3.5 h-3.5 text-white/30" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-white/50 block mb-2">AI System Prompt (Personality)</label>
                            <textarea
                                value={aiData.aiSystemPrompt}
                                onChange={(e) => setAiData({ ...aiData, aiSystemPrompt: e.target.value })}
                                placeholder="Enter instructions for the AI..."
                                className="input-dark h-32 resize-none text-xs font-mono leading-relaxed"
                            />
                            <p className="text-[10px] text-white/30 mt-2">
                                Use this to define how the AI should talk to your customers. E.g., "Be very professional" or "Use lots of emojis".
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-white/50 block mb-2">Detailed Knowledge Base (FAQs, Product List, Pricing)</label>
                            <textarea
                                value={aiData.knowledgeBase}
                                onChange={(e) => setAiData({ ...aiData, knowledgeBase: e.target.value })}
                                placeholder="List your FAQs, products, pricing, and specific business rules here. The AI will use this data to answer customer questions accurately."
                                className="input-dark h-48 resize-none text-xs leading-relaxed"
                            />
                            <p className="text-[10px] text-white/30 mt-2">
                                The more detail you provide here, the better the AI can sell your products/services without human help.
                            </p>
                        </div>
                        <button
                            onClick={handleSaveAI}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-sm font-semibold disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Update AI Knowledge & Personality
                        </button>
                    </div>
                )}

                {activeTab === "billing" && (
                    <div className="glass-card border border-white/5 p-6 space-y-8">
                        <div>
                            <h2 className="font-bold font-[Outfit] text-xl mb-1">Billing & Subscription</h2>
                            <p className="text-sm text-white/40">Manage your plan and monitor AI usage</p>
                        </div>

                        {/* Current Plan Card */}
                        <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${business?.plan !== "FREE" ? "bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/10 border-[#25D366]/20" : "bg-white/[0.03] border-white/10"
                            }`}>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-1">Active Plan</p>
                                <h3 className="text-3xl font-black font-[Outfit] text-white flex items-center gap-2">
                                    {business?.plan || "FREE"}
                                    {business?.plan !== "FREE" && <span className="px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#25D366] text-[10px] font-bold">PRO</span>}
                                </h3>
                                {business?.subscriptionExpiresAt && (
                                    <p className="text-xs text-white/50 mt-2 flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5 text-[#25D366]" />
                                        Renews on {new Date(business.subscriptionExpiresAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="text-right">
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-1">AI Usage</p>
                                    {(() => {
                                        const used = business?.aiRepliesUsed || 0;
                                        const plan = business?.plan || "FREE";
                                        const details = getPlanDetails(plan);
                                        const limit = details.limit;
                                        const percentage = Math.min(100, (used / limit) * 100);
                                        return (
                                            <div className="w-48 text-right">
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="font-bold text-white">{used.toLocaleString()}</span>
                                                    <span className="text-white/40">/ {limit.toLocaleString()}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#25D366] to-[#128C7E]"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Plan Selection */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold font-[Outfit] text-white/70">Switch to a better plan</h4>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionPlan, any][]).map(([key, plan]) => (
                                    <div
                                        key={key}
                                        className={`p-5 rounded-2xl border transition-all ${business?.plan === key
                                            ? "bg-[#25D366]/5 border-[#25D366]/40 ring-1 ring-[#25D366]/20"
                                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h5 className="font-bold text-lg font-[Outfit]">{plan.name}</h5>
                                                <p className="text-xl font-black text-white mt-1">
                                                    ₹{plan.price.toLocaleString()}<span className="text-[10px] font-normal text-white/40">/mo</span>
                                                </p>
                                            </div>
                                            {business?.plan === key && (
                                                <div className="p-1.5 rounded-full bg-[#25D366] text-black">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                        <ul className="space-y-2 mb-6">
                                            {plan.features.map((feat: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-[11px] text-white/50">
                                                    <div className="w-1 h-1 rounded-full bg-[#25D366] mt-1.5" />
                                                    {feat}
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            disabled={business?.plan === key || loading}
                                            onClick={() => handleUpgrade(key)}
                                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${business?.plan === key
                                                ? "bg-white/5 text-white/30 cursor-not-allowed"
                                                : "bg-white text-black hover:bg-white/90"
                                                }`}
                                        >
                                            {business?.plan === key ? "Current Plan" : "Upgrade Now"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <p className="text-[11px] text-white/30 italic">All prices are in INR. Subscriptions are billed monthly.</p>
                            <button className="text-xs text-white/50 hover:text-white font-medium flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5" />
                                Manage Billing Methods
                            </button>
                        </div>
                    </div>
                )}

                <Script src="https://checkout.razorpay.com/v1/checkout.js" />

                {(activeTab === "notifications" || activeTab === "security") && (
                    <div className="glass-card border border-white/5 p-6">
                        <h2 className="font-bold font-[Outfit] mb-4">{activeTab === "notifications" ? "Notification Preferences" : "Security Settings"}</h2>
                        <p className="text-white/40 text-sm">Coming soon — this section is under development.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

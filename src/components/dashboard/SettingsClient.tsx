"use client";

import { useState } from "react";
import { Zap, Bot, CreditCard, Bell, Shield, Phone, Loader2, Sparkles, ShieldCheck, Users, UserPlus, Trash2 } from "lucide-react";
import {
    updateBusinessSettings,
    updateWhatsAppSettings,
    updateAISettings,
    generateAISettings,
    updateNotificationSettings,
    addTeamMember,
    removeTeamMember
} from "@/app/actions/settings";
import { savePushSubscription } from "@/app/actions/notifications";
import { applyBlueprint } from "@/app/actions/settings";
import { INDUSTRY_BLUEPRINTS } from "@/config/blueprints";
import { createCheckoutOrder, verifyPayment } from "@/app/actions/billing";
import { SUBSCRIPTION_PLANS, SubscriptionPlan, getPlanDetails } from "@/config/subscription";
import Script from "next/script";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { WhatsAppConnect } from "./WhatsAppConnect";
import { AIConfigAssistant } from "./AIConfigAssistant";
import DeploymentManager from "./DeploymentManager";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { urlBase64ToUint8Array } from "@/lib/utils-web";

const tabs = [
    { key: "business", label: "Business", icon: Phone },
    { key: "ai", label: "AI Engine", icon: Bot },
    { key: "billing", label: "Billing", icon: CreditCard },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "team", label: "Team", icon: Users },
    { key: "deployment", label: "Deployment", icon: Rocket },
    { key: "security", label: "Security", icon: Shield },
];

export default function SettingsClient({ business, user, initialTeam = [] }: { business: any; user: any; initialTeam?: any[] }) {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") || "business";
    const upgradePlan = searchParams.get("upgrade") as SubscriptionPlan | null;

    const router = useRouter();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [team, setTeam] = useState<any[]>(initialTeam);
    const [inviteEmail, setInviteEmail] = useState("");

    useEffect(() => {
        if (upgradePlan && activeTab === "billing") {
            handleUpgrade(upgradePlan);
        }
    }, [upgradePlan, activeTab]);

    // Business Form State
    const [businessData, setBusinessData] = useState({
        name: business?.name || "",
        industry: business?.industry || "Fitness & Gym",
        description: business?.description || "",
        businessType: business?.businessType || "OTHER",
        targetAudience: business?.targetAudience || "",
        pricingDetails: business?.pricingDetails || "",
        businessRules: business?.businessRules || "",
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
        autoReplyEnabled: business?.autoReplyEnabled ?? true,
        followUpEnabled: business?.followUpEnabled ?? true,
        autoBookingEnabled: business?.autoBookingEnabled ?? false,
        mediaAutoSendEnabled: business?.mediaAutoSendEnabled ?? true,
        lowStockAlertsEnabled: business?.lowStockAlertsEnabled ?? true,
    });

    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiDraftDescription, setAiDraftDescription] = useState(business?.description || "");
    const [showAIAssistant, setShowAIAssistant] = useState(false);

    const [notifData, setNotifData] = useState({
        notifyOnEmergency: business?.notifyOnEmergency ?? true,
        notifyOnNewLead: business?.notifyOnNewLead ?? true,
        notifyOnAiPause: business?.notifyOnAiPause ?? true,
    });

    const [isPushSupported, setIsPushSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && 'serviceWorker' in navigator && 'PushManager' in window) {
            setIsPushSupported(true);
            checkPushSubscription();
        }
    }, []);

    const checkPushSubscription = async () => {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
    };

    const handleEnablePushSettings = async () => {
        setLoading(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error("Permission not granted for notifications");
            }

            // Unregister old workers if any for a clean slate
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let reg of registrations) {
                await reg.unregister();
            }

            await navigator.serviceWorker.register('/sw.js');

            // Wait for service worker to be ready and active
            let registration = await navigator.serviceWorker.ready;

            // If the worker is not yet active, wait for it
            if (!registration.active) {
                await new Promise<void>((resolve) => {
                    const worker = registration.installing || registration.waiting;
                    if (worker) {
                        worker.addEventListener('statechange', (e: any) => {
                            if (e.target.state === 'activated') resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            }

            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) throw new Error("VAPID public key not found");

            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            const subJson = JSON.parse(JSON.stringify(subscription));
            await savePushSubscription(subJson);

            setIsSubscribed(true);
            toast.success("Desktop notifications enabled!");
        } catch (error: any) {
            console.error("Push registration failed:", error);
            toast.error(error.message || "Failed to enable notifications");
        } finally {
            setLoading(false);
        }
    };

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

    const handleGenerateAI = async () => {
        if (!aiDraftDescription) {
            toast.error("Please enter a business description first");
            return;
        }

        setAiGenerating(true);
        try {
            const result = await generateAISettings(aiDraftDescription);
            if (result.success) {
                setAiData(prev => ({ ...prev, ...result.data }));
                toast.success("AI generated your personality and knowledge base! Review it below.");
            }
        } catch (err: any) {
            toast.error(err.message || "AI failed to generate settings");
        } finally {
            setAiGenerating(false);
        }
    };

    const handleSaveNotifications = async () => {
        setLoading(true);
        try {
            await updateNotificationSettings(notifData);
            toast.success("Notification preferences updated!");
        } catch (err: any) {
            toast.error(err.message || "Failed to update preferences");
        } finally {
            setLoading(false);
        }
    };

    const handleApplyBlueprint = async (key: string) => {
        setLoading(true);
        try {
            await applyBlueprint(key);
            toast.success(`Applied ${INDUSTRY_BLUEPRINTS[key].name} template!`);
            // Refresh local state to match DB
            const blueprint = INDUSTRY_BLUEPRINTS[key];
            setBusinessData(prev => ({ ...prev, industry: blueprint.industry }));
            setAiData(prev => ({
                ...prev,
                aiSystemPrompt: blueprint.aiSystemPrompt,
                knowledgeBase: blueprint.knowledgeBase
            }));
        } catch (err: any) {
            toast.error(err.message || "Failed to apply template");
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = (planKey: SubscriptionPlan) => {
        router.push(`/checkout?plan=${planKey}`);
    };

    const handleInvite = async () => {
        if (!inviteEmail) return;
        setLoading(true);
        try {
            await addTeamMember(inviteEmail);
            toast.success(`Invite sent to ${inviteEmail}! (If they have an account, they now have access)`);
            setInviteEmail("");
            // In a real app we'd refresh the list, but for now we'll rely on server action revalidation
            // or a local update if we want it snappy.
            window.location.reload();
        } catch (err: any) {
            toast.error(err.message || "Failed to invite member");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (memberId: string) => {
        if (!confirm("Remove this team member?")) return;
        setLoading(true);
        try {
            await removeTeamMember(memberId);
            toast.success("Member removed");
            setTeam(team.filter(m => m.id !== memberId));
        } catch (err: any) {
            toast.error(err.message || "Failed to remove member");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar tabs */}
            <div className="w-full md:w-56 flex-shrink-0 flex md:flex-col overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 space-x-1 md:space-x-0 md:space-y-1 scrollbar-hide mb-4 md:mb-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 md:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-left transition-all border ${activeTab === tab.key
                            ? "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20 shadow-[0_0_20px_rgba(37,211,102,0.1)]"
                            : "text-white/40 border-transparent hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.key ? "text-[#25D366]" : "text-white/30"}`} />
                        <span className="whitespace-nowrap">{tab.label}</span>
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
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold font-[Outfit]">Business Profile</h2>
                            <button
                                onClick={() => setShowAIAssistant(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[10px] font-bold text-[#25D366] hover:bg-[#25D366]/20 transition-all"
                            >
                                <Sparkles className="w-3 h-3" />
                                OPTIMIZE WITH AI
                            </button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-white/50 block mb-2">Business Name</label>
                                <input
                                    type="text"
                                    value={businessData.name}
                                    onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
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
                            {user?.role === "ADMIN" ? (
                                <div>
                                    <label className="text-xs font-medium text-white/50 block mb-2">Business Persona (AI Mode)</label>
                                    <select
                                        value={businessData.businessType}
                                        onChange={(e) => setBusinessData({ ...businessData, businessType: e.target.value })}
                                        className="input-dark w-full"
                                    >
                                        <option value="SERVICE">SERVICE BUSINESS (Salon, Gym, Clinic)</option>
                                        <option value="SELLING">SELLING BUSINESS (Retail, E-commerce)</option>
                                        <option value="FOOD">FOOD & RESTAURANT (Pickup, Delivery)</option>
                                        <option value="RENTAL">RENTAL & STAY (Property, Car)</option>
                                        <option value="COACHING">COACHING & COURSES (Tutor, Yoga)</option>
                                        <option value="OTHER">GENERAL / CUSTOM BUSINESS</option>
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs font-medium text-white/50 block mb-2">Account Type</label>
                                    <div className="input-dark w-full opacity-70 cursor-not-allowed flex items-center px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-xs">
                                        {businessData.businessType} Mode
                                    </div>
                                    <p className="text-[10px] text-white/30 mt-1">Contact support to change your business persona.</p>
                                </div>
                            )}
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
                            <div className="sm:col-span-2">
                                <label className="text-xs font-medium text-white/50 block mb-2">Target Audience</label>
                                <textarea
                                    value={businessData.targetAudience}
                                    onChange={(e) => setBusinessData({ ...businessData, targetAudience: e.target.value })}
                                    className="input-dark h-20 resize-none"
                                    placeholder="Describe your ideal customers..."
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs font-medium text-white/50 block mb-2">Pricing & Services</label>
                                <textarea
                                    value={businessData.pricingDetails}
                                    onChange={(e) => setBusinessData({ ...businessData, pricingDetails: e.target.value })}
                                    className="input-dark h-24 resize-none"
                                    placeholder="List your products, packages and pricing..."
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs font-medium text-white/50 block mb-2">Business Rules & Policies</label>
                                <textarea
                                    value={businessData.businessRules}
                                    onChange={(e) => setBusinessData({ ...businessData, businessRules: e.target.value })}
                                    className="input-dark h-24 resize-none"
                                    placeholder="Cancellation policy, refunds, booking rules..."
                                />
                            </div>
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={handleSaveBusiness}
                                disabled={loading}
                                className="btn-primary btn-full-mobile flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
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

                        {/* Write by AI Section */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#25D366]/10 via-[#128C7E]/5 to-transparent border border-[#25D366]/20 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-[#25D366]/20 rounded-lg">
                                        <Sparkles className="w-4 h-4 text-[#25D366]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Write by AI</h3>
                                        <p className="text-[10px] text-white/40">Describe your business and let AI do the setup</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <textarea
                                    value={aiDraftDescription}
                                    onChange={(e) => setAiDraftDescription(e.target.value)}
                                    placeholder="e.g. I run a Premium Car Wash in Mumbai. We offer foam washing, interior detailing, and ceramic coating. Prices start from ₹500..."
                                    className="input-dark h-24 text-[11px] resize-none"
                                />
                                <button
                                    onClick={handleGenerateAI}
                                    disabled={aiGenerating || !aiDraftDescription}
                                    className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-black flex items-center justify-center gap-2 hover:bg-[#25D366] hover:text-white transition-all disabled:opacity-50"
                                >
                                    {aiGenerating ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            GENERATING AI PERSONALITY...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5" />
                                            GENERATE AI CONFIGURATION
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="p-5 bg-gradient-to-r from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/20 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-[#25D366]/20 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-[#25D366]" />
                                </div>
                                <p className="text-sm text-white font-bold">Automation Toggles</p>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4 mt-4">
                                {[
                                    { key: "autoReplyEnabled", label: "Auto Reply", desc: "Allow AI to reply automatically" },
                                    { key: "followUpEnabled", label: "Smart Follow-up", desc: "AI suggests follow-ups for leads" },
                                    { key: "autoBookingEnabled", label: "Auto Booking", desc: "AI books slots (Suggest-only if off)" },
                                    { key: "mediaAutoSendEnabled", label: "Media Auto-send", desc: "Send product/menu images" },
                                    { key: "lowStockAlertsEnabled", label: "Low Stock Alerts", desc: "Notify when items run low" },
                                ].map((toggle) => (
                                    <div key={toggle.key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div>
                                            <p className="text-[11px] font-bold text-white">{toggle.label}</p>
                                            <p className="text-[9px] text-white/30">{toggle.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setAiData(prev => ({ ...prev, [toggle.key]: !prev[toggle.key as keyof typeof aiData] }))}
                                            className={`w-8 h-4.5 rounded-full relative transition-all ${aiData[toggle.key as keyof typeof aiData] ? "bg-[#25D366]" : "bg-white/10"}`}
                                        >
                                            <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${aiData[toggle.key as keyof typeof aiData] ? "right-0.5" : "left-0.5"}`} />
                                        </button>
                                    </div>
                                ))}
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
                        <div className="pt-2">
                            <button
                                onClick={handleSaveAI}
                                disabled={loading}
                                className="btn-primary btn-full-mobile flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Update AI Knowledge
                            </button>
                        </div>
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
                                    {business?.plan}
                                    {business?.plan !== "FREE" ? (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${business?.subscriptionStatus === "ACTIVE" ? "bg-[#25D366]/20 text-[#25D366]" : "bg-red-500/20 text-red-400"
                                            }`}>
                                            {business?.subscriptionStatus === "ACTIVE" ? "ACTIVE" : "EXPIRED"}
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">FREE FOREVER</span>
                                    )}
                                </h3>
                                {business?.subscriptionExpiresAt && (
                                    <p className="text-xs text-white/50 mt-2 flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5 text-[#25D366]" />
                                        {`Renews on ${new Date(business.subscriptionExpiresAt).toLocaleDateString()}`}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="text-right">
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${business?.subscriptionStatus === "ACTIVE" ? "bg-[#25D366]" : "bg-red-500"}`} />
                                        <span className="text-sm font-bold text-white/80">{business?.subscriptionStatus || "UNKNOWN"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

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

                            {/* Meta Billing Guide */}
                            <div className="p-6 rounded-2xl bg-[#25D366]/5 border border-[#25D366]/10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#25D366]/20 rounded-lg">
                                        <Phone className="w-4 h-4 text-[#25D366]" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Meta WhatsApp Charges (Direct)</h4>
                                        <p className="text-[10px] text-white/40">These charges are billed directly by Meta, not Turant Reply</p>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4 mt-2">
                                    <div className="space-y-2">
                                        <h5 className="text-[11px] font-bold text-white/70 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                                            Service Conversations
                                        </h5>
                                        <p className="text-[10px] text-white/50 leading-relaxed">
                                            When a customer messages you first. **The first 1,000 service conversations every month are FREE** for your account.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="text-[11px] font-bold text-white/70 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            Marketing & Utility
                                        </h5>
                                        <p className="text-[10px] text-white/50 leading-relaxed">
                                            When you initiate the conversation using templates. These are paid from the first message according to Meta's rate card.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-white/5">
                                    <p className="text-[10px] text-white/40 mb-3 italic">
                                        To manage Meta billing, visit your Facebook Business Manager &gt; Billing & Payments.
                                    </p>
                                    <a
                                        href="https://business.facebook.com/billing_hub"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-white transition-all"
                                    >
                                        Open Meta Billing Hub
                                        <Zap className="w-3 h-3 text-yellow-400" />
                                    </a>
                                </div>
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


                {activeTab === "notifications" && (
                    <div className="glass-card border border-white/5 p-4 sm:p-6 space-y-6 sm:space-y-8">
                        <div>
                            <h2 className="font-bold font-[Outfit] text-lg sm:text-xl mb-1">Notification Preferences</h2>
                            <p className="text-xs sm:text-sm text-white/40">Choose how and when you want to be alerted</p>
                        </div>

                        {/* Push Status Card */}
                        <div className={`p-4 sm:p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 ${isSubscribed ? "bg-[#25D366]/5 border-[#25D366]/20" : "bg-white/[0.03] border-white/10"}`}>
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className={`p-2 sm:p-3 rounded-xl ${isSubscribed ? "bg-[#25D366]/20 text-[#25D366]" : "bg-white/5 text-white/20"}`}>
                                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-white">Browser Push Notifications</h3>
                                    <p className="text-[10px] sm:text-xs text-white/40">
                                        {isSubscribed
                                            ? "Alerts are active on this device"
                                            : "Enable browser alerts to get notified even when Turant Reply is closed"
                                        }
                                    </p>
                                </div>
                            </div>
                            {isPushSupported && !isSubscribed && (
                                <button
                                    onClick={handleEnablePushSettings}
                                    disabled={loading}
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-black text-[10px] sm:text-xs font-black hover:bg-[#25D366] hover:text-white transition-all disabled:opacity-50"
                                >
                                    ENABLE NOW
                                </button>
                            )}
                            {isSubscribed && (
                                <div className="self-start sm:self-center flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] text-[10px] font-bold uppercase tracking-wider">
                                    <Check className="w-3.5 h-3.5" />
                                    Subscribed
                                </div>
                            )}
                        </div>

                        {/* Toggles */}
                        <div className="space-y-4">
                            <h4 className="text-xs sm:text-sm font-bold font-[Outfit] text-white/70">Alert Types</h4>

                            <div className="grid gap-3">
                                {[
                                    { key: "notifyOnEmergency", label: "AI Emergency Alerts", desc: "Get notified immediately when AI detects a frustrated customer needing human help." },
                                    { key: "notifyOnNewLead", label: "New Lead Alerts", desc: "Receive a notification whenever a new person messages your WhatsApp bot." },
                                    { key: "notifyOnAiPause", label: "AI Pause Alerts", desc: "Know when the AI automatically stops to let you take over the conversation." },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5 gap-4">
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm font-bold text-white/90 truncate">{item.label}</p>
                                            <p className="text-[10px] text-white/40 mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifData(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifData] }))}
                                            className={`flex-shrink-0 w-10 h-6 rounded-full transition-all relative ${notifData[item.key as keyof typeof notifData] ? "bg-[#25D366]" : "bg-white/10"}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifData[item.key as keyof typeof notifData] ? "right-1" : "left-1"}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleSaveNotifications}
                                disabled={loading}
                                className="btn-primary btn-full-mobile flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Preferences
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "team" && (
                    <div className="glass-card border border-white/5 p-6 space-y-8">
                        <div>
                            <h2 className="font-bold font-[Outfit] text-xl mb-1">Team Management</h2>
                            <p className="text-sm text-white/40">Invite your staff to manage this business dashboard</p>
                        </div>

                        {/* Invite Form */}
                        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-[#25D366]" />
                                Add Team Member
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    placeholder="Enter agent's email..."
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="input-dark flex-1"
                                />
                                <button
                                    onClick={handleInvite}
                                    disabled={loading || !inviteEmail}
                                    className="px-6 py-2.5 rounded-xl bg-[#25D366] text-black text-xs font-black flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Invite Member"}
                                </button>
                            </div>
                            <p className="text-[10px] text-white/20">The agent must already have a TurantReply account.</p>
                        </div>

                        {/* Members List */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-white/70">Current Members</h3>
                            <div className="grid gap-3">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] font-bold">
                                            {business?.user?.name?.[0] || "O"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{business?.user?.name} (You)</p>
                                            <p className="text-[10px] text-white/30">{business?.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                        Owner
                                    </div>
                                </div>

                                {team.map((member: any) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 font-bold">
                                                {member.user?.name?.[0] || member.user?.email?.[0] || "A"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white/90">{member.user?.name || "Agent"}</p>
                                                <p className="text-[10px] text-white/30">{member.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                                {member.role}
                                            </div>
                                            <button
                                                onClick={() => handleRemove(member.id)}
                                                className="p-2 rounded-lg text-white/10 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {team.length === 0 && (
                                    <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                        <Users className="w-8 h-8 text-white/10 mx-auto mb-3" />
                                        <p className="text-sm text-white/20 italic">No agents added yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "deployment" && (
                    <DeploymentManager />
                )}

                {activeTab === "security" && (
                    <div className="glass-card border border-white/5 p-6">
                        <h2 className="font-bold font-[Outfit] mb-4">Security Settings</h2>
                        <p className="text-white/40 text-sm">Coming soon — this section is under development.</p>
                    </div>
                )}
            </div>

            {showAIAssistant && (
                <AIConfigAssistant
                    initialData={{
                        name: businessData.name,
                        businessType: businessData.businessType,
                        description: businessData.description,
                        targetAudience: businessData.targetAudience,
                        pricingDetails: businessData.pricingDetails,
                        businessRules: businessData.businessRules,
                    }}
                    onClose={() => setShowAIAssistant(false)}
                    onSave={async (optimizedData) => {
                        setBusinessData(prev => ({
                            ...prev,
                            ...optimizedData
                        }));
                        setShowAIAssistant(false);
                        toast.success("Profile optimized! Don't forget to save changes.");
                    }}
                />
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { Zap, Bot, CreditCard, Bell, Shield, Phone, Loader2, Sparkles, ShieldCheck, Users, UserPlus, Trash2, Rocket, Settings } from "lucide-react";
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
    { key: "business", label: "Business Settings", icon: Settings },
    { key: "whatsapp", label: "WhatsApp Settings", icon: Phone },
    { key: "team", label: "Team Members", icon: Users },
];

export default function SettingsClient({ business, user, initialTeam = [] }: { business: any; user: any; initialTeam?: any[] }) {
    const searchParams = useSearchParams();
    const initialTab = searchParams?.get("tab") || "business";
    const upgradePlan = searchParams?.get("upgrade") as SubscriptionPlan | null;

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
        location: business?.location || "",
        workingHours: business?.workingHours ? (typeof business.workingHours === 'string' ? business.workingHours : JSON.stringify(business.workingHours)) : "",
        phone: business?.whatsappNumber || "",
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
                            <div>
                                <label className="text-xs font-medium text-white/50 block mb-2">Business Phone Number</label>
                                <input
                                    type="text"
                                    value={businessData.phone}
                                    onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                                    className="input-dark"
                                    placeholder="e.g. +919876543210"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-white/50 block mb-2">Business Address</label>
                                <input
                                    type="text"
                                    value={businessData.location}
                                    onChange={(e) => setBusinessData({ ...businessData, location: e.target.value })}
                                    className="input-dark"
                                    placeholder="e.g. Sector 15, Noida, UP"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs font-medium text-white/50 block mb-2">Working Hours</label>
                                <input
                                    type="text"
                                    value={businessData.workingHours}
                                    onChange={(e) => setBusinessData({ ...businessData, workingHours: e.target.value })}
                                    className="input-dark w-full"
                                    placeholder="e.g. Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM"
                                />
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



                {activeTab === "whatsapp" && (
                    <div className="glass-card border border-white/5 p-6 space-y-6">
                        <div>
                            <h2 className="font-bold font-[Outfit] text-xl mb-1">WhatsApp Cloud API Connection</h2>
                            <p className="text-sm text-white/40">Connect and authenticate your business WhatsApp number with Meta</p>
                        </div>
                        <WhatsAppConnect business={business} />
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

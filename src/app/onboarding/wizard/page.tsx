"use client";

import { useState, useEffect } from "react";
import { completeOnboarding, checkCalendarConnection } from "@/app/actions/onboarding";
import { CheckCircle, Calendar, MessageSquare, Phone, Activity, ChevronRight, Store, CalendarPlus, Wand2, PhoneCall, Headphones, Zap } from "lucide-react";

import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function OnboardingWizard() {
    const [step, setStep] = useState(1);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();
    const { update } = useSession();

    const [formData, setFormData] = useState({
        businessName: "",
        industry: "SALON",
        agentName: "AI Assistant",
        tone: "PROFESSIONAL",
        welcomeMessage: "Hi, how can I help you today?",
        accessToken: "",
        phoneNumberId: "",
        wabaId: "",
        testPhone: "",
        calendarConnected: false
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlStep = params.get("step");
        if (urlStep) {
            setStep(parseInt(urlStep));
        }

        // Automatically check if the calendar was connected when returning from OAuth
        if (step === 2 || urlStep === "2") {
            checkCalendarConnection().then(isConnected => {
                if (isConnected) {
                    setFormData(prev => ({ ...prev, calendarConnected: true }));
                }
            });
        }
    }, [step]);

    const [testStatus, setTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [testError, setTestError] = useState("");

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCopyWebhook = () => {
        navigator.clipboard.writeText("https://www.turantreply.com/api/webhook/whatsapp");
        alert("Webhook URL copied to clipboard!");
    };

    const handleSendTestMessage = async () => {
        if (!formData.testPhone) return;
        setTestStatus("sending");
        try {
            const { sendWhatsAppTestMessage } = await import("@/app/actions/settings");
            await sendWhatsAppTestMessage(formData.testPhone);
            setTestStatus("success");
        } catch (err: any) {
            setTestError(err.message || "Failed to send test message");
            setTestStatus("error");
        }
    };

    const handleNext = () => setStep((s) => Math.min(5, s + 1));
    const handlePrev = () => setStep((s) => Math.max(1, s - 1));

    const handleGoLive = async () => {
        setIsPending(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([k, v]) => data.append(k, String(v)));
            const res = await completeOnboarding(data);
            if (res?.success) {
                await update({ onboardingCompleted: true, isSetupComplete: true });
                router.push("/overview");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setIsPending(false);
        }
    };

    const steps = [
        { id: 1, name: "Business Info", icon: Store },
        { id: 2, name: "Calendar Connect", icon: CalendarPlus },
        { id: 3, name: "AI Setup", icon: Wand2 },
        { id: 4, name: "WhatsApp Setup", icon: PhoneCall },
        { id: 5, name: "Test Bot", icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl w-full">
                
                {/* Progress Tracker */}
                <div className="mb-12">
                    <div className="flex justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -z-10 -translate-y-1/2" />
                        <div 
                            className="absolute top-1/2 left-0 h-[2px] bg-[#25D366] -z-10 -translate-y-1/2 transition-all duration-300" 
                            style={{ width: `${((step - 1) / 4) * 100}%`, boxShadow: '0 0 10px rgba(37,211,102,0.5)' }}
                        />
                        
                        {steps.map((s) => (
                            <div key={s.id} className="flex flex-col items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${
                                    step >= s.id 
                                    ? "bg-[#25D366] text-black shadow-[0_0_20px_rgba(37,211,102,0.4)] scale-110" 
                                    : "bg-[#111111] text-zinc-500 border-2 border-white/10"
                                }`}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                    step >= s.id ? "text-[#25D366]" : "text-zinc-500"
                                }`}>
                                    {s.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-[#111111] rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-8 sm:p-12">
                        
                        {/* Step 1 */}
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-3xl font-black text-white mb-8 font-[Outfit]">Business Details</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Business Name</label>
                                        <input 
                                            type="text" 
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 rounded-xl bg-black border border-white/10 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] text-white outline-none transition-all placeholder-zinc-700"
                                            placeholder="e.g. Bella Salon"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Industry</label>
                                        <select 
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 rounded-xl bg-black border border-white/10 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] text-white outline-none transition-all"
                                        >
                                            <option value="SALON">Salon / Spa</option>
                                            <option value="GYM">Gym / Fitness</option>
                                            <option value="COACHING">Coaching</option>
                                            <option value="REALESTATE">Real Estate</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2 */}
                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
                                <h2 className="text-3xl font-black text-white mb-4 font-[Outfit]">Connect Your Calendar</h2>
                                <p className="text-zinc-500 mb-8">Allow your AI to book appointments directly into your schedule.</p>
                                
                                <div className="max-w-md mx-auto">
                                    <button 
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            if (!formData.calendarConnected) {
                                                // Trigger actual Google OAuth Flow via NextAuth
                                                await signIn("google-calendar", { callbackUrl: "/onboarding/wizard?step=2" });
                                            }
                                        }}
                                        className={`w-full flex flex-col items-center justify-center gap-4 p-8 border rounded-2xl transition-all group ${
                                            formData.calendarConnected 
                                                ? "border-[#25D366] bg-[#25D366]/10" 
                                                : "border-white/10 bg-black hover:border-[#25D366] hover:bg-[#25D366]/5"
                                        }`}
                                    >
                                        {formData.calendarConnected ? (
                                            <CheckCircle className="w-12 h-12 text-[#25D366]" />
                                        ) : (
                                            <Calendar className="w-12 h-12 text-zinc-600 group-hover:text-white transition-all" />
                                        )}
                                        <span className={`font-bold transition-colors ${
                                            formData.calendarConnected ? "text-[#25D366]" : "text-zinc-400 group-hover:text-white"
                                        }`}>
                                            {formData.calendarConnected ? "Google Calendar (Connected)" : "Google Calendar"}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3 */}
                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-3xl font-black text-white mb-8 font-[Outfit]">AI Personality Setup</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Agent Name</label>
                                        <input 
                                            type="text" 
                                            name="agentName"
                                            value={formData.agentName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 rounded-xl bg-black border border-white/10 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] text-white outline-none transition-all placeholder-zinc-700"
                                            placeholder="e.g. Sarah"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Tone of Voice</label>
                                        <select 
                                            name="tone"
                                            value={formData.tone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 rounded-xl bg-black border border-white/10 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] text-white outline-none transition-all"
                                        >
                                            <option value="PROFESSIONAL">Professional & Polite</option>
                                            <option value="FRIENDLY">Friendly & Casual</option>
                                            <option value="ENTHUSIASTIC">Enthusiastic & Energetic</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Welcome Message</label>
                                        <textarea 
                                            name="welcomeMessage"
                                            value={formData.welcomeMessage}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-4 py-4 rounded-xl bg-black border border-white/10 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] text-white outline-none transition-all resize-none placeholder-zinc-700"
                                            placeholder="Initial message sent to customers"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4 */}
                        {step === 4 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-3xl font-black text-white mb-2 font-[Outfit]">Connect Your WhatsApp</h2>
                                <p className="text-zinc-500 mb-8">Link your own WhatsApp Business number via Meta Cloud API.</p>
                                
                                <div className="space-y-6">
                                    <div className="bg-[#25D366]/10 border border-[#25D366]/30 p-6 rounded-2xl">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#25D366] mb-2">Webhook URL</h4>
                                        <p className="text-sm text-zinc-400 mb-4">Copy this URL and paste it in your Meta App &gt; WhatsApp &gt; Configuration as the Callback URL.</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-black px-4 py-3 rounded-xl text-sm font-mono text-zinc-300 border border-white/10">
                                                https://www.turantreply.com/api/webhook/whatsapp
                                            </code>
                                            <button onClick={handleCopyWebhook} className="px-6 py-3 bg-[#25D366] text-black rounded-xl text-sm font-black hover:bg-[#20b858] transition-colors shadow-[0_0_15px_rgba(37,211,102,0.3)]">
                                                Copy
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Permanent Access Token</label>
                                        <input 
                                            type="password" 
                                            name="accessToken"
                                            value={formData.accessToken}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 rounded-xl bg-black border border-white/10 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] text-white outline-none transition-all placeholder-zinc-700"
                                            placeholder="EAAB..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Phone Number ID</label>
                                            <input 
                                                type="text" 
                                                name="phoneNumberId"
                                                value={formData.phoneNumberId}
                                                onChange={handleChange}
                                                className="w-full px-4 py-4 rounded-xl bg-black border border-white/10 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] text-white outline-none transition-all placeholder-zinc-700"
                                                placeholder="1234567890"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">WABA ID</label>
                                            <input 
                                                type="text" 
                                                name="wabaId"
                                                value={formData.wabaId}
                                                onChange={handleChange}
                                                className="w-full px-4 py-4 rounded-xl bg-black border border-white/10 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] text-white outline-none transition-all placeholder-zinc-700"
                                                placeholder="0987654321"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-500 text-center pt-2 uppercase tracking-widest">
                                        Need help? <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:underline">Read the official Meta guide</a>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 5 */}
                        {step === 5 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
                                <div className="w-24 h-24 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-8 relative">
                                    <div className="absolute inset-0 bg-[#25D366]/20 blur-xl rounded-full animate-pulse" />
                                    <MessageSquare className="w-10 h-10 relative z-10" />
                                </div>
                                <h2 className="text-3xl font-black text-white mb-4 font-[Outfit]">Test Your Automation</h2>
                                <p className="text-zinc-500 mb-10">Let's verify that your WhatsApp is connected correctly. Enter a different phone number to send a test message.</p>
                                
                                <div className="max-w-md mx-auto text-left space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Test Phone Number</label>
                                        <div className="flex gap-3">
                                            <input 
                                                type="text" 
                                                name="testPhone"
                                                value={formData.testPhone}
                                                onChange={handleChange}
                                                className="flex-1 px-4 py-4 rounded-xl bg-black border border-white/10 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] text-white outline-none transition-all placeholder-zinc-700"
                                                placeholder="e.g. 919876543210"
                                            />
                                            <button 
                                                onClick={handleSendTestMessage}
                                                disabled={!formData.testPhone || testStatus === "sending"}
                                                className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {testStatus === "sending" ? "Sending..." : "Send Test"}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {testStatus === "success" && (
                                        <div className="p-4 bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl text-[#25D366] text-sm flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 shrink-0" />
                                            Test message sent! Check WhatsApp on {formData.testPhone}.
                                        </div>
                                    )}
                                    
                                    {testStatus === "error" && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                                            Error: {testError}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                    
                    {/* Footer Actions */}
                    <div className="px-8 sm:px-12 py-6 bg-black border-t border-white/5 flex items-center justify-between">
                        <button
                            onClick={handlePrev}
                            className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${
                                step === 1 
                                ? "text-zinc-700 cursor-not-allowed" 
                                : "text-zinc-500 hover:text-white"
                            }`}
                            disabled={step === 1}
                        >
                            Back
                        </button>
                        
                        {step < 5 ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-black transition-all active:scale-95 uppercase tracking-widest text-xs"
                            >
                                Continue <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleGoLive}
                                disabled={isPending}
                                className="flex items-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20b858] text-black rounded-xl font-black transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] disabled:opacity-50 active:scale-95 uppercase tracking-widest text-xs"
                            >
                                {isPending ? "Configuring..." : "Go Live"} <Zap className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

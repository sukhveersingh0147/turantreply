"use client";

import { useState } from "react";
import { Smartphone, Loader2, Check, XCircle, Settings2, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function WhatsAppConnect({ business, onClose }: { business?: any; onClose?: () => void }) {
    const [connecting, setConnecting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [copying, setCopying] = useState(false);
    const [formData, setFormData] = useState({
        accessToken: "",
        phoneNumberId: "",
        wabaId: ""
    });

    const isConnected = !!(business?.waToken && business?.waPhoneNumberId);
    const webhookUrl = "https://www.turantreply.com/api/webhook/whatsapp";

    const handleCopyWebhook = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopying(true);
        toast.success("Webhook URL copied!");
        setTimeout(() => setCopying(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.accessToken || !formData.phoneNumberId || !formData.wabaId) {
            toast.error("Please fill in all three fields.");
            return;
        }

        setConnecting(true);
        try {
            const res = await fetch("/api/whatsapp/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData), 
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("WhatsApp Business Account Connected!");
                if (onClose) onClose();
                window.location.reload();
            } else {
                throw new Error(data.error || "Failed to store credentials");
            }
        } catch (error: any) {
            console.error("Connection Error:", error);
            toast.error(error.message || "Failed to connect account.");
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect? This will stop all AI replies.")) return;
        
        setConnecting(true);
        try {
            const res = await fetch("/api/whatsapp/connect", { method: "DELETE" });
            if (res.ok) {
                toast.success("WhatsApp account disconnected.");
                if (onClose) onClose();
                window.location.reload();
            } else {
                const data = await res.json();
                throw new Error(data.error || "Failed to disconnect");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Webhook Guide Section */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40">Step 1: Callback URL</h5>
                    <button 
                        onClick={handleCopyWebhook}
                        className="text-[10px] font-bold text-[#25D366] hover:underline flex items-center gap-1"
                    >
                        {copying ? <Check className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                        {copying ? "Copied" : "Copy URL"}
                    </button>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] text-white/60 break-all">
                    {webhookUrl}
                </div>
                <p className="text-[10px] text-white/30 italic leading-relaxed">
                    Set this as your Callback URL in Meta App &gt; WhatsApp &gt; Configuration with any Verify Token.
                </p>
            </div>

            {isConnected ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-[#25D366]/5 border border-[#25D366]/20 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-[#25D366]" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-white">{business?.whatsappNumber || "WhatsApp Connected"}</h4>
                                    <span className="px-1.5 py-0.5 rounded-full bg-[#25D366]/20 text-[#25D366] text-[8px] font-black uppercase tracking-wider">Active</span>
                                </div>
                                <p className="text-[10px] text-white/40 mt-0.5">Phone ID: {business?.waPhoneNumberId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleDisconnect}
                                disabled={connecting}
                                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                title="Disconnect"
                            >
                                {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {!showForm && (
                       <button 
                         onClick={() => setShowForm(true)}
                         className="flex items-center gap-2 text-[10px] text-white/30 hover:text-white transition-colors mx-auto"
                       >
                         <Settings2 className="w-3 h-3" />
                         Update Credentials
                       </button>
                    )}

                    {showForm && (
                        <div className="pt-4 border-t border-white/5 mt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h5 className="text-xs font-bold text-white/70">Update Configuration</h5>
                                <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white"><XCircle className="w-4 h-4" /></button>
                            </div>
                            <FormView formData={formData} setFormData={setFormData} connecting={connecting} handleSubmit={handleSubmit} isUpdate />
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {!showForm ? (
                        <div className="text-center py-8 space-y-6">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto flex items-center justify-center relative">
                                 <div className="absolute inset-0 bg-[#25D366]/20 blur-2xl rounded-full animate-pulse" />
                                 <Smartphone className="w-10 h-10 text-white/20 relative z-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold font-[Outfit]">Link Your WhatsApp</h3>
                                <p className="text-sm text-white/40 max-w-xs mx-auto">
                                    Connect your Meta Developer App to start using AI-powered replies.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="btn-primary btn-full-mobile flex items-center justify-center gap-3"
                                >
                                    <Settings2 className="w-5 h-5" />
                                    Setup Manually
                                </button>
                                <a 
                                    href="https://developers.facebook.com/apps" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[10px] sm:text-xs font-bold text-white/30 flex items-center justify-center gap-1 hover:text-[#25D366] transition-colors uppercase tracking-widest"
                                >
                                    Open Meta Dashboard <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                    <Settings2 className="w-4 h-4 text-[#25D366]" />
                                    Manual Configuration
                                </h4>
                                <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                            <FormView formData={formData} setFormData={setFormData} connecting={connecting} handleSubmit={handleSubmit} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function FormView({ formData, setFormData, connecting, handleSubmit, isUpdate }: any) {
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                    Permanent Access Token
                </label>
                <input
                    type="password"
                    placeholder="EAAB..."
                    value={formData.accessToken}
                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                    className="input-dark w-full"
                    required
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                        Phone Number ID
                    </label>
                    <input
                        type="text"
                        placeholder="12345..."
                        value={formData.phoneNumberId}
                        onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                        className="input-dark w-full"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                        WABA ID
                    </label>
                    <input
                        type="text"
                        placeholder="67890..."
                        value={formData.wabaId}
                        onChange={(e) => setFormData({ ...formData, wabaId: e.target.value })}
                        className="input-dark w-full"
                        required
                    />
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={connecting}
                    className="btn-primary btn-full-mobile flex items-center justify-center gap-3"
                >
                    {connecting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {isUpdate ? <Check className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                            {isUpdate ? "Update Connection" : "Verify and Connect"}
                        </>
                    )}
                </button>
            </div>
            <p className="text-[10px] text-white/30 text-center uppercase tracking-widest font-bold">
                Need help? <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" className="underline text-[#25D366]">Official Guide →</a>
            </p>
        </form>
    );
}

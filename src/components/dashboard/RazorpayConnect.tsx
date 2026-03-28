"use client";

import { useState } from "react";
import { CreditCard, Loader2, Check, XCircle, Settings2, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function RazorpayConnect({ business, onClose }: { business?: any; onClose?: () => void }) {
    const [connecting, setConnecting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        keyId: business?.razorpayKeyId || "",
        keySecret: business?.razorpayKeySecret || "",
        webhookSecret: business?.razorpayWebhookSecret || ""
    });

    const isConnected = !!(business?.razorpayKeyId && business?.razorpayKeySecret);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.keyId || !formData.keySecret) {
            toast.error("Please fill in Key ID and Key Secret.");
            return;
        }

        setConnecting(true);
        try {
            const res = await fetch("/api/razorpay/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData), 
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Razorpay Account Connected!");
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
        if (!confirm("Are you sure you want to disconnect Razorpay?")) return;
        
        setConnecting(true);
        try {
            const res = await fetch("/api/razorpay/connect", { method: "DELETE" });
            if (res.ok) {
                toast.success("Razorpay account disconnected.");
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
            {isConnected ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-white">Razorpay Connected</h4>
                                    <span className="px-1.5 py-0.5 rounded-full bg-[#25D366]/20 text-[#25D366] text-[8px] font-black uppercase tracking-wider">Active</span>
                                </div>
                                <p className="text-[10px] text-white/40 mt-0.5">Key ID: {business?.razorpayKeyId}</p>
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
                                 <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                                 <CreditCard className="w-10 h-10 text-white/20 relative z-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold font-[Outfit]">Connect Razorpay</h3>
                                <p className="text-sm text-white/40 max-w-xs mx-auto">
                                    Link your Razorpay account to collect payments directly via WhatsApp.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="btn-primary-indigo btn-full-mobile flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm"
                                >
                                    <Settings2 className="w-5 h-5" />
                                    Setup Manually
                                </button>
                                <a 
                                    href="https://dashboard.razorpay.com/app/dashboard" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[10px] sm:text-xs font-bold text-white/30 flex items-center justify-center gap-1 hover:text-indigo-400 transition-colors uppercase tracking-widest"
                                >
                                    Open Razorpay Dashboard <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                    <Settings2 className="w-4 h-4 text-indigo-400" />
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
                    Key ID
                </label>
                <input
                    type="text"
                    placeholder="rzp_live_..."
                    value={formData.keyId}
                    onChange={(e) => setFormData({ ...formData, keyId: e.target.value })}
                    className="input-dark w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                    Key Secret
                </label>
                <input
                    type="password"
                    placeholder="••••••••••••"
                    value={formData.keySecret}
                    onChange={(e) => setFormData({ ...formData, keySecret: e.target.value })}
                    className="input-dark w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                    Webhook Secret (Optional)
                </label>
                <input
                    type="password"
                    placeholder="••••••••••••"
                    value={formData.webhookSecret}
                    onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                    className="input-dark w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                />
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={connecting}
                    className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                >
                    {connecting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {isUpdate ? <Check className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                            {isUpdate ? "Update Connection" : "Verify and Connect"}
                        </>
                    )}
                </button>
            </div>
            <p className="text-[10px] text-white/30 text-center uppercase tracking-widest font-bold">
                Need help? <a href="https://razorpay.com/docs/payments/dashboard/settings/api-keys/" target="_blank" className="underline text-indigo-400">Official Guide →</a>
            </p>
        </form>
    );
}

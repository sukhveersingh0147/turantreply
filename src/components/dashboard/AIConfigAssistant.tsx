"use client";

import { useState, useEffect } from "react";
import { 
    Sparkles, 
    Check, 
    X, 
    ArrowRight, 
    ArrowLeft, 
    MessageSquare, 
    Zap, 
    Loader2,
    Users,
    CircleDollarSign,
    Scale,
    Info
} from "lucide-react";
import { improveContentWithAI, generateConversationPreview } from "@/app/actions/settings";
import { toast } from "sonner";

interface AIConfigAssistantProps {
    initialData: {
        description: string;
        targetAudience: string;
        pricingDetails: string;
        businessRules: string;
        businessType: string;
        name: string;
    };
    onSave: (data: any) => void;
    onClose: () => void;
}

export function AIConfigAssistant({ initialData, onSave, onClose }: AIConfigAssistantProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(initialData);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [previewMessages, setPreviewMessages] = useState<any[]>([]);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const steps = [
        { id: 1, title: "Business Description", field: "description", icon: Info, desc: "Explain what your business does and what makes it special." },
        { id: 2, title: "Target Audience", field: "targetAudience", icon: Users, desc: "Who are your ideal customers? (e.g. busy parents, tech pros)" },
        { id: 3, title: "Pricing Details", field: "pricingDetails", icon: CircleDollarSign, desc: "List your services/products and their prices clearly." },
        { id: 4, title: "Business Rules", field: "businessRules", icon: Scale, desc: "Policies for booking, cancellations, or refunds." },
        { id: 5, title: "AI Preview", field: "preview", icon: MessageSquare, desc: "See how your AI assistant will respond." },
    ];

    const currentStep = steps.find(s => s.id === step);

    const handleImprove = async () => {
        if (!currentStep || currentStep.field === "preview") return;
        
        const content = data[currentStep.field as keyof typeof data] as string;
        if (!content || content.length < 5) {
            toast.error("Please enter a bit more detail first.");
            return;
        }

        setLoading(true);
        try {
            const result = await improveContentWithAI(currentStep.field, content, data.businessType);
            if (result.success) {
                setSuggestion(result.improvedContent || "");
                toast.success("AI suggestion generated!");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to generate suggestion");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = () => {
        if (suggestion && currentStep) {
            setData({ ...data, [currentStep.field]: suggestion });
            setSuggestion(null);
        }
    };

    const handlePreview = async () => {
        setIsPreviewLoading(true);
        try {
            const result = await generateConversationPreview(data);
            if (result.success) {
                setPreviewMessages(result.messages);
            }
        } catch (err: any) {
            toast.error("Failed to generate preview");
        } finally {
            setIsPreviewLoading(false);
        }
    };

    useEffect(() => {
        if (step === 5) {
            handlePreview();
        }
    }, [step]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#050505] border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#25D366]/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#25D366]/20 rounded-xl">
                            <Sparkles className="w-5 h-5 text-[#25D366]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black font-[Outfit] text-white">AI Config Assistant</h2>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Guided Setup & Optimization</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all">
                        <X className="w-5 h-5 text-white/40" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex h-1 bg-white/5">
                    {steps.map(s => (
                        <div 
                            key={s.id} 
                            className={`flex-1 transition-all duration-500 ${s.id <= step ? "bg-[#25D366]" : "bg-transparent"}`}
                        />
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10">
                    <div className="max-w-2xl mx-auto space-y-8">
                        
                        {/* Step Description */}
                        {currentStep && (
                            <div className="space-y-2 text-center">
                                <div className="inline-flex p-3 bg-white/5 rounded-2xl mb-2 text-[#25D366]">
                                    <currentStep.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black font-[Outfit]">{currentStep.title}</h3>
                                <p className="text-white/40 text-sm">{currentStep.desc}</p>
                            </div>
                        )}

                        {step < 5 ? (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Your Input</label>
                                        <button 
                                            onClick={handleImprove}
                                            disabled={loading}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#25D366] hover:text-[#128C7E] transition-all disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            Improve with AI
                                        </button>
                                    </div>
                                    <textarea 
                                        value={data[currentStep!.field as keyof typeof data] as string}
                                        onChange={(e) => setData({ ...data, [currentStep!.field]: e.target.value })}
                                        className="input-dark min-h-[150px] text-sm leading-relaxed p-5 bg-white/[0.03]"
                                        placeholder={`Describe your ${currentStep!.title.toLowerCase()}...`}
                                    />
                                </div>

                                {suggestion && (
                                    <div className="animate-in slide-in-from-top-4 fade-in duration-500">
                                        <div className="p-5 rounded-2xl bg-[#25D366]/5 border border-[#25D366]/20 space-y-4 shadow-xl">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#25D366] flex items-center gap-2">
                                                    <Zap className="w-3 h-3" /> AI Suggestion
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setSuggestion(null)} className="p-1 px-2 text-[10px] font-bold text-white/40 hover:text-white transition-all">Ignore</button>
                                                    <button onClick={handleAccept} className="px-3 py-1.5 bg-[#25D366] text-black text-[10px] font-black rounded-lg hover:shadow-[0_0_15px_rgba(37,211,102,0.3)] transition-all">Accept Suggestion</button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-white/80 leading-relaxed italic">{suggestion}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {isPreviewLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                        <Loader2 className="w-10 h-10 text-[#25D366] animate-spin" />
                                        <p className="text-white/30 text-xs animate-pulse font-bold tracking-widest uppercase">Simulating Conversation...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5 max-w-lg mx-auto">
                                        {previewMessages.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] leading-relaxed ${
                                                    msg.role === "user" 
                                                    ? "bg-[#25D366] text-black font-medium" 
                                                    : "bg-white/10 text-white"
                                                }`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-4 flex justify-center">
                                            <button onClick={handlePreview} className="text-[10px] font-bold text-[#25D366] hover:underline uppercase tracking-widest">
                                                Regenerate Preview
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <button 
                        onClick={() => step > 1 && setStep(step - 1)}
                        className={`flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white transition-all ${step === 1 ? "invisible" : ""}`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {step < 5 ? (
                            <button 
                                onClick={() => setStep(step + 1)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-black text-xs hover:bg-[#25D366] hover:text-white transition-all group"
                            >
                                Next Step <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button 
                                onClick={() => onSave(data)}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#25D366] text-black font-black text-xs hover:shadow-[0_0_25px_rgba(37,211,102,0.4)] transition-all"
                            >
                                Save Configuration <Check className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

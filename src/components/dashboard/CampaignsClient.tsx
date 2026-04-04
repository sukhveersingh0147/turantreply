"use client";

import { useState } from "react";
import { 
    Plus, Megaphone, Trash2, Clock, CheckCircle2, AlertCircle, Loader2, Play, 
    Pause, ChevronRight, Layers, MessageSquare, ArrowRight, Zap, Target,
    Users, BarChart3, Search, Smartphone, Monitor, BrainCircuit,
    ShieldAlert, Sparkles, Lightbulb, PlayCircle, Tag, FileSpreadsheet
} from "lucide-react";
import { createCampaign, deleteCampaign, toggleCampaign } from "@/app/actions/campaign";
import { uploadImage } from "@/app/actions/upload";
import { toast } from "sonner";
import SetupGuide from "./SetupGuide";
import { hasFeature } from "@/lib/plans";
import { VERTICALS, VerticalType } from "@/lib/verticals";

const campaignSteps = [
    {
        title: "Select Your Audience",
        description: "Filter your leads by stage, interest, or use a custom Google Sheet for the broadcast.",
        icon: Users
    },
    {
        title: "Design Your Content",
        description: "Attach products, coupons, and use AI-powered variables like {{name}} for impact.",
        icon: Target
    },
    {
        title: "Analyze & Optimize",
        description: "Monitor reach and engagement in real-time to refine your next big campaign.",
        icon: BarChart3
    }
];

interface CampaignStep {
    id: string;
    order: number;
    delayHours: number;
    message: string;
}

interface Campaign {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    steps: CampaignStep[];
    createdAt: Date;
}

export default function CampaignsClient({ 
    initialCampaigns, 
    items = [], 
    coupons = [],
    business
}: { 
    initialCampaigns: any[], 
    items?: any[], 
    coupons?: any[],
    business: any
}) {
    const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const canUseCampaigns = hasFeature(business, "canUseCampaigns");

    const [newCampaign, setNewCampaign] = useState({
        name: "",
        description: "",
        audienceSource: "SEGMENT" as "SEGMENT" | "TAG" | "SHEET",
        audienceValue: "ALL",
        scheduledAt: null as string | null
    });
    const [steps, setSteps] = useState([{ order: 1, delayHours: 24, message: "" }]);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleAddStep = () => {
        setSteps([...steps, { order: steps.length + 1, delayHours: 24, message: "" }]);
    };

    const handleRemoveStep = (index: number) => {
        const updatedSteps = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
        setSteps(updatedSteps);
    };

    const handleCreate = async () => {
        if (!newCampaign.name) return toast.error("Campaign name is required");
        if (steps.some(s => !s.message)) return toast.error("All steps must have a message");
        
        setLoading(true);
        try {
            const campaign = await createCampaign({
                name: newCampaign.name,
                description: newCampaign.description,
                audienceSource: newCampaign.audienceSource,
                audienceValue: newCampaign.audienceValue,
                scheduledAt: newCampaign.scheduledAt,
                steps,
                itemIds: selectedItemIds,
                couponId: selectedCouponId,
                imageUrl: uploadedImageUrl,
            });
            setCampaigns([campaign, ...campaigns]);
            setIsAdding(false);
            setNewCampaign({ 
                name: "", 
                description: "", 
                audienceSource: "SEGMENT",
                audienceValue: "ALL",
                scheduledAt: null
            });
            setSteps([{ order: 1, delayHours: 24, message: "" }]);
            setSelectedItemIds([]);
            setSelectedCouponId(null);
            setUploadedImageUrl(null);
            toast.success("Marketing sequence launched!");
        } catch (error: any) {
            toast.error(error.message || "Failed to create campaign");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this marketing sequence?")) return;
        try {
            await deleteCampaign(id);
            setCampaigns(campaigns.filter(c => c.id !== id));
            toast.success("Campaign deleted");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleToggle = async (campaign: Campaign) => {
        try {
            await toggleCampaign(campaign.id, !campaign.isActive);
            setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, isActive: !campaign.isActive } : c));
            toast.success(campaign.isActive ? "Sequence paused" : "Sequence active");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <SetupGuide 
                title="Scale Your Marketing"
                description="Follow these steps to launch high-converting marketing sequences."
                steps={campaignSteps}
                type="CAMPAIGN"
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-[Outfit] text-white tracking-tight">
                        Marketing <span className="text-gradient">Hub</span>
                    </h1>
                    <p className="text-white/40 mt-1 font-medium">Strategic drip sequences to convert leads over time.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => {
                            if (!canUseCampaigns) {
                                toast.error("Upgrade to GROWTH or PRO to launch marketing sequences!");
                                return;
                            }
                            setIsAdding(true);
                        }}
                        className={`btn-primary flex items-center justify-center gap-2 ${!canUseCampaigns ? 'opacity-50 grayscale hover:grayscale-0' : ''}`}
                    >
                        {!canUseCampaigns && <ShieldAlert className="w-4 h-4" />}
                        <Plus className="w-5 h-5" />
                        New Marketing Sequence
                    </button>
                )}
            </div>

            {/* Quick-Start Templates Section */}
            {!isAdding && campaigns.length === 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">Quick-Start Templates for {VERTICALS[business.businessType as VerticalType]?.name || "Your Business"}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(VERTICALS[business.businessType as VerticalType] || VERTICALS.OTHER).campaignTemplates.map((template, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (!canUseCampaigns) {
                                        toast.error("Upgrade to launch these templates!");
                                        return;
                                    }
                                    setNewCampaign({
                                        ...newCampaign,
                                        name: template.name,
                                        description: `Auto-generated ${template.name} template`
                                    });
                                    setSteps([{ order: 1, delayHours: 24, message: template.message }]);
                                    setIsAdding(true);
                                }}
                                className="glass-card border border-white/5 p-4 text-left hover:border-emerald-500/30 transition-all group"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        <Lightbulb className="w-4 h-4" />
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <h3 className="text-sm font-bold text-white mb-1">{template.name}</h3>
                                <p className="text-[10px] text-white/30 line-clamp-2 italic">"{template.message}"</p>
                            </button>
                        ))}
                    </div>
                    <div className="h-4" />
                </div>
            )}


            {isAdding ? (
                <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* Left: Sequence Builder */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Audience & Schedule Selection */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="glass-card border border-white/5 p-6">
                                <label className="text-[10px] uppercase font-black tracking-widest text-[#25D366] block mb-4">Target Audience</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: "SEGMENT", label: "Segments", icon: Layers },
                                        { id: "TAG", label: "Tags", icon: Tag },
                                        { id: "SHEET", label: "G-Sheets", icon: FileSpreadsheet }
                                    ].map(src => {
                                        const Icon = (src as any).icon || Users;
                                        return (
                                            <button 
                                                key={src.id}
                                                onClick={() => setNewCampaign({ ...newCampaign, audienceSource: src.id as any })}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                                                    newCampaign.audienceSource === src.id 
                                                        ? 'bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366]' 
                                                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="text-[8px] font-black uppercase">{src.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-4">
                                    <select 
                                        value={newCampaign.audienceValue}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, audienceValue: e.target.value })}
                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[11px] text-white outline-none focus:border-[#25D366]/30"
                                    >
                                        {newCampaign.audienceSource === "SEGMENT" && (
                                            <>
                                                <option value="ALL">All Leads</option>
                                                <option value="NEW">New Leads</option>
                                                <option value="HOT">Hot Leads</option>
                                                <option value="CUSTOMER">Customers</option>
                                            </>
                                        )}
                                        {newCampaign.audienceSource === "TAG" && (
                                            <>
                                                <option value="INTERESTED">Interested</option>
                                                <option value="FOLLOWUP">Follow-up</option>
                                            </>
                                        )}
                                        {newCampaign.audienceSource === "SHEET" && (
                                            <>
                                                <option value="LATEST">Latest Sheet</option>
                                                <option value="LEADS_APRIL">Leads_April_24</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="glass-card border border-white/5 p-6">
                                <label className="text-[10px] uppercase font-black tracking-widest text-blue-400 block mb-4">Sending Schedule</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setNewCampaign({ ...newCampaign, scheduledAt: null })}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                                            !newCampaign.scheduledAt 
                                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                        }`}
                                    >
                                        <Zap className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase">Immediate</span>
                                    </button>
                                    <button 
                                        onClick={() => setNewCampaign({ ...newCampaign, scheduledAt: new Date().toISOString() })}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                                            newCampaign.scheduledAt 
                                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                        }`}
                                    >
                                        <Clock className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase">Scheduled</span>
                                    </button>
                                </div>
                                {newCampaign.scheduledAt && (
                                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                        <input 
                                            type="datetime-local"
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-[11px] text-white outline-none focus:border-purple-500/30 color-scheme-dark"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass-card border border-white/5 p-8">
                            <div className="grid gap-6 mb-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-white/30">Sequence Name</label>
                                    <input
                                        value={newCampaign.name}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-bold text-white outline-none focus:border-[#25D366]/30 transition-all"
                                        placeholder="e.g. Real Estate Welcome Sequence"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-white/30">Objective (Optional)</label>
                                    <input
                                        value={newCampaign.description}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm text-white/60 outline-none"
                                        placeholder="To nurture new leads and book a call..."
                                    />
                                </div>
                            </div>

                                {/* Custom Image Upload - PROMOTED */}
                                <div className="space-y-4 mb-8 bg-white/[0.02] p-6 rounded-3xl border border-white/5 shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-[#25D366]">Sequence Welcome Image</label>
                                        <span className="text-[9px] text-white/20 font-medium tracking-tight">Sent with the very first message</span>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        {uploadedImageUrl ? (
                                            <div className="relative group w-24 h-24 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                                                <img src={uploadedImageUrl} className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={() => setUploadedImageUrl(null)}
                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-5 h-5 text-red-400" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className={`w-24 h-24 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-[#25D366]/30 transition-all bg-black/40 group ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#25D366]/10 transition-colors">
                                                    <Plus className="w-5 h-5 text-white/20 group-hover:text-[#25D366]" />
                                                </div>
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    disabled={uploading}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setUploading(true);
                                                        try {
                                                            const formData = new FormData();
                                                            formData.append("image", file);
                                                            const res = await uploadImage(formData);
                                                            setUploadedImageUrl(res.url);
                                                            toast.success("Marketing sequence image set!");
                                                        } catch (err: any) {
                                                            toast.error(err.message);
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-[11px] text-white/70 font-medium leading-relaxed">
                                                {uploadedImageUrl 
                                                    ? "🔥 Looking good! This image will grab attention instantly when the sequence starts." 
                                                    : "A visual welcome increases response rates by 40%. Upload a flyer, menu, or greeting photo for this sequence."
                                                }
                                            </p>
                                            <div className="flex gap-3 mt-2">
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">High Quality</span>
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">Auto-optimized</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            <div className="space-y-0">
                                {steps.map((step, i) => (
                                    <div key={i} className="relative">
                                        {i > 0 && (
                                            <div className="flex flex-col items-center py-4">
                                                <div className="w-0.5 h-12 bg-gradient-to-b from-[#25D366]/50 to-[#25D366]/10" />
                                                <div className="bg-[#25D366]/10 border border-[#25D366]/20 rounded-full px-4 py-1 flex items-center gap-2 my-2">
                                                    <Clock className="w-3 h-3 text-[#25D366]" />
                                                    <input 
                                                        type="number"
                                                        value={step.delayHours}
                                                        onChange={(e) => {
                                                            const updatedSteps = [...steps];
                                                            updatedSteps[i].delayHours = Number(e.target.value);
                                                            setSteps(updatedSteps);
                                                        }}
                                                        className="w-12 bg-transparent text-[11px] font-black text-[#25D366] outline-none text-center"
                                                    />
                                                    <span className="text-[9px] font-black text-[#25D366] uppercase tracking-tighter">Hours Later</span>
                                                </div>
                                                <div className="w-0.5 h-12 bg-gradient-to-t from-[#25D366]/50 to-[#25D366]/10" />
                                            </div>
                                        )}
                                        
                                        <div className="group relative glass-card border border-white/5 p-6 rounded-[2rem] hover:border-[#25D366]/20 transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] font-black text-xs">
                                                        {i + 1}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Step {i + 1} Message</span>
                                                </div>
                                                {i > 0 && (
                                                    <button onClick={() => handleRemoveStep(i)} className="p-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <textarea
                                                value={step.message}
                                                onChange={(e) => {
                                                    const updatedSteps = [...steps];
                                                    updatedSteps[i].message = e.target.value;
                                                    setSteps(updatedSteps);
                                                }}
                                                rows={4}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white/80 outline-none focus:border-[#25D366]/20 transition-all resize-none"
                                                placeholder="Hi {{name}}, just following up..."
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-center mt-10">
                                    <button
                                        onClick={handleAddStep}
                                        className="group flex flex-col items-center gap-3"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[#25D366]/5 border border-[#25D366]/20 flex items-center justify-center group-hover:bg-[#25D366]/10 group-hover:scale-110 transition-all">
                                            <Plus className="w-6 h-6 text-[#25D366]" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors">Add Next Sequence Step</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary & Save */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card border border-white/5 p-8 sticky top-8">
                            <div className="flex items-center gap-3 mb-8">
                                <Target className="w-5 h-5 text-[#25D366]" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-white/90">Preview Sequence</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="text-[10px] font-black uppercase text-white/30">Total Steps</div>
                                    <div className="text-xl font-black text-white">{steps.length}</div>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="text-[10px] font-black uppercase text-white/30">Total Duration</div>
                                    <div className="text-sm font-black text-white">
                                        {Math.round(steps.reduce((acc, s) => acc + s.delayHours, 0) / 24)} Days
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 mt-8 border-t border-white/5 space-y-6">
                                {/* Product Showcase Selection */}
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-[#25D366]">Attach Products (Carousel)</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {items.slice(0, 8).map(item => (
                                            <button 
                                                key={item.id}
                                                onClick={() => {
                                                    const exists = selectedItemIds.includes(item.id);
                                                    setSelectedItemIds(
                                                        exists 
                                                            ? selectedItemIds.filter(id => id !== item.id)
                                                            : [...selectedItemIds, item.id]
                                                    );
                                                }}
                                                className={`aspect-square rounded-xl border transition-all overflow-hidden relative ${
                                                    selectedItemIds.includes(item.id) 
                                                        ? 'border-[#25D366] ring-2 ring-[#25D366]/20' 
                                                        : 'border-white/5 opacity-40 grayscale hover:opacity-100'
                                                }`}
                                            >
                                                <img src={item.imageUrl || item.imageUrls?.[0]} className="w-full h-full object-cover" />
                                                {selectedItemIds.includes(item.id) && (
                                                    <div className="absolute inset-0 bg-[#25D366]/20 flex items-center justify-center">
                                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-white/20 italic">Selected items will be sent as a carousel.</p>
                                </div>

                                {/* Coupon Selection */}
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-amber-400">Attach Offer/Coupon</label>
                                    <select 
                                        value={selectedCouponId || ""}
                                        onChange={(e) => setSelectedCouponId(e.target.value || null)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none"
                                    >
                                        <option value="">No Coupon Attached</option>
                                        {coupons.map(coupon => (
                                            <option key={coupon.id} value={coupon.id}>{coupon.code} (-{coupon.discount}%)</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={handleCreate}
                                    disabled={loading || !newCampaign.name}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-black font-black text-[10px] uppercase tracking-widest shadow-[0_10px_30px_rgba(37,211,102,0.2)] active:scale-95 transition-all"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Launch Marketing Sequence"}
                                </button>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all"
                                >
                                    Cancel & Discard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((camp) => (
                        <div key={camp.id} className="glass-card border border-white/5 hover:border-white/10 transition-all p-6 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(camp.id)} className="text-white/20 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-start gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${camp.isActive ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-white/5 text-white/20'}`}>
                                    <Megaphone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white/90 font-[Outfit] leading-tight">{camp.name}</h3>
                                    <p className="text-[10px] text-white/30 mt-1 line-clamp-1">{camp.description || "No objective set"}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Steps</div>
                                    <div className="text-sm font-black text-white">{camp.steps.length} Nodes</div>
                                </div>
                                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Status</div>
                                    <div className={`text-sm font-black ${camp.isActive ? 'text-[#25D366]' : 'text-white/20 italic uppercase tracking-tighter'}`}>
                                        {camp.isActive ? 'Active' : 'Paused'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                                    <span className="text-[9px] font-black uppercase text-white/40 tracking-wider">Live Tracking</span>
                                </div>
                                <button
                                    onClick={() => handleToggle(camp)}
                                    className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${camp.isActive ? 'text-orange-400' : 'text-[#25D366]'}`}
                                >
                                    {camp.isActive ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                                    {camp.isActive ? "Pause" : "Resume"}
                                </button>
                            </div>
                        </div>
                    ))}

                    {campaigns.length === 0 && (
                        <div className="col-span-full py-24 text-center glass-card border-2 border-dashed border-white/5 p-12">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                                <Zap className="w-8 h-8 text-white/10" />
                            </div>
                            <h2 className="text-2xl font-black text-white/90 font-[Outfit] mb-2">Build your first sequence</h2>
                            <p className="text-sm text-white/30 max-w-sm mx-auto mb-8">Automate multi-day follow ups on WhatsApp for new leads, course reminders, or festival offers.</p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Start Marketing sequence
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

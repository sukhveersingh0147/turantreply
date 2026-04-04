"use client";

import { useState, useEffect } from "react";
import { Radio, Users, Clock, Send, CheckCircle, Loader2, Plus, Trash2, Split, BarChart3, ChevronRight, LayoutPanelTop, Monitor, Smartphone, RefreshCcw, Calendar, BrainCircuit, Zap, ShieldAlert } from "lucide-react";
import { getBroadcasts, createBroadcast, deleteBroadcast } from "@/app/actions/broadcast";
import { uploadImage } from "@/app/actions/upload";
import { toast } from "sonner";
import { format } from "date-fns";
import { hasFeature } from "@/lib/plans";
import { getBusinessSettings } from "@/app/actions/settings";
import { useRouter } from "next/navigation";

const segments = [
    { key: "all", label: "All Leads", icon: Users, color: "blue", desc: "Every contact in your database" },
    { key: "new", label: "New Leads", icon: Zap, color: "yellow", desc: "Leads created in last 24h" },
    { key: "hot", label: "Hot Leads", icon: Radio, color: "red", desc: "Leads with high interest score" },
    { key: "customer", label: "Customers", icon: CheckCircle, color: "green", desc: "Leads who have purchased" },
    { key: "gsheets", label: "Google Sheets", icon: Database, color: "emerald", desc: "Import numbers from a sheet" },
];

import { Database, FileSpreadsheet } from "lucide-react";

export default function BroadcastPage() {
    const [msg, setMsg] = useState(
        "Hi {{name}} 👋\n\nWe have an exciting offer this week — 20% OFF on all memberships!\n\nOffer valid till Sunday. Reply YES to grab it! 🎉"
    );
    const [selectedSegment, setSelectedSegment] = useState("all");
    const [sheetUrl, setSheetUrl] = useState("");
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [broadcastName, setBroadcastName] = useState("");
    const [isABTesting, setIsABTesting] = useState(false);
    const [variants, setVariants] = useState([{ name: "Variant B", content: "" }]);
    const [scheduledAt, setScheduledAt] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<"A" | "B">("A");
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    
    const [items, setItems] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [selectedCouponId, setSelectedCouponId] = useState<string>("");
    const [business, setBusiness] = useState<any>(null);
    const router = useRouter();
    const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setSearchParams(params);
        
        const prefillMsg = params.get("prefill_message");
        const prefillSegment = params.get("prefill_segment");

        if (prefillMsg) setMsg(decodeURIComponent(prefillMsg));
        if (prefillSegment) setSelectedSegment(prefillSegment);

        loadBroadcasts();
        loadMetadata();
    }, []);

    const canUseBroadcast = business ? hasFeature(business, "canUseBroadcast") : true;

    async function loadMetadata() {
        const { getInventory } = await import("@/app/actions/inventory");
        const { getCoupons } = await import("@/app/actions/coupons");
        const [inv, cpn, biz] = await Promise.all([getInventory(), getCoupons(), getBusinessSettings()]);
        if (biz?.plan === "FREE") {
            router.push("/settings?tab=billing");
            return;
        }
        setItems(inv);
        setCoupons(cpn);
        setBusiness(biz);
    }

    async function loadBroadcasts() {
        try {
            const data = await getBroadcasts();
            setBroadcasts(data);
        } catch (error) {
            toast.error("Failed to load history");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSend() {
        if (!canUseBroadcast) return toast.error("Upgrade to GROWTH or PRO to send broadcasts!");
        if (!broadcastName) return toast.error("Please enter a campaign name");
        if (isABTesting && variants.some(v => !v.content)) return toast.error("Please enter content for all variants");

        setIsSending(true);
        try {
            await createBroadcast({
                name: broadcastName,
                content: msg,
                segment: selectedSegment,
                sheetUrl: selectedSegment === 'gsheets' ? sheetUrl : null,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                variants: isABTesting ? variants : [],
                itemIds: selectedItemIds,
                couponId: selectedCouponId || null,
                imageUrl: uploadedImageUrl,
            });
            toast.success("Broadcast initiated successfully!");
            setBroadcastName("");
            loadBroadcasts();
        } catch (error: any) {
            toast.error(error.message || "Failed to send");
        } finally {
            setIsSending(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this broadcast history?")) return;
        try {
            await deleteBroadcast(id);
            setBroadcasts(prev => prev.filter(b => b.id !== id));
            toast.success("Deleted");
        } catch (error) {
            toast.error("Failed to delete");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-[Outfit] text-white tracking-tight">
                        WhatsApp <span className="text-gradient">Broadcast</span>
                    </h1>
                    <p className="text-white/40 mt-1 font-medium">Send unlimited personalized campaigns to your leads</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
                    <button className="px-4 py-2 bg-[#25D366] text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(37,211,102,0.2)]">
                        Active Numbers: 1
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Compose Loop */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Setup Card */}
                    <div className="glass-card border border-white/5 p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                    <LayoutPanelTop className="w-5 h-5 text-purple-400" />
                                </div>
                                <h2 className="font-black font-[Outfit] text-lg text-white/90">Campaign Setup</h2>
                            </div>
                            <button 
                                onClick={() => setIsABTesting(!isABTesting)}
                                className={`flex items-center gap-2 border px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isABTesting ? "bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]" : "bg-white/5 border-white/5 text-white/40 hover:text-white"}`}
                            >
                                <Split className="w-3 h-3" />
                                {isABTesting ? "A/B Test Enabled" : "Enable A/B Test"}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-2 block">Campaign Internal Name</label>
                                <input
                                    value={broadcastName}
                                    onChange={(e) => setBroadcastName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white/80 placeholder:text-white/10 focus:border-purple-500/30 outline-none transition-all"
                                    placeholder="e.g. Festival Season Kickoff 2026"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-3 block">Target Audience Segment</label>
                                
                                {selectedSegment === "gsheets" && (
                                    <div className="mb-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="relative group">
                                            <FileSpreadsheet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 group-focus-within:scale-110 transition-transform" />
                                            <input 
                                                value={sheetUrl}
                                                onChange={(e) => setSheetUrl(e.target.value)}
                                                placeholder="Paste Google Sheet URL (Public or Shared)" 
                                                className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-emerald-100 outline-none focus:border-emerald-500/40 transition-all font-medium placeholder:text-emerald-500/30"
                                            />
                                        </div>
                                        <p className="text-[9px] text-emerald-500/50 mt-2 ml-2 font-bold uppercase tracking-tighter">AI will parse the first column for phone numbers</p>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {segments.map((seg) => {
                                        const Icon = seg.icon;
                                        return (
                                            <button
                                                key={seg.key}
                                                onClick={() => setSelectedSegment(seg.key)}
                                                className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${selectedSegment === seg.key
                                                    ? "bg-white/5 border-white/20 ring-1 ring-white/10"
                                                    : "bg-black/20 border-white/5 opacity-50 hover:opacity-100 hover:bg-white/[0.02]"
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${seg.color}-500/10 text-${seg.color}-400`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-white/90 uppercase tracking-widest">{seg.label}</div>
                                                    <div className="text-[9px] text-white/30 font-medium mt-0.5">{seg.desc}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Product Showcase Selection */}
                            <div className="space-y-4 pt-4 border-t border-white/[0.03]">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-[#25D366]">Attach Products (Carousel)</label>
                                    <span className="text-[9px] text-white/20 font-medium">{selectedItemIds.length} Selected</span>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    {items.slice(0, 12).map(item => (
                                        <button 
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                const exists = selectedItemIds.includes(item.id);
                                                setSelectedItemIds(exists 
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
                                            <img src={(item.imageUrls && item.imageUrls[0]) || item.imageUrl} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Coupon Selection */}
                            <div className="space-y-4 pt-4 border-t border-white/[0.03]">
                                <label className="text-[10px] uppercase font-black tracking-widest text-amber-400">Attach Active Coupon</label>
                                <select 
                                    value={selectedCouponId}
                                    onChange={(e) => setSelectedCouponId(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-xs text-white outline-none focus:border-amber-400/30 transition-all font-medium"
                                >
                                    <option value="">No Discount Card Attached</option>
                                    {coupons.map(coupon => (
                                        <option key={coupon.id} value={coupon.id}>{coupon.code} (-{coupon.discount}%)</option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Image Upload - PROMOTED */}
                            <div className="space-y-4 pt-4 border-t border-white/[0.03] bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-[#25D366]">Send Custom Image / Flyer</label>
                                    <span className="text-[9px] text-white/20 font-medium">Recommended for 1-off promotions</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {uploadedImageUrl ? (
                                        <div className="relative group w-20 h-20 rounded-xl border border-white/10 overflow-hidden shadow-lg">
                                            <img src={uploadedImageUrl} className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => setUploadedImageUrl(null)}
                                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className={`w-20 h-20 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-[#25D366]/30 transition-all bg-black/20 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <Plus className="w-5 h-5 text-white/20" />
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
                                                        toast.success("Image attached to broadcast!");
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
                                        <p className="text-[10px] text-white/60 font-medium leading-relaxed">
                                            {uploadedImageUrl 
                                                ? "✨ Perfect! This image will be sent as a header with your message." 
                                                : "Upload a photo from your gallery to send it with this broadcast message. Higher engagement than text-only!"
                                            }
                                        </p>
                                        <p className="text-[9px] text-white/20 mt-1 uppercase font-black tracking-widest">Max 10MB · JPG/PNG</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content & Variants */}
                            <div className="space-y-4 pt-4 border-t border-white/[0.03]">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-white/30">
                                                {isABTesting ? "Variant A (Control)" : "Message Content"}
                                            </label>
                                            <span className="text-[9px] font-black text-[#25D366] tracking-tighter bg-[#25D366]/5 px-2 py-0.5 rounded uppercase">Personalization: {"{{name}}"} supported</span>
                                        </div>
                                        <textarea
                                            value={msg}
                                            onChange={(e) => setMsg(e.target.value)}
                                            onFocus={() => setPreviewMode("A")}
                                            className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-medium text-white/70 placeholder:text-white/10 focus:border-purple-500/30 outline-none transition-all resize-none leading-relaxed"
                                            placeholder="Hello {{name}}, we have an offer..."
                                        />
                                    </div>

                                    {isABTesting && variants.map((v, i) => (
                                        <div key={i} className="animate-in slide-in-from-top-4 duration-300">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-white/30">{v.name} (Challenger)</label>
                                                <button onClick={() => setVariants([])} className="text-[9px] text-red-400 font-black hover:underline uppercase">Remove</button>
                                            </div>
                                            <textarea
                                                value={v.content}
                                                onChange={(e) => {
                                                    const newV = [...variants];
                                                    newV[i].content = e.target.value;
                                                    setVariants(newV);
                                                }}
                                                onFocus={() => setPreviewMode("B")}
                                                className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-medium text-white/70 placeholder:text-white/10 focus:border-purple-500/30 outline-none transition-all resize-none leading-relaxed"
                                                placeholder="Different approach for A/B testing..."
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Schedule & Submit */}
                        <div className="space-y-4 pt-4 border-t border-white/[0.03]">
                            <div>
                                <label className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-3 block">Delivery Schedule</label>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setScheduledAt(null)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${!scheduledAt ? "bg-white/10 border-white/20 text-white" : "bg-black/20 border-white/5 text-white/20"}`}
                                    >
                                        <Zap className="w-3 h-3" /> Send Immediately
                                    </button>
                                    <div className="flex-1 relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                        <input 
                                            type="datetime-local" 
                                            onChange={(e) => setScheduledAt(e.target.value)}
                                            className={`w-full py-3 pl-12 pr-4 rounded-xl border text-[10px] font-black uppercase tracking-widest outline-none transition-all ${scheduledAt ? "bg-white/10 border-white/20 text-white" : "bg-black/20 border-white/5 text-white/20"}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={isSending}
                                className="w-full group relative overflow-hidden flex items-center justify-center gap-3 py-4.5 rounded-2xl bg-gradient-to-r from-purple-600 to-[#25D366] text-black font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(168,85,247,0.2)] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {scheduledAt ? "Schedule Campaign" : "Launch Broadcast Now"}
                                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info & Side Panel */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Real-time Preview */}
                    <div className="glass-card border border-white/5 p-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-[10px] uppercase font-black tracking-widest text-white/30">Intelligence Preview</h3>
                            <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-lg border border-white/5">
                                <button onClick={() => setPreviewMode("A")} className={`px-2 py-1 rounded text-[8px] font-black transition-all ${previewMode === "A" ? "bg-purple-500 text-white" : "text-white/20"}`}>VAR A</button>
                                {isABTesting && <button onClick={() => setPreviewMode("B")} className={`px-2 py-1 rounded text-[8px] font-black transition-all ${previewMode === "B" ? "bg-purple-500 text-white" : "text-white/20"}`}>VAR B</button>}
                            </div>
                        </div>
                        
                        <div className="relative aspect-[9/12] max-w-[280px] mx-auto bg-[#070d14] rounded-[2.5rem] border-[6px] border-[#1a1f26] shadow-2xl p-4 overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-6 bg-[#1a1f26] flex items-center justify-center">
                                <div className="w-12 h-1.5 rounded-full bg-black/40" />
                            </div>
                            
                            <div className="mt-8 space-y-3">
                                {uploadedImageUrl && (
                                    <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/5 aspect-video mb-3 animate-in zoom-in-95 duration-500">
                                        <img src={uploadedImageUrl} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="max-w-[85%] bg-[#1f2c34] rounded-2xl rounded-tl-none p-3 shadow-sm border border-white/5 animate-in slide-in-from-left-4 duration-500">
                                    <div className="flex items-center gap-1.5 mb-1.5 opacity-40">
                                        <BrainCircuit className="w-2.5 h-2.5" />
                                        <span className="text-[8px] font-black uppercase">Variant {previewMode}</span>
                                    </div>
                                    <p className="text-[10px] text-white/80 whitespace-pre-wrap leading-relaxed font-medium">
                                        {(previewMode === "A" ? msg : variants[0]?.content) || "Type your message..."}
                                    </p>
                                    <span className="text-[7px] text-white/20 text-right block mt-1 uppercase font-bold">10:42 AM · Sent</span>
                                </div>
                            </div>

                            {/* Decorative Bottom Bar */}
                            <div className="absolute bottom-4 inset-x-4 h-8 bg-white/5 rounded-2xl flex items-center px-3 gap-2 border border-white/5">
                                <div className="w-4 h-4 rounded-full bg-white/10" />
                                <div className="h-1 flex-1 bg-white/5 rounded-full" />
                                <Send className="w-3 h-3 text-[#25D366] opacity-40" />
                            </div>
                        </div>

                        <div className="mt-6 p-4 rounded-2xl bg-[#D32F2F]/5 border border-[#D32F2F]/10 flex gap-3">
                            <ShieldAlert className="w-4 h-4 text-[#D32F2F] mt-0.5" />
                            <div>
                                <h4 className="text-[10px] font-black text-white/90 uppercase tracking-widest">Meta Policy Alert</h4>
                                <p className="text-[9px] text-white/30 mt-1 leading-relaxed">Ensure your message follows WhatsApp Business policies to avoid account restrictions.</p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics and History */}
                    <div className="glass-card border border-white/5 p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] uppercase font-black tracking-widest text-white/30">Analytics & History</h3>
                            <BarChart3 className="w-4 h-4 text-white/20" />
                        </div>

                        <div className="space-y-3">
                            {isLoading ? (
                                <div className="flex flex-col items-center py-12 opacity-15">
                                    <Loader2 className="w-6 h-6 animate-spin mb-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Syncing Data...</span>
                                </div>
                            ) : broadcasts.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No Campaigns Found</p>
                                </div>
                            ) : (
                                broadcasts.map((b) => (
                                    <div key={b.id} className="group bg-black/20 border border-white/5 rounded-2xl p-4 hover:border-purple-500/20 transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <div className="text-xs font-black text-white/90 uppercase tracking-widest">{b.name}</div>
                                                <div className="text-[8px] text-white/20 font-black tracking-tighter mt-0.5 uppercase">
                                                    {format(new Date(b.createdAt), "MMM d, yyyy · HH:mm")}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDelete(b.id)}
                                                className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#25D366]">
                                                <Users className="w-3 h-3" /> {b.sentCount} REACHED
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-purple-400">
                                                <CheckCircle className="w-3 h-3" /> {b.status}
                                            </div>
                                        </div>
                                        <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-purple-500 to-[#25D366] rounded-full transition-all duration-1000" 
                                                style={{ width: b.status === "COMPLETED" ? "100%" : "30%" }} 
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

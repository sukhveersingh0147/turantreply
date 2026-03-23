"use client";

import { useState, useEffect } from "react";
import { 
    Plus, 
    Tag, 
    Trash2, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    Ticket,
    Calendar,
    Percent,
    X,
    Scissors,
    Copy,
    Share2
} from "lucide-react";
import { getCoupons, createCoupon, deleteCoupon, toggleCouponStatus } from "@/app/actions/coupons";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CouponsClient() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discount: 10,
        expiryDate: ""
    });

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const data = await getCoupons();
            setCoupons(data);
        } catch (error) {
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!newCoupon.code || newCoupon.discount <= 0) {
            toast.error("Please enter a valid code and discount");
            return;
        }

        setSaving(true);
        try {
            const coupon = await createCoupon({
                code: newCoupon.code.toUpperCase().replace(/\s+/g, ""),
                discount: newCoupon.discount,
                expiryDate: newCoupon.expiryDate ? new Date(newCoupon.expiryDate) : undefined
            });
            setCoupons([coupon, ...coupons]);
            setIsAddOpen(false);
            setNewCoupon({ code: "", discount: 10, expiryDate: "" });
            toast.success("Coupon created successfully!");
        } catch (error) {
            toast.error("Failed to create coupon");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this coupon permanently?")) return;
        try {
            await deleteCoupon(id);
            setCoupons(coupons.filter(c => c.id !== id));
            toast.success("Coupon deleted");
        } catch (error) {
            toast.error("Failed to delete coupon");
        }
    };

    const handleToggle = async (coupon: any) => {
        try {
            const newStatus = !coupon.isActive;
            await toggleCouponStatus(coupon.id, newStatus);
            setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, isActive: newStatus } : c));
            toast.success(`Coupon ${newStatus ? 'Activated' : 'Paused'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black font-[Outfit] text-white">Offers & Coupons</h2>
                    <p className="text-sm text-white/40">Launch discounts to boost your conversion rates.</p>
                </div>
                <button 
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                    <Plus className="w-4 h-4 font-black" /> Create Coupon
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
                </div>
            ) : coupons.length === 0 ? (
                <div className="py-20 text-center glass-card border-2 border-dashed border-white/5 rounded-[2rem]">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                        <Ticket className="w-8 h-8 text-white/10" />
                    </div>
                    <h3 className="text-lg font-bold text-white/60 mb-2">No active offers</h3>
                    <p className="text-sm text-white/20 max-w-xs mx-auto mb-8">Create your first coupon code to share in your broadcasts and campaigns.</p>
                    <button 
                        onClick={() => setIsAddOpen(true)}
                        className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                        New Coupon
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map((coupon) => (
                        <motion.div 
                            key={coupon.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`glass-card border border-white/5 overflow-hidden group relative ${!coupon.isActive && 'opacity-60'}`}
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-8">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${coupon.isActive ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-white/20'}`}>
                                        <Ticket className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleToggle(coupon)}
                                            className={`p-2 rounded-lg transition-all ${coupon.isActive ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-white/40'}`}
                                            title={coupon.isActive ? "Pause" : "Activate"}
                                        >
                                            <Clock className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(coupon.id)}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Coupon Code</span>
                                            {coupon.isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                        </div>
                                        <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-black/40 border border-white/5 group-hover:border-amber-500/20 transition-all">
                                            <span className="text-xl font-black font-mono tracking-tighter text-white">{coupon.code}</span>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(coupon.code);
                                                    toast.success("Code copied!");
                                                }}
                                                className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                <Percent className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black uppercase text-white/20 tracking-widest">Discount</div>
                                                <div className="text-sm font-black text-white">{coupon.discount}% OFF</div>
                                            </div>
                                        </div>
                                        {coupon.expiryDate && (
                                            <div className="text-right">
                                                <div className="text-[9px] font-black uppercase text-white/20 tracking-widest">Expires</div>
                                                <div className="text-sm font-black text-white/60">
                                                    {new Date(coupon.expiryDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${coupon.isActive ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-400'}`}>
                                    {coupon.isActive ? 'Active' : 'Expired/Paused'}
                                </span>
                                <span className="text-[10px] font-medium text-white/20 tracking-tighter">Added {new Date(coupon.createdAt).toLocaleDateString()}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setIsAddOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="glass-card border border-white/10 w-full max-w-md p-8 relative z-10"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                                        <Plus className="w-5 h-5 text-black" />
                                    </div>
                                    <h2 className="text-xl font-black font-[Outfit] text-white">New Discount Offer</h2>
                                </div>
                                <button onClick={() => setIsAddOpen(false)} className="p-2 text-white/20 hover:text-white transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Coupon Code</label>
                                    <input 
                                        value={newCoupon.code}
                                        onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                                        placeholder="E.G. FESTIVAL30"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-mono font-black text-white outline-none focus:border-amber-500/30 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Discount (%)</label>
                                        <div className="relative">
                                            <input 
                                                type="number"
                                                value={newCoupon.discount}
                                                onChange={(e) => setNewCoupon({...newCoupon, discount: Number(e.target.value)})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-black text-white outline-none focus:border-amber-500/30 transition-all"
                                            />
                                            <Percent className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Expiry (Optional)</label>
                                        <input 
                                            type="date"
                                            value={newCoupon.expiryDate}
                                            onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-amber-500/30 transition-all color-scheme-dark"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button 
                                        onClick={() => setIsAddOpen(false)}
                                        className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all underline underline-offset-4"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-[2] py-4 px-6 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : "Launch Offer"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .color-scheme-dark {
                    color-scheme: dark;
                }
            `}</style>
        </div>
    );
}

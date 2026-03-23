"use client";

import { useState } from "react";
import { 
    Briefcase, 
    ShoppingBag, 
    Utensils, 
    Key, 
    GraduationCap, 
    MoreHorizontal, 
    ArrowRight, 
    Check, 
    Clock, 
    MapPin, 
    Layout, 
    Loader2,
    Zap
} from "lucide-react";
import { completeSetup } from "@/app/actions/setup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const BUSINESS_TYPES = [
    { id: "SERVICE", name: "Service Business", icon: Briefcase, desc: "Booking, appointment slots, service lists" },
    { id: "SELLING", name: "Selling Business", icon: ShoppingBag, desc: "Product catalog, inventory, order flow" },
    { id: "FOOD", name: "Food Business", icon: Utensils, desc: "Menu system, categories, order system" },
    { id: "RENTAL", name: "Rental Business", icon: Key, desc: "Availability, duration, booking system" },
    { id: "COACHING", name: "Coaching / Education", icon: GraduationCap, desc: "Course list, demo booking, lead capture" },
    { id: "OTHER", name: "Other", icon: MoreHorizontal, desc: "Generic AI automation and lead capture" },
];

export function SetupWizard() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        businessType: "",
        name: "",
        description: "",
        location: "",
        workingHours: {
            mon: { open: "09:00", close: "18:00" },
            tue: { open: "09:00", close: "18:00" },
            wed: { open: "09:00", close: "18:00" },
            thu: { open: "09:00", close: "18:00" },
            fri: { open: "09:00", close: "18:00" },
            sat: { open: "10:00", close: "16:00" },
            sun: { open: "Closed", close: "Closed" },
        }
    });

    const { update } = useSession();

    const handleComplete = async () => {
        setLoading(true);
        try {
            await completeSetup(formData);
            
            // Update session so middleware sees isSetupComplete: true
            await update({ isSetupComplete: true });
            
            toast.success("Setup completed successfully!");
            
            // Hard redirect to clear any middleware state
            setTimeout(() => {
                window.location.href = "/overview";
            }, 1000);
        } catch (error) {
            console.error("Setup error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 mt-16">
            <div className="text-center mb-10">
                <span className="badge-live mb-3 inline-flex">Step {step} of 3</span>
                <h1 className="text-4xl font-black font-[Outfit] mb-2">
                    {step === 1 ? "What's your business type?" : 
                     step === 2 ? "Tell us about your business" : 
                     "Finalize details"}
                </h1>
                <p className="text-white/40 text-sm">
                    {step === 1 ? "Select the category that best fits your daily operations." : 
                     step === 2 ? "This helps our AI understand what you offer and how to talk to clients." : 
                     "Set your location and working hours for automated bookings."}
                </p>
            </div>

            <div className="glass-card border border-white/5 p-6 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <Layout className="w-64 h-64 text-[#25D366]" />
                </div>

                {step === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                        {BUSINESS_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => {
                                    setFormData({ ...formData, businessType: type.id });
                                    setStep(2);
                                }}
                                className={`flex flex-col items-center p-6 rounded-2xl border transition-all hover:-translate-y-1 ${
                                    formData.businessType === type.id 
                                    ? "bg-[#25D366]/10 border-[#25D366] shadow-[0_0_30px_rgba(37,211,102,0.1)]" 
                                    : "bg-white/5 border-white/5 hover:border-white/10"
                                }`}
                            >
                                <type.icon className={`w-10 h-10 mb-4 ${formData.businessType === type.id ? "text-[#25D366]" : "text-white/30"}`} />
                                <h3 className="font-bold text-sm mb-1">{type.name}</h3>
                                <p className="text-[10px] text-white/30 text-center leading-relaxed">{type.desc}</p>
                            </button>
                        ))}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Business Name</label>
                                    <input 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g. Green Valley Cafe"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#25D366] outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">General Description (AI will use this)</label>
                                    <textarea 
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="Briefly explain what your business does..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#25D366] outline-none transition-all min-h-[100px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 p-6 rounded-2xl bg-[#25D366]/5 border border-[#25D366]/10">
                                <h4 className="text-xs font-black uppercase tracking-widest text-[#25D366] mb-2 flex items-center gap-2">
                                    <Zap className="w-3 h-3" /> Industry Specific Details
                                </h4>
                                
                                {formData.businessType === "SERVICE" && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Services Offered</label>
                                            <input 
                                                placeholder="e.g. Haircut, Spa, Massage"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none" 
                                                onChange={(e) => setFormData({...formData, description: formData.description + " Services: " + e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Booking Method</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none">
                                                <option value="whatsapp">On WhatsApp</option>
                                                <option value="link">External Link</option>
                                                <option value="call">Phone Call</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {formData.businessType === "SELLING" && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Product Categories</label>
                                            <input 
                                                placeholder="e.g. Shoes, Clothes, Electronics"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Delivery Info</label>
                                            <input 
                                                placeholder="e.g. PAN India, 3-5 Days"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none" 
                                            />
                                        </div>
                                    </div>
                                )}

                                {formData.businessType === "FOOD" && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Cuisine / Shop Type</label>
                                            <input 
                                                placeholder="e.g. Italian, Bakery, Cloud Kitchen"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Order Method</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none">
                                                <option value="direct">Direct Order on WhatsApp</option>
                                                <option value="swiggy">Swiggy/Zomato</option>
                                                <option value="dinein">Dine-in Only</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {(formData.businessType === "COACHING" || formData.businessType === "OTHER") && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Key Offering</label>
                                            <input 
                                                placeholder="e.g. Digital Marketing Course"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none" 
                                            />
                                        </div>
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-[9px] text-white/30 italic">
                                            Our AI will prioritize these details when answering client queries.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <button onClick={() => setStep(1)} className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest">Back</button>
                            <button 
                                onClick={() => setStep(3)} 
                                disabled={!formData.name || !formData.description}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(37,211,102,0.3)] disabled:opacity-50"
                            >
                                Next Step <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Location (Optional)</label>
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                    <MapPin className="w-4 h-4 text-[#25D366]" />
                                    <input 
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        placeholder="Physical address or online city..."
                                        className="bg-transparent text-sm w-full outline-none"
                                    />
                                </div>
                                <div className="p-4 rounded-xl bg-[#25D366]/5 border border-[#25D366]/10 mt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-[#25D366]" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#25D366]">Working Hours</h4>
                                    </div>
                                    <p className="text-[10px] text-white/50 leading-relaxed italic">
                                        AI will use these hours to tell clients when you're available for calls or visits.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {Object.keys(formData.workingHours).map((day) => (
                                    <div key={day} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{day}</span>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                className="bg-transparent text-[10px] border border-white/10 rounded px-1 w-16 text-center"
                                                defaultValue={formData.workingHours[day as keyof typeof formData.workingHours].open}
                                            />
                                            <span className="text-[8px] text-white/20">-</span>
                                            <input 
                                                className="bg-transparent text-[10px] border border-white/10 rounded px-1 w-16 text-center"
                                                defaultValue={formData.workingHours[day as keyof typeof formData.workingHours].close}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-8">
                            <button onClick={() => setStep(2)} className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest">Back</button>
                            <button 
                                onClick={handleComplete} 
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-black text-sm hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Finalizing...
                                    </>
                                ) : (
                                    <>
                                        Complete Setup <Check className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Steps Progress Bottom */}
            <div className="flex items-center justify-center gap-2 mt-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1 rounded-full transition-all duration-300 ${s === step ? "w-8 bg-[#25D366]" : "w-2 bg-white/10"}`} />
                ))}
            </div>
        </div>
    );
}

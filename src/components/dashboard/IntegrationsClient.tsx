"use client";

import { useState } from "react";
import { 
    MessageSquare, 
    Zap, 
    CreditCard, 
    ShoppingCart, 
    Database, 
    Puzzle, 
    Search, 
    ExternalLink, 
    CheckCircle2, 
    Plus, 
    ShieldCheck, 
    Globe, 
    Smartphone,
    ArrowRight,
    Settings
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["All", "Channels", "Payments", "E-commerce", "CRM", "Utilities"];

const INTEGRATIONS = [
    {
        id: "whatsapp-meta",
        name: "WhatsApp Cloud API",
        category: "Channels",
        description: "Official Meta API for unlimited business messaging.",
        icon: MessageSquare,
        color: "bg-[#25D366]/10 text-[#25D366]",
        status: "Active",
        featured: true,
    },
    {
        id: "razorpay",
        name: "Razorpay",
        category: "Payments",
        description: "Collect payments directly via WhatsApp chat links.",
        icon: CreditCard,
        color: "bg-indigo-500/10 text-indigo-400",
        status: "Setup Required",
        featured: true,
    },
    {
        id: "shopify",
        name: "Shopify",
        category: "E-commerce",
        description: "Sync products and recover abandoned carts automatically.",
        icon: ShoppingCart,
        color: "bg-green-600/10 text-green-500",
        status: "Available",
        featured: false,
    },
    {
        id: "google-sheets",
        name: "Google Sheets",
        category: "Utilities",
        description: "Export leads and conversation data to sheets in real-time.",
        icon: Database,
        color: "bg-emerald-500/10 text-emerald-400",
        status: "Available",
        featured: false,
    },
    {
        id: "webhooks",
        name: "Webhooks",
        category: "Utilities",
        description: "Connect any 3rd party tool via custom HTTP webhooks.",
        icon: Zap,
        color: "bg-orange-500/10 text-orange-400",
        status: "Available",
        featured: false,
    },
    {
        id: "instagram",
        name: "Instagram DM",
        category: "Channels",
        description: "Automate your Instagram Direct Messages.",
        icon: Globe,
        color: "bg-pink-500/10 text-pink-400",
        status: "Available",
        featured: false,
    }
];

import { useRouter } from "next/navigation";
import GoogleSheetsClient from "./GoogleSheetsClient";

export default function IntegrationsClient({ business }: { business: any }) {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<"list" | "google-sheets">("list");
    const [googleConnected, setGoogleConnected] = useState(false);
    const router = useRouter();

    const filtered = INTEGRATIONS.filter(i => {
        const matchesCat = activeCategory === "All" || i.category === activeCategory;
        const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             i.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const handleManage = (id: string) => {
        if (id === "whatsapp-meta") {
            router.push("/integrations/whatsapp");
        } else if (id === "google-sheets") {
            setView("google-sheets");
        } else {
            toast.info(`Configuration for ${id} coming soon!`);
        }
    };

    if (view === "google-sheets") {
        return (
            <div className="space-y-6">
                <button 
                    onClick={() => setView("list")}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back to Integrations
                </button>
                <div className="glass-card border border-white/5 p-8">
                    <GoogleSheetsClient />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                    activeCategory === cat 
                                    ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                                    : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="relative group max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#25D366] transition-colors" />
                    <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search integration..." 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:border-[#25D366]/30 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((integration) => {
                    const Icon = integration.icon;
                    const isConnected = (integration.id === "whatsapp-meta" && business?.waToken && business?.waPhoneNumberId) || (integration.id === "google-sheets" && googleConnected);
                    const status = isConnected ? "Connected" : integration.status;
                    
                    return (
                        <div key={integration.id} className="glass-card border border-white/5 p-6 hover:border-white/10 transition-all group relative overflow-hidden flex flex-col h-full text-left">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500 ${integration.color}`}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    status === "Active" || status === "Connected" 
                                    ? "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20" 
                                    : status === "Setup Required"
                                    ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                    : "bg-white/5 text-white/30 border-white/10"
                                }`}>
                                    {status}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-black font-[Outfit] text-white/90 mb-2">{integration.name}</h3>
                                <p className="text-xs text-white/40 leading-relaxed font-medium mb-6">{integration.description}</p>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                <button 
                                    onClick={() => handleManage(integration.id)}
                                    className="text-[10px] font-black uppercase tracking-widest text-[#25D366] flex items-center gap-2 hover:gap-3 transition-all"
                                >
                                    {status === "Available" ? "Connect" : "Manage"} <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                                {integration.featured && (
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/20 italic">
                                        <ShieldCheck className="w-3 h-3" /> Recommended
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Custom Integration Request */}
                <div className="glass-card border-2 border-dashed border-white/5 p-8 flex flex-col items-center justify-center text-center group hover:bg-white/[0.02] transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                        <Plus className="w-6 h-6 text-white/20" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/50">Request Integration</h3>
                    <p className="text-[10px] text-white/20 mt-2 max-w-[180px]">Need a specific tool? We're adding new apps every week.</p>
                </div>
            </div>

            {/* API Access Section */}
            <div className="glass-card border border-white/5 p-8 relative overflow-hidden mt-12 text-left">
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-0.5 shadow-2xl">
                        <div className="w-full h-full rounded-[1.8rem] bg-[#0a0f14] flex items-center justify-center">
                            <Puzzle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-black font-[Outfit] text-white mb-2">Developer <span className="text-gradient">API Access</span></h2>
                        <p className="text-white/40 text-sm font-medium max-w-2xl">Access our powerful API to build custom workflows, sync data to your own CRM, or trigger AI actions from your server.</p>
                    </div>
                    <button className="px-8 py-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                        Get API Keys
                    </button>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Settings className="w-48 h-48 rotate-12" />
                </div>
            </div>
        </div>
    );
}

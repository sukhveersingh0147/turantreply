"use client";

import { useState } from "react";
import { 
    FileSpreadsheet, 
    Link2, 
    RefreshCw, 
    Database, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    ExternalLink,
    Search,
    ChevronRight,
    ArrowRightLeft,
    Phone,
    User,
    Settings2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function GoogleSheetsClient() {
    const [isConnected, setIsConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [sheets, setSheets] = useState<any[]>([]);
    const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
    const [mapping, setMapping] = useState({
        phone: "",
        name: "",
        custom1: ""
    });

    const handleConnect = () => {
        setConnecting(true);
        // Simulate OAuth
        setTimeout(() => {
            setIsConnected(true);
            setConnecting(false);
            setSheets([
                { id: "1", name: "WhatsApp Leads Q1", lastModified: "2 hours ago", rows: 1250 },
                { id: "2", name: "Campaign_Feb_2024", lastModified: "Yesterday", rows: 450 },
                { id: "3", name: "Organic_Leads_Form", lastModified: "3 days ago", rows: 3200 },
            ]);
            toast.success("Google Account Connected!");
        }, 1500);
    };

    const handleSelectSheet = (id: string) => {
        setSelectedSheet(id);
        toast.info("Sheet data loaded. Please map your columns.");
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black font-[Outfit] text-white tracking-tight">Google Sheets Integration</h2>
                    <p className="text-sm text-white/40">Sync your contact lists and automate broadcasts directly from spreadsheets.</p>
                </div>
                {!isConnected ? (
                    <button 
                        onClick={handleConnect}
                        disabled={connecting}
                        className="btn-primary flex items-center gap-2 group"
                    >
                        {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4 group-hover:rotate-45 transition-transform" />}
                        Connect Google Account
                    </button>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">Connected: rahul@example.com</span>
                    </div>
                )}
            </div>

            {!isConnected ? (
                <div className="py-24 text-center glass-card border-2 border-dashed border-white/5 rounded-[3rem]">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 relative group">
                        <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <FileSpreadsheet className="w-10 h-10 text-white/10 group-hover:text-white/40 transition-colors relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold text-white/60 mb-2">Power up your marketing with data</h3>
                    <p className="text-sm text-white/20 max-w-sm mx-auto mb-10 leading-relaxed font-medium">Connect your Google account to import thousands of contacts, map custom fields, and launch hyper-personalized campaigns.</p>
                    <button 
                        onClick={handleConnect}
                        className="px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-3 mx-auto"
                    >
                        <Settings2 className="w-4 h-4 text-white/40" /> Configure Integration
                    </button>
                </div>
            ) : (
                <div className="grid lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Left: Sheet Selection */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="glass-card border border-white/5 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Select Spreadsheet</h3>
                                <div className="flex items-center gap-4 px-4 py-2 bg-black/40 border border-white/5 rounded-2xl">
                                    <Search className="w-4 h-4 text-white/20" />
                                    <input placeholder="Search sheets..." className="bg-transparent text-xs text-white outline-none w-32" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {sheets.map((sheet) => (
                                    <button 
                                        key={sheet.id}
                                        onClick={() => handleSelectSheet(sheet.id)}
                                        className={`w-full p-6 rounded-[2rem] border text-left transition-all group ${
                                            selectedSheet === sheet.id 
                                                ? "bg-[#25D366]/5 border-[#25D366]/20 ring-1 ring-[#25D366]/10" 
                                                : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                                    selectedSheet === sheet.id ? "bg-[#25D366] text-black" : "bg-white/5 text-white/20 group-hover:text-white/40"
                                                }`}>
                                                    <FileSpreadsheet className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-white group-hover:text-[#25D366] transition-colors">{sheet.name}</div>
                                                    <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Modified {sheet.lastModified}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-black text-white/60 tracking-tighter">{sheet.rows.toLocaleString()}</div>
                                                <div className="text-[9px] font-black uppercase text-white/20 tracking-widest">Leads Found</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Data Mapping */}
                    <div className="lg:col-span-5 space-y-6 sticky top-6">
                        <AnimatePresence mode="wait">
                            {selectedSheet ? (
                                <motion.div 
                                    key="mapping"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="glass-card border border-[#25D366]/20 p-8 space-y-8 shadow-[0_0_40px_rgba(37,211,102,0.05)]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                                            <ArrowRightLeft className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-white">Smart Data Mapping</h3>
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Assign columns to fields</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 tracking-widest">
                                                    <Phone className="w-3 h-3" /> Phone Number (Required)
                                                </div>
                                                <CheckCircle2 className="w-3 h-3 text-[#25D366]" />
                                            </div>
                                            <select className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-[#25D366]/30 appearance-none cursor-pointer">
                                                <option>Phone Number</option>
                                                <option>WhatsApp</option>
                                                <option>Contact</option>
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 tracking-widest">
                                                <User className="w-3 h-3" /> Customer Name
                                            </div>
                                            <select className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-[#25D366]/30 appearance-none cursor-pointer">
                                                <option>Full Name</option>
                                                <option>First Name</option>
                                                <option>Lead Name</option>
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 tracking-widest">
                                                <Database className="w-3 h-3" /> Custom Attribute 1
                                            </div>
                                            <select className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white/40 outline-none focus:border-[#25D366]/30 appearance-none cursor-pointer">
                                                <option>None (Optional)</option>
                                                <option>City</option>
                                                <option>Product Interest</option>
                                                <option>Last Purchase</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex gap-4">
                                        <button className="flex-1 py-4 px-4 rounded-2xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Preview Data</button>
                                        <button 
                                            onClick={() => toast.success("Data mapping saved and synced!")}
                                            className="flex-[2] py-4 px-4 rounded-2xl bg-[#25D366] text-black text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                                        >
                                            Apply Sync Logic
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="glass-card border border-white/5 p-8 text-center space-y-4"
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                                        <ArrowRightLeft className="w-6 h-6 text-white/10" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white/40">Select a sheet to begin mapping</h3>
                                    <p className="text-[10px] text-white/20 font-medium">TurantReply will automatically try to guess your column headers.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}

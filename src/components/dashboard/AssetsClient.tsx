"use client";

import { useState, useEffect } from "react";
import { FileText, Image as ImageIcon, Link as LinkIcon, Trash2, Plus, Search, ExternalLink, Hash, Loader2 } from "lucide-react";
import { getAssets, addAsset, deleteAsset } from "@/app/actions/assets";
import { toast } from "sonner";

export default function AssetsClient() {
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets : any = async () => {
        setLoading(true);
        try {
            const data = await getAssets();
            setAssets(data);
        } catch (error) {
            toast.error("Failed to load assets");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteAsset(id);
            setAssets(assets.filter(a => a.id !== id));
            toast.success("Asset deleted");
        } catch (error) {
            toast.error("Failed to delete asset");
        }
    };

    const filtered = assets.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.intentKeyword?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black font-[Outfit]">Media & Marketing Assets</h1>
                    <p className="text-sm text-white/40">Link PDFs and images to keywords for auto-responses.</p>
                </div>
                <button 
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-black text-xs font-bold hover:shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Asset
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 max-w-md">
                <Search className="w-4 h-4 text-white/30" />
                <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or keyword..." 
                    className="bg-transparent text-sm outline-none flex-1 text-white/70 placeholder:text-white/20"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#25D366]" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-20 text-center glass-card border border-white/5 rounded-3xl">
                    <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/30 italic">No marketing assets found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((asset) => (
                        <div key={asset.id} className="glass-card border border-white/5 p-5 group hover:border-[#25D366]/30 transition-all card-hover">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${asset.type === "CATALOG" ? "bg-blue-500/10 text-blue-400" : "bg-orange-500/10 text-orange-400"}`}>
                                    {asset.type === "CATALOG" ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={asset.url} target="_blank" className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <button 
                                        onClick={() => handleDelete(asset.id)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-white/80 mb-1">{asset.name}</h3>
                            <div className="flex items-center gap-1.5 mb-4">
                                <Hash className="w-3 h-3 text-[#25D366]" />
                                <span className="text-[10px] font-black tracking-widest text-[#25D366] uppercase">
                                    {asset.intentKeyword || "No Keyword"}
                                </span>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] text-white/20 uppercase tracking-tighter">
                                    Type: {asset.type}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] text-white/40">
                                    <LinkIcon className="w-3 h-3" /> Linked to AI
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Asset Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card border border-white/10 w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-6 font-[Outfit]">Link New Asset</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Asset Name</label>
                                <input id="a-name" placeholder="e.g. Summer Menu 2024" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#25D366] outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Public URL (PDF/Image)</label>
                                <input id="a-url" placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#25D366] outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Type</label>
                                    <select id="a-type" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#25D366] outline-none appearance-none">
                                        <option value="CATALOG">Catalog</option>
                                        <option value="MENU">Menu</option>
                                        <option value="BROCHURE">Brochure</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">AI Keyword</label>
                                    <input id="a-keyword" placeholder="e.g. menu" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#25D366] outline-none" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                                <button onClick={() => setIsAddOpen(false)} className="flex-1 py-3.5 rounded-xl border border-white/5 text-xs font-bold hover:bg-white/5">Cancel</button>
                                <button className="flex-1 py-3.5 rounded-xl bg-[#25D366] text-black text-xs font-bold hover:shadow-[0_0_20px_rgba(37,211,102,0.3)]">Save Asset</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

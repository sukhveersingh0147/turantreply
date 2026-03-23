"use client";

import { useState } from "react";
import InventoryClient from "@/components/dashboard/InventoryClient";
import CouponsClient from "@/components/dashboard/CouponsClient";
import { Package, Ticket } from "lucide-react";

export default function CatalogPage() {
    const [activeTab, setActiveTab] = useState<"products" | "coupons">("products");

    return (
        <main className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-white font-[Outfit] tracking-tight leading-none mb-2">
                        Unified <span className="text-gradient">Catalog</span>
                    </h1>
                    <p className="text-white/40 font-medium">Manage your products, services, and promotional offers.</p>
                </div>

                <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit">
                    <button 
                        onClick={() => setActiveTab("products")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === "products" 
                                ? "bg-[#25D366] text-black shadow-[0_0_20px_rgba(37,211,102,0.3)]" 
                                : "text-white/40 hover:text-white"
                        }`}
                    >
                        <Package className="w-4 h-4" /> Products
                    </button>
                    <button 
                        onClick={() => setActiveTab("coupons")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === "coupons" 
                                ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                                : "text-white/40 hover:text-white"
                        }`}
                    >
                        <Ticket className="w-4 h-4" /> Offers
                    </button>
                </div>
            </div>

            <div className="relative">
                {activeTab === "products" ? (
                    <InventoryClient />
                ) : (
                    <CouponsClient />
                )}
            </div>
        </main>
    );
}

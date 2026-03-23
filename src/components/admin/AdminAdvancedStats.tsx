"use client";

import { useState, useEffect } from "react";
import { Coins, Flame, User, Building2, MessageSquare, Loader2 } from "lucide-react";

export function AdminAdvancedStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/stats")
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 glass-card border border-white/5">
                <Loader2 className="w-6 h-6 animate-spin text-[#25D366]" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 gap-6">
            {/* Most Active Businesses */}
            <div className="glass-card border border-white/5 p-6 h-full">
                <div className="flex items-center gap-2 mb-6 text-[#25D366]">
                    <Flame className="w-5 h-5" />
                    <h3 className="font-black text-sm uppercase tracking-widest text-white/70">Highest Traffic Accounts</h3>
                </div>

                <div className="space-y-4">
                    {stats.mostActiveBusinesses.map((biz: any, i: number) => (
                        <div key={biz.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                            <div className="flex items-center gap-3">
                                <div className="text-xs font-black text-white/20 w-4">{i + 1}</div>
                                <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366] text-xs font-bold">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold text-white leading-none">{biz.name}</div>
                                    <div className="text-[9px] text-white/30 font-medium mt-1">Owner: {biz.user?.name || biz.user?.email}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-black text-[#25D366] flex items-center justify-end gap-1.5">
                                    {biz._count.messages.toLocaleString()}
                                    <MessageSquare className="w-3 h-3 opacity-50" />
                                </div>
                                <div className="text-[9px] text-white/20 uppercase font-black tracking-tighter">Messages</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

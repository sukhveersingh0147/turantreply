"use client";

import { useState, useEffect } from "react";
import { Search, Edit2, Coins, Calendar, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AdminUsersTable() {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = () => {
        setLoading(true);
        fetch("/api/admin/users")
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(() => {
                toast.error("Failed to load users");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAction = async (action: () => Promise<any>, successMsg: string) => {
        setActionLoading(true);
        try {
            await action();
            toast.success(successMsg);
            fetchUsers();
            setIsModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const filteredUsers = users.filter((u: any) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full glass-card border border-white/5 rounded-2xl overflow-hidden relative">
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-white font-[Outfit]">User Management</h2>
                    <p className="text-xs text-white/40">Monitor usage, subscriptions, and platform engagement</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                    <input
                        placeholder="Search by name or email..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#25D366]/50 transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">User</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Plan</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Created</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-white/20 text-xs">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-[#25D366]" />
                                        Loading platform users...
                                    </div>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-white/20 text-xs text-italic">
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white/90">{user.name || "Unnamed"}</span>
                                        <span className="text-[10px] text-white/30 mt-0.5">{user.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${user.business?.plan === "STARTER" || user.business?.plan === "GROWTH" || user.business?.plan === "PRO"
                                        ? "bg-[#25D366]/10 text-[#25D366]"
                                        : "bg-yellow-500/10 text-yellow-400"
                                        }`}>
                                        {user.business?.plan || "FREE"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1.5 text-[10px] font-bold ${user.status === "ACTIVE"
                                        ? "text-[#25D366]"
                                        : "text-red-400"
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-[#25D366]" : "bg-red-400"
                                            }`} />
                                        {user.status || "INACTIVE"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-white/40 hover:text-[#25D366] group/btn"
                                    >
                                        <Edit2 className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Management Modal */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/60 font-[Outfit]">
                    <div className="w-full max-w-lg bg-[#0a0f14] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] p-[1px]">
                                        <div className="w-full h-full rounded-[15px] bg-[#0a0f14] flex items-center justify-center text-lg font-black text-white">
                                            {selectedUser.name?.[0] || "?"}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white leading-none">{selectedUser.name || "User Details"}</h3>
                                        <p className="text-xs text-white/40 mt-1">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-8">
                            {/* Action: Plan Management */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">Subscription Control</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["FREE", "STARTER", "GROWTH", "PRO"].map((plan) => (
                                        <button
                                            key={plan}
                                            disabled={actionLoading}
                                            onClick={() => handleAction(() => import("@/app/actions/admin").then(m => m.updateUserPlan(selectedUser.id, plan)), `Plan updated to ${plan}`)}
                                            className={`py-2 text-[10px] font-black rounded-xl border transition-all ${selectedUser.business?.plan === plan
                                                ? "bg-[#25D366] text-black border-[#25D366]"
                                                : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                                                }`}
                                        >
                                            {plan}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action: Usage Reset */}
                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Usage Management</label>
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/60">
                                    <div>
                                        <div className="font-bold">AI Replies Used</div>
                                        <div className="text-[10px] text-white/30">{selectedUser.business?.aiRepliesUsed || 0} / {selectedUser.business?.monthlyLimit || 30}</div>
                                    </div>
                                    <button
                                        disabled={actionLoading}
                                        onClick={() => handleAction(() => import("@/app/actions/admin").then(m => m.resetBusinessUsage(selectedUser.business.id)), "Usage reset successfully")}
                                        className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-xl hover:bg-blue-500/20 transition-all font-bold"
                                    >
                                        RESET USAGE
                                    </button>
                                </div>
                            </div>

                            {/* Action: Status Toggle */}
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-white">Account Status</div>
                                    <div className="text-[10px] text-white/30 uppercase tracking-tight">Current: {selectedUser.status}</div>
                                </div>
                                <button
                                    disabled={actionLoading}
                                    onClick={() => handleAction(() => import("@/app/actions/admin").then(m => m.toggleUserStatus(selectedUser.id, selectedUser.status)), `User ${selectedUser.status === "ACTIVE" ? "suspended" : "activated"}`)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black border transition-all ${selectedUser.status === "ACTIVE"
                                            ? "text-red-400 border-red-500/10 hover:bg-red-500/10"
                                            : "text-[#25D366] border-[#25D366]/10 hover:bg-[#25D366]/10"
                                        }`}
                                >
                                    {selectedUser.status === "ACTIVE" ? "SUSPEND ACCOUNT" : "ACTIVATE ACCOUNT"}
                                </button>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 text-xs font-bold text-white/40 hover:text-white transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    Search,
    Filter,
    MoreVertical,
    UserX,
    UserCheck,
    Trash2,
    Shield,
    Building2,
    Calendar,
    Mail,
} from "lucide-react";
import { toggleUserStatus, deleteUser, updateUserPlan } from "@/app/actions/admin";

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const session = await auth();
    if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
        redirect("/overview");
    }

    const query = typeof params.q === 'string' ? params.q : "";

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
            ]
        },
        include: {
            business: {
                select: {
                    name: true,
                    plan: true,
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black font-[Outfit]">User Management</h1>
                    <p className="text-sm text-white/40 mt-1">Manage all registered users and their account status</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <form className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 flex-1 max-w-md">
                    <Search className="w-4 h-4 text-white/30" />
                    <input
                        name="q"
                        defaultValue={query}
                        placeholder="Search users by name or email..."
                        className="bg-transparent text-sm text-white/70 placeholder:text-white/30 outline-none flex-1"
                    />
                </form>
            </div>

            {/* Users Table */}
            <div className="glass-card border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium font-[Outfit] uppercase tracking-widest">User</th>
                                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium font-[Outfit] uppercase tracking-widest">Business</th>
                                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium font-[Outfit] uppercase tracking-widest">Plan</th>
                                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium font-[Outfit] uppercase tracking-widest">Status</th>
                                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium font-[Outfit] uppercase tracking-widest">Joined</th>
                                <th className="text-right px-4 py-3 text-xs text-white/40 font-medium font-[Outfit] uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-400">
                                                {user.name?.[0] || user.email?.[0] || "?"}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-white/90">{user.name || "N/A"}</div>
                                                <div className="text-[10px] text-white/30 flex items-center gap-1">
                                                    <Mail className="w-2.5 h-2.5" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                        {user.business ? (
                                            <div className="flex items-center gap-2 text-white/60">
                                                <Building2 className="w-3.5 h-3.5 text-white/20" />
                                                <span className="text-xs font-medium">{user.business.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-white/20 italic">No business linked</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border
                                          ${user.business?.plan === "PRO" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                user.business?.plan === "ENTERPRISE" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                                    "bg-white/5 text-white/40 border-white/10"}`}>
                                            {user.business?.plan || "FREE"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                                          ${user.status === "ACTIVE" ? "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                        <div className="text-[11px] text-white/40 flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-white/20" />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-2">
                                            <form action={async () => { "use server"; await toggleUserStatus(user.id, user.status); }}>
                                                <button
                                                    title={user.status === "ACTIVE" ? "Suspend User" : "Activate User"}
                                                    className={`p-2 rounded-lg transition-colors border ${user.status === "ACTIVE"
                                                        ? "text-orange-400 border-orange-500/10 hover:bg-orange-500/10"
                                                        : "text-[#25D366] border-[#25D366]/10 hover:bg-[#25D366]/10"}`}
                                                >
                                                    {user.status === "ACTIVE" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                </button>
                                            </form>
                                            <form action={async () => { "use server"; await deleteUser(user.id); }}>
                                                <button
                                                    title="Delete User"
                                                    className="p-2 rounded-lg text-red-400 border border-red-500/10 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && (
                    <div className="py-20 text-center text-white/20 text-sm">
                        No users found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}

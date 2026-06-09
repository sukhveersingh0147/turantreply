import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreditCard, Calendar, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";

export default async function AdminBillingPage() {
    const session = await auth();
    if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
        redirect("/overview");
    }

    const clients = await prisma.business.findMany({
        select: {
            id: true,
            name: true,
            plan: true,
            subscriptionStatus: true,
            subscriptionExpiresAt: true,
            user: {
                select: {
                    name: true,
                    email: true,
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black font-[Outfit]">Agency Billing Panel</h1>
                <p className="text-sm text-white/40">Overview of plan assignments, expiry dates, and statuses across all clients</p>
            </div>

            <div className="glass-card border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] uppercase tracking-wider font-bold text-white/40">
                                <th className="p-4">Client Business</th>
                                <th className="p-4">Owner</th>
                                <th className="p-4">Plan Name</th>
                                <th className="p-4">Expiry Date</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03] text-sm text-white/75">
                            {clients.map((client) => {
                                const isExpired = client.subscriptionExpiresAt 
                                    ? new Date(client.subscriptionExpiresAt) < new Date() 
                                    : false;
                                
                                const status = isExpired ? "EXPIRED" : client.subscriptionStatus;

                                return (
                                    <tr key={client.id} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="p-4 font-bold text-white">{client.name}</td>
                                        <td className="p-4">
                                            <div className="text-xs">{client.user?.name}</div>
                                            <div className="text-[10px] text-white/30">{client.user?.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${
                                                client.plan === "FREE" 
                                                    ? "bg-white/5 text-white/50 border-white/10" 
                                                    : "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20 shadow-[0_0_10px_rgba(37,211,102,0.05)]"
                                            }`}>
                                                {client.plan}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs font-mono">
                                            {client.subscriptionExpiresAt ? (
                                                <div className="flex items-center gap-1.5 text-white/60">
                                                    <Calendar className="w-3.5 h-3.5 text-white/30" />
                                                    {new Date(client.subscriptionExpiresAt).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <span className="text-white/20">Lifetime / Free</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                status === "ACTIVE" 
                                                    ? "bg-[#25D366]/10 text-[#25D366]" 
                                                    : "bg-red-500/10 text-red-400"
                                            }`}>
                                                {status === "ACTIVE" ? (
                                                    <>
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                        Inactive / Suspended
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {clients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-white/20">
                                        No client accounts registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

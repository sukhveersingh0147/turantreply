import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { MessageSquare, User, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function BusinessMessagesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();
    
    if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
        redirect("/overview");
    }

    const business = await prisma.business.findUnique({
        where: { id },
        include: {
            user: {
                select: { name: true, email: true }
            }
        }
    });

    if (!business) notFound();

    // @ts-ignore
    const messages = await prisma.message.findMany({
        where: { businessId: id },
        orderBy: { timestamp: "desc" },
        take: 100,
        include: {
            lead: {
                select: { name: true, phone: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link 
                    href="/admin/businesses" 
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black font-[Outfit]">Recent Messages</h1>
                    <p className="text-sm text-white/40 mt-1">Monitoring messages for {business.name} ({business.user?.name})</p>
                </div>
            </div>

            <div className="glass-card border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="text-[10px] uppercase tracking-wider font-bold text-white/40 px-6 py-4 text-left">Timestamp</th>
                                <th className="text-[10px] uppercase tracking-wider font-bold text-white/40 px-6 py-4 text-left">Contact</th>
                                <th className="text-[10px] uppercase tracking-wider font-bold text-white/40 px-6 py-4 text-left">Sender</th>
                                <th className="text-[10px] uppercase tracking-wider font-bold text-white/40 px-6 py-4 text-left">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {messages.map((msg) => (
                                <tr key={msg.id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-[11px] text-white/40">
                                            <Clock className="w-3 h-3" />
                                            {msg.timestamp.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white/80">{msg.lead?.name || "Unknown"}</span>
                                            <span className="text-[10px] text-white/30">{msg.lead?.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                                            msg.sender === "CUSTOMER" 
                                            ? "bg-blue-500/10 text-blue-400" 
                                            : "bg-[#25D366]/10 text-[#25D366]"
                                        }`}>
                                            {msg.sender === "CUSTOMER" ? "Customer" : msg.senderType || "Business"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-white/60 line-clamp-2 max-w-xl">{msg.message}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {messages.length === 0 && (
                    <div className="py-20 text-center text-white/20 text-sm">
                        No messages found for this business.
                    </div>
                )}
            </div>
        </div>
    );
}

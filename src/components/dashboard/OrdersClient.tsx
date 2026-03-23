"use client";

import { useState } from "react";
import { ShoppingCart, User, Bot, ExternalLink, Check, X, CreditCard, Package, Clock, Search } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { updateOrderStatus } from "@/app/actions/orders";

const statusColors: Record<string, string> = {
    PENDING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    COMPLETED: "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const paymentStatusColors: Record<string, string> = {
    PAID: "bg-[#25D366]/10 text-[#25D366]",
    UNPAID: "bg-red-500/10 text-red-400",
    PARTIAL: "bg-orange-500/10 text-orange-400",
};

export default function OrdersClient({ initialData }: { initialData: any[] }) {
    const [orders, setOrders] = useState(initialData);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleUpdateStatus = async (id: string, status: string) => {
        setUpdatingId(id);
        try {
            await updateOrderStatus(id, status);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
            toast.success(`Order marked as ${status.toLowerCase()}`);
        } catch (error) {
            toast.error("Failed to update order");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-[Outfit] text-white tracking-tight">
                        Order <span className="text-gradient">Management</span>
                    </h1>
                    <p className="text-white/40 mt-1 font-medium">
                        {orders.length} total orders from WhatsApp AI automated checkout
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="glass-card border border-white/5 p-5 group hover:border-white/10 transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            {/* Order ID & Price */}
                            <div className="min-w-[150px]">
                                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Order ID</div>
                                <div className="text-sm font-bold text-white mb-2">#{order.id.slice(-6).toUpperCase()}</div>
                                <div className="text-xl font-black text-[#25D366]">₹{order.totalAmount}</div>
                            </div>

                            {/* Customer */}
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Customer</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40 border border-white/10">
                                        {order.customerName[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{order.customerName}</div>
                                        <div className="text-[10px] text-white/20 font-black">{order.customerPhone}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Statuses */}
                            <div className="flex flex-col gap-2 min-w-[120px]">
                                <span className={`text-[9px] font-black text-center uppercase tracking-widest px-2 py-1 rounded-lg border ${statusColors[order.status]}`}>
                                    {order.status}
                                </span>
                                <div className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase ${paymentStatusColors[order.paymentStatus]}`}>
                                    <CreditCard className="w-3 h-3" />
                                    {order.paymentStatus}
                                </div>
                            </div>

                            {/* Interaction Context */}
                            <div className="flex-[1.5] space-y-4">
                                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 relative group/context">
                                    <p className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-2">Intent Snapshot</p>
                                    <div className="flex gap-2">
                                        <User className="w-3.5 h-3.5 text-white/20 mt-0.5 flex-shrink-0" />
                                        <p className="text-[11px] text-white/60 leading-relaxed italic line-clamp-2 group-hover/context:line-clamp-none transition-all">
                                            "{order.query}"
                                        </p>
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-white/10 uppercase tracking-widest px-1">Order Items</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(order.items) && (order.items as any[]).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                                                <Package className="w-3 h-3 text-[#25D366]/40" />
                                                <span className="text-[11px] font-bold text-white/80">{item.name}</span>
                                                <span className="text-[10px] text-white/20 font-black">×{item.qty || 1}</span>
                                                <span className="text-[10px] text-[#25D366] font-black">₹{item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 justify-end">
                                {order.status !== 'COMPLETED' && (
                                    <button
                                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                                        disabled={updatingId === order.id}
                                        className="p-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-black transition-all border border-[#25D366]/20"
                                        title="Complete Order"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                                <Link
                                    href={`/conversations?phone=${order.customerPhone}`}
                                    className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 border border-white/10 transition-all"
                                    title="View Chat"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="glass-card border border-white/5 p-20 text-center bg-white/[0.01]">
                        <ShoppingCart className="w-16 h-16 text-white/5 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-white/40 tracking-tight">No orders yet</h3>
                        <p className="text-sm text-white/20 max-w-sm mx-auto mt-2 italic">
                            Orders generated via AI checkout will be listed here automatically.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

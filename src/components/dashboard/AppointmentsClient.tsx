"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Users, CheckCircle, AlertCircle, Loader2, User, Bot, ExternalLink, ChevronRight, Check, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { updateAppointmentStatus } from "@/app/actions/appointments";

const statusColors: Record<string, string> = {
    SCHEDULED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    COMPLETED: "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    PENDING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export default function AppointmentsClient({ initialData }: { initialData: any[] }) {
    const [appointments, setAppointments] = useState(initialData);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleUpdateStatus = async (id: string, status: string) => {
        setUpdatingId(id);
        try {
            await updateAppointmentStatus(id, status);
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            toast.success(`Appointment marked as ${status.toLowerCase()}`);
        } catch (error) {
            toast.error("Failed to update appointment");
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDateTime = (date: Date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-[Outfit] text-white tracking-tight">
                        Business <span className="text-gradient">Appointments</span>
                    </h1>
                    <p className="text-white/40 mt-1 font-medium">
                        {appointments.length} total bookings recorded from WhatsApp
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {appointments.map((appointment) => (
                    <div key={appointment.id} className="glass-card border border-white/5 p-5 group hover:border-white/10 transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            {/* Time & Status */}
                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <div className="flex items-center gap-2 text-white/80">
                                    <CalendarIcon className="w-4 h-4 text-[#25D366]" />
                                    <span className="text-sm font-bold tracking-tight">
                                        {formatDateTime(appointment.startTime)}
                                    </span>
                                </div>
                                <span className={`w-fit text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${statusColors[appointment.status]}`}>
                                    {appointment.status}
                                </span>
                            </div>

                            {/* Customer & Item */}
                            <div className="flex-1 flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Customer</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40 border border-white/10">
                                            {appointment.customerName[0]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{appointment.customerName}</div>
                                            <div className="text-[10px] text-white/20 font-black">{appointment.customerPhone}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Service/Item</p>
                                    <div className="text-sm font-bold text-[#25D366]">{appointment.itemName}</div>
                                </div>
                            </div>

                            {/* Interaction Context - The "Meat" of the user's request */}
                            <div className="flex-[1.5] bg-black/40 rounded-2xl p-4 border border-white/5 relative group/context">
                                <p className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-2">Triggering Conversation</p>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <User className="w-3.5 h-3.5 text-white/20 mt-0.5 flex-shrink-0" />
                                        <p className="text-[11px] text-white/60 leading-relaxed italic">"{appointment.query}"</p>
                                    </div>
                                    <div className="flex gap-2 border-t border-white/5 pt-2">
                                        <Bot className="w-3.5 h-3.5 text-[#25D366]/40 mt-0.5 flex-shrink-0" />
                                        <p className="text-[11px] text-[#25D366]/50 leading-relaxed italic line-clamp-2 group-hover/context:line-clamp-none transition-all">"{appointment.summary}"</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 justify-end">
                                {appointment.status !== 'COMPLETED' && (
                                    <button
                                        onClick={() => handleUpdateStatus(appointment.id, 'COMPLETED')}
                                        disabled={updatingId === appointment.id}
                                        className="p-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-black transition-all border border-[#25D366]/20"
                                        title="Mark Completed"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                                <Link
                                    href={`/conversations?phone=${appointment.customerPhone}`}
                                    className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 border border-white/10 transition-all"
                                    title="View Full Chat"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {appointments.length === 0 && (
                    <div className="glass-card border border-white/5 p-20 text-center bg-white/[0.01]">
                        <CalendarIcon className="w-16 h-16 text-white/5 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-white/40 tracking-tight">No appointments yet</h3>
                        <p className="text-sm text-white/20 max-w-sm mx-auto mt-2 italic">
                            Bookings made via your WhatsApp AI Assistant will appear here with full context.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

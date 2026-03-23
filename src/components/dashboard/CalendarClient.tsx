"use client";

import { useState } from "react";
import { 
    Calendar as CalendarIcon, 
    Clock, 
    User, 
    Plus, 
    Search, 
    Filter, 
    CheckCircle2, 
    XCircle, 
    MoreHorizontal,
    Phone,
    Package,
    Bot,
    UserCircle,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { updateAppointmentStatus, createAppointment } from "@/app/actions/appointments";

interface Appointment {
    id: string;
    customerName: string;
    customerPhone: string;
    itemName: string;
    startTime: Date;
    endTime?: Date;
    status: string;
    source: string;
    query?: string;
    summary?: string;
}

export default function CalendarClient({ 
    initialAppointments,
    resources 
}: { 
    initialAppointments: Appointment[],
    resources: { leads: any[], items: any[] }
}) {
    const [appointments, setAppointments] = useState(initialAppointments);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [newBooking, setNewBooking] = useState({
        leadId: "",
        itemId: "",
        startTime: "",
        title: "",
        description: ""
    });

    const filtered = appointments.filter(a => {
        const matchesFilter = filter === "ALL" || a.status === filter;
        const matchesSearch = a.customerName.toLowerCase().includes(search.toLowerCase()) || 
                             a.customerPhone.includes(search) ||
                             a.itemName.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateAppointmentStatus(id, newStatus);
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
            toast.success(`Booking ${newStatus.toLowerCase()}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleAddBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBooking.leadId || !newBooking.startTime) {
            toast.error("Please fill required fields");
            return;
        }

        setSaving(true);
        try {
            const res = await createAppointment({
                ...newBooking,
                startTime: new Date(newBooking.startTime)
            });
            // Mock addition to UI (or revalidate)
            toast.success("Booking created successfully");
            setIsAddOpen(false);
            window.location.reload(); // Simple refresh for now to fetch new data
        } catch (error) {
            toast.error("Failed to create booking");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-[Outfit] text-white italic tracking-tighter uppercase flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-[#25D366]" />
                        Bookings & Appointments
                    </h1>
                    <p className="text-white/40 text-sm font-medium">Manage your schedule and customer bookings</p>
                </div>
                
                <button 
                    onClick={() => setIsAddOpen(true)}
                    className="bg-[#25D366] hover:bg-[#20bd5b] text-black font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#25D366]/20"
                >
                    <Plus className="w-5 h-5" />
                    NEW BOOKING
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total", count: appointments.length, color: "white" },
                    { label: "Scheduled", count: appointments.filter(a => a.status === "SCHEDULED").length, color: "#25D366" },
                    { label: "Completed", count: appointments.filter(a => a.status === "COMPLETED").length, color: "#3B82F6" },
                    { label: "Cancelled", count: appointments.filter(a => a.status === "CANCELLED").length, color: "#EF4444" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card border border-white/5 p-4 rounded-3xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
                        <p className="text-2xl font-black text-white italic" style={{ color: stat.count > 0 ? stat.color : undefined }}>
                            {stat.count.toString().padStart(2, '0')}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#25D366] transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search by customer, phone or item..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-white focus:border-[#25D366]/50 outline-none transition-all"
                    />
                </div>
                <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                    {["ALL", "SCHEDULED", "COMPLETED", "CANCELLED"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                                filter === t ? "bg-white/10 text-[#25D366]" : "text-white/40 hover:text-white"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filtered.map((app) => (
                        <motion.div
                            key={app.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-[#25D366]/30 transition-all"
                        >
                            {/* Status Stripe */}
                            <div className={`absolute top-0 left-0 w-1 h-full ${
                                app.status === "SCHEDULED" ? "bg-[#25D366]" : 
                                app.status === "COMPLETED" ? "bg-blue-500" : "bg-red-500"
                            }`} />

                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                                            <User className="w-6 h-6 text-[#25D366]" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg tracking-tight">{app.customerName}</h3>
                                            <div className="flex items-center gap-1.5 text-white/40 text-xs">
                                                <Phone className="w-3 h-3" />
                                                {app.customerPhone}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${
                                        app.source === "AI" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-purple-500/10 text-purple-400"
                                    } flex items-center gap-1.5`}>
                                        {app.source === "AI" ? <Bot className="w-3 h-3" /> : <UserCircle className="w-3 h-3" />}
                                        {app.source}
                                    </div>
                                </div>

                                <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2.5">
                                        <Package className="w-4 h-4 text-white/30" />
                                        <span className="text-sm font-bold text-white/80">{app.itemName}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Clock className="w-4 h-4 text-white/30" />
                                        <span className="text-sm font-medium text-white/60">
                                            {format(new Date(app.startTime), "MMM dd, yyyy • hh:mm a")}
                                        </span>
                                    </div>
                                </div>

                                {app.summary && (
                                    <p className="text-[11px] text-white/40 line-clamp-2 italic leading-relaxed px-1">
                                        "{app.summary}"
                                    </p>
                                )}

                                <div className="pt-2 flex items-center gap-2">
                                    {app.status === "SCHEDULED" && (
                                        <>
                                            <button 
                                                onClick={() => handleStatusUpdate(app.id, "COMPLETED")}
                                                className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border border-blue-500/20 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Complete
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(app.id, "CANCELLED")}
                                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border border-red-500/20 flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                    {app.status !== "SCHEDULED" && (
                                        <div className="w-full py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-white/20 border border-white/5 rounded-xl">
                                            {app.status}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add Booking Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg glass-card border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
                        >
                            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-6">Create New Booking</h2>
                            
                            <form onSubmit={handleAddBooking} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2 px-1">Customer / Lead</label>
                                        <select 
                                            value={newBooking.leadId}
                                            onChange={(e) => setNewBooking({...newBooking, leadId: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-[#25D366] outline-none"
                                        >
                                            <option value="" className="bg-zinc-900">Select Customer</option>
                                            {resources.leads.map(lead => (
                                                <option key={lead.id} value={lead.id} className="bg-zinc-900">
                                                    {lead.name || "Unnamed"} ({lead.phone})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2 px-1">Item / Service</label>
                                        <select 
                                            value={newBooking.itemId}
                                            onChange={(e) => setNewBooking({...newBooking, itemId: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-[#25D366] outline-none"
                                        >
                                            <option value="" className="bg-zinc-900">Select Item</option>
                                            {resources.items.map(item => (
                                                <option key={item.id} value={item.id} className="bg-zinc-900">
                                                    {item.name} - ₹{item.price}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2 px-1">Date & Time</label>
                                        <input 
                                            type="datetime-local"
                                            value={newBooking.startTime}
                                            onChange={(e) => setNewBooking({...newBooking, startTime: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-[#25D366] outline-none [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2 px-1">Title (Optional)</label>
                                        <input 
                                            type="text"
                                            placeholder="e.g. Test Drive, Pizza Party"
                                            value={newBooking.title}
                                            onChange={(e) => setNewBooking({...newBooking, title: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-[#25D366] outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setIsAddOpen(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-white font-black text-[10px] tracking-widest uppercase hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[2] bg-[#25D366] text-black px-6 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-[#20bd5b] transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Create Booking
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    Building2,
    User,
    Mail,
    Phone,
    Trash2,
    Edit,
    Power,
    Loader2,
    X,
    Shield,
} from "lucide-react";
import { createClient, updateClient, deleteClient } from "@/app/actions/admin";
import { toast } from "sonner";

export default function ClientsClient({ initialClients }: { initialClients: any[] }) {
    const router = useRouter();
    const [clients, setClients] = useState(initialClients);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [activeClient, setActiveClient] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        businessName: "",
        phone: "",
        plan: "FREE",
    });

    const filteredClients = clients.filter((client) => {
        const query = searchQuery.toLowerCase();
        return (
            client.name.toLowerCase().includes(query) ||
            client.user?.name?.toLowerCase().includes(query) ||
            client.user?.email?.toLowerCase().includes(query)
        );
    });

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await createClient({
                name: formData.name,
                email: formData.email,
                passwordHash: formData.password,
                businessName: formData.businessName,
                plan: formData.plan,
                phone: formData.phone,
            });
            if (res.success) {
                toast.success("Client registered successfully!");
                setIsAddOpen(false);
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    businessName: "",
                    phone: "",
                    plan: "FREE",
                });
                router.refresh();
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to create client");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeClient) return;
        setSubmitting(true);
        try {
            const res = await updateClient(activeClient.id, {
                name: formData.name,
                email: formData.email,
                businessName: formData.businessName,
                plan: formData.plan,
                phone: formData.phone,
                status: activeClient.subscriptionStatus,
            });
            if (res.success) {
                toast.success("Client details updated!");
                setIsEditOpen(false);
                router.refresh();
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update client");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleSuspend = async (client: any) => {
        const confirmMsg = client.subscriptionStatus === "ACTIVE" 
            ? "Are you sure you want to suspend this client?" 
            : "Are you sure you want to activate this client?";
        if (!confirm(confirmMsg)) return;

        try {
            const newStatus = client.subscriptionStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
            const res = await updateClient(client.id, {
                name: client.user?.name || "",
                email: client.user?.email || "",
                businessName: client.name,
                plan: client.plan,
                phone: client.whatsappNumber || "",
                status: newStatus,
            });
            if (res.success) {
                toast.success(newStatus === "ACTIVE" ? "Client activated!" : "Client suspended!");
                router.refresh();
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to toggle client status");
        }
    };

    const handleDelete = async (client: any) => {
        if (!confirm(`WARNING: Deleting client "${client.name}" will permanently erase their user account and all of their business leads, messages, and appointments. Proceed?`)) return;

        try {
            const res = await deleteClient(client.id);
            if (res.success) {
                toast.success("Client account completely deleted.");
                router.refresh();
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete client");
        }
    };

    const openEdit = (client: any) => {
        setActiveClient(client);
        setFormData({
            name: client.user?.name || "",
            email: client.user?.email || "",
            password: "", // Not used in edit
            businessName: client.name,
            phone: client.whatsappNumber || "",
            plan: client.plan,
        });
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black font-[Outfit]">Clients Management</h1>
                    <p className="text-sm text-white/40">Add, edit, suspend, and delete client business accounts</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-black text-sm font-bold hover:bg-[#128C7E] hover:text-white transition-all shadow-[0_0_20px_rgba(37,211,102,0.15)]"
                >
                    <Plus className="w-4 h-4" />
                    Add Client
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-4 py-3 max-w-md">
                <Search className="w-4 h-4 text-white/30" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by business name, owner name, or email..."
                    className="bg-transparent text-sm text-white/70 placeholder:text-white/30 outline-none flex-1"
                />
            </div>

            {/* Clients Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredClients.map((client) => (
                    <div
                        key={client.id}
                        className="glass-card border border-white/5 p-6 flex flex-col justify-between gap-5 hover:border-white/10 transition-all group"
                    >
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-white/90">{client.name}</h3>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-white/30 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                            {client.plan} Plan
                                        </span>
                                    </div>
                                </div>

                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                    client.subscriptionStatus === "ACTIVE" 
                                        ? "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20" 
                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${client.subscriptionStatus === "ACTIVE" ? "bg-[#25D366]" : "bg-red-400"}`} />
                                    {client.subscriptionStatus === "ACTIVE" ? "ACTIVE" : "SUSPENDED"}
                                </div>
                            </div>

                            <div className="space-y-2 text-xs text-white/60 pt-3 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-white/30" />
                                    <span>{client.user?.name || "No Owner Registered"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-white/30" />
                                    <span className="truncate">{client.user?.email || "No Email"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-white/30" />
                                    <span>{client.whatsappNumber || "No Phone"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                            <button
                                onClick={() => handleToggleSuspend(client)}
                                className={`p-2 rounded-xl border transition-all ${
                                    client.subscriptionStatus === "ACTIVE"
                                        ? "text-red-400 border-red-500/10 bg-red-500/5 hover:bg-red-500/10"
                                        : "text-[#25D366] border-[#25D366]/10 bg-[#25D366]/5 hover:bg-[#25D366]/10"
                                }`}
                                title={client.subscriptionStatus === "ACTIVE" ? "Suspend Client" : "Unsuspend Client"}
                            >
                                <Power className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => openEdit(client)}
                                className="p-2 rounded-xl border border-white/5 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                                title="Edit Client"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(client)}
                                className="p-2 rounded-xl border border-red-500/10 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                                title="Delete Client"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredClients.length === 0 && (
                    <div className="col-span-full py-20 text-center text-white/20 text-sm">
                        No clients found matching your search.
                    </div>
                )}
            </div>

            {/* ADD CLIENT MODAL */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="glass-card border border-white/10 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-lg font-black font-[Outfit]">Add New Client</h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-white/40 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Business Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    className="input-dark w-full"
                                    placeholder="e.g. Acme Agency"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Owner Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-dark w-full"
                                        placeholder="Arjun"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">WhatsApp / Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input-dark w-full"
                                        placeholder="9876543210"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Owner Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-dark w-full"
                                    placeholder="owner@acme.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-dark w-full"
                                    placeholder="Create account password"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Subscription Plan</label>
                                <select
                                    value={formData.plan}
                                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                    className="input-dark w-full"
                                >
                                    <option value="FREE">FREE</option>
                                    <option value="STARTER">STARTER</option>
                                    <option value="GROWTH">GROWTH</option>
                                    <option value="PRO">PRO</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full mt-2 py-3 rounded-xl bg-[#25D366] text-black font-bold hover:bg-[#128C7E] hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Register Client"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT CLIENT MODAL */}
            {isEditOpen && activeClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="glass-card border border-white/10 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-lg font-black font-[Outfit]">Edit Client Details</h3>
                            <button onClick={() => setIsEditOpen(false)} className="text-white/40 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Business Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    className="input-dark w-full"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Owner Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-dark w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">WhatsApp / Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input-dark w-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Owner Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-dark w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Subscription Plan</label>
                                <select
                                    value={formData.plan}
                                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                    className="input-dark w-full"
                                >
                                    <option value="FREE">FREE</option>
                                    <option value="STARTER">STARTER</option>
                                    <option value="GROWTH">GROWTH</option>
                                    <option value="PRO">PRO</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full mt-2 py-3 rounded-xl bg-[#25D366] text-black font-bold hover:bg-[#128C7E] hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

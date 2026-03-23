"use client";

import { useState, useEffect } from "react";
import { Plus, Package, Search, Filter, Trash2, Edit2, Upload, AlertCircle, Loader2, Tag, Utensils, BookOpen, Clock, X } from "lucide-react";
import { getInventory, addItem, updateItem, updateStock, deleteItem, bulkAddItems } from "@/app/actions/inventory";
import { importInventoryFromCSV } from "@/app/actions/sync";
import { createFlow, deleteFlow, updateFlow } from "@/app/actions/automation";
import { uploadImage } from "@/app/actions/upload";
import { toast } from "sonner";

const ITEM_TYPES = [
    { value: "PRODUCT", label: "Product", icon: Package },
    { value: "SERVICE", label: "Service", icon: Clock },
    { value: "MENU", label: "Menu Item", icon: Utensils },
    { value: "COURSE", label: "Course", icon: BookOpen },
    { value: "RENTAL", label: "Rental", icon: Tag },
];

export default function InventoryClient() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [newItem, setNewItem] = useState({
        name: "",
        type: "PRODUCT",
        price: 0,
        stock: 0,
        category: "General",
        description: "",
        imageUrl: "",
        imageUrls: [] as string[],
        isAvailable: true,
        variants: null,
        metadata: {} as any
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importing, setImporting] = useState(false);
    const [extractedItems, setExtractedItems] = useState<any[]>([]);
    const [importPreviewImage, setImportPreviewImage] = useState("");

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        setLoading(true);
        try {
            const data = await getInventory();
            setItems(data);
        } catch (error) {
            toast.error("Failed to load catalog");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!newItem.name || newItem.price < 0) {
            toast.error("Please enter valid name and price");
            return;
        }

        setSaving(true);
        try {
            if (editingItem) {
                const updated = await updateItem(editingItem.id, newItem);
                setItems(items.map(i => i.id === editingItem.id ? updated : i));
                toast.success("Item updated successfully");
            } else {
                const item = await addItem(newItem);
                setItems([item, ...items]);
                toast.success("Item added successfully");
            }
            setIsAddOpen(false);
            setEditingItem(null);
            resetForm();
        } catch (error) {
            toast.error(editingItem ? "Failed to update item" : "Failed to add item");
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setNewItem({ 
            name: "", 
            type: "PRODUCT", 
            price: 0, 
            stock: 0, 
            category: "General", 
            description: "",
            imageUrl: "",
            imageUrls: [],
            isAvailable: true,
            variants: null,
            metadata: {}
        });
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setNewItem({
            name: item.name,
            type: item.type,
            price: item.price,
            stock: item.stock || 0,
            category: item.category || "General",
            description: item.description || "",
            imageUrl: item.imageUrl || "",
            imageUrls: item.imageUrls || [],
            isAvailable: item.isAvailable,
            variants: item.variants,
            metadata: item.metadata || {}
        });
        setIsAddOpen(true);
    };

    const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Compression failed"));
                    }, "image/jpeg", quality);
                };
                img.onerror = () => reject(new Error("Image load failed"));
                img.src = event.target?.result as string;
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isAdditional = false, index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            let fileToUpload = file;
            if (file.type.startsWith("image/")) {
                try {
                    const compressedBlob = await compressImage(file);
                    fileToUpload = new File([compressedBlob], file.name, { type: "image/jpeg" });
                } catch (e) {
                    console.warn("Compression failed, using original file", e);
                }
            }
            
            const formData = new FormData();
            formData.append("image", fileToUpload);
            const result = await uploadImage(formData);
            if (isAdditional && index !== undefined) {
                const newUrls = [...newItem.imageUrls];
                newUrls[index] = result.url;
                setNewItem({ ...newItem, imageUrls: newUrls });
            } else {
                setNewItem({ ...newItem, imageUrl: result.url });
            }
            toast.success("Image uploaded successfully");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error?.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteItem(id);
            setItems(items.filter(i => i.id !== id));
            toast.success("Item deleted");
        } catch (error) {
            toast.error("Failed to delete item");
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const csvText = event.target?.result as string;
            setLoading(true);
            try {
                const result = await importInventoryFromCSV(csvText);
                toast.success(`Successfully imported ${result.count} items!`);
                await loadInventory();
            } catch (error: any) {
                toast.error(error.message || "Failed to import CSV");
            } finally {
                setLoading(false);
                // Reset input
                e.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length || !confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;
        setLoading(true);
        try {
            for (const id of selectedIds) {
                await deleteItem(id);
            }
            setItems(items.filter(i => !selectedIds.includes(i.id)));
            setSelectedIds([]);
            toast.success("Bulk delete successful");
        } catch (error) {
            toast.error("Failed to delete some items");
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async (item: any) => {
        try {
            const updated = await updateItem(item.id, { isAvailable: !item.isAvailable });
            setItems(items.map(i => i.id === item.id ? updated : i));
            toast.success(`${item.name} is now ${!item.isAvailable ? 'Available' : 'Unavailable'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filtered = items.filter(i => {
        const search = searchTerm.toLowerCase();
        return (
            (i.name?.toLowerCase() || "").includes(search) ||
            (i.category?.toLowerCase() || "").includes(search) ||
            (i.type?.toLowerCase() || "").includes(search)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black font-[Outfit]">Catalog Management</h1>
                    <p className="text-sm text-white/40">Manage your products, services, and inventory levels.</p>
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="file" 
                        id="csv-import" 
                        hidden 
                        accept=".csv" 
                        onChange={handleImport}
                    />
                    <button 
                        onClick={() => document.getElementById('csv-import')?.click()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-bold hover:bg-white/10 transition-all"
                    >
                        <Upload className="w-4 h-4" /> Import CSV
                    </button>
                    <button 
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-black text-xs font-bold hover:shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Item
                    </button>
                </div>
            </div>

            {/* Filters & Bulk Actions */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 flex-1 max-w-md w-full">
                    <Search className="w-4 h-4 text-white/30" />
                    <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, category, or type..." 
                        className="bg-transparent text-sm outline-none flex-1 text-white/70 placeholder:text-white/20"
                    />
                </div>
                
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-200">
                        <span className="text-xs font-bold text-white/40">{selectedIds.length} selected</span>
                        <button 
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
                        >
                            <Trash2 className="w-4 h-4" /> Delete Selected
                        </button>
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block glass-card border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 w-10">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.length === filtered.length && filtered.length > 0}
                                        onChange={(e) => setSelectedIds(e.target.checked ? filtered.map(i => i.id) : [])}
                                        className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[#25D366]"
                                    />
                                </th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-black">Item</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-black">Type</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-black">Category</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-black">Price / Status</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-black text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#25D366]" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-white/20 italic">
                                        {searchTerm ? "No items match your search." : "Your catalog is empty."}
                                    </td>
                                </tr>
                            ) : filtered.map((item) => {
                                const TypeIcon = ITEM_TYPES.find(t => t.value === item.type)?.icon || Package;
                                return (
                                    <tr key={item.id} className={`hover:bg-white/[0.01] transition-colors group ${selectedIds.includes(item.id) ? 'bg-[#25D366]/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(item.id)}
                                                onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, item.id] : prev.filter(idx => idx !== item.id))}
                                                className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[#25D366]"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                                                    {item.imageUrl || (item.imageUrls && item.imageUrls.length > 0) ? (
                                                        <img 
                                                            src={item.imageUrl || item.imageUrls[0]} 
                                                            className="w-full h-full object-cover" 
                                                            alt={item.name}
                                                            onError={(e) => {
                                                                // If image fails to load, replace with a placeholder or icon
                                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=25D366&color=fff`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-white/20" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white/80">{item.name}</div>
                                                    <div className="text-[10px] text-white/30 truncate max-w-[150px]">{item.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-white/30">
                                                {item.type}
                                                {(item.metadata?.duration || item.duration) && (
                                                    <span className="ml-2 px-1 py-0.5 rounded bg-[#25D366]/10 text-[#25D366] text-[8px] font-bold">
                                                        {item.metadata?.duration || item.duration}
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/40">
                                                {item.category || "General"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold ${item.isAvailable ? "text-[#25D366]" : "text-red-400"}`}>
                                                        ₹{item.price}
                                                    </span>
                                                    <button 
                                                        onClick={() => toggleAvailability(item)}
                                                        className={`px-1.5 py-0.5 rounded text-[8px] font-black transition-all border ${
                                                            item.isAvailable 
                                                                ? "bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366]" 
                                                                : "bg-red-500/10 border-red-500/20 text-red-400"
                                                        }`}
                                                    >
                                                        {item.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
                                                    </button>
                                                </div>
                                                {(item.type === "PRODUCT" || item.type === "MENU") && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="text-[10px] text-white/30 font-mono">
                                                            {item.stock ?? 0} in stock
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button 
                                                                onClick={async () => {
                                                                    const newStock = Math.max(0, (item.stock || 0) - 1);
                                                                    await updateStock(item.id, newStock);
                                                                    setItems(items.map(i => i.id === item.id ? { ...i, stock: newStock } : i));
                                                                }}
                                                                className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40"
                                                            >
                                                                -
                                                            </button>
                                                            <button 
                                                                onClick={async () => {
                                                                    const newStock = (item.stock || 0) + 1;
                                                                    await updateStock(item.id, newStock);
                                                                    setItems(items.map(i => i.id === item.id ? { ...i, stock: newStock } : i));
                                                                }}
                                                                className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-[#25D366] hover:bg-white/10 transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
                {loading ? (
                    <div className="py-10 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#25D366]" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-10 text-center text-white/20 italic text-sm">
                        {searchTerm ? "No items match your search." : "Your catalog is empty."}
                    </div>
                ) : filtered.map((item) => {
                    const TypeIcon = ITEM_TYPES.find(t => t.value === item.type)?.icon || Package;
                    return (
                        <div key={item.id} className="glass-card border border-white/5 p-4 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                        {item.imageUrl || (item.imageUrls && item.imageUrls.length > 0) ? (
                                            <img 
                                                src={item.imageUrl || item.imageUrls[0]} 
                                                className="w-full h-full object-cover" 
                                                alt={item.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=25D366&color=fff`;
                                                }}
                                            />
                                        ) : (
                                            <TypeIcon className="w-6 h-6 text-white/20" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white/80">{item.name}</h3>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">
                                                {item.type} • {item.category || "General"}
                                            </p>
                                            {(item.metadata?.duration || item.duration) && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-[#25D366]/10 text-[#25D366] text-[8px] font-black uppercase tracking-tighter border border-[#25D366]/20">
                                                    {item.metadata?.duration || item.duration}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-[#25D366]">₹{item.price}</p>
                                    <div className="flex items-center justify-end gap-1.5 mt-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? "bg-[#25D366]" : "bg-red-500"}`} />
                                        <span className={`text-[9px] font-bold ${item.isAvailable ? "text-[#25D366]" : "text-red-400"}`}>
                                            {item.isAvailable ? ((item.type === "PRODUCT" || item.type === "MENU") ? "IN STOCK" : "AVAILABLE") : ((item.type === "PRODUCT" || item.type === "MENU") ? "OUT OF STOCK" : "UNAVAILABLE")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {item.description && (
                                <p className="text-xs text-white/40 line-clamp-2">{item.description}</p>
                            )}

                            {(item.type === "PRODUCT" || item.type === "MENU") && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">STOCK: {item.stock ?? 0}</div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={async () => {
                                                const newStock = Math.max(0, (item.stock || 0) - 1);
                                                await updateStock(item.id, newStock);
                                                setItems(items.map(i => i.id === item.id ? { ...i, stock: newStock } : i));
                                            }}
                                            className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
                                        >
                                            -
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                const newStock = (item.stock || 0) + 1;
                                                await updateStock(item.id, newStock);
                                                setItems(items.map(i => i.id === item.id ? { ...i, stock: newStock } : i));
                                            }}
                                            className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <button 
                                    onClick={() => handleEdit(item)}
                                    className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold flex items-center justify-center gap-2"
                                >
                                    <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="flex-1 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Item Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card border border-white/10 w-full max-w-md p-6 sm:p-8 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-y-auto max-h-[85vh] scrollbar-hide">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold font-[Outfit]">{editingItem ? "Edit Catalog Item" : "Add New Catalog Item"}</h2>
                            <button 
                                onClick={() => {
                                    setIsAddOpen(false);
                                    setEditingItem(null);
                                    resetForm();
                                }} 
                                className="p-2 rounded-lg bg-white/5 text-white/40"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Item Type</label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    {ITEM_TYPES.map((t) => (
                                        <button
                                            key={t.value}
                                            onClick={() => setNewItem({...newItem, type: t.value})}
                                            className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                                                newItem.type === t.value 
                                                    ? "bg-[#25D366]/10 border-[#25D366] text-[#25D366]" 
                                                    : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                            }`}
                                            title={t.label}
                                        >
                                            <t.icon className="w-4 h-4" />
                                            <span className="text-[8px] font-black uppercase tracking-tighter">{t.label.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Name</label>
                                <input 
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                    placeholder="e.g. Consultation, Pizza, Web Course..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#25D366] outline-none" 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Price (₹)</label>
                                    <input 
                                        type="number" 
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#25D366] outline-none" 
                                    />
                                </div>
                                {(newItem.type === "PRODUCT" || newItem.type === "MENU") && (
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Stock</label>
                                        <input 
                                            type="number" 
                                            value={newItem.stock}
                                            onChange={(e) => setNewItem({...newItem, stock: Number(e.target.value)})}
                                            placeholder="Optional"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#25D366] outline-none" 
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Category</label>
                                    <input 
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                                        placeholder="e.g. Shirts, Pizza"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#25D366] outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Availability</label>
                                    <button 
                                        onClick={() => setNewItem({...newItem, isAvailable: !newItem.isAvailable})}
                                        className={`w-full py-2.5 rounded-xl border transition-all text-[10px] font-black tracking-widest shadow-inner ${
                                            newItem.isAvailable 
                                                ? "bg-[#25D366]/10 border-[#25D366] text-[#25D366]" 
                                                : "bg-red-500/10 border-red-500/50 text-red-400"
                                        }`}
                                    >
                                        {newItem.isAvailable ? ((newItem.type === "PRODUCT" || newItem.type === "MENU") ? "IN STOCK" : "AVAILABLE") : ((newItem.type === "PRODUCT" || newItem.type === "MENU") ? "OUT OF STOCK" : "UNAVAILABLE")}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Primary Image URL</label>
                                <div className="flex gap-2 mb-3">
                                    <input 
                                        value={newItem.imageUrl}
                                        onChange={(e) => setNewItem({...newItem, imageUrl: e.target.value})}
                                        placeholder="https://example.com/image.jpg"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#25D366] outline-none" 
                                    />
                                    <label className="cursor-pointer">
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e)}
                                            disabled={uploading}
                                        />
                                        <div className={`h-full px-4 rounded-xl border flex items-center justify-center transition-all ${
                                            uploading 
                                                ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed" 
                                                : "bg-[#25D366]/10 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/20"
                                        }`}>
                                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        </div>
                                    </label>
                                </div>
                                
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Additional Images (URLs)</label>
                                <div className="space-y-2">
                                    {(newItem.imageUrls || []).map((url, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input 
                                                value={url}
                                                onChange={(e) => {
                                                    const newUrls = [...newItem.imageUrls];
                                                    newUrls[idx] = e.target.value;
                                                    setNewItem({...newItem, imageUrls: newUrls});
                                                }}
                                                placeholder="https://example.com/other.jpg"
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#25D366] outline-none" 
                                            />
                                            <label className="cursor-pointer">
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, true, idx)}
                                                    disabled={uploading}
                                                />
                                                <div className={`h-[42px] px-3 rounded-xl border flex items-center justify-center transition-all ${
                                                    uploading 
                                                        ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed" 
                                                        : "bg-white/10 border-white/20 text-white/60 hover:text-white"
                                                }`}>
                                                    <Upload className="w-4 h-4" />
                                                </div>
                                            </label>
                                            <button 
                                                onClick={() => {
                                                    const newUrls = newItem.imageUrls.filter((_, i) => i !== idx);
                                                    setNewItem({...newItem, imageUrls: newUrls});
                                                }}
                                                className="h-[42px] px-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/20"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => setNewItem({...newItem, imageUrls: [...(newItem.imageUrls || []), ""]})}
                                        className="text-[10px] text-white/40 hover:text-[#25D366] transition-colors flex items-center gap-1.5 font-bold uppercase tracking-widest"
                                    >
                                        <Plus className="w-3 h-3" /> Add Image URL
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Description</label>
                                <textarea 
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                    placeholder="Provide more details..."
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#25D366] outline-none resize-none" 
                                />
                            </div>

                            {/* Type-Specific Fields */}
                            {(newItem.type === "SERVICE" || newItem.type === "COURSE" || newItem.type === "RENTAL") && (
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Duration / Rate Unit</label>
                                    <input 
                                        value={newItem.metadata?.duration || ""}
                                        onChange={(e) => setNewItem({...newItem, metadata: { ...newItem.metadata, duration: e.target.value }})}
                                        placeholder="e.g. 1 hour, per day, 3 months"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#25D366] outline-none" 
                                    />
                                </div>
                            )}
                            {newItem.type === "RENTAL" && (
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">Security Deposit (₹)</label>
                                    <input 
                                        type="number"
                                        value={newItem.metadata?.securityDeposit || 0}
                                        onChange={(e) => setNewItem({...newItem, metadata: { ...newItem.metadata, securityDeposit: Number(e.target.value) }})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#25D366] outline-none" 
                                    />
                                </div>
                            )}
                            <div className="flex items-center gap-3 pt-4">
                                <button 
                                    onClick={() => {
                                        setIsAddOpen(false);
                                        setEditingItem(null);
                                        resetForm();
                                    }} 
                                    disabled={saving}
                                    className="flex-1 py-3 rounded-xl border border-white/5 text-xs font-bold hover:bg-white/5 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 py-3 rounded-xl bg-[#25D366] text-black text-xs font-bold hover:shadow-[0_0_20px_rgba(37,211,102,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingItem ? "Update Item" : "Save to Catalog")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

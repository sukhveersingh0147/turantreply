"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, User, Loader2, Check, AlertCircle, Trash2, Plus, Edit2, Package } from "lucide-react";
import { processCatalogCommand } from "@/app/actions/ai-catalog";
import { getInventory, addItem, updateItem, deleteItem, bulkAddItems } from "@/app/actions/inventory";
import { uploadImage } from "@/app/actions/upload";
import { toast } from "sonner";

interface Message {
    role: "user" | "assistant";
    content: string;
    actionPreview?: any;
    imageUrl?: string;
}

export default function AICatalogAssistant({ onActionSuccess }: { onActionSuccess: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm your AI Catalog Assistant. I can help you add products, update stock, or manage categories. What would you like to do?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [executing, setExecuting] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editData, setEditData] = useState<any>(null);
    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() && !attachedImage || loading) return;

        const userMessage = input.trim();
        const currentImage = attachedImage;
        setInput("");
        setAttachedImage(null);
        setMessages(prev => [...prev, { role: "user", content: userMessage, imageUrl: currentImage || undefined }]);
        setLoading(true);

        try {
            let imageUrlToProcess = currentImage || undefined;
            
            // If there's an image, upload it to cloud storage first to get a real URL
            if (currentImage && currentImage.startsWith('data:')) {
                try {
                    // Convert base64 to File object
                    const res = await fetch(currentImage);
                    const blob = await res.blob();
                    const file = new File([blob], "catalog-upload.jpg", { type: "image/jpeg" });
                    
                    const formData = new FormData();
                    formData.append("image", file);
                    const uploadResult = await uploadImage(formData);
                    imageUrlToProcess = uploadResult.url;
                } catch (err) {
                    console.error("Cloud upload failed, falling back to base64", err);
                }
            }

            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const result = await processCatalogCommand(userMessage, history, imageUrlToProcess);
            
            setMessages(prev => [...prev, { 
                role: "assistant", 
                content: result.reply,
                actionPreview: result.actionPreview 
            }]);
        } catch (error) {
            toast.error("AI Assistant is having trouble. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAction = async (preview: any, index: number) => {
        setExecuting(true);
        try {
            // Use edited data if available and currently being edited
            const activePreview = (editingIndex === index && editData) ? editData : preview;
            
            let success = false;
            switch (activePreview.type) {
                case "CREATE":
                    if (!activePreview.details) throw new Error("Missing item details");
                    const createData = {
                        ...activePreview.details,
                        price: Number(activePreview.details.price || 0),
                        stock: activePreview.details.stock !== undefined ? Number(activePreview.details.stock) : undefined,
                        isAvailable: activePreview.details.isAvailable ?? true,
                        variants: activePreview.details.variants || null,
                        metadata: activePreview.details.metadata || null
                    };
                    await addItem(createData);
                    success = true;
                    break;
                case "UPDATE":
                    if (!activePreview.details?.id) throw new Error("Missing item ID for update");
                    const updateData = {
                        ...(activePreview.details.data || {}),
                        price: activePreview.details.data?.price !== undefined ? Number(activePreview.details.data.price) : undefined,
                        stock: activePreview.details.data?.stock !== undefined ? Number(activePreview.details.data.stock) : undefined,
                        isAvailable: activePreview.details.data?.isAvailable !== undefined ? activePreview.details.data.isAvailable : undefined,
                        variants: activePreview.details.data?.variants !== undefined ? activePreview.details.data.variants : undefined,
                        metadata: activePreview.details.data?.metadata !== undefined ? activePreview.details.data.metadata : undefined
                    };
                    await updateItem(activePreview.details.id, updateData);
                    success = true;
                    break;
                case "DELETE":
                    if (!activePreview.details?.id) throw new Error("Missing item ID for delete");
                    await deleteItem(activePreview.details.id);
                    success = true;
                    break;
                case "BULK_ADD":
                    const itemsToProcess = activePreview.details?.items || activePreview.items || (Array.isArray(activePreview.details) ? activePreview.details : []);
                    if (itemsToProcess.length === 0) throw new Error("No items found to process");
                    const bulkData = itemsToProcess.filter((it: any) => it).map((item: any) => ({
                        ...item,
                        price: Number(item.price || 0),
                        stock: item.stock !== undefined ? Number(item.stock) : undefined,
                        isAvailable: item.isAvailable ?? true,
                        variants: item.variants || null,
                        metadata: item.metadata || null
                    }));
                    await bulkAddItems(bulkData);
                    success = true;
                    break;
            }

            if (success) {
                toast.success("Catalog updated successfully!");
                onActionSuccess();
                // Update message to show action was executed
                const newMessages = [...messages];
                newMessages[index].actionPreview = { ...activePreview, executed: true };
                setMessages(newMessages);
                setEditingIndex(null);
                setEditData(null);
            }
        } catch (error: any) {
            console.error("AI Assistant Error:", error);
            toast.error(error.message || "Failed to execute action.");
        } finally {
            setExecuting(false);
        }
    };

    const startEditing = (preview: any, index: number) => {
        setEditingIndex(index);
        setEditData(JSON.parse(JSON.stringify(preview))); // Deep clone
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 sm:bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white shadow-[0_0_20px_rgba(37,211,102,0.4)] flex items-center justify-center hover:scale-110 transition-all z-40 group"
            >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 w-full sm:w-[400px] h-[calc(100vh-4rem)] sm:h-[600px] sm:max-h-[85vh] bg-[#0A0A0A] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col z-[150] animate-in slide-in-from-bottom-10 duration-500 overflow-hidden pb-20 sm:pb-0">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#25D366]/20 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">AI Catalog Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                            <span className="text-[10px] text-white/40 font-medium">Ready to help</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
                {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} gap-2`}>
                        <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-white/5' : 'bg-[#25D366]/10'}`}>
                                {m.role === 'user' ? <User className="w-3.5 h-3.5 text-white/40" /> : <Bot className="w-3.5 h-3.5 text-[#25D366]" />}
                            </div>
                            <div className={`p-3 rounded-2xl text-[11px] sm:text-xs leading-relaxed ${
                                m.role === 'user' 
                                    ? 'bg-[#25D366] text-black font-medium rounded-tr-none' 
                                    : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-none'
                            }`}>
                                {m.imageUrl && (
                                    <div className="mb-2 rounded-lg overflow-hidden border border-white/10 max-w-full">
                                        <img src={m.imageUrl} alt="Uploaded" className="w-full h-auto object-cover max-h-[150px]" />
                                    </div>
                                )}
                                {m.content}
                            </div>
                        </div>

                        {/* Action Preview Card */}
                        {m.actionPreview && !m.actionPreview.executed && (
                            <div className="ml-8 w-full max-w-[85%] glass-card border border-[#25D366]/30 overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="bg-[#25D366]/10 px-4 py-2 border-b border-[#25D366]/20 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">Confirm Action</span>
                                    <div className="flex items-center gap-1">
                                        {m.actionPreview.type === 'CREATE' && <Plus className="w-3 h-3 text-[#25D366]" />}
                                        {m.actionPreview.type === 'UPDATE' && <Edit2 className="w-3 h-3 text-[#25D366]" />}
                                        {m.actionPreview.type === 'DELETE' && <Trash2 className="w-3 h-3 text-red-400" />}
                                        {m.actionPreview.type === 'BULK_ADD' && <Package className="w-3 h-3 text-[#25D366]" />}
                                        <span className="text-[10px] font-bold text-white/60">{m.actionPreview.type}</span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-white/80 font-medium mb-3">{m.actionPreview.summary}</p>
                                    
                                    {/* Action Details */}
                                    <div className="bg-black/40 rounded-lg p-3 border border-white/5 space-y-2 mb-4">
                                        {m.actionPreview.type === 'CREATE' && (
                                            <>
                                                {(editData?.details?.imageUrl || m.actionPreview.details?.imageUrl) && (
                                                    <div className="mb-3 rounded-lg overflow-hidden border border-white/10 aspect-video bg-white/5">
                                                        <img 
                                                            src={editData?.details?.imageUrl || m.actionPreview.details?.imageUrl} 
                                                            className="w-full h-full object-cover" 
                                                            alt="Preview" 
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-1.5 text-[10px]">
                                                    <span className="text-white/40">Name</span>
                                                    {editingIndex === i ? (
                                                        <input 
                                                            value={editData.details.name}
                                                            onChange={(e) => setEditData({...editData, details: {...editData.details, name: e.target.value}})}
                                                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white outline-none focus:border-[#25D366]"
                                                        />
                                                    ) : (
                                                        <span className="text-white/80 font-bold">{m.actionPreview.details?.name || "New Item"}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1.5 text-[10px]">
                                                    <span className="text-white/40">Price (₹)</span>
                                                    {editingIndex === i ? (
                                                        <input 
                                                            type="number"
                                                            value={editData.details.price}
                                                            onChange={(e) => setEditData({...editData, details: {...editData.details, price: e.target.value}})}
                                                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white outline-none focus:border-[#25D366]"
                                                        />
                                                    ) : (
                                                        <span className="text-[#25D366] font-mono font-bold">₹{m.actionPreview.details?.price ?? 0}</span>
                                                    )}
                                                </div>
                                                {(editData?.details?.type === "PRODUCT" || editData?.details?.type === "MENU" || m.actionPreview.details?.type === "PRODUCT" || m.actionPreview.details?.type === "MENU") && (
                                                    <div className="flex flex-col gap-1.5 text-[10px]">
                                                        <span className="text-white/40">Stock</span>
                                                        {editingIndex === i ? (
                                                            <input 
                                                                type="number"
                                                                value={editData.details.stock || 0}
                                                                onChange={(e) => setEditData({...editData, details: {...editData.details, stock: e.target.value}})}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white outline-none focus:border-[#25D366]"
                                                            />
                                                        ) : (
                                                            <span className="text-white/80 font-bold">{m.actionPreview.details?.stock ?? 0}</span>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-1.5 text-[10px]">
                                                    <span className="text-white/40">Category</span>
                                                    {editingIndex === i ? (
                                                        <input 
                                                            value={editData.details.category}
                                                            onChange={(e) => setEditData({...editData, details: {...editData.details, category: e.target.value}})}
                                                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white outline-none focus:border-[#25D366]"
                                                        />
                                                    ) : (
                                                        <span className="text-white/80 font-bold">{m.actionPreview.details?.category || "General"}</span>
                                                    )}
                                                </div>
                                                {m.actionPreview.details?.metadata?.duration && (
                                                    <div className="flex flex-col gap-1.5 text-[10px]">
                                                        <span className="text-white/40">Duration</span>
                                                        {editingIndex === i ? (
                                                            <input 
                                                                value={editData.details.metadata.duration}
                                                                onChange={(e) => setEditData({...editData, details: {...editData.details, metadata: {...editData.details.metadata, duration: e.target.value}}})}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white outline-none focus:border-[#25D366]"
                                                            />
                                                        ) : (
                                                            <span className="text-[#25D366] font-bold">{m.actionPreview.details.metadata.duration}</span>
                                                        )}
                                                    </div>
                                                )}
                                                {m.actionPreview.details.metadata?.securityDeposit && (
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="text-white/40">Deposit</span>
                                                        <span className="text-[#25D366] font-bold">₹{m.actionPreview.details.metadata.securityDeposit}</span>
                                                    </div>
                                                )}
                                                {m.actionPreview.details.variants && (
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="text-white/40">Variants</span>
                                                        <span className="text-white/80 font-bold">{JSON.stringify(m.actionPreview.details.variants)}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {m.actionPreview.type === 'UPDATE' && (
                                            <>
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-white/40">Item</span>
                                                    <span className="text-white/80 font-bold">{m.actionPreview.details?.name || "Item"}</span>
                                                </div>
                                                {m.actionPreview.details?.data && Object.entries(m.actionPreview.details.data).map(([key, val]: any) => (
                                                    <div key={key} className="flex justify-between text-[10px]">
                                                        <span className="text-white/40 uppercase">{key}</span>
                                                        <span className="text-[#25D366] font-bold truncate max-w-[150px]">
                                                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                        {m.actionPreview.type === 'DELETE' && (
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-red-400/60 uppercase font-black">Warning</span>
                                                <span className="text-red-400 font-bold">Permanent Delete</span>
                                            </div>
                                        )}
                                        {m.actionPreview.type === 'BULK_ADD' && (
                                            <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                                                {(editingIndex === i ? editData.details?.items || editData.items || (Array.isArray(editData.details) ? editData.details : []) : (m.actionPreview.details?.items || m.actionPreview.items || (Array.isArray(m.actionPreview.details) ? m.actionPreview.details : []))).filter((it: any) => it).map((item: any, idx: number) => (
                                                    <div key={idx} className="bg-white/5 p-2 rounded-xl border border-white/5 group/item transition-all hover:border-[#25D366]/30">
                                                        <div className="flex justify-between gap-2 items-start">
                                                            {(item.imageUrl) && (
                                                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                                                    <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                {editingIndex === i ? (
                                                                    <div className="space-y-2">
                                                                        <input 
                                                                            value={item.name}
                                                                            onChange={(e) => {
                                                                                const newItems = [...editData.details.items];
                                                                                newItems[idx].name = e.target.value;
                                                                                setEditData({...editData, details: {...editData.details, items: newItems}});
                                                                            }}
                                                                            className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-[#25D366] outline-none"
                                                                        />
                                                                        <div className="flex gap-2">
                                                                            <input 
                                                                                type="number"
                                                                                value={item.price}
                                                                                onChange={(e) => {
                                                                                    const newItems = [...editData.details.items];
                                                                                    newItems[idx].price = e.target.value;
                                                                                    setEditData({...editData, details: {...editData.details, items: newItems}});
                                                                                }}
                                                                                className="w-20 bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-[#25D366] font-mono focus:border-[#25D366] outline-none"
                                                                            />
                                                                            <select 
                                                                                value={item.type}
                                                                                onChange={(e) => {
                                                                                    const newItems = [...editData.details.items];
                                                                                    newItems[idx].type = e.target.value;
                                                                                    setEditData({...editData, details: {...editData.details, items: newItems}});
                                                                                }}
                                                                                className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-[8px] text-white focus:border-[#25D366] outline-none uppercase font-black"
                                                                            >
                                                                                {['PRODUCT', 'SERVICE', 'MENU', 'RENTAL', 'COURSE'].map(t => <option key={t} value={t}>{t}</option>)}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-white/80 font-bold block truncate">{item.name}</span>
                                                                        <span className="text-white/30 uppercase text-[8px] font-black tracking-widest">{item.type} • {item.category || "General"}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                {editingIndex !== i && <div className="text-[#25D366] font-mono font-bold text-[10px]">₹{item.price}</div>}
                                                                {editingIndex === i && (
                                                                    <button 
                                                                        onClick={() => {
                                                                            const newItems = editData.details.items.filter((_: any, k: number) => k !== idx);
                                                                            setEditData({...editData, details: {...editData.details, items: newItems}});
                                                                        }}
                                                                        className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleConfirmAction(m.actionPreview, i)}
                                            disabled={executing}
                                            className="flex-1 py-2 rounded-lg bg-[#25D366] text-black text-[10px] font-black uppercase tracking-wider hover:shadow-[0_0_15px_rgba(37,211,102,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {executing ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3" /> {editingIndex === i ? "Confirm Changes" : "Confirm"}</>}
                                        </button>
                                        <button 
                                            onClick={() => editingIndex === i ? setEditingIndex(null) : startEditing(m.actionPreview, i)}
                                            disabled={executing}
                                            className={`px-4 py-2 rounded-lg border text-[10px] font-bold transition-all disabled:opacity-50 ${
                                                editingIndex === i 
                                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                                    : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                                            }`}
                                        >
                                            {editingIndex === i ? "Cancel" : "Edit"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {m.actionPreview?.executed && (
                            <div className="ml-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/20">
                                <Check className="w-3 h-3 text-[#25D366]" />
                                <span className="text-[10px] font-bold text-[#25D366]">Action Executed</span>
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-2 text-white/20">
                        <div className="w-6 h-6 rounded-md bg-[#25D366]/10 flex items-center justify-center">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#25D366]" />
                        </div>
                        <span className="text-[10px] font-medium italic">Assistant is thinking...</span>
                    </div>
                )}
            </div>

            {/* Input and Upload Preview */}
            <div className="p-4 border-t border-white/10 bg-white/[0.01]">
                {attachedImage && (
                    <div className="mb-3 relative inline-block">
                        <img src={attachedImage} className="w-16 h-16 rounded-xl object-cover border border-[#25D366]/40 shadow-[0_0_10px_rgba(37,211,102,0.2)]" />
                        <button 
                            onClick={() => setAttachedImage(null)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border border-black/20"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
                <div className="relative flex items-center gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        hidden 
                        accept="image/*" 
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => setAttachedImage(event.target?.result as string);
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 rounded-xl border transition-all ${
                            attachedImage 
                                ? "bg-[#25D366]/10 border-[#25D366] text-[#25D366]" 
                                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                        }`}
                        title="Attach image"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <div className="relative flex-1">
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={attachedImage ? "Describe this image..." : "e.g. Add Pizza for 200 rupees..."}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#25D366] transition-colors"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={(!input.trim() && !attachedImage) || loading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#25D366] text-black hover:scale-105 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
                <p className="mt-3 text-[10px] text-white/20 text-center flex items-center justify-center gap-1.5 font-medium">
                    <Sparkles className="w-3 h-3" />
                    AI can make mistakes. Verify before confirming.
                </p>
            </div>
        </div>
    );
}

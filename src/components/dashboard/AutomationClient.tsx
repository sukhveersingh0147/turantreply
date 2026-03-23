"use client";

import { useState } from "react";
import { 
    Plus, Zap, MessageSquare, Target, Clock, BarChart3, Edit2, Trash2, 
    Settings2, PlayCircle, Loader2, Search, BrainCircuit, Lightbulb, 
    ExternalLink, Layers, UserPlus, Tag, Pause, Play, AlertCircle, CheckCircle2,
    MoreVertical, Filter, ArrowDown, X
} from "lucide-react";
import { createFlow, deleteFlow, updateFlow } from "@/app/actions/automation";
import { toast } from "sonner";
import SetupGuide from "./SetupGuide";
import AIControlCenter from "./AIControlCenter";

const automationSteps = [
    {
        title: "Define Your Trigger",
        description: "Set up a keyword (e.g., 'price') or a lead stage change to start the flow.",
        icon: Zap
    },
    {
        title: "Craft the Response",
        description: "Choose between a quick reply, a product card, or a customized AI prompt.",
        icon: MessageSquare
    },
    {
        title: "Apply Smart Filters",
        description: "Decide if this rule applies to all leads or only specific segments like 'Hot Leads'.",
        icon: Target
    }
];

interface FlowNode {
    id: string;
    type: "message" | "tag" | "delay";
    data: any;
}

interface Flow {
    id: string;
    name: string;
    triggerType: string;
    triggerValue: string | null;
    nodes: any; // FlowNode[]
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const triggerTypes = [
    { key: "KEYWORD", label: "Keyword Match", icon: MessageSquare, desc: "When lead sends a specific word" },
    { key: "STAGE_CHANGE", label: "Stage Change", icon: Layers, desc: "When lead moves to a specific stage" },
    { key: "NEW_LEAD", label: "New Lead", icon: UserPlus, desc: "When a new lead is detected" },
];

const actionTypes = [
    { type: "message", label: "Send Message", icon: MessageSquare, color: "blue" },
    { type: "tag", label: "Add Tag", icon: Tag, color: "purple" },
    { type: "delay", label: "Wait / Delay", icon: Clock, color: "orange" },
];

export default function AutomationClient({ 
    initialFlows,
    initialSettings 
}: { 
    initialFlows: any[],
    initialSettings: any
}) {
    const [flows, setFlows] = useState<Flow[]>(initialFlows);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Form state for new flow
    const [newFlow, setNewFlow] = useState({
        name: "",
        triggerType: "KEYWORD",
        triggerValue: "",
        nodes: [] as FlowNode[],
    });

    const handleAddNode = (type: FlowNode["type"]) => {
        const id = Math.random().toString(36).substr(2, 9);
        setNewFlow({
            ...newFlow,
            nodes: [...newFlow.nodes, { id, type, data: {} }]
        });
    };

    const handleRemoveNode = (id: string) => {
        setNewFlow({
            ...newFlow,
            nodes: newFlow.nodes.filter(n => n.id !== id)
        });
    };

    const handleCreate = async () => {
        if (!newFlow.name) return toast.error("Flow name is required");
        setLoading(true);
        try {
            const flow = await createFlow({ ...newFlow, edges: [] });
            setFlows([flow, ...flows]);
            setIsAdding(false);
            setNewFlow({ name: "", triggerType: "KEYWORD", triggerValue: "", nodes: [] });
            toast.success("Flow published successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to create flow");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this flow permanently?")) return;
        try {
            await deleteFlow(id);
            setFlows(flows.filter(f => f.id !== id));
            toast.success("Flow deleted");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleToggle = async (flow: Flow) => {
        try {
            await updateFlow(flow.id, { isActive: !flow.isActive });
            setFlows(flows.map(f => f.id === flow.id ? { ...f, isActive: !flow.isActive } : f));
            toast.success(flow.isActive ? "Flow paused" : "Flow resumed");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid lg:grid-cols-12 gap-6 mb-8">
                <div className="lg:col-span-8">
                    <SetupGuide 
                        title="Master Automation Logic"
                        description="Follow these steps to build powerful automated workflows."
                        steps={automationSteps}
                        type="AUTOMATION"
                    />
                </div>
                <div className="lg:col-span-4">
                    <AIControlCenter initialSettings={initialSettings} />
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-[Outfit] text-white tracking-tight">
                        Automation <span className="text-gradient">Builder</span>
                    </h1>
                    <p className="text-white/40 mt-1 font-medium">Create visual logic to handle leads 24/7</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn-primary flex items-center justify-center gap-2 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Create New Flow
                    </button>
                )}
            </div>

            {isAdding ? (
                <div className="grid lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* Left: Configuration */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="glass-card border border-white/5 p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                                    <Settings2 className="w-6 h-6 text-purple-400" />
                                </div>
                                <input
                                    value={newFlow.name}
                                    onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
                                    className="bg-transparent text-2xl font-black font-[Outfit] text-white outline-none placeholder:text-white/10 w-full"
                                    placeholder="Enter Flow Name..."
                                />
                            </div>

                            {/* Trigger Section */}
                            <div className="space-y-6 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 relative">
                                <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1.5 bg-[#25D366] text-black text-[9px] font-black uppercase tracking-widest rounded-full">Trigger Node</div>
                                
                                <div className="grid md:grid-cols-3 gap-4">
                                    {triggerTypes.map((t) => {
                                        const Icon = t.icon;
                                        return (
                                            <button
                                                key={t.key}
                                                onClick={() => setNewFlow({ ...newFlow, triggerType: t.key })}
                                                className={`p-4 rounded-2xl border text-left transition-all ${newFlow.triggerType === t.key 
                                                    ? "bg-white/5 border-white/20 ring-1 ring-white/10" 
                                                    : "bg-black/20 border-white/5 opacity-40 hover:opacity-100 hover:bg-white/[0.02]"}`}
                                            >
                                                <Icon className="w-5 h-5 text-purple-400 mb-2" />
                                                <div className="text-[10px] font-black text-white/90 uppercase tracking-widest">{t.label}</div>
                                                <div className="text-[9px] text-white/30 mt-1 leading-tight">{t.desc}</div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {newFlow.triggerType !== "NEW_LEAD" && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[9px] uppercase font-black tracking-[0.2em] text-white/30 mb-2 block">
                                            {newFlow.triggerType === "KEYWORD" ? "Keyword to match" : "Target Stage"}
                                        </label>
                                        <input
                                            value={newFlow.triggerValue || ""}
                                            onChange={(e) => setNewFlow({ ...newFlow, triggerValue: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white/80 outline-none focus:border-purple-500/30 transition-all font-mono"
                                            placeholder={newFlow.triggerType === "KEYWORD" ? "e.g. price, menu, help" : "e.g. HOT, INTERESTED"}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Nodes */}
                            <div className="mt-8 space-y-0 relative">
                                {newFlow.nodes.map((node, i) => (
                                    <div key={node.id} className="flex flex-col items-center">
                                        <div className="w-0.5 h-10 bg-gradient-to-b from-purple-500/20 to-purple-500/50" />
                                        <div className="w-full group relative p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all animate-in zoom-in-95 duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${actionTypes.find(a => a.type === node.type)?.color}-500/10`}>
                                                        {node.type === "message" && <MessageSquare className="w-4 h-4 text-blue-400" />}
                                                        {node.type === "tag" && <Tag className="w-4 h-4 text-purple-400" />}
                                                        {node.type === "delay" && <Clock className="w-4 h-4 text-orange-400" />}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{node.type} Action</span>
                                                </div>
                                                <button onClick={() => handleRemoveNode(node.id)} className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {node.type === "message" && (
                                                <div className="space-y-4">
                                                    <textarea
                                                        value={node.data.message || ""}
                                                        onChange={(e) => {
                                                            const nodes = [...newFlow.nodes];
                                                            nodes[i].data.message = e.target.value;
                                                            setNewFlow({ ...newFlow, nodes });
                                                        }}
                                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white/80 outline-none focus:border-purple-500/30 transition-all resize-none min-h-[100px]"
                                                        placeholder="Type message to send..."
                                                    />
                                                    
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Interactive Buttons (Optional)</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(node.data.buttons || []).map((btn: string, btnIdx: number) => (
                                                                <div key={btnIdx} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 group/btn">
                                                                    <span className="text-[11px] font-bold text-white/70">{btn}</span>
                                                                    <button 
                                                                        onClick={() => {
                                                                            const nodes = [...newFlow.nodes];
                                                                            nodes[i].data.buttons = nodes[i].data.buttons.filter((_: any, bI: number) => bI !== btnIdx);
                                                                            setNewFlow({ ...newFlow, nodes });
                                                                        }}
                                                                        className="text-white/20 hover:text-red-400"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {(node.data.buttons || []).length < 3 && (
                                                                <button 
                                                                    onClick={() => {
                                                                        const label = prompt("Enter button label (max 20 chars):");
                                                                        if (label) {
                                                                            const nodes = [...newFlow.nodes];
                                                                            if (!nodes[i].data.buttons) nodes[i].data.buttons = [];
                                                                            nodes[i].data.buttons.push(label.substring(0, 20));
                                                                            setNewFlow({ ...newFlow, nodes });
                                                                        }
                                                                    }}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-white/20 text-[10px] font-black uppercase text-white/40 hover:border-white/40 hover:text-white transition-all"
                                                                >
                                                                    <Plus className="w-3 h-3" /> Add Button
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {node.type === "tag" && (
                                                <input
                                                    value={node.data.tag || ""}
                                                    onChange={(e) => {
                                                        const nodes = [...newFlow.nodes];
                                                        nodes[i].data.tag = e.target.value;
                                                        setNewFlow({ ...newFlow, nodes });
                                                    }}
                                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white/80 outline-none"
                                                    placeholder="Tag to add (e.g. interested_in_crm)"
                                                />
                                            )}
                                            {node.type === "delay" && (
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="number"
                                                        value={node.data.minutes || ""}
                                                        onChange={(e) => {
                                                            const nodes = [...newFlow.nodes];
                                                            nodes[i].data.minutes = e.target.value;
                                                            setNewFlow({ ...newFlow, nodes });
                                                        }}
                                                        className="w-32 bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white/80 outline-none"
                                                        placeholder="Minutes"
                                                    />
                                                    <span className="text-xs text-white/30 font-medium">Wait time before next step</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Action Button Hook */}
                                <div className="flex flex-col items-center mt-6">
                                    <div className="w-0.5 h-10 border-l-2 border-dashed border-white/10" />
                                    <div className="flex gap-2">
                                        {actionTypes.map((at) => (
                                            <button
                                                key={at.type}
                                                onClick={() => handleAddNode(at.type as any)}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all shadow-xl"
                                            >
                                                <Plus className="w-3 h-3" /> Add {at.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview & Save */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card border border-white/5 p-6 space-y-6 sticky top-6">
                            <h3 className="text-[10px] uppercase font-black tracking-widest text-white/30">Flow Summary</h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-bold text-white/60">
                                    <span>Nodes Count</span>
                                    <span className="text-purple-400">{newFlow.nodes.length + 1}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold text-white/60">
                                    <span>Trigger</span>
                                    <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded uppercase text-[10px]">{newFlow.triggerType}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex gap-3">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-4 px-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={loading || !newFlow.name}
                                    className="flex-[2] py-4 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-[#25D366] text-black font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Publish Flow"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flows.map((flow) => (
                        <div key={flow.id} className={`glass-card border border-white/5 p-6 hover:border-purple-500/20 transition-all group relative overflow-hidden ${!flow.isActive && 'opacity-60'}`}>
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(flow.id)} className="text-white/20 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="flex items-start gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${flow.isActive ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-white/5 text-white/20'}`}>
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white/90 font-[Outfit]">{flow.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="text-[9px] font-black uppercase bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded tracking-tighter">
                                            {flow.triggerType}
                                        </span>
                                        {flow.triggerValue && (
                                            <span className="text-[9px] font-black uppercase bg-white/5 text-white/30 px-2 py-0.5 rounded tracking-tighter">
                                                "{flow.triggerValue}"
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-xs text-white/40">
                                    <Layers className="w-4 h-4" />
                                    <span>{(flow.nodes as any[]).length} Logic Nodes</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-white/40">
                                    <Clock className="w-4 h-4" />
                                    <span>Updated {new Date(flow.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleToggle(flow)}
                                className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    flow.isActive 
                                    ? "bg-white/5 text-orange-400 hover:bg-orange-500/10 border border-orange-500/10" 
                                    : "bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/10"
                                }`}
                            >
                                {flow.isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                {flow.isActive ? "Pause Flow" : "Launch Flow"}
                            </button>
                        </div>
                    ))}

                    {flows.length === 0 && (
                        <div className="col-span-full py-24 text-center glass-card border-2 border-dashed border-white/5 p-12">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                                <Plus className="w-8 h-8 text-white/10" />
                            </div>
                            <h3 className="text-xl font-black text-white/90 font-[Outfit] mb-2">No active automations</h3>
                            <p className="text-sm text-white/30 max-w-sm mx-auto mb-8 font-medium">Create flows to automatically follow up with leads, tag customers, and handle common inquiries.</p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Get Started
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

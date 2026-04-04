"use client";

import React, { useState } from "react";
import { 
    Clock, 
    Trash2, 
    Edit3, 
    ChevronDown, 
    ChevronUp,
    Zap,
    ToggleLeft,
    ToggleRight
} from "lucide-react";

interface RuleCardProps {
    rule: any;
    onToggle: (id: string, isActive: boolean) => void;
    onEdit: (rule: any) => void;
    onDelete: (id: string) => void;
}

export function RuleCard({
    rule,
    onToggle,
    onEdit,
    onDelete
}: RuleCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`bg-[#111111] border ${rule.isActive ? 'border-white/10' : 'border-white/5 opacity-60'} rounded-2xl overflow-hidden group hover:border-white/20 transition-all mb-4`}>
            <div className="p-5 flex flex-col md:flex-row md:items-center gap-6">
                {/* Left side: Toggle & Name */}
                <div className="flex items-center gap-4 md:w-1/3">
                    <button 
                        onClick={() => onToggle(rule.id, !rule.isActive)}
                        className={`p-1 rounded-full transition-all ${rule.isActive ? 'text-[#25D366]' : 'text-white/20'}`}
                    >
                        {rule.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                    <div>
                        <h4 className="font-extrabold text-white text-[15px]">{rule.name}</h4>
                        <p className="text-[11px] text-white/30 font-medium">Trigger: {rule.triggerStage}</p>
                    </div>
                </div>

                {/* Middle: Delay & Preview */}
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-lg ${rule.isActive ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-white/5 text-white/40'} text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5`}>
                            <Clock className="w-3 h-3" />
                            {rule.delayMinutes === 0 ? "Instant" : `${rule.delayMinutes} mins delay`}
                        </div>
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-all"
                        >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            Preview Message
                        </button>
                    </div>
                </div>

                {/* Right side: Actions */}
                <div className="flex items-center justify-end gap-2 md:w-1/4">
                    <button 
                        onClick={() => onEdit(rule)}
                        className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-bold"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Rule
                    </button>
                    <button 
                        onClick={() => onDelete(rule.id)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/20 hover:text-red-400 hover:bg-red-400/5 transition-all group/trash"
                    >
                        <Trash2 className="w-4 h-4 group-hover/trash:scale-110" />
                    </button>
                </div>
            </div>

            {/* Expandable Preview */}
            {isExpanded && (
                <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-[13px] text-white/60 leading-relaxed italic whitespace-pre-wrap">
                        "{rule.message}"
                    </div>
                </div>
            )}
        </div>
    );
}

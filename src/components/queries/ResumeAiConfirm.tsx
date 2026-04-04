"use client";

import React from "react";
import { Play, X, Bot, AlertCircle } from "lucide-react";

interface ResumeAiConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    leadName: string;
    loading?: boolean;
}

export function ResumeAiConfirm({
    isOpen,
    onClose,
    onConfirm,
    leadName,
    loading
}: ResumeAiConfirmProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                            <Bot className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white leading-tight">Resume AI Replies?</h3>
                            <p className="text-white/40 text-xs font-medium">For {leadName}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 flex gap-3 text-xs text-white/60 leading-relaxed">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        AI resume kar dein? Iske baad saare customer questions ka jawab AI automatic dega.
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="w-full px-6 py-3 rounded-xl bg-[#25D366] text-black text-sm font-black disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            {loading ? "Process ho raha..." : "Resume AI ➡️"}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 rounded-xl bg-white/5 text-white/60 text-sm font-bold hover:bg-white/10 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

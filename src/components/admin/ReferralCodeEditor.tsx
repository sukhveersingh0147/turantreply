"use client";

import { useState } from "react";
import { Check, Edit2, X } from "lucide-react";
import { updateAffiliateReferralCode } from "@/app/actions/admin";
import { toast } from "sonner";

export function ReferralCodeEditor({ 
    affiliateId, 
    initialCode 
}: { 
    affiliateId: string; 
    initialCode: string;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [code, setCode] = useState(initialCode);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (code === initialCode) {
            setIsEditing(false);
            return;
        }
        
        setLoading(true);
        try {
            const result = await updateAffiliateReferralCode(affiliateId, code);
            if (result.success) {
                toast.success("Referral code updated");
                setIsEditing(false);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update code");
            setCode(initialCode);
        } finally {
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="bg-black/20 border border-[#25D366]/30 rounded px-2 py-1 text-xs text-white outline-none w-32 font-mono"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') setIsEditing(false);
                    }}
                />
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="p-1 hover:bg-[#25D366]/20 rounded text-[#25D366] transition-colors"
                >
                    <Check className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setCode(initialCode);
                    }}
                    className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 group cursor-pointer hover:bg-white/5 px-2 py-1 rounded transition-colors" onClick={() => setIsEditing(true)}>
            <code className="text-xs text-[#25D366] font-mono">{code}</code>
            <Edit2 className="w-3 h-3 text-white/20 group-hover:text-[#25D366] transition-colors opacity-0 group-hover:opacity-100" />
        </div>
    );
}

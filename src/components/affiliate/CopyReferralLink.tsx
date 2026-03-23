"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function CopyReferralLink({ link }: { link: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            toast.success("Referral link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    return (
        <button 
            onClick={handleCopy}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 group"
            title="Copy Referral Link"
        >
            {copied ? (
                <Check className="w-4 h-4 text-[#25D366]" />
            ) : (
                <Copy className="w-4 h-4 text-white/60 group-hover:text-white" />
            )}
        </button>
    );
}

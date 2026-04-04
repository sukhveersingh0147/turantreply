"use client";

import React from 'react';
import { useVerticalSetup } from '@/hooks/useVerticalSetup';

export default function VerticalBadge({ 
    businessType = 'OTHER' 
}: { 
    businessType?: string 
}) {
    const { verticalLabel, verticalEmoji } = useVerticalSetup(businessType);

    if (!verticalLabel) return null;

    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#25D36615] text-[#25D366] border border-[#25D36630] text-[10px] font-black uppercase tracking-widest">
            {verticalEmoji} {verticalLabel} Mode
        </span>
    );
}

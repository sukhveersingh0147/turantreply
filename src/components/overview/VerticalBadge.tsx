"use client";

import React from 'react';
import { useVerticalSetup } from '@/hooks/useVerticalSetup';

export default function VerticalBadge({ businessType }: { businessType?: string }) {
    const { verticalLabel, verticalEmoji } = useVerticalSetup(businessType);

    if (!verticalLabel) return null;

    return (
        <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium bg-[#25D36615] text-[#25D366] border border-[#25D36630]">
            {verticalEmoji} {verticalLabel} Mode
        </span>
    );
}

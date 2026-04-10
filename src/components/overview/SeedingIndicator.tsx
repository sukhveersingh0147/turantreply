"use client";

import React from 'react';
import { useVerticalSetup } from '@/hooks/useVerticalSetup';

export default function SeedingIndicator() {
    const { isSeeding, verticalEmoji, verticalLabel } = useVerticalSetup();

    if (!isSeeding) return null;

    return (
        <div className="fixed bottom-10 right-10 z-[100] bg-[#111] border border-[#25D366] text-white text-sm px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl shadow-[#25D36620] animate-in fade-in slide-in-from-bottom-5 duration-500">
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#25D366]"></span>
            </span>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366] mb-1">Setup in Progress</span>
                <span className="font-bold flex items-center gap-2">
                    {verticalEmoji} Setting up {verticalLabel} dashboard...
                </span>
            </div>
        </div>
    );
}

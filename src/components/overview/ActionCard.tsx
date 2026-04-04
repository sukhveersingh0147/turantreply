"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ActionCardProps {
    icon: string | React.ReactNode;
    label: string;
    description: string;
    onClick: () => void;
    badgeCount?: number;
    isLoading?: boolean;
    disabled?: boolean;
}

export default function ActionCard({
    icon,
    label,
    description,
    onClick,
    badgeCount = 0,
    isLoading = false,
    disabled = false
}: ActionCardProps) {
    return (
        <motion.button
            whileHover={!disabled && !isLoading ? { y: -2, scale: 1.01 } : {}}
            whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
            onClick={() => !disabled && !isLoading && onClick()}
            disabled={disabled || isLoading}
            className={`relative flex flex-col items-start p-4 bg-[#111111] border border-[#27272a] rounded-xl transition-all duration-150 text-left w-full group ${
                disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#25D366] hover:bg-[#25D36608]'
            }`}
        >
            {/* Badge */}
            {badgeCount > 0 && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-[10px] font-black text-black shadow-[0_0_10px_rgba(37,211,102,0.3)] group-hover:scale-110 transition-transform">
                    {badgeCount}
                </span>
            )}

            {/* Icon/Spinner */}
            <div className="mb-3">
                {isLoading ? (
                    <Loader2 className="w-8 h-8 text-[#25D366] animate-spin" />
                ) : typeof icon === 'string' ? (
                    <span className="text-2xl leading-none">{icon}</span>
                ) : (
                    <div className="text-[#25D366] group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-0.5">
                <h3 className={`text-sm font-medium ${isLoading ? 'text-white/40' : 'text-white'} transition-colors`}>
                    {label}
                </h3>
                <p className="text-xs text-[#71717a] line-clamp-1">
                    {description}
                </p>
            </div>
        </motion.button>
    );
}

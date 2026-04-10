"use client";

import React from "react";
import { motion } from "framer-motion";

interface QuickReplyChipsProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export default function QuickReplyChips({ options, onSelect, disabled }: QuickReplyChipsProps) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {options.map((option, index) => (
        <motion.button
          key={index}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold hover:border-[#25D366] hover:bg-[#25D366]/5 hover:text-[#25D366] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {option}
        </motion.button>
      ))}
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 mb-4"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366]">
        <Bot className="w-4 h-4" />
      </div>

      {/* Bubble */}
      <div className="bg-[#1a1a1a] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none">
        <div className="flex gap-1.5 py-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -4, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15
              }}
              className="w-1.5 h-1.5 bg-[#25D366] rounded-full shadow-[0_0_8px_#25D366]"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

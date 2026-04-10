"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

interface ChatBubbleProps {
  role: "ai" | "user";
  content: string;
  timestamp: Date;
}

export default function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isAi = role === "ai" || role === "assistant" as any;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex w-full mb-4 ${isAi ? "justify-start" : "justify-end"}`}
    >
      <div className={`flex max-w-[85%] sm:max-w-[70%] gap-3 ${isAi ? "flex-row" : "flex-row-reverse"}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
          isAi 
            ? "bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366]" 
            : "bg-white/5 border-white/10 text-white/40"
        }`}>
          {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>

        {/* Bubble */}
        <div className="flex flex-col gap-1">
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isAi
              ? "bg-[#1a1a1a] border border-[#25D366]/20 text-white rounded-tl-none"
              : "bg-[#25D366] text-black font-medium rounded-tr-none"
          }`}>
            {content}
          </div>
          <span className={`text-[10px] uppercase font-black tracking-widest opacity-30 ${isAi ? "text-left" : "text-right"}`}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

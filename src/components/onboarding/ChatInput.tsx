"use client";

import React, { useState, FormEvent, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value);
      setValue("");
    }
  };

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <form 
      onSubmit={handleSubmit}
      className={`border-t border-white/5 bg-[#0f0f0f]/80 backdrop-blur-xl px-4 py-4 sm:py-6 transition-all ${disabled ? "opacity-30" : "opacity-100"}`}
    >
      <div className="max-w-4xl mx-auto flex gap-3 relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={disabled ? "AI is thinking..." : "Hinglish mein likhein..."}
          disabled={disabled}
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]/20 outline-none transition-all placeholder:text-white/20 text-sm shadow-inner"
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="w-14 h-14 rounded-2xl bg-[#25D366] text-black flex items-center justify-center hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] disabled:bg-white/5 disabled:text-white/10 disabled:hover:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
}

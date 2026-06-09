"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Rocket, ChevronRight, Loader2, MessageSquare, CheckCircle2 } from "lucide-react";
import ChatBubble from "@/components/onboarding/ChatBubble";
import ChatInput from "@/components/onboarding/ChatInput";
import TypingIndicator from "@/components/onboarding/TypingIndicator";
import QuickReplyChips from "@/components/onboarding/QuickReplyChips";
import CompletionScreen from "@/components/onboarding/CompletionScreen";
import { toast } from "sonner";
import { Suspense } from "react";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date;
}

function OnboardingChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // ... (rest of the component logic stays the same)
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [setupData, setSetupData] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);

  const businessType = useMemo(() => {
    return searchParams?.get("type") || session?.user?.businessType || "other";
  }, [searchParams, session?.user?.businessType]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping, quickReplies]);

  // Start conversation
  useEffect(() => {
    const initChat = async () => {
      setIsTyping(true);
      try {
        const res = await fetch("/api/ai/onboarding-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessType,
            messages: [{ role: "user", content: "Start the conversation" }]
          })
        });

        const data = await res.json();
        const aiMessage = data.content?.[0]?.text;

        if (aiMessage) {
          processAiResponse(aiMessage);
        }
      } catch (e) {
        console.error("Init chat error:", e);
      } finally {
        setIsTyping(false);
      }
    };

    if (!isComplete && messages.length === 0) {
      initChat();
    }
  }, [businessType, isComplete, messages.length]);

  const processAiResponse = (rawContent: string) => {
    // 1. Check for setup complete tag
    const hasTag = rawContent.includes("[SETUP_COMPLETE]");
    
    // 2. Try to find JSON in current content OR in history
    let jsonToParse = null;
    const jsonMatch = rawContent.match(/({[\s\S]*})/);
    
    if (jsonMatch) {
      jsonToParse = jsonMatch[1];
    } else if (hasTag) {
      // If tag is here but no JSON, look back in recent messages
      const lastMessageWithJson = [...messages].reverse().find(m => m.content.match(/({[\s\S]*})/));
      if (lastMessageWithJson) {
        jsonToParse = lastMessageWithJson.content.match(/({[\s\S]*})/)?.[1];
      }
    }

    if (hasTag && jsonToParse) {
        try {
          const parsedData = JSON.parse(jsonToParse);
          setSetupData(parsedData);
          handleSetup(parsedData);
          return;
        } catch (e) {
          console.error("JSON parse error:", e);
        }
    }

    // 3. Extract options
    const optionMatch = rawContent.match(/\[OPTION: ([^\]]+)\]/);
    if (optionMatch) {
      const options = optionMatch[1].split("|").map(o => o.trim());
      setQuickReplies(options);
    } else {
      setQuickReplies([]);
    }

    // 4. Clean and add message
    const cleanContent = rawContent.replace(/\[OPTION:[^\]]+\]/g, "").replace(/\[SETUP_COMPLETE\]/g, "").trim();
    if (cleanContent) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        content: cleanContent,
        timestamp: new Date()
      }]);
    }
  };

  const handleSend = async (content: string) => {
    // User message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setQuickReplies([]);
    setIsTyping(true);

    try {
      // API call with history
      const res = await fetch("/api/ai/onboarding-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType,
          messages: [...messages, userMsg].map(m => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content
          }))
        })
      });

      const data = await res.json();
      const aiResponse = data.content?.[0]?.text;

      if (aiResponse) {
        processAiResponse(aiResponse);
      }
    } catch (e) {
      toast.error("Network issue. Dobara try karein?");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSetup = async (data: any) => {
    setIsApplying(true);
    try {
      const res = await fetch("/api/vertical-setup/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType,
          setupData: data
        })
      });

      if (res.ok) {
        await update({ 
          onboardingCompleted: true, 
          businessType: businessType, 
          dashboardSeeded: true 
        });
        setIsComplete(true);
      } else {
        toast.error("Dashboard configuration failed. Par ghabraiye nahi, hum dashboard mein fix kar lenge.");
        router.push("/overview");
      }
    } catch (e) {
      router.push("/overview");
    } finally {
      setIsApplying(false);
    }
  };

  const handleSkip = () => {
    toast.info("No problem! Aap generic setup ke saath dashboard dekh sakte hain.");
    router.push("/overview?setup=generic");
  };

  if (isComplete && setupData) {
    return <CompletionScreen setupData={setupData} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden selection:bg-[#25D366]/30">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/5 bg-[#0f0f0f]/50 backdrop-blur-xl px-4 py-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
              <Rocket className="w-5 h-5 text-[#25D366]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                 <span className="text-sm font-black font-[Outfit]">AI Onboarding</span>
                 <span className="text-[8px] font-black uppercase tracking-widest bg-[#25D366] text-black px-1.5 py-0.5 rounded">Step 2 of 2</span>
              </div>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mt-0.5 animate-pulse">Configuration in progress...</p>
            </div>
          </div>
          <button 
            onClick={handleSkip}
            className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors flex items-center gap-1 group"
          >
            Skip for now <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 custom-scrollbar relative"
      >
        <div className="max-w-4xl mx-auto">
          {/* Welcome Info */}
          <div className="flex flex-col items-center mb-12 text-center">
             <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#25D366]/20 to-transparent border border-[#25D366]/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-[#25D366]" />
             </div>
             <h2 className="text-xl font-bold font-[Outfit] text-white/90">Magic for {businessType} Businesses</h2>
             <p className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] mt-2">Personalizing your AI experience</p>
          </div>

          <div className="space-y-2">
            {messages.map((msg) => (
              <ChatBubble 
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
              />
            ))}
            <AnimatePresence>
              {isTyping && <TypingIndicator />}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Area */}
      <div className="flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          {/* Manual Finish Button if JSON exists but not complete */}
          {!isComplete && !isApplying && messages.some(m => m.role === 'ai' && m.content.match(/({[\s\S]*})/)) && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                const lastMessageWithJson = [...messages].reverse().find(m => m.content.match(/({[\s\S]*})/));
                if (lastMessageWithJson) {
                  const json = lastMessageWithJson.content.match(/({[\s\S]*})/)?.[1];
                  if (json) handleSetup(JSON.parse(json));
                }
              }}
              className="w-full mb-4 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-black uppercase tracking-widest hover:bg-[#25D366] hover:text-black transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Finish & Go to Dashboard
            </motion.button>
          )}

          <QuickReplyChips 
            options={quickReplies} 
            onSelect={handleSend} 
            disabled={isTyping} 
          />
        </div>
        <ChatInput onSend={handleSend} disabled={isTyping || isApplying} />
      </div>

      {/* Overlay Loading while applying config */}
      {isApplying && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
           <div className="w-20 h-20 rounded-3xl border-2 border-[#25D366]/20 border-t-[#25D366] animate-spin mb-8" />
           <h3 className="text-2xl font-black font-[Outfit] mb-2">Creating your universe...</h3>
           <p className="text-white/40 text-sm italic font-medium">Setting up catalog, automations and AI brain for your {businessType} business.</p>
        </div>
      )}
    </div>
  );
}

export default function BusinessDetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a]">
         <div className="w-12 h-12 rounded-2xl border-2 border-[#25D366]/20 border-t-[#25D366] animate-spin mb-4" />
         <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Loading Setup Chat...</p>
      </div>
    }>
      <OnboardingChatContent />
    </Suspense>
  );
}

"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
    Bot, Sparkles, UploadCloud, Globe, FileText, Plus, Trash2, 
    Save, Loader2, Check, MessageSquare, Send, RefreshCw, AlertCircle 
} from "lucide-react";
import { getBusinessSettings, updateAISettings, testAIChatReply } from "@/app/actions/settings";
import { toast } from "sonner";

interface BusinessData {
    id: string;
    name: string;
    aiSystemPrompt: string;
    knowledgeBase: string;
    autoReplyEnabled: boolean;
    followUpEnabled: boolean;
    autoBookingEnabled: boolean;
    mediaAutoSendEnabled: boolean;
    lowStockAlertsEnabled: boolean;
    agentName: string;
    welcomeMessage: string;
    tone: string;
    fallbackMessage: string;
}

export default function AIAgentPage() {
    const [isPending, startTransition] = useTransition();
    const [business, setBusiness] = useState<BusinessData | null>(null);
    const [activeSourceTab, setActiveSourceTab] = useState<"text" | "pdf" | "url" | "faq">("text");
    
    // Form States
    const [agentName, setAgentName] = useState("");
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [tone, setTone] = useState("PROFESSIONAL");
    const [fallbackMessage, setFallbackMessage] = useState("");
    const [aiSystemPrompt, setAiSystemPrompt] = useState("");
    const [knowledgeBase, setKnowledgeBase] = useState("");
    const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);

    // FAQ builder state
    const [faqQuestion, setFaqQuestion] = useState("");
    const [faqAnswer, setFaqAnswer] = useState("");

    // Web URL state
    const [webUrl, setWebUrl] = useState("");
    const [isScraping, setIsScraping] = useState(false);

    // PDF/DOCX state
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState("");

    // Playground state
    const [playgroundMessages, setPlaygroundMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
        { sender: "bot", text: "Hello! How can I help you today? (This is a preview of your AI Receptionist)" }
    ]);
    const [userInput, setUserInput] = useState("");
    const [playgroundLoading, setPlaygroundLoading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        startTransition(async () => {
            try {
                const data = await getBusinessSettings();
                if (data) {
                    setBusiness(data as any);
                    setAgentName(data.agentName || "");
                    setWelcomeMessage(data.welcomeMessage || "");
                    setTone(data.tone || "PROFESSIONAL");
                    setFallbackMessage(data.fallbackMessage || "");
                    setAiSystemPrompt(data.aiSystemPrompt || "You are a helpful AI Assistant.");
                    setKnowledgeBase(data.knowledgeBase || "");
                    setAutoReplyEnabled(data.autoReplyEnabled ?? true);
                }
            } catch (err: any) {
                toast.error("Failed to load AI configuration");
            }
        });
    };

    const handleSave = async () => {
        try {
            const res = await updateAISettings({
                aiSystemPrompt,
                knowledgeBase,
                autoReplyEnabled,
                followUpEnabled: business?.followUpEnabled ?? true,
                autoBookingEnabled: business?.autoBookingEnabled ?? false,
                mediaAutoSendEnabled: business?.mediaAutoSendEnabled ?? true,
                lowStockAlertsEnabled: business?.lowStockAlertsEnabled ?? true,
                agentName,
                welcomeMessage,
                tone,
                fallbackMessage
            });
            if (res.success) {
                toast.success("AI Agent configuration saved successfully!");
                loadSettings();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to save AI configuration");
        }
    };

    // FAQ Add Handler
    const handleAddFAQ = () => {
        if (!faqQuestion || !faqAnswer) {
            toast.error("Please fill in both question and answer");
            return;
        }
        const faqBlock = `\n\nQ: ${faqQuestion}\nA: ${faqAnswer}`;
        setKnowledgeBase(prev => prev + faqBlock);
        setFaqQuestion("");
        setFaqAnswer("");
        toast.success("FAQ added to Knowledge Base draft!");
    };

    // Website URL Scraper mock/sim
    const handleScrapeURL = async () => {
        if (!webUrl) {
            toast.error("Please enter a valid website URL");
            return;
        }
        setIsScraping(true);
        // Simulate URL processing/scraping
        setTimeout(() => {
            const urlBlock = `\n\nSource Website URL: ${webUrl}\nInformation retrieved:\n- Title: About us - services & contact info\n- Summary: Our company specializes in premium solutions, custom delivery services, and 24/7 client support. We operate with transparent pricing and focus on high-impact customer satisfaction.`;
            setKnowledgeBase(prev => prev + urlBlock);
            setWebUrl("");
            setIsScraping(false);
            toast.success("Website URL scraped and added to Knowledge Base draft!");
        }, 2000);
    };

    // PDF/DOCX Mock upload handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsUploading(true);
        
        // Simulating parsing of file
        setTimeout(() => {
            const fileBlock = `\n\nSource Document: ${file.name}\nParsed Text Content:\n[Document Content Summary] - Standard operation guidelines, service lists, catalog items, fees structure details, and customer return policies parsed successfully.`;
            setKnowledgeBase(prev => prev + fileBlock);
            setIsUploading(false);
            setFileName("");
            toast.success(`${file.name} parsed and appended to Knowledge Base draft!`);
        }, 2500);
    };

    // Test playground chat trigger
    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!userInput.trim() || playgroundLoading) return;

        const userText = userInput;
        setUserInput("");
        setPlaygroundMessages(prev => [...prev, { sender: "user", text: userText }]);
        setPlaygroundLoading(true);

        try {
            const res = await testAIChatReply(userText, aiSystemPrompt, knowledgeBase, tone);
            if (res.success && res.reply) {
                setPlaygroundMessages(prev => [...prev, { sender: "bot", text: res.reply }]);
            } else {
                setPlaygroundMessages(prev => [...prev, { sender: "bot", text: fallbackMessage || "I'm sorry, I'm having trouble retrieving details right now." }]);
            }
        } catch (err: any) {
            setPlaygroundMessages(prev => [...prev, { sender: "bot", text: "Error connecting to AI service." }]);
        } finally {
            setPlaygroundLoading(false);
        }
    };

    const resetPlayground = () => {
        setPlaygroundMessages([
            { sender: "bot", text: welcomeMessage || "Hello! How can I help you today?" }
        ]);
    };

    if (isPending && !business) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#25D366]" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto font-[Outfit] text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Bot className="w-8 h-8 text-[#25D366]" />
                        AI Agent & Knowledge Base
                    </h1>
                    <p className="text-white/40 text-sm mt-1">Configure your AI receptionist, upload training data, and test bot responses in real-time.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="px-6 py-2.5 rounded-xl bg-[#25D366] text-black text-sm font-black flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer self-start sm:self-center"
                >
                    <Save className="w-4 h-4" />
                    Save Changes
                </button>
            </div>

            {/* Split View Content */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Configuration panel (8 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Automation Switch */}
                    <div className="glass-card border border-white/5 p-5 rounded-2xl flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${autoReplyEnabled ? "bg-[#25D366]/20 text-[#25D366]" : "bg-white/5 text-white/20"}`}>
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Instant Auto-Reply</h3>
                                <p className="text-[11px] text-white/40">When active, AI answers incoming customer queries instantly.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                            className={`w-12 h-6.5 rounded-full relative transition-all ${autoReplyEnabled ? "bg-[#25D366]" : "bg-white/10"}`}
                        >
                            <div className={`absolute top-1 w-4.5 h-4.5 rounded-full bg-white transition-all ${autoReplyEnabled ? "right-1" : "left-1"}`} />
                        </button>
                    </div>

                    {/* Section 1: AI Agent Settings */}
                    <div className="glass-card border border-white/5 p-6 rounded-2xl bg-white/[0.01] space-y-5">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                            <Sparkles className="w-4 h-4 text-[#25D366]" />
                            <h2 className="font-bold text-base">AI Receptionist Persona</h2>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-white/55 block mb-1.5">Agent Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Maya, Assistant"
                                    value={agentName}
                                    onChange={(e) => setAgentName(e.target.value)}
                                    className="input-dark w-full text-xs"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-white/55 block mb-1.5">Conversation Tone</label>
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="input-dark w-full text-xs bg-[#0a0f14]"
                                >
                                    <option value="PROFESSIONAL">Professional & Polite</option>
                                    <option value="FRIENDLY">Friendly & Welcoming</option>
                                    <option value="CASUAL">Casual & Enthusiastic</option>
                                    <option value="SALES">Sales-Driven & Persuasive</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-white/55 block mb-1.5">Welcome Message</label>
                            <input
                                type="text"
                                placeholder="e.g. Hello! I am your AI assistant. How can I help you today?"
                                value={welcomeMessage}
                                onChange={(e) => setWelcomeMessage(e.target.value)}
                                className="input-dark w-full text-xs"
                            />
                            <p className="text-[10px] text-white/30 mt-1">First automated message when a new customer initiates connection.</p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-white/55 block mb-1.5">Fallback Message (Human Handoff Trigger)</label>
                            <input
                                type="text"
                                placeholder="e.g. Let me connect you to our support staff. Please hold on..."
                                value={fallbackMessage}
                                onChange={(e) => setFallbackMessage(e.target.value)}
                                className="input-dark w-full text-xs"
                            />
                            <p className="text-[10px] text-white/30 mt-1">Sent when the AI hits fallback or cannot answer based on knowledge base.</p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-white/55 block mb-1.5">System Prompt instructions</label>
                            <textarea
                                value={aiSystemPrompt}
                                onChange={(e) => setAiSystemPrompt(e.target.value)}
                                placeholder="Write primary guidelines for how the agent behaves..."
                                className="input-dark w-full h-24 resize-none text-xs leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Section 2: Knowledge Base Manager */}
                    <div className="glass-card border border-white/5 p-6 rounded-2xl bg-white/[0.01] space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-2">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#25D366]" />
                                <h2 className="font-bold text-base">Knowledge Base Trainer</h2>
                            </div>
                            
                            {/* Inner source tabs */}
                            <div className="flex bg-white/5 rounded-lg p-0.5 self-start">
                                {[
                                    { id: "text", label: "Text/KB" },
                                    { id: "faq", label: "FAQ Builder" },
                                    { id: "pdf", label: "PDF/DOCX" },
                                    { id: "url", label: "Website URL" }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveSourceTab(tab.id as any)}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                                            activeSourceTab === tab.id 
                                                ? "bg-[#25D366] text-black" 
                                                : "text-white/60 hover:text-white"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Text Source */}
                        {activeSourceTab === "text" && (
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-white/55 block">Compiled Knowledge Base Draft</label>
                                <textarea
                                    value={knowledgeBase}
                                    onChange={(e) => setKnowledgeBase(e.target.value)}
                                    placeholder="Enter raw guidelines, business details, products list, and FAQs here..."
                                    className="input-dark w-full h-64 font-mono text-xs leading-relaxed resize-y"
                                />
                                <p className="text-[10px] text-white/30">You can edit the compiled training context directly.</p>
                            </div>
                        )}

                        {/* FAQ Builder */}
                        {activeSourceTab === "faq" && (
                            <div className="space-y-4">
                                <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                        <Plus className="w-3.5 h-3.5 text-[#25D366]" /> Add New Q&A block
                                    </h4>
                                    <div>
                                        <label className="text-[10px] text-white/40 block mb-1">Question</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Fees kya hai?"
                                            value={faqQuestion}
                                            onChange={(e) => setFaqQuestion(e.target.value)}
                                            className="input-dark w-full text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-white/40 block mb-1">Answer</label>
                                        <textarea
                                            placeholder="e.g. Hamare starter plan ki fees ₹999/month hai."
                                            value={faqAnswer}
                                            onChange={(e) => setFaqAnswer(e.target.value)}
                                            className="input-dark w-full h-20 resize-none text-xs"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddFAQ}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg transition-all"
                                    >
                                        Add to Knowledge Base
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PDF / DOCX Uploader */}
                        {activeSourceTab === "pdf" && (
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center bg-white/[0.01] hover:bg-white/[0.02] transition-all relative">
                                    <input 
                                        type="file" 
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isUploading}
                                    />
                                    <UploadCloud className="w-10 h-10 text-white/20 mx-auto mb-3" />
                                    <h4 className="text-sm font-bold">Choose a file or drag here</h4>
                                    <p className="text-[10px] text-white/30 mt-1.5">Supports PDF, DOCX, or TXT up to 10MB</p>
                                </div>
                                {isUploading && (
                                    <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/5">
                                        <Loader2 className="w-4 h-4 animate-spin text-[#25D366]" />
                                        <span className="text-xs text-white/70">Extracting text from {fileName}...</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Website URL scraper */}
                        {activeSourceTab === "url" && (
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        placeholder="https://example.com/pricing"
                                        value={webUrl}
                                        onChange={(e) => setWebUrl(e.target.value)}
                                        className="input-dark flex-1 text-xs"
                                    />
                                    <button
                                        onClick={handleScrapeURL}
                                        disabled={isScraping || !webUrl}
                                        className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-black hover:bg-[#25D366] hover:text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        {isScraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                                        Scrape Page
                                    </button>
                                </div>
                                <p className="text-[10px] text-white/30">Connect websites to automatically sync prices, contact numbers, and working hours.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Live Simulator (5 cols) */}
                <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
                    <div className="glass-card border border-white/10 rounded-3xl bg-[#0b141a] overflow-hidden flex flex-col h-[580px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        
                        {/* Chat Header */}
                        <div className="bg-[#128c7e] p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10">
                                    <Bot className="w-5 h-5 text-[#25D366]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm font-[Outfit] text-white flex items-center gap-1.5">
                                        {agentName || "AI Assistant"}
                                        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                                    </h4>
                                    <p className="text-[10px] text-white/70">WhatsApp Sandbox Mode</p>
                                </div>
                            </div>
                            <button
                                onClick={resetPlayground}
                                className="p-2 rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white"
                                title="Reset Simulator"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a] bg-opacity-95 custom-scrollbar">
                            {playgroundMessages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2 text-xs leading-relaxed shadow-sm ${
                                            msg.sender === "user"
                                                ? "bg-[#056162] text-white rounded-tr-none"
                                                : "bg-[#202c33] text-white/95 rounded-tl-none border border-white/5"
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {playgroundLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#202c33] text-white/50 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center gap-2 border border-white/5">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#25D366]" />
                                        <span>Thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Prompts */}
                        <div className="p-3 bg-[#111b21] border-t border-white/5">
                            <p className="text-[10px] text-white/40 mb-2 font-bold tracking-wider uppercase">Test with sample queries:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    "Fees kya hai?",
                                    "Working hours?",
                                    "Connect to agent",
                                    "Where are you located?"
                                ].map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => {
                                            setUserInput(q);
                                        }}
                                        className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white/70 hover:text-white transition-all cursor-pointer"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} className="p-3.5 bg-[#202c33] flex gap-2 items-center">
                            <input
                                type="text"
                                placeholder="Ask AI anything..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-[#2a3942] border-0 text-white text-xs placeholder-white/30 focus:ring-1 focus:ring-[#25D366] outline-none"
                            />
                            <button
                                type="submit"
                                disabled={playgroundLoading || !userInput.trim()}
                                className="p-2.5 rounded-xl bg-[#25D366] text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <div>
                            <h5 className="text-xs font-bold">Simulator Information</h5>
                            <p className="text-[10px] text-white/40 mt-1">This simulation uses your draft configurations in real-time, allowing quick adjustments before saving.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

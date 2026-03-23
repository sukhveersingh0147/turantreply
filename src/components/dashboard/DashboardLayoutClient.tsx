"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Script from "next/script";
import {
    LayoutDashboard,
    Users,
    MessageCircle,
    Zap,
    Radio,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    Bell,
    Search,
    LogOut,
    Bot,
    Menu,
    Globe,
    CreditCard,
    X,
    Plus,
    Send,
    PlusSquare,
    Calendar,
    ClipboardList,
    Package,
    ShoppingCart,
    Utensils,
    BookOpen,
    Users2,
    Clock,
    Tag,
    Megaphone,
    Puzzle,
} from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { getPlanFeatures } from "@/lib/plans";

const unifiedItems = [
    { href: "/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/conversations", label: "Inbox", icon: MessageCircle },
    { href: "/leads", label: "Contacts", icon: Users },
    { href: "/broadcast", label: "Broadcast", icon: Radio },
    { href: "/automation", label: "Automation", icon: Zap },
    { href: "/catalog", label: "Catalog", icon: Package },
    { href: "/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/integrations", label: "Integrations", icon: Puzzle },
    { href: "/affiliate", label: "Affiliate", icon: Users2 },
    { href: "/settings", label: "Settings", icon: Settings },
];

const adminItems = [
    { href: "/admin/subscriptions", label: "System Subs", icon: Bell },
    { href: "/inquiries", label: "Inquiries", icon: Bell },
];

function Sidebar({
    collapsed,
    onToggle,
    mobileOpen,
    onMobileClose,
    role,
    businessType,
    plan
}: {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
    role?: string;
    businessType?: string;
    plan?: string;
}) {
    const pathname = usePathname();
    const isAdmin = role === "admin" || role === "support_admin";
    
    // Filter items based on plan features
    const features = getPlanFeatures(plan || "FREE");
    const sidebarItems = unifiedItems.filter(item => {
        if (item.href === "/overview" || item.href === "/conversations" || item.href === "/leads" || item.href === "/catalog" || item.href === "/settings") return true;
        if (item.href === "/broadcast") return features.canUseBroadcast;
        if (item.href === "/automation") return features.canUseCustomFlows;
        if (item.href === "/campaigns") return features.canUseCampaigns;
        if (item.href === "/analytics") return true; // Keep analytics for now
        if (item.href === "/integrations") return true; // Keep integrations
        return true;
    });

    const allItems = isAdmin 
        ? [...sidebarItems, ...adminItems] 
        : sidebarItems;

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[60] md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full z-[70] flex flex-col bg-[#0a0f14] border-r border-white/5 transition-all duration-300
          ${collapsed ? "md:w-16 w-[280px]" : "w-[280px] md:w-64"}
          ${mobileOpen ? "translate-x-0 shadow-[20px_0_60px_rgba(0,0,0,0.8)]" : "-translate-x-full md:translate-x-0"}
        `}
            >
                {/* Logo & Mobile Close */}
                <div className="flex items-center justify-between px-4 py-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner">
                            <img src="/turantreply-removebg.png" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        {(!collapsed || mobileOpen) && (
                            <span className="text-lg font-black font-[Outfit] whitespace-nowrap tracking-tighter">
                                Turant<span className="text-gradient">Reply</span>
                            </span>
                        )}
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onMobileClose}
                        className="md:hidden p-2 rounded-lg bg-white/5 text-white/40 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-6 overflow-y-auto font-[Outfit] scrollbar-hide px-3 space-y-1">
                    <div className="pb-4 mb-4 border-b border-white/5">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-[#25D366] hover:bg-[#25D366]/5 transition-all group text-sm font-bold"
                            title={collapsed ? "View Website" : undefined}
                        >
                            <Globe className="w-4.5 h-4.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            {!collapsed && <span>View Website</span>}
                        </Link>
                    </div>

                    {allItems.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onMobileClose}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group text-sm font-bold
                ${active
                                        ? "bg-[#25D366]/10 text-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.05)]"
                                        : "text-white/40 hover:text-white hover:bg-white/5"
                                    }`}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-[#25D366]" : "group-hover:text-white"} transition-colors`} />
                                {!collapsed && <span>{item.label}</span>}
                                {!collapsed && item.href === "/leads" && (
                                    <span className="ml-auto text-[10px] bg-[#25D366] text-black px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                        New
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* AI Status - Fixed at bottom */}
                <div className="mt-auto border-t border-white/5 p-4 bg-[#0a0f14]/80 backdrop-blur-md pb-safe">
                    {!collapsed && (
                        <div className="p-3 rounded-2xl bg-[#25D366]/5 border border-[#25D366]/10 mb-4">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Bot className="w-4 h-4 text-[#25D366]" />
                                <span className="text-[11px] font-black text-[#25D366] uppercase tracking-wider">
                                    System Active
                                </span>
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse shadow-[0_0_10px_rgba(37,211,102,0.5)]" />
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                                AI is monitoring your WhatsApp messages in real-time.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className={`flex items-center w-full gap-3 px-3 py-3 rounded-xl text-white/30 hover:text-white hover:bg-red-500/5 transition-all text-sm font-bold group`}
                    >
                        <LogOut className="w-4.5 h-4.5 flex-shrink-0 group-hover:text-red-400 transition-colors" />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={onToggle}
                    className="hidden md:flex absolute -right-3 top-24 w-6 h-6 bg-[#0a0f14] border border-white/10 rounded-full items-center justify-center text-white/40 hover:text-white transition-all hover:scale-110 z-[80]"
                >
                    {collapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5" />
                    )}
                </button>
            </aside>
        </>
    );
}

function QuickActions() {
    return (
        <div className="flex items-center gap-2">
            <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25D366] text-black text-xs font-bold hover:bg-[#128C7E] transition-all"
                title="Add Lead"
            >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
            </button>
            <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
                title="Send Message"
            >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
            </button>
            <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
                title="Create Rule"
            >
                <PlusSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
            </button>
        </div>
    );
}

function Topbar({ onMenuClick, user }: { onMenuClick: () => void, user: any }) {
    const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) : "U";

    return (
        <header className="h-16 border-b border-white/5 bg-[#060a0f]/80 backdrop-blur-xl flex items-center px-4 md:px-6 gap-4 sticky top-0 z-40">
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
                aria-label="Open Menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Topbar Spacer */}
            <div className="md:hidden flex-1" />

            {/* Search - Hidden on mobile if space is tight */}
            <div className="hidden lg:block flex-1 max-w-md lg:ml-8">
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 hover:bg-white/[0.05] transition-all group">
                    <Search className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
                    <input
                        type="text"
                        placeholder="Search leads, conversations..."
                        className="bg-transparent text-[13px] text-white/60 placeholder:text-white/20 outline-none w-full"
                    />
                </div>
            </div>

            <div className="flex-1 max-w-xs ml-4 hidden sm:block">
                <QuickActions />
            </div>

            <div className="flex items-center gap-3 ml-auto">
                {/* Status - Desktop */}
                <div className="hidden sm:flex items-center gap-2 bg-[#25D366]/5 border border-[#25D366]/20 px-4 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                    <span className="text-[11px] text-[#25D366] font-black uppercase tracking-widest">AI Live</span>
                </div>

                {/* Notifications */}
                <NotificationBell />

                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] p-[1.5px] group cursor-pointer transition-transform hover:scale-105 active:scale-95" title={user?.email}>
                    <div className="w-full h-full rounded-[10px] bg-[#060a0f] flex items-center justify-center text-[13px] font-black text-white">
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
}

function BottomNav({ businessType }: { businessType?: string }) {
    const pathname = usePathname();
    // Bottom nav shows key actions on mobile
    const mobileItems = [
        { href: "/overview", label: "Home", icon: LayoutDashboard },
        { href: "/conversations", label: "Inbox", icon: MessageCircle },
        { href: "/leads", label: "Contacts", icon: Users },
        { href: "/catalog", label: "Catalog", icon: Package },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-[#0a0f14]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-30">
            {mobileItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 transition-all ${active ? "text-[#25D366]" : "text-white/30"
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}

export default function DashboardLayoutClient({
    children,
    user,
    business,
}: {
    children: React.ReactNode;
    user: any;
    business?: any;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#060a0f] flex font-[Outfit]">
            {/* FB SDK Script */}
            <Script
                src="https://connect.facebook.net/en_US/sdk.js"
                strategy="lazyOnload"
                onLoad={() => {
                    console.log("FB SDK Loaded");
                    // Initialize FB SDK if needed
                    (window as any).fbAsyncInit = function () {
                        (window as any).FB.init({
                            appId: process.env.NEXT_PUBLIC_FB_APP_ID || 'your-app-id',
                            autoLogAppEvents: true,
                            xfbml: true,
                            version: 'v18.0'
                        });
                    };
                }}
            />

            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((c) => !c)}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
                role={user?.role}
                businessType={business?.businessType}
                plan={business?.plan}
            />

            {/* Main content — offset by sidebar on desktop only */}
            <div
                className="flex-1 flex flex-col min-h-screen transition-all duration-300 overflow-hidden w-full relative z-10"
                style={{
                    marginLeft: `var(--sidebar-width, 0px)`,
                }}
            >
                <style>{`
                    @media (min-width: 768px) {
                        :root { --sidebar-width: ${collapsed ? "4rem" : "16rem"}; }
                    }
                    @media (max-width: 767px) {
                        :root { --sidebar-width: 0px; }
                    }
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
                <Topbar onMenuClick={() => setMobileOpen(true)} user={user} />
                <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-auto bg-[#070c12] pb-24 md:pb-8">
                    <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#25D366]/5 to-transparent pointer-events-none" />
                    <div className="relative max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
                <BottomNav businessType={business?.businessType} />
            </div>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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
} from "lucide-react";

const navItems = [
    { href: "/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/conversations", label: "Conversations", icon: MessageCircle },
    { href: "/automation", label: "Automation", icon: Zap },
    { href: "/broadcast", label: "Broadcast", icon: Radio },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
];

function Sidebar({
    collapsed,
    onToggle,
    mobileOpen,
    onMobileClose,
}: {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
}) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full z-50 flex flex-col bg-[#0a0f14] border-r border-white/5 transition-all duration-300
          ${collapsed ? "w-16" : "w-60"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                        <Zap className="w-4 h-4 text-white" fill="white" />
                    </div>
                    {!collapsed && (
                        <span className="text-base font-bold font-[Outfit] whitespace-nowrap">
                            Reply<span className="text-gradient">Flow</span>{" "}
                            <span className="text-[#25D366]">AI</span>
                        </span>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    <div className="space-y-1 px-2 border-b border-white/5 pb-4 mb-4">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:text-[#25D366] hover:bg-white/5 transition-all group text-sm font-medium"
                            title={collapsed ? "View Website" : undefined}
                        >
                            <Globe className="w-4.5 h-4.5 flex-shrink-0 group-hover:text-[#25D366]" />
                            {!collapsed && <span>View Website</span>}
                        </Link>
                    </div>

                    <div className="space-y-1 px-2">
                        {navItems.map((item) => {
                            const active = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onMobileClose}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group text-sm font-medium
                    ${active
                                            ? "sidebar-active bg-[#25D366]/10 text-[#25D366]"
                                            : "text-white/50 hover:text-white hover:bg-white/5"
                                        }`}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-[#25D366]" : ""}`} />
                                    {!collapsed && <span>{item.label}</span>}
                                    {!collapsed && item.href === "/leads" && (
                                        <span className="ml-auto text-[10px] bg-[#25D366]/15 text-[#25D366] px-1.5 py-0.5 rounded-full font-semibold">
                                            12
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* AI Status */}
                {!collapsed && (
                    <div className="mx-3 mb-3 p-3 rounded-xl bg-[#25D366]/5 border border-[#25D366]/15">
                        <div className="flex items-center gap-2 mb-1">
                            <Bot className="w-4 h-4 text-[#25D366]" />
                            <span className="text-xs font-semibold text-[#25D366]">
                                AI Active
                            </span>
                            <div className="ml-auto w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                        </div>
                        <p className="text-[10px] text-white/40">
                            Watching for new WhatsApp messages
                        </p>
                    </div>
                )}

                {/* Logout */}
                <div className="px-2 pb-10 border-t border-white/5 pt-2 relative z-50">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm`}
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span>Logout</span>}
                    </button>
                    <p className="hidden md:block absolute bottom-2 left-4 text-[9px] text-white/20 whitespace-nowrap">
                        In Dev, Next Dev logo may appear here.
                    </p>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={onToggle}
                    className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-[#0a0f14] border border-white/10 rounded-full items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-3 h-3" />
                    ) : (
                        <ChevronLeft className="w-3 h-3" />
                    )}
                </button>
            </aside>
        </>
    );
}

function Topbar({ onMenuClick, user }: { onMenuClick: () => void, user: any }) {
    const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) : "U";

    return (
        <header className="h-14 border-b border-white/5 bg-[#060a0f]/95 backdrop-blur-xl flex items-center px-4 gap-4 sticky top-0 z-30">
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="hidden sm:block flex-1 max-w-md">
                <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-3 py-2">
                    <Search className="w-4 h-4 text-white/30 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search leads, conversations..."
                        className="bg-transparent text-xs text-white/60 placeholder:text-white/30 outline-none w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
                {/* Status */}
                <div className="hidden sm:flex items-center gap-1.5 bg-[#25D366]/10 border border-[#25D366]/20 px-3 py-1.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                    <span className="text-[11px] text-[#25D366] font-semibold">AI Live</span>
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#25D366] rounded-full" />
                </button>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-xs font-bold text-white cursor-pointer" title={user?.email}>
                    {initials}
                </div>
            </div>
        </header>
    );
}

export default function DashboardLayoutClient({
    children,
    user,
}: {
    children: React.ReactNode;
    user: any;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#060a0f] flex">
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((c) => !c)}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            {/* Main content — offset by sidebar on desktop only */}
            <div
                className="flex-1 flex flex-col min-h-screen transition-all duration-300 overflow-hidden w-full"
                style={{
                    marginLeft: `var(--sidebar-width, 0px)`,
                }}
            >
                <style>{`
                    @media (min-width: 768px) {
                        :root { --sidebar-width: ${collapsed ? "4rem" : "15rem"}; }
                    }
                    @media (max-width: 767px) {
                        :root { --sidebar-width: 0px; }
                    }
                `}</style>
                <Topbar onMenuClick={() => setMobileOpen(true)} user={user} />
                <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
}

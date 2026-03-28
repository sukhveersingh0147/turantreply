"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Building2,
    CreditCard,
    BarChart3,
    ShieldCheck,
    History,
    ChevronLeft,
    ChevronRight,
    Bell,
    Search,
    LogOut,
    Menu,
    X,
    Shield,
    LifeBuoy,
} from "lucide-react";

const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/businesses", label: "Businesses", icon: Building2 },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/affiliates", label: "Affiliates", icon: Users },
    { href: "/admin/system", label: "System Health", icon: ShieldCheck },
    { href: "/admin/support", label: "Support Tickets", icon: LifeBuoy },
    { href: "/admin/logs", label: "Audit Logs", icon: History },
];

function AdminSidebar({
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
                className={`fixed top-0 left-0 h-full z-50 flex flex-col bg-[#060a0f] border-r border-white/5 transition-all duration-300
          ${collapsed ? "w-16" : "w-60"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-base font-bold font-[Outfit] whitespace-nowrap">
                            Admin<span className="text-purple-500">Panel</span>
                        </span>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    <div className="space-y-1 px-2">
                        {adminNavItems.map((item) => {
                            const active = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onMobileClose}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group text-sm font-medium
                    ${active
                                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                            : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                                        }`}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-purple-400" : ""}`} />
                                    {!collapsed && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Back to Client App */}
                <div className="px-2 pb-4 border-t border-white/5 pt-2">
                    <Link
                        href="/overview"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm`}
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0 rotate-180" />
                        {!collapsed && <span>Exit Admin</span>}
                    </Link>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={onToggle}
                    className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-[#060a0f] border border-white/10 rounded-full items-center justify-center text-white/40 hover:text-white transition-colors"
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

function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className="h-14 border-b border-white/5 bg-[#060a0f]/95 backdrop-blur-xl flex items-center px-4 gap-4 sticky top-0 z-30">
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
                <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1">
                <h2 className="text-sm font-bold text-white/70">Super Admin Console</h2>
            </div>

            <div className="flex items-center gap-2 ml-auto">
                <div className="hidden sm:flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-[11px] text-purple-400 font-semibold">Monitoring Active</span>
                </div>

                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white cursor-pointer border border-white/10">
                    AD
                </div>
            </div>
        </header>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#030609] flex text-white">
            <AdminSidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((c) => !c)}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div
                className={cn(
                    "flex-1 flex flex-col min-h-screen transition-all duration-300 overflow-hidden w-full",
                    collapsed ? "md:pl-16" : "md:pl-60"
                )}
            >
                <AdminTopbar onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
}

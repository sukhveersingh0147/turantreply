"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Zap, ChevronRight } from "lucide-react";

const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/#how-it-works", label: "How it Works" },
];

export default function Navbar({ user }: { user?: any }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? "bg-[#060a0f]/90 backdrop-blur-xl border-b border-white/5 py-3"
                : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center animate-pulse-glow">
                            <Zap className="w-4 h-4 text-white" fill="white" />
                        </div>
                        <span className="text-xl font-bold font-[Outfit]">
                            Reply<span className="text-gradient">Flow</span>{" "}
                            <span className="text-[#25D366]">AI</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-white/70 hover:text-[#25D366] transition-colors duration-200 font-medium"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <Link
                                href="/overview"
                                className="flex items-center gap-1.5 btn-primary text-sm px-6"
                            >
                                Dashboard
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="flex items-center gap-1.5 btn-primary text-sm"
                                >
                                    Start Free Trial
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-white/10">
                        <nav className="flex flex-col gap-1 mt-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="mt-3 flex flex-col gap-2 px-4">
                                {user ? (
                                    <Link
                                        href="/overview"
                                        onClick={() => setMobileOpen(false)}
                                        className="text-center py-3 rounded-lg bg-gradient-to-r from-[#25D366] to-[#128C7E] text-sm font-semibold text-white"
                                    >
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            onClick={() => setMobileOpen(false)}
                                            className="text-center py-3 rounded-lg border border-white/20 text-sm font-medium text-white/80 hover:bg-white/5 transition-colors"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/signup"
                                            onClick={() => setMobileOpen(false)}
                                            className="text-center py-3 rounded-lg bg-gradient-to-r from-[#25D366] to-[#128C7E] text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                                        >
                                            Start Free Trial
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

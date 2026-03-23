"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Zap, ChevronRight } from "lucide-react";

const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/affiliate", label: "Affiliate" },
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
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-300">
                            <img src="/turantreply-removebg.png" alt="Turant Reply AI Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-bold font-[Outfit]">
                            Turant<span className="text-gradient">Reply</span>
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
                                    Get Started
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

                {/* Mobile Navigation Drawer */}
                <div
                    className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${mobileOpen ? "visible" : "invisible"
                        }`}
                >
                    {/* Overlay */}
                    <div
                        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"
                            }`}
                        onClick={() => setMobileOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div
                        className={`absolute top-0 right-0 bottom-0 w-[280px] bg-[#0a0f14] border-l border-white/10 p-6 flex flex-col transition-transform duration-300 ease-out shadow-2xl ${mobileOpen ? "translate-x-0" : "translate-x-full"
                            }`}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                                <img src="/turantreply-removebg.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-lg border border-white/5" />
                                <span className="text-lg font-bold font-[Outfit] text-white">Turant Reply</span>
                            </Link>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="p-2 -mr-2 rounded-lg bg-white/5 text-white/50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="px-4 py-3 text-base text-white/70 hover:text-[#25D366] hover:bg-white/5 rounded-xl transition-all font-medium"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto pt-6 flex flex-col gap-3">
                            {user ? (
                                <Link
                                    href="/overview"
                                    onClick={() => setMobileOpen(false)}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-sm font-bold text-white shadow-lg text-center"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white text-center"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        onClick={() => setMobileOpen(false)}
                                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-sm font-bold text-white shadow-lg text-center"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

import Link from "next/link";
import { Zap, Twitter, Linkedin, Github, Mail, Phone } from "lucide-react";

const footerLinks = {
    Product: [
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/#how-it-works", label: "How it Works" },
    ],
    Company: [
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact" },
    ],
    Legal: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/refund", label: "Refund Policy" },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-[#04070a] border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                                <img src="/turantreply-removebg.png" alt="Turant Reply Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-bold font-[Outfit]">
                                Turant<span className="text-gradient">Reply</span>
                            </span>
                        </Link>
                        <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                            The AI-powered WhatsApp Sales Automation platform that helps
                            businesses recover leads, auto-reply, and convert enquiries into
                            paying customers.
                        </p>
                        <div className="flex flex-col gap-4 mt-6">
                            <a
                                href="mailto:rs163592@gmail.com"
                                className="flex items-center gap-3 text-sm text-white/50 hover:text-[#25D366] transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                rs163592@gmail.com
                            </a>
                            <a
                                href="tel:+919694707873"
                                className="flex items-center gap-3 text-sm text-white/50 hover:text-[#25D366] transition-colors"
                            >
                                <Phone className="w-4 h-4" />
                                +91 9694707873
                            </a>
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
                                {title}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/60 hover:text-[#25D366] transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-white/30">
                        © {new Date().getFullYear()} Turant Reply. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-xs text-white/30">
                        <span>Built with</span>
                        <span className="text-[#25D366]">♥</span>
                        <span>in India · WhatsApp Cloud API · OpenAI · Razorpay</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

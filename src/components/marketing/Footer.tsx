import Link from "next/link";
import { Zap, Twitter, Linkedin, Github, Mail, Phone } from "lucide-react";

const footerLinks = {
    Product: [
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/#how-it-works", label: "How it Works" },
        { href: "/changelog", label: "Changelog" },
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
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" fill="white" />
                            </div>
                            <span className="text-xl font-bold font-[Outfit]">
                                Reply<span className="text-gradient">Flow</span>{" "}
                                <span className="text-[#25D366]">AI</span>
                            </span>
                        </Link>
                        <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                            The AI-powered WhatsApp Sales Automation platform that helps
                            businesses recover leads, auto-reply, and convert enquiries into
                            paying customers.
                        </p>
                        <div className="flex items-center gap-4 mt-6">
                            <a
                                href="mailto:hello@replyflow.ai"
                                className="flex items-center gap-2 text-xs text-white/50 hover:text-[#25D366] transition-colors"
                            >
                                <Mail className="w-3.5 h-3.5" />
                                hello@replyflow.ai
                            </a>
                            <a
                                href="tel:+911800000000"
                                className="flex items-center gap-2 text-xs text-white/50 hover:text-[#25D366] transition-colors"
                            >
                                <Phone className="w-3.5 h-3.5" />
                                +91 1800-000-000
                            </a>
                        </div>
                        {/* Socials */}
                        <div className="flex items-center gap-3 mt-5">
                            {[
                                { icon: Twitter, href: "#" },
                                { icon: Linkedin, href: "#" },
                                { icon: Github, href: "#" },
                            ].map(({ icon: Icon, href }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-[#25D366] hover:border-[#25D366]/30 transition-all"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
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
                        © {new Date().getFullYear()} ReplyFlow AI. All rights reserved.
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

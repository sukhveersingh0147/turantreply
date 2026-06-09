"use client";

import React from "react";
import Link from "next/link";
import { Rocket, Instagram, Linkedin, Twitter, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="pt-24 pb-12 bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          
          {/* Column 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20">
                   <Rocket className="w-5 h-5 text-[#25D366]" />
                </div>
                <span className="text-xl font-bold font-[Outfit] text-[#25D366]">Turant<span className="text-white">Reply</span></span>
            </Link>
            <p className="text-sm text-zinc-500 mb-8 leading-relaxed max-w-xs">
              India's first industry-specific WhatsApp automation platform.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-[#25D366] hover:border-[#25D366]/20 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-[#25D366] hover:border-[#25D366]/20 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-[#25D366] hover:border-[#25D366]/20 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="text-sm font-black text-white font-[Outfit] uppercase tracking-widest mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-sm text-zinc-500 hover:text-[#25D366] transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="text-sm text-zinc-500 hover:text-[#25D366] transition-colors">Pricing</Link></li>
              <li><Link href="#how-it-works" className="text-sm text-zinc-500 hover:text-[#25D366] transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-sm font-black text-white font-[Outfit] uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-sm text-zinc-500 hover:text-[#25D366] transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="text-sm text-zinc-500 hover:text-[#25D366] transition-colors">Blog</Link></li>
              <li><Link href="/affiliate" className="text-sm text-zinc-500 hover:text-[#25D366] transition-colors">Affiliate Program</Link></li>
              <li><Link href="/contact" className="text-sm text-zinc-500 hover:text-[#25D366] transition-colors">Contact</Link></li>
              <li><Link href="/support" className="text-sm text-zinc-500 hover:text-[#25D366] transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="text-sm font-black text-white font-[Outfit] uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-sm text-zinc-500 hover:text-[#25D366] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-zinc-500 hover:text-[#25D366] transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="text-sm text-zinc-500 hover:text-[#25D366] transition-colors">Refund Policy</Link></li>
              <li><Link href="/cookies" className="text-sm text-zinc-500 hover:text-[#25D366] transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-zinc-600 flex items-center gap-1 font-medium font-[Outfit]">
            © 2026 TurantReply. All rights reserved. Built with <Heart className="w-3 h-3 text-[#25D366] animate-pulse" /> in India
          </p>
          <div className="flex items-center gap-6 grayscale opacity-40">
             <span className="text-[10px] font-black text-white hover:text-[#25D366] transition-colors flex items-center gap-1">
                WhatsApp Cloud API
             </span>
             <span className="text-[10px] font-black text-white hover:text-[#25D366] transition-colors flex items-center gap-1">
                PayU Payments
             </span>
             <span className="text-[10px] font-black text-white hover:text-[#25D366] transition-colors flex items-center gap-1">
                OpenAI
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

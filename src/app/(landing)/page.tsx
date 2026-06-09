import React from "react";
import { auth } from "@/auth";

// Import all landing components
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustedBy from "@/components/landing/TrustedBy";
import Problem from "@/components/landing/Problem";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="bg-[#0a0a0a] text-white selection:bg-[#25D366] selection:text-black">
      <Navbar user={session?.user} />
      
      <main>
        <Hero />
        <TrustedBy />
        <Problem />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
      
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999] bg-[url('https://res.cloudinary.com/dcb6e87/image/upload/v1724243144/noise_fzzv9t.png')] mix-blend-overlay" />
    </div>
  );
}

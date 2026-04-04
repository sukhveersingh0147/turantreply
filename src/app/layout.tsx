import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const viewport = {
  themeColor: "#25D366",
};

export const metadata: Metadata = {
  title: {
    default: "TurantReply — India's #1 Industry-Specific WhatsApp Automation",
    template: "%s | TurantReply"
  },
  manifest: "/manifest.json",
  description:
    "India's first industry-specific WhatsApp automation for local businesses. Select your vertical (Salon, Gym, Real Estate, etc.) and get your dashboard ready in 60 seconds.",
  keywords: [
    "WhatsApp automation for Salon",
    "WhatsApp bot for Gym",
    "Real Estate WhatsApp automation",
    "Coaching center WhatsApp bot",
    "Restaurant WhatsApp automation",
    "TurantReply AI",
    "WhatsApp CRM India"
  ],
  authors: [{ name: "Saurabh", url: "https://turantreply.com" }],
  creator: "Turant Reply Team",
  publisher: "Turant Reply",
  openGraph: {
    title: "Turant Reply — WhatsApp AI Sales Automation",
    description:
      "Hire an AI Sales Employee that replies instantly and converts WhatsApp chats into customers 24/7.",
    url: "https://turantreply.com",
    siteName: "Turant Reply",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Turant Reply — WhatsApp AI Sales Automation",
    description: "Stop losing WhatsApp leads. Automate your sales with AI.",
  },
  alternates: {
    canonical: "https://turantreply.com"
  }
};

import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/Providers";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(
        inter.variable,
        outfit.variable,
        "font-sans antialiased bg-[#060a0f] text-white"
      )}>
        <Script 
          id="fb-async-init" 
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.fbAsyncInit = function() {
                FB.init({
                  appId: '${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}',
                  autoLogAppEvents: true,
                  xfbml: true,
                  version: 'v21.0'
                });
              };
            `
          }} 
        />
        <Script
          id="fb-sdk"
          src="https://connect.facebook.net/en_US/sdk.js"
          strategy="afterInteractive"
        />
        <Script
          id="razorpay-checkout"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
        <Toaster richColors position="top-center" />
        <Providers>
          <ImpersonationBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}

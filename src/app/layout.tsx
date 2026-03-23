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
    default: "Turant Reply — Best WhatsApp AI Sales Assistant for Indian Businesses",
    template: "%s | Turant Reply"
  },
  manifest: "/manifest.json",
  description:
    "Automate your WhatsApp sales with Turant Reply. The #1 AI WhatsApp bot for Indian businesses to recover leads, auto-reply 24/7, and grow revenue instantly.",
  keywords: [
    "WhatsApp AI assistant India",
    "WhatsApp sales automation",
    "best WhatsApp bot for business",
    "lead recovery WhatsApp",
    "WhatsApp marketing tool India",
    "Turant Reply AI",
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

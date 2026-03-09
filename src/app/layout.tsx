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

export const metadata: Metadata = {
  title: "ReplyFlow AI — WhatsApp AI Sales Automation",
  description:
    "Stop losing WhatsApp leads. ReplyFlow AI automatically replies to enquiries, recovers missed leads, and follows up with potential customers.",
  keywords: [
    "WhatsApp automation",
    "AI sales",
    "lead recovery",
    "WhatsApp CRM",
    "business automation",
    "ReplyFlow",
  ],
  openGraph: {
    title: "ReplyFlow AI — WhatsApp AI Sales Automation",
    description:
      "Hire an AI Sales Employee that replies instantly and converts chats into customers.",
    type: "website",
  },
};

import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

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
        <Toaster richColors position="top-center" />
        <ImpersonationBanner />
        {children}
      </body>
    </html>
  );
}

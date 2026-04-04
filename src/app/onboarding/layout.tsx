import React from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
      {/* Background Decorative Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#25D366]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-4xl relative z-10">
        {children}
      </div>
    </div>
  );
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { 
  CreditCard, 
  Zap, 
  Shield, 
  Check, 
  MessageCircle,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Billing & Subscription | TurantReply",
  description: "Select a plan and upgrade your TurantReply account via WhatsApp.",
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user business
  const business = await prisma.business.findUnique({
    where: { userId: session.user.id }
  });

  if (!business) {
    return (
      <div className="p-8 text-center glass-card border-red-500/20 bg-red-500/5 rounded-3xl max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-500 mb-2">No Business Found</h2>
        <p className="text-white/60 mb-6">Please complete your business setup first before accessing billing.</p>
        <Link 
          href="/setup" 
          className="px-6 py-2 bg-[#25D366] text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1ebd5b] transition-all"
        >
          Setup Business
        </Link>
      </div>
    );
  }

  const currentPlan = business.plan || "FREE";
  const isActive = business.subscriptionStatus === "ACTIVE";

  // Pre-fill parameters for WhatsApp message
  const whatsappNumber = "9694707873";
  const getWhatsAppLink = (planName: string, price: string) => {
    const text = `Hello! I would like to upgrade my TurantReply account to the ${planName} plan (${price}).\n\nRegistered Email: ${session.user?.email || "N/A"}\nBusiness Name: ${business.name}\nBusiness ID: ${business.id}`;
    return `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const plansList = [
    {
      name: "FREE",
      price: "₹0",
      period: "forever",
      description: "Ideal for testing and basic exploration of WhatsApp automation.",
      limits: {
        daily: "30 Messages / day",
        monthly: "30 Messages / month",
      },
      features: [
        "Basic WhatsApp Auto-Replies",
        "CRM Pipeline Lead Capture",
        "Includes standard branding badge",
        "Email support",
      ],
      isPopular: false,
    },
    {
      name: "STARTER",
      price: "₹999",
      period: "month",
      description: "Perfect for local shops and small businesses starting out.",
      limits: {
        daily: "200 Messages / day",
        monthly: "6,000 Messages / month",
      },
      features: [
        "No Branding Badge (Clean UI)",
        "Broadcast campaigns enabled",
        "Workflow automations & triggers",
        "Calendar & appointment scheduling",
        "AI Agent Assistant",
        "Standard priority email support",
      ],
      isPopular: false,
    },
    {
      name: "GROWTH",
      price: "₹2,499",
      period: "month",
      description: "Designed for rapidly growing businesses needing high volume.",
      limits: {
        daily: "1,000 Messages / day",
        monthly: "30,000 Messages / month",
      },
      features: [
        "Everything in Starter",
        "Higher message limits",
        "Custom rule workflows",
        "Advanced lead scoring",
        "Dedicated priority WhatsApp support",
      ],
      isPopular: true,
    },
    {
      name: "PRO",
      price: "₹4,999",
      period: "month",
      description: "Uncapped, full-featured automation for high-volume enterprise users.",
      limits: {
        daily: "Unlimited Messages",
        monthly: "Unlimited Messages",
      },
      features: [
        "Everything in Growth",
        "Unlimited Daily & Monthly Messages",
        "Custom branded automation flows",
        "Advanced LLM custom tuning support",
        "24/7 dedicated account manager",
      ],
      isPopular: false,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-black font-[Outfit] text-white">Plans & Billing</h1>
        <p className="text-sm text-white/40">Select a plan that fits your business. Manual verification is processed instantly via WhatsApp support.</p>
      </div>

      {/* Current Plan Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
        isActive && currentPlan !== "FREE" 
          ? "bg-gradient-to-br from-[#25D366]/10 via-[#128C7E]/5 to-transparent border-[#25D366]/20" 
          : "bg-white/[0.02] border-white/5"
      }`}>
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Zap className="w-32 h-32 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                isActive ? "bg-[#25D366] text-black" : "bg-red-500 text-white"
              }`}>
                {isActive ? "ACTIVE PLAN" : "EXPIRED / INACTIVE"}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[10px] font-bold">
                Manual Verification Active
              </span>
            </div>

            <h3 className="text-3xl font-black font-[Outfit] text-white">
              {currentPlan} <span className="text-xs font-normal text-white/40">plan</span>
            </h3>
            
            <p className="text-white/50 text-xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#25D366]" />
              Account Status: {isActive ? "All features active according to plan tiers" : "Limitations applied"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent("Hello! I have a question about my TurantReply billing/account.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-all text-center flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-white/60" /> Contact Support
            </a>
          </div>
        </div>

        {/* Detailed limits progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/5">
          <div>
            <p className="text-[10px] text-white/30 uppercase font-black tracking-wider mb-1">Today's Daily Conversations</p>
            <p className="text-lg font-bold text-white">{business.trialConversationsToday}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase font-black tracking-wider mb-1">Monthly Conversations Used</p>
            <p className="text-lg font-bold text-white">{business.aiRepliesUsed} / {business.monthlyLimit}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase font-black tracking-wider mb-1">Expires/Renewal Date</p>
            <p className="text-lg font-bold text-white">
              {business.subscriptionExpiresAt 
                ? new Date(business.subscriptionExpiresAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })
                : "Continuous / Free"}
            </p>
          </div>
        </div>
      </div>

      {/* Manual verification disclaimer banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
            <MessageCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">How to upgrade?</h4>
            <p className="text-xs text-white/60 leading-relaxed mt-0.5">Select a plan from the options below, then click "Upgrade via WhatsApp" to request plan activation. The admin will verify and activate your plan immediately.</p>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plansList.map((plan) => {
          const isCurrent = currentPlan === plan.name;
          return (
            <div 
              key={plan.name} 
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all relative ${
                plan.isPopular 
                  ? "bg-gradient-to-b from-[#25D366]/10 to-transparent border-[#25D366]/30 shadow-[0_4px_30px_rgba(37,211,102,0.05)]" 
                  : "bg-white/[0.02] border-white/5 hover:border-white/10"
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[#25D366] text-black text-[9px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(37,211,102,0.4)]">
                  POPULAR
                </span>
              )}

              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#25D366]/80 font-[Outfit]">{plan.name}</h4>
                <div className="flex items-baseline gap-1 mt-4 mb-2">
                  <span className="text-3xl font-black font-[Outfit] text-white">{plan.price}</span>
                  <span className="text-xs text-white/40 font-medium">/{plan.period}</span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed mb-6 h-12">{plan.description}</p>

                {/* Plan limits */}
                <div className="py-3 border-y border-white/5 space-y-2 mb-6">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-white/30 uppercase tracking-wider">Daily Limit:</span>
                    <span className="text-white/80">{plan.limits.daily}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-white/30 uppercase tracking-wider">Monthly Limit:</span>
                    <span className="text-white/80">{plan.limits.monthly}</span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-white/70 font-medium">
                      <Check className="w-3.5 h-3.5 text-[#25D366] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div>
                {isCurrent ? (
                  <button 
                    disabled 
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/30 text-xs font-bold uppercase tracking-wider cursor-default"
                  >
                    CURRENT PLAN
                  </button>
                ) : plan.name === "FREE" ? (
                  <Link
                    href="/support"
                    className="block w-full py-3 text-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Downgrade Inquiry
                  </Link>
                ) : (
                  <a
                    href={getWhatsAppLink(plan.name, plan.price)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-3 text-center rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      plan.isPopular 
                        ? "bg-[#25D366] text-black hover:bg-[#1ebd5b] hover:shadow-[0_0_20px_rgba(37,211,102,0.3)]" 
                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    Upgrade via WhatsApp
                  </a>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* FAQs */}
      <div className="glass-card border border-white/5 p-6 sm:p-8 space-y-6 mt-12">
        <h3 className="text-lg font-bold font-[Outfit] text-white">Frequently Asked Questions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white/90">How long does activation take?</h4>
            <p className="text-xs text-white/50 leading-relaxed">Usually within 5-15 minutes after messaging the owner on WhatsApp with your request. Our admins process confirmations immediately.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white/90">What payment options are supported?</h4>
            <p className="text-xs text-white/50 leading-relaxed">UPI (PhonePe, GPay, Paytm), Bank Transfer, or QR Scan. Details will be provided directly in the WhatsApp chat by the owner.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white/90">Can I upgrade/downgrade at any time?</h4>
            <p className="text-xs text-white/50 leading-relaxed">Yes! You can contact support on WhatsApp to switch your active plan or adjust your monthly message limit.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white/90">Will my automation stop if limits are reached?</h4>
            <p className="text-xs text-white/50 leading-relaxed">Yes, once the limit is exhausted, the AI agent pauses. Upgrading restarts it immediately.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

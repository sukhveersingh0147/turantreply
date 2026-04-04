"use client";

import { useEffect, useState } from "react";
import { 
  CreditCard, 
  Zap, 
  Shield, 
  Calendar, 
  History, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function BillingClient() {
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [statusRes, historyRes] = await Promise.all([
        fetch("/api/payments/payu/subscription-status"),
        fetch("/api/payments/history")
      ]);
      
      const statusData = await statusRes.json();
      const historyData = await historyRes.json();
      
      setData(statusData);
      setHistory(historyData);
    } catch (err) {
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAutopay = async () => {
    if (!confirm("Are you sure you want to cancel autopay? Your subscription will remain active until the end of the current period.")) return;
    
    setCancelling(true);
    try {
      const res = await fetch("/api/payments/payu/cancel-autopay", {
        method: "POST"
      });
      if (res.ok) {
        toast.success("Autopay cancelled successfully");
        fetchBillingData();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to cancel autopay");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#25D366]" />
      </div>
    );
  }

  const { business, subscription } = data || {};
  const isActive = business?.subscriptionStatus === "ACTIVE";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-[Outfit] text-white">Manage Subscription</h2>
          <p className="text-sm text-white/40">Overview of your plan, payments and billing cycles</p>
        </div>
        <Link 
          href="/pricing"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all w-fit"
        >
          View All Plans <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Current Plan */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-8 rounded-3xl border relative overflow-hidden ${
            isActive ? "bg-gradient-to-br from-[#25D366]/10 via-[#128C7E]/5 to-transparent border-[#25D366]/20" : "bg-white/[0.03] border-white/10"
          }`}>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="w-32 h-32" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                  isActive ? "bg-[#25D366] text-black" : "bg-red-500 text-white"
                }`}>
                  {isActive ? "ACTIVE PLAN" : "EXPIRED / INACTIVE"}
                </span>
                {subscription?.autopayEnabled && (
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> AUTOPAY ON
                  </span>
                )}
              </div>

              <h3 className="text-4xl font-black font-[Outfit] text-white mb-2">
                {business?.plan || "FREE"}
              </h3>
              <p className="text-white/50 text-sm mb-8 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#25D366]" />
                Next Renewal: {business?.subscriptionExpiresAt ? new Date(business.subscriptionExpiresAt).toLocaleDateString("en-IN", {
                  day: 'numeric', month: 'long', year: 'numeric'
                }) : "N/A"}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-white/5">
                <div>
                  <p className="text-[10px] text-white/30 uppercase font-bold mb-1">Monthly Cost</p>
                  <p className="text-lg font-bold text-white">₹{subscription?.price?.toLocaleString() || "0"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase font-bold mb-1">Payment Method</p>
                  <p className="text-lg font-bold text-white uppercase">{subscription?.payuPaymentId ? "PayU India" : "N/A"}</p>
                </div>
                <div className="col-span-2 md:col-span-1 border-t md:border-t-0 pt-4 md:pt-0">
                   {subscription?.autopayEnabled ? (
                      <button 
                        onClick={handleCancelAutopay}
                        disabled={cancelling}
                        className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors underline underline-offset-4"
                      >
                        {cancelling ? "Cancelling..." : "Cancel Autopay"}
                      </button>
                   ) : (
                     <p className="text-[10px] font-bold text-white/30 italic">Autopay is disabled</p>
                   )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="glass-card border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold font-[Outfit] flex items-center gap-2">
                <History className="w-4 h-4 text-[#25D366]" />
                Payment History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="p-4 text-[10px] font-black text-white/30 uppercase">Date</th>
                    <th className="p-4 text-[10px] font-black text-white/30 uppercase">Amount</th>
                    <th className="p-4 text-[10px] font-black text-white/30 uppercase">Gateway</th>
                    <th className="p-4 text-[10px] font-black text-white/30 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((pay: any, i: number) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 text-xs text-white/60">
                          {new Date(pay.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-xs font-bold text-white">
                          ₹{pay.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-xs text-white/40 uppercase">
                          {pay.payment_gateway}
                        </td>
                        <td className="p-4 uppercase">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            pay.status === "SUCCESS" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-red-500/10 text-red-500"
                          }`}>
                            {pay.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-white/20 text-xs italic">
                        No transaction history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Secondary Info */}
        <div className="space-y-6">
          
          <div className="glass-card border border-white/5 p-6 space-y-4">
            <h4 className="font-bold font-[Outfit] text-sm">Billing Support</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <AlertCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Agar aapka payment deduct ho gaya hai par plan update nahi hua, toh please support ticket raise karein.
                </p>
              </div>
              <Link 
                href="/support"
                className="block w-full py-2 text-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-white transition-all"
              >
                CONTACT SUPPORT
              </Link>
            </div>
          </div>

          <div className="glass-card border border-[#25D366]/20 p-6 bg-gradient-to-br from-[#25D366]/5 to-transparent">
            <h4 className="font-bold font-[Outfit] text-sm mb-2">Safe & Secure</h4>
            <p className="text-[11px] text-white/40 mb-4 leading-relaxed">
              We use PayU's PCI-DSS compliant infrastructure to handle your payments safely. Your data is encrypted.
            </p>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-[#25D366]/40" />
              <div className="w-px h-6 bg-white/10 mx-1" />
              <div className="text-[9px] text-white/30 uppercase font-black tracking-tighter">
                PayU Certified<br />Safety Verified
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

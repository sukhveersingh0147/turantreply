import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BillingClient from "@/components/dashboard/BillingClient";

export const metadata = {
  title: "Billing & Subscription | TurantReply",
  description: "Manage your PayU subscription, view payment history and billing settings.",
};

export default async function BillingPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-[Outfit] text-white">Billing</h1>
        <p className="text-sm text-white/40">Manage your subscription and payments</p>
      </div>
      
      <BillingClient />
    </div>
  );
}

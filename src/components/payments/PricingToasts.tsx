"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function ToastHandler() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams?.get("payment");

  useEffect(() => {
    if (paymentStatus === "success") {
      toast.success("🎉 Payment successful! Dashboard ready hai.");
    } else if (paymentStatus === "failed") {
      toast.error("Payment fail ho gayi. Dobara try karein.");
    } else if (paymentStatus === "tampered") {
      toast.error("Payment verification fail. Support se contact karein.");
    }
  }, [paymentStatus]);

  return null;
}

export default function PricingToasts() {
  return (
    <Suspense fallback={null}>
      <ToastHandler />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming sonner is used, common in these projects

interface Props {
  planId: "starter" | "growth" | "agency";
  buttonLabel?: string;
  className?: string;
}

export function PayUCheckout({ 
  planId, 
  buttonLabel = "Subscribe Now",
  className 
}: Props) {
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      // 1. Get PayU params from our API
      const res = await fetch(
        "/api/payments/payu/create", 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId })
        }
      );
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      // 2. Create hidden form and submit to PayU
      const form = document.createElement("form");
      form.method  = "POST";
      form.action  = data.payuUrl;
      form.style.display = "none";

      // Add all params as hidden inputs
      Object.entries(data.params).forEach(
        ([key, value]) => {
          const input = document.createElement("input");
          input.type  = "hidden";
          input.name  = key;
          input.value = String(value ?? "");
          form.appendChild(input);
        }
      );

      document.body.appendChild(form);
      form.submit();
      // Page will navigate to PayU — 
      // loading state stays until redirect

    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <span className="flex items-center gap-2 justify-center">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Redirecting to PayU...
        </span>
      ) : (
        buttonLabel
      )}
    </button>
  );
}

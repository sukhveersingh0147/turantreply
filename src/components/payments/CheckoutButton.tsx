"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap } from "lucide-react";

interface CheckoutButtonProps {
    plan: string;
    price: number;
    businessName: string;
    businessEmail: string;
    popular?: boolean;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutButton({
    plan,
    price,
    businessName,
    businessEmail,
    popular,
}: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        setLoading(true);

        try {
            const res = await loadRazorpay();

            if (!res) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                return;
            }

            // 1. Create Order
            const response = await fetch("/api/payments/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            });

            if (response.status === 401) {
                router.push("/login?callbackUrl=/pricing");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to create order");
            }

            const order = await response.json();

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
                amount: order.amount,
                currency: order.currency,
                name: "ReplyFlow AI",
                description: `${plan} Plan Subscription`,
                image: "/logo.png", // Replace with your logo
                order_id: order.id,
                handler: function (response: any) {
                    toast.success("Payment Successful! Your plan is being activated.");
                    router.push("/overview?success=true");
                },
                prefill: {
                    name: businessName,
                    email: businessEmail,
                },
                theme: {
                    color: "#25D366",
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            paymentObject.on("payment.failed", function (response: any) {
                toast.error("Payment failed: " + response.error.description);
            });

        } catch (error) {
            console.error("Checkout Error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className={`block w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${popular
                ? "bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:-translate-y-0.5"
                : "border border-white/15 text-white/70 hover:border-[#25D366]/40 hover:text-white hover:bg-white/5"
                }`}
        >
            {loading ? "Processing..." : "Start Subscription"}
        </button>
    );
}

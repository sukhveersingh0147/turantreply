"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCheckoutOrder, verifyPayment } from "@/app/actions/billing";
import { SubscriptionPlan } from "@/config/subscription";
import { Zap } from "lucide-react";

interface CheckoutButtonProps {
    plan: string;
    price: number;
    businessName: string;
    businessEmail: string;
    popular?: boolean;
    children?: React.ReactNode;
    className?: string;
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
    children,
    className,
}: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    const handleCheckout = async () => {
        setLoading(true);

        try {
            // 1. Create Order using Server Action
            const order = await createCheckoutOrder(plan as SubscriptionPlan);

            if ((order as any).isMock) {
                toast.info("Mock Mode: Simulating successful payment...");
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const result = await verifyPayment({
                    razorpay_order_id: (order as any).id,
                    razorpay_payment_id: "pay_mock_" + Date.now(),
                    razorpay_signature: "mock_signature",
                    planKey: plan as SubscriptionPlan,
                });

                if (result.success) {
                    toast.success("Payment Successful! Your plan is being activated.");
                    router.push("/payment/success");
                }
                return; // Exit handleCheckout
            }

            // 2. Check if Razorpay is loaded
            if (!window.Razorpay) {
                toast.error("Razorpay SDK is still loading. Please wait a moment or refresh.");
                setLoading(false);
                return;
            }

            // 3. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Turant Reply",
                description: `${plan} Plan Subscription`,
                image: "/turantreply-removebg.png",
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        const result = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planKey: plan as SubscriptionPlan,
                        });

                        if (result.success) {
                            toast.success("Payment Successful!");
                            router.push("/payment/success");
                        }
                    } catch (err: any) {
                        toast.error(err.message || "Payment verification failed");
                        router.push("/payment/failure");
                    }
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
                router.push("/payment/failure");
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
            className={className || `block w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${popular
                ? "bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:-translate-y-0.5"
                : "border border-white/15 text-white/70 hover:border-[#25D366]/40 hover:text-white hover:bg-white/5"
                }`}
        >
            {loading ? "Processing..." : children || "Subscribe Now"}
        </button>
    );
}


"use server";

import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getAccessibleBusiness } from "./settings";


export async function createPaymentLink(data: {
    orderId: string;
    amount: number;
    currency?: string;
    customerName: string;
    customerPhone: string;
    description: string;
    businessId: string;
}) {
    const { orderId, amount, currency = "INR", customerName, customerPhone, description, businessId } = data;

    try {
        console.log(`[PAYMENTS] Creating Razorpay payment link for Order ${orderId} (Business: ${businessId})`);
        
        // Fetch business specific keys
        const business = await prisma.business.findUnique({
            where: { id: businessId },
            select: {
                razorpayKeyId: true,
                razorpayKeySecret: true,
            }
        });

        if (!business?.razorpayKeyId || !business?.razorpayKeySecret) {
            console.warn(`[PAYMENTS] Razorpay not configured for business ${businessId}. Skipping link generation.`);
            return {
                success: false,
                error: "PAYMENT_SETUP_MISSING",
            };
        }

        // Initialize Razorpay with business keys
        const businessRazorpay = new Razorpay({
            key_id: business.razorpayKeyId,
            key_secret: business.razorpayKeySecret,
        });

        // Razorpay expects amount in paise (e.g. 1000 - 10.00)
        const amountInPaise = Math.round(amount * 100);

        // Clean phone: remove non-digits, and strip leading +91 or 91 if present
        const cleanPhone = customerPhone.replace(/\D/g, "");
        const finalPhone = cleanPhone.startsWith("91") ? cleanPhone.substring(2) : cleanPhone;
        
        const paymentLink = await businessRazorpay.paymentLink.create({
            amount: amountInPaise,
            currency,
            accept_partial: false,
            description,
            customer: {
                name: customerName || "Customer",
                contact: `+91${finalPhone}`,
            },
            notify: {
                sms: true,
                email: false,
            },
            reminder_enable: true,
            notes: {
                order_id: orderId,
            },
            // Callback/Webhook can update the order status
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/razorpay`,
            callback_method: "get",
        });

        // Update order status (Keep existing logic)
        await prisma.order.update({
            where: { id: orderId },
            data: { 
                status: "CONFIRMED",
            }
        });

        return {
            success: true,
            short_url: paymentLink.short_url,
            id: paymentLink.id,
        };
    } catch (error: any) {
        console.error("[PAYMENTS ERROR] Failed to create payment link:", error.message || error);
        return {
            success: false,
            error: error.message || "Failed to create payment link",
        };
    }
}

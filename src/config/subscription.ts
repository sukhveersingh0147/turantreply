export type SubscriptionPlan = "FREE" | "STARTER" | "GROWTH" | "AGENCY";

export interface PlanDetails {
    name: string;
    limit: number;
    price: number;
    priceId?: string; // Razorpay Plan ID or Price ID
    features: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanDetails> = {
    FREE: {
        name: "Free",
        limit: 50,
        price: 0,
        features: ["50 AI Auto-Replies", "Basic Lead Tracking", "1 WhatsApp Number"],
    },
    STARTER: {
        name: "Starter",
        limit: 500,
        price: 999, // ₹999/month
        features: ["500 AI Auto-Replies", "Advanced Lead CRM", "Priority Support", "Basic Analytics"],
    },
    GROWTH: {
        name: "Growth",
        limit: 5000,
        price: 2999, // ₹2999/month
        features: ["5,000 AI Auto-Replies", "Bulk Broadcasts", "Follow-up Automation", "Detailed Analytics"],
    },
    AGENCY: {
        name: "Agency",
        limit: 1000000, // Unlimited-ish
        price: 9999, // ₹9999/month
        features: ["Unlimited AI Auto-Replies", "Multi-Agent Support", "White-label Dashboard", "API Access"],
    },
};

export const getPlanDetails = (plan: string): PlanDetails => {
    return SUBSCRIPTION_PLANS[plan as SubscriptionPlan] || SUBSCRIPTION_PLANS.FREE;
};

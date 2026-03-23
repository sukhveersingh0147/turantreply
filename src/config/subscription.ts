export type SubscriptionPlan = "FREE" | "STARTER" | "GROWTH" | "PRO";

export interface PlanDetails {
    name: string;
    price: number;
    features: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanDetails> = {
    FREE: {
        name: "Free Forever",
        price: 0,
        features: ["30 Daily Msg Limit", "Basic AI Auto-Reply", "Product Catalog", "Lead Management", "Unified Dashboard"],
    },
    STARTER: {
        name: "Starter",
        price: 999,
        features: ["200 Daily Msg Limit", "ALL FEATURES UNLOCKED", "Flow Builder Access", "Marketing Campaigns", "Unlimited Broadcasts", "Team Support"],
    },
    GROWTH: {
        name: "Growth",
        price: 2499,
        features: ["1,000 Daily Msg Limit", "Everything in Starter", "Advanced AI Insights", "Detailed Analytics", "Priority Support"],
    },
    PRO: {
        name: "Pro",
        price: 4999,
        features: ["UNLIMITED Daily Msgs", "Everything in Growth", "Dedicated Manager", "Custom Integrations", "Full White-label"],
    },
};

export const getPlanDetails = (plan: string): PlanDetails => {
    return SUBSCRIPTION_PLANS[plan as SubscriptionPlan] || SUBSCRIPTION_PLANS.FREE;
};

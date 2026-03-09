export type SubscriptionPlan = "FREE" | "STARTER" | "GROWTH" | "AGENCY";

export const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
    FREE: 50,
    STARTER: 500,
    GROWTH: 5000,
    AGENCY: 1000000,
};

export const getPlanLimit = (plan: string): number => {
    return PLAN_LIMITS[plan as SubscriptionPlan] ?? PLAN_LIMITS.FREE;
};

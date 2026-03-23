export type PlanType = "FREE" | "STARTER" | "GROWTH" | "PRO";

export interface PlanFeatures {
    monthlyLimit: number;
    dailyLimit: number | null; // Daily message limit
    canUseBroadcast: boolean;
    canUseCampaigns: boolean;
    canUseAutomations: boolean;
    canUseBooking: boolean;
    canUseLeadScoring: boolean;
    canUseAutomationRules: boolean;
    canUseCustomFlows: boolean;
    canUseAdvancedAI: boolean;
    hasBranding: boolean;
}

export const PLANS: Record<PlanType, PlanFeatures> = {
    FREE: {
        monthlyLimit: 30,
        dailyLimit: 30,
        canUseBroadcast: false,
        canUseCampaigns: false,
        canUseAutomations: false,
        canUseBooking: false,
        canUseLeadScoring: false,
        canUseAutomationRules: false,
        canUseCustomFlows: false,
        canUseAdvancedAI: false,
        hasBranding: true,
    },
    STARTER: {
        monthlyLimit: 6000, // 200 * 30 approx
        dailyLimit: 200,
        canUseBroadcast: true,
        canUseCampaigns: true,
        canUseAutomations: true,
        canUseBooking: true,
        canUseLeadScoring: true,
        canUseAutomationRules: true,
        canUseCustomFlows: true,
        canUseAdvancedAI: true,
        hasBranding: false,
    },
    GROWTH: {
        monthlyLimit: 30000, // 1000 * 30 approx
        dailyLimit: 1000,
        canUseBroadcast: true,
        canUseCampaigns: true,
        canUseAutomations: true,
        canUseBooking: true,
        canUseLeadScoring: true,
        canUseAutomationRules: true,
        canUseCustomFlows: true,
        canUseAdvancedAI: true,
        hasBranding: false,
    },
    PRO: {
        monthlyLimit: 999999, // Unlimited
        dailyLimit: 999999,   // Unlimited
        canUseBroadcast: true,
        canUseCampaigns: true,
        canUseAutomations: true,
        canUseBooking: true,
        canUseLeadScoring: true,
        canUseAutomationRules: true,
        canUseCustomFlows: true,
        canUseAdvancedAI: true,
        hasBranding: false,
    }
};

export function getPlanFeatures(plan: string | null): PlanFeatures {
    const p = (plan?.toUpperCase() as PlanType) || "FREE";
    return PLANS[p] || PLANS.FREE;
}

export function hasFeature(business: { plan: string }, feature: keyof PlanFeatures): boolean {
    const features = getPlanFeatures(business.plan);
    const value = features[feature];
    return typeof value === 'boolean' ? value : false;
}

export function isLimitReached(business: { 
    aiRepliesUsed: number, 
    monthlyLimit: number, 
    trialConversationsToday: number, 
    plan: string 
}): boolean {
    const features = getPlanFeatures(business.plan);
    
    // Check daily limit first
    if (features.dailyLimit && business.trialConversationsToday >= features.dailyLimit) {
        return true;
    }
    
    // Check monthly/total limit
    return business.aiRepliesUsed >= business.monthlyLimit;
}

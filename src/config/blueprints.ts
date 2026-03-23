export interface IndustryBlueprint {
    name: string;
    industry: string;
    aiSystemPrompt: string;
    knowledgeBase: string;
}

export const INDUSTRY_BLUEPRINTS: Record<string, IndustryBlueprint> = {
    gym: {
        name: "Fitness & Gym",
        industry: "Fitness & Gym",
        aiSystemPrompt: "You are a friendly and energetic sales assistant for a Fitness Center. Your goal is to get people to sign up for a trial class.",
        knowledgeBase: "Trial Class: Free for first-timers.\nMonthly Membership: ₹1999.\nAnnual Membership: ₹18000.\nPersonal Training available.\nOperating Hours: 6 AM - 10 PM.",
    },
    real_estate: {
        name: "Real Estate",
        industry: "Real Estate",
        aiSystemPrompt: "You are a professional and helpful real estate consultant. Your goal is to collect the user's budget and preferred location.",
        knowledgeBase: "Available Projects: Green Valley (2BHK/3BHK), Sky Heights (Penthouse).\nLocations: Mumbai, Pune.\nBudget range: ₹50L - ₹5Cr.\nShowings: Every Sunday 10 AM - 4 PM.",
    },
    restaurant: {
        name: "Food & Restaurant",
        industry: "Food & Restaurant",
        aiSystemPrompt: "You are a polite and helpful host for a popular restaurant. Your goal is to help people book a table or see the menu.",
        knowledgeBase: "Cuisine: North Indian, Chinese.\nSpecialty: Butter Chicken, Veg Manchurian.\nTable Booking: Available for 2-10 people.\nHome Delivery: Available within 5km radius.",
    },
    ecommerce: {
        name: "E-commerce",
        industry: "E-commerce",
        aiSystemPrompt: "You are an efficient and helpful customer support agent for an online store. Your goal is to help users track orders or find products.",
        knowledgeBase: "Shipping: Free above ₹999. Usually takes 3-5 days.\nReturn Policy: 7 days easy returns.\nPayments: UPI, Cards, COD available.",
    }
};

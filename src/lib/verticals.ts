export type VerticalType = 'SALON' | 'GYM' | 'COACHING' | 'REAL_ESTATE' | 'RESTAURANT' | 'OTHER';

export interface VerticalTemplate {
  name: string;
  description: string;
  aiSystemPrompt: string;
  catalogItems: {
    name: string;
    type: 'PRODUCT' | 'SERVICE';
    price: number;
    category: string;
    description: string;
  }[];
  automations: {
    triggerKeyword: string;
    responseMessage: string;
  }[];
  contactTags: string[];
  kpiLabels: {
    revenue: string;
    leads: string;
    conversions: string;
    pending: string;
    followups: string;
  };
  campaignTemplates: {
    name: string;
    message: string;
  }[];
}

export const VERTICALS: Record<VerticalType, VerticalTemplate> = {
  SALON: {
    name: "Salon & Beauty",
    description: "For hair salons, spas, and beauty clinics wishing to automate bookings and follow-ups.",
    aiSystemPrompt: "You are a professional salon assistant for [Salon Name]. Your goal is to help customers book appointments, share prices, and handle follow-ups. \n\nCRITICAL CONVERSATION PATTERNS:\n1. Appointment Confirmed: '✂️ Appointment Confirmed! Hi [Name]! Your appointment at [Salon] is confirmed for [Date] at [Time]. Service: [Service Name] Reply CANCEL if you need to reschedule 😊'\n2. Feedback: '💖 Thank you for visiting [Salon]! How was your experience today? ⭐ 1-5 for a rating or type your feedback'\n3. Reminder: '⏰ Reminder: Your appointment is tomorrow! Hi [Name], we're looking forward to seeing you at [Salon] tomorrow at [Time].'\n4. Win-back: 'Hi [Name]! It's been a while 🌸 We miss you! Come back this week and get 15% off any service.'\n\nAlways be polite, use emojis naturally, and ensure every lead is captured with their preferred service and time.",
    catalogItems: [
      { name: "Haircut & Styling", type: "SERVICE", price: 500, category: "Hair", description: "Professional haircut and styling by our experts." },
      { name: "Luxury Facial", type: "SERVICE", price: 1200, category: "Skin", description: "Deep cleansing facial for a glowing skin." },
      { name: "Full Body Waxing", type: "SERVICE", price: 1500, category: "Body", description: "Smooth and painless waxing service." },
      { name: "Manicure & Pedicure", type: "SERVICE", price: 800, category: "Nails", description: "Complete nail care for hands and feet." },
      { name: "Bridal Makeup Package", type: "SERVICE", price: 5000, category: "Special", description: "Premium bridal makeup for your special day." },
    ],
    automations: [
      { triggerKeyword: "book", responseMessage: "✂️ Appointment Confirmed!\nHi [Name]! Your appointment at [Salon] is confirmed for [Date] at [Time].\nService: [Service Name]\nReply CANCEL if you need to reschedule 😊" },
      { triggerKeyword: "price", responseMessage: "Here is our service menu:\n- Haircut: ₹500\n- Facial: ₹1200\n- Waxing: ₹1500\n- Nails: ₹800\nHow can we help you today?" },
      { triggerKeyword: "feedback", responseMessage: "💖 Thank you for visiting [Salon]!\nHow was your experience today? Reply:\n⭐ 1-5 for a rating\nor type your feedback" },
    ],
    contactTags: ["VIP Client", "First-Timer", "Lapsed (60+ days)", "Birthday This Month"],
    kpiLabels: {
      revenue: "Total Bookings (₹)",
      leads: "New Clients",
      conversions: "Appointments Confirmed",
      pending: "Pending Inquiries",
      followups: "Reminders Sent",
    },
    campaignTemplates: [
      { name: "Festival Offer", message: "🎉 [Festival] Special at [Salon]!\nGet [X]% off on all services this [Festival] week.\nLimited slots — Reply BOOK now! ✨" },
      { name: "Reminder", message: "⏰ Reminder: Your appointment is tomorrow!\nHi [Name], we're looking forward to seeing you at [Salon] tomorrow at [Time].\nSee you soon! 💆‍♀️" },
      { name: "Win-back Offer", message: "Hi [Name]! It's been a while 🌸\nWe miss you! Come back this week and get 15% off any service.\nReply BOOK to reserve your spot!" },
    ],
  },
  GYM: {
    name: "Gym & Fitness",
    description: "For fitness centers, yoga studios, and personal trainers to manage memberships and trials.",
    aiSystemPrompt: "You are a fitness consultant. Help leads understand membership plans, book trial sessions, and stay motivated.",
    catalogItems: [],
    automations: [],
    contactTags: ["Active Member", "Trial Pending", "Expired", "Personal Training"],
    kpiLabels: {
      revenue: "Membership Revenue",
      leads: "Trial Signups",
      conversions: "Members Joined",
      pending: "Incomplete Forms",
      followups: "Nudges Sent",
    },
    campaignTemplates: [],
  },
  COACHING: {
    name: "Coaching & Tuition",
    description: "For tutors, coaching institutes, and online courses to capture leads and share course details.",
    aiSystemPrompt: "You are an education counselor. Help students and parents understand course curriculums, fee structures, and batch timings.",
    catalogItems: [],
    automations: [],
    contactTags: ["Enrolled", "Prospect", "Parent", "Demo Attended"],
    kpiLabels: {
      revenue: "Course Fees (₹)",
      leads: "Student Inquiries",
      conversions: "Enrolments",
      pending: "Callbacks Needed",
      followups: "Updates Sent",
    },
    campaignTemplates: [],
  },
  REAL_ESTATE: {
    name: "Real Estate",
    description: "For brokers and developers to manage property inquiries and site visits.",
    aiSystemPrompt: "You are a real estate advisor. Share property details, prices, and floor plans. Help leads schedule site visits.",
    catalogItems: [],
    automations: [],
    contactTags: ["Buyer", "Investor", "Site Visit Done", "Hot Property"],
    kpiLabels: {
      revenue: "Portfolio Value (₹)",
      leads: "Property Leads",
      conversions: "Site Visits",
      pending: "Follow-ups Due",
      followups: "Alerts Sent",
    },
    campaignTemplates: [],
  },
  RESTAURANT: {
    name: "Restaurant & Cafe",
    description: "For restaurants and cafes to manage orders, table bookings, and loyalty.",
    aiSystemPrompt: "You are a helpful restaurant host. Share menus, take table reservations, and help with order inquiries.",
    catalogItems: [],
    automations: [],
    contactTags: ["Regular", "Weekend Guest", "Takeaway", "Vegetarian"],
    kpiLabels: {
      revenue: "Total Sales (₹)",
      leads: "New Guests",
      conversions: "Orders/Tables",
      pending: "Active Queries",
      followups: "Offers Sent",
    },
    campaignTemplates: [],
  },
  OTHER: {
    name: "Generic Business",
    description: "Standard configuration for any other business type.",
    aiSystemPrompt: "You are a helpful business assistant. Answer queries professionally and capture lead information.",
    catalogItems: [],
    automations: [],
    contactTags: ["New Lead", "Interested", "Customer"],
    kpiLabels: {
      revenue: "Revenue / Bookings",
      leads: "Hot Leads",
      conversions: "Conversations Today",
      pending: "Pending Replies",
      followups: "Smart Follow-ups",
    },
    campaignTemplates: [],
  },
};

import { VerticalPage } from "@/components/landing/VerticalPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsApp Automation for Gyms & Fitness Centers | TurantReply",
  description: "Automate trial session bookings, membership renewals, and class registrations for your gym. Increase your member retention by 30%.",
};

export default function GymLanding() {
  return (
    <VerticalPage
      vertical="gym"
      emoji="🏋️"
      title="Gym & Fitness"
      headline="Apna Gym, Khud ke\nReply karega."
      subheadline="Trial bookings, membership renewals, aur fee reminders — sab automate karo WhatsApp pe. Focus on training, not on chasing members."
      metaTitle="Gym WhatsApp Automation"
      metaDescription="Best WhatsApp tool for Gyms in India"
      chatMessages={[
        { sender: "customer", message: "Membership plans kya hain?", delay: 1000 },
        { sender: "ai", message: "💪 Hello! Hamare best fitness plans:\n- Basic: ₹1,500/month\n- Pro (PT included): ₹3,999/month\n- Annual: ₹9,999 (Save ₹8,000!)\nFree trial book karein?", delay: 2500 },
        { sender: "customer", message: "Trial done", delay: 4000 },
        { sender: "ai", message: "Great! 🏋️ Kal morning 8 AM trial done. Ek valid ID saath layein. Excited to see you at FitZone!", delay: 5500 }
      ]}
      problems={[
        { icon: "📉", stat: "25%", label: "Lost Trials", subtext: "Inquiry aati hai par trial setup karne mein time lagta hai." },
        { icon: "💸", stat: "40%", label: "Non-Renewals", subtext: "Members bhool jaate hain aur fees pending reh jaati hai." },
        { icon: "😴", stat: "50%", label: "Absent Members", subtext: "Attendance kum hone pe members gym chodd dete hain." }
      ]}
      exclusiveFeatures={[
        { icon: "🛡️", title: "Renewals Engine", description: "AI automatically 3 din pehle reminder bhejta hai aur payment link share karta hai." },
        { icon: "🎯", title: "Lead Qualification", description: "Inquiry aate hi AI qualify karta hai — Fat Loss, Muscle Gain, ya Yoga? Phir PT offer karta hai." },
        { icon: "⏱️", title: "Class Scheduling", description: "Zumba, Yoga, ya HIIT — members WhatsApp se hi apni seat book kar sakte hain." },
        { icon: "📊", title: "Attendance Alerts", description: "Agar member 3 din se nahi aaya, AI use fitness motivate karke wapas bulata hai." }
      ]}
      benefits={[
        { icon: "🚀", title: "Trial Conversion", description: "Immediate response se trial conversion rate 2x ho jaata hai.", result: "50% Growth" },
        { icon: "💰", title: "On-time Fees", description: "Automatic reminders se bad-debts aur pending fees khatam ho jaati hain.", result: "90% Collected" },
        { icon: "❤️", title: "Member Retention", description: "Personal touch aur care se members lambe time tak judi rehti hain.", result: "30% Loyal" }
      ]}
      testimonial={{
        quote: "Membership renewal ke liye ab calls nahi karne padte. AI payment link bhej deta hai aur members pay kar dete hain. ROI has been incredible!",
        name: "Vikram Singh",
        role: "Owner",
        location: "Iron Muscle Gym, Jaipur",
        result: "₹40k Extra Rev"
      }}
      faqs={[
        { question: "Kya AI attendance track kar sakta hai?", answer: "Haan! Dashboard se manual mark karo ya AI se pucho 'Arjun kitne din aaya?'" },
        { question: "Diet plans share kar sakte hain?", answer: "Bilkul. Broadcaster se poore batch ko diet plans ek click mein bhej sakte hain." }
      ]}
      ctaText="Mera Gym Dashboard Setup Karo →"
      ctaSubtext="60 seconds setup • 14 din free trial"
    />
  );
}

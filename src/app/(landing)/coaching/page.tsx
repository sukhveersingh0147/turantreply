import { VerticalPage } from "@/components/landing/VerticalPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsApp Automation for Coaching Centers & Schools | TurantReply",
  description: "Automate demo class registration, fee collection, and parent communication for your institute. Increase enrollments by 50%.",
};

export default function CoachingLanding() {
  return (
    <VerticalPage
      vertical="coaching"
      emoji="🎓"
      title="Coaching & Education"
      headline="Apna Coaching, Khud ke\nReply karega."
      subheadline="Demo registrations, fee reminders, aur study material — sab automate karo WhatsApp pe. Spend more time teaching, less time managing."
      metaTitle="Coaching WhatsApp Automation"
      metaDescription="Best WhatsApp tool for Coaching in India"
      chatMessages={[
        { sender: "customer", message: "Class 10 ke liye demo milega?", delay: 1000 },
        { sender: "ai", message: "📚 Hello! Haan, Class 10th (Maths) ke liye demo class next Sunday 11 AM hai. Bilkul FREE hai! Registration confirm karu?", delay: 2500 },
        { sender: "customer", message: "Yes, register please", delay: 4000 },
        { sender: "ai", message: "Done! ✅ Kal subah 11 AM demo hai. Reminder aur Google Meet link (if online) bhej denge!", delay: 5500 }
      ]}
      problems={[
        { icon: "📉", stat: "40%", label: "Demo Drops", subtext: "Inquiry aati hai par demo class book hone mein delay ho jaata hai." },
        { icon: "💸", stat: "30%", label: "Pending Fees", subtext: "Manual messages se fees collection mushkil hai." },
        { icon: "😴", stat: "70%", label: "Parent Gaps", subtext: "Regular communication na hone se trust kam ho jaata hai." }
      ]}
      exclusiveFeatures={[
        { icon: "📝", title: "Registration Engine", description: "Inquiry to Enrollment flow handle karega — automatic registration aur details capture." },
        { icon: "💳", title: "Fee Reminders", description: "AI periodic reminders bhejta hai — 'Aapki fee pending hai' se 'Last date kal hai' tak." },
        { icon: "📖", title: "Material Dispatch", description: "New test series aur notes WhatsApp pe push karo — segmented by class/batch." },
        { icon: "📢", title: "Broadcast Alerts", description: "School holidays, exam results, ya fee schedule — ek click mein 1,000+ parents ko message." }
      ]}
      benefits={[
        { icon: "🚀", title: "Enrollment Growth", description: "Immediate lead recovery aur follow-ups se intake badh jaata hai.", result: "2x Admissions" },
        { icon: "⏰", title: "Admin Relief", description: "Fees mangna, demo schedule karna — ab sab automated hai.", result: "6h daily saved" },
        { icon: "🌟", title: "Brand Trust", description: "Professional WhatsApp communication se parents ka trust badhta hai.", result: "95% Satisfaction" }
      ]}
      testimonial={{
        quote: "Ab hamein fee collection ke liye peon ya admin ko phone nahi dena padta. TurantReply reminders send karta hai aur parents pay kar dete hain. Genius solution!",
        name: "Sanjay Gupta",
        role: "Director",
        location: "Gupta Coaching Classes, Indore",
        result: "₹1.5L extra fees"
      }}
      faqs={[
        { question: "Multiple levels (Class 8-12) manage honge?", answer: "Bilkul. Tags use karke alag batches banayein aur target messages bhejein." },
        { question: "Result/Reports bhej sakte hain?", answer: "Haan, media templates use karke PDF reports share karein." }
      ]}
      ctaText="Mera Coaching Dashboard Setup Karo →"
      ctaSubtext="60 seconds setup • 14 din free trial"
    />
  );
}

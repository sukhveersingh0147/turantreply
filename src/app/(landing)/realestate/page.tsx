import { VerticalPage } from "@/components/landing/VerticalPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsApp Automation for Real Estate Agents & Developers | TurantReply",
  description: "Automate property inquiries, site visits, and lead qualification for your projects. Convert 30% more site visits.",
};

export default function RealEstateLanding() {
  return (
    <VerticalPage
      vertical="realestate"
      emoji="🏠"
      title="Real Estate"
      headline="Apna Real Estate, Khud ke\nReply karega."
      subheadline="Property Catalogs, Site visit scheduling, aur lead follow-ups — sab automate karo WhatsApp pe. Turn every inquiry into a hot lead."
      metaTitle="Real Estate WhatsApp Automation"
      metaDescription="Best WhatsApp tool for Real Estate in India"
      chatMessages={[
        { sender: "customer", message: "2BHK available hai Jaipur mein?", delay: 1000 },
        { sender: "ai", message: "🏠 Haan! 3 options hain aapke budget (₹40L-₹60L) mein:\n1. Vaishali Nagar - ₹45L\n2. Mansarovar - ₹52L\n3. Jagatpura - ₹38L\nDetails ya brochure chahiye?", delay: 2500 },
        { sender: "customer", message: "Brochure bhejo Vaishali ka", delay: 4000 },
        { sender: "ai", message: "Done! ✅ Yeh lijiye brochure aur site visit 2 PM pe book ho gaya hai kal ke liye. Link visit location: [Google Maps Link]", delay: 5500 }
      ]}
      problems={[
        { icon: "📉", stat: "30%", label: "Lost Interest", subtext: "Inquiry ke baad broker late reply karta hai toh client interest kho deta hai." },
        { icon: "💸", stat: "₹5k+", label: "Lead Cost", subtext: "Expensive leads waste hoti hain kyunki agents busy thae." },
        { icon: "😴", stat: "80%", label: "Ghosted Leads", subtext: "Clients inquiry karke bhool jaate hain aur koi system follow-up nahi karta." }
      ]}
      exclusiveFeatures={[
        { icon: "📂", title: "Automated Catalogs", description: "Inquiry keyword detect hote hi AI properties ke photos aur price list share kar deta hai." },
        { icon: "📍", title: "Site Visit Scheduler", description: "AI calendar check karke automatically visits book karta hai aur client ke maps pe location bhejta hai." },
        { icon: "🔍", title: "Lead Qualification", description: "AI qualification pucho — Budget? Area? Timeline? Phir hi hot lead broker ko pass karo." },
        { icon: "🔄", title: "Follow-up Machine", description: "Client ne site visit ki par buy nahi kiya? AI automatically project updates aur price drops bhejte rehta hai." }
      ]}
      benefits={[
        { icon: "🚀", title: "Hot Lead Capture", description: "Immediate response se client response rate 3x badh jaata hai.", result: "30% more visits" },
        { icon: "💰", title: "ROI Growth", description: "Marketing spend ka poora faida — zero lead wastages.", result: "2x Sales" },
        { icon: "❤️", title: "Better Relationship", description: "Professional WhatsApp updates se client trust build hota hai.", result: "High Retention" }
      ]}
      testimonial={{
        quote: "Pehele enquiries aati thhi par agents reply late karte thae. Ab TurantReply 0.3s mein reply karta hai aur property details share karta hai. Site visits drastically badh gayi hai!",
        name: "Abhishek Jain",
        role: "Director",
        location: "A.J. Real Estate, Gurgaon",
        result: "₹5Cr extra deals"
      }}
      faqs={[
        { question: "Multiple properties manage hongi?", answer: "Haan! Keywords use karke alag property flows banayein aur specific content share karein." },
        { question: "Payment reminders bhej sakte hain?", answer: "Bilkul. Installment dates pe automated reminders aur links bhej sakte hain." }
      ]}
      ctaText="Mera Real Estate Dashboard Setup Karo →"
      ctaSubtext="60 seconds setup • 14 din free trial"
    />
  );
}

import { VerticalPage } from "@/components/landing/VerticalPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsApp Automation for Salons & Spas | TurantReply",
  description: "Automate appointment bookings, reminders, and client follow-ups for your salon. 60-second setup, 14-day free trial. Improve retention by 40%.",
};

export default function SalonLanding() {
  return (
    <VerticalPage
      vertical="salon"
      emoji="💇"
      title="Salon & Beauty"
      headline="Apna Salon, Khud ke\nReply karega."
      subheadline="Appointment booking, reminders, aur loyalty offers — sab automate karo WhatsApp pe. Turn your salon into a 24/7 booking machine."
      metaTitle="Salon WhatsApp Automation"
      metaDescription="Best WhatsApp tool for Salons in India"
      chatMessages={[
        { sender: "customer", message: "Facial ke liye appointment chahiye aaj", delay: 1000 },
        { sender: "ai", message: "Namaste! ✨ Aaj ke available slots:\n- 2:00 PM\n- 4:30 PM\n- 6:00 PM\nKonsa book karu?", delay: 2500 },
        { sender: "customer", message: "2 PM done", delay: 4000 },
        { sender: "ai", message: "Done! ✅ 2:00 PM book ho gaya. Address: Model Town, Phase 2. Reminder bhej dungi!", delay: 5500 }
      ]}
      problems={[
        { icon: "📉", stat: "35%", label: "Missing Appointments", subtext: "Receptionist busy hone pe calls aur messages miss hote hain." },
        { icon: "💸", stat: "₹20k+", label: "No-Show Loss", subtext: "Clients bhool jaate hain aur seat khaali reh jaati hai." },
        { icon: "😴", stat: "60%", label: "Dead Clients", subtext: "Purane clients ko wapas bulane ka koi system nahi hai." }
      ]}
      exclusiveFeatures={[
        { icon: "📅", title: "Smart Appointment Bot", description: "AI aapka calendar check karke automatically slots offer karta hai aur book karta hai." },
        { icon: "🔔", title: "No-Show Protection", description: "Automatic reminders bhejo — 24h pehle aur 1h pehle. Cancellation rates 80% kam ho jaate hain." },
        { icon: "🛍️", title: "Service Catalog", description: "WhatsApp pe hi apna poora menu dikhao — Prices, Duration, aur Photos ke saath." },
        { icon: "💖", title: "Loyalty & Festive Offers", description: "Diwali, Karwa Chauth, ya Birthday — automated wishes aur offers bhej ke clients ko wapas bulao." }
      ]}
      benefits={[
        { icon: "🚀", title: "More Bookings", description: "Raat ko 11 baje bhi booking hogi jab aapka salon band hota hai.", result: "40% Increase" },
        { icon: "⏰", title: "Save Staff Time", description: "Assistant ko calls kum handle karne padenge, clients pe zyada dhyaan denge.", result: "4h Daily Saved" },
        { icon: "💰", title: "More Revenue", description: "No-shows kum honge aur repeat clients badhenge.", result: "₹50k+ Monthly" }
      ]}
      testimonial={{
        quote: "Pehle receptionist saara din phone pe rehti thi. TurantReply ke baad 80% bookings WhatsApp AI khud handle kar leta hai. Best investment for my salon!",
        name: "Pooja Sharma",
        role: "Owner",
        location: "Oasis Luxury Salon, Delhi",
        result: "3x More Bookings"
      }}
      faqs={[
        { question: "Kya AI mere services samajhta hai?", answer: "Haan! Setup mein bas apne services aur prices dalo. AI automatically Waxing, Facial, Haircut sabke baare mein batayega." },
        { question: "Multiple staff ka manage ho jayega?", answer: "Bilkul. Aap specific staff selection bhi enable kar sakte hain automation mein." }
      ]}
      ctaText="Mera Salon Dashboard Setup Karo →"
      ctaSubtext="60 seconds setup • 14 din free trial"
    />
  );
}

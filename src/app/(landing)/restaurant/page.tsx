import { VerticalPage } from "@/components/landing/VerticalPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsApp Automation for Restaurants & Cafes | TurantReply",
  description: "Automate table reservations, digital menu sharing, and feedback collection for your restaurant. Increase repeat customers by 40%.",
};

export default function RestaurantLanding() {
  return (
    <VerticalPage
      vertical="restaurant"
      emoji="🍽️"
      title="Restaurant & Cafe"
      headline="Apna Restaurant, Khud ke\nReply karega."
      subheadline="Table reservations, Digital Menus, aur special offers — sab automate karo WhatsApp pe. Turn every diner into a regular."
      metaTitle="Restaurant WhatsApp Automation"
      metaDescription="Best WhatsApp tool for Restaurants in India"
      chatMessages={[
        { sender: "customer", message: "Saturday 8 PM table available hai for 4?", delay: 1000 },
        { sender: "ai", message: "🍴 Hello! Haan, Saturday 8 PM table available hai. Guest count: 4.\nConfirmation send karu? 😊", delay: 2500 },
        { sender: "customer", message: "Yes, please", delay: 4000 },
        { sender: "ai", message: "Done! ✅ Table book ho gayi. Aaj ka special: Paneer Tikka Platter! Poora menu check karein: [Menu Link]", delay: 5500 }
      ]}
      problems={[
        { icon: "📉", stat: "20%", label: "Lost Tables", subtext: "Receptionist busy thhi toh bookings miss hoti hain." },
        { icon: "💸", stat: "₹10k+", label: "Missed Orders", subtext: "Digital menu mangwate thae par koi reply nahi deta thha." },
        { icon: "😴", stat: "70%", label: "One-time Diners", subtext: "Clients khaa kar chale jaate hain par koi system database nahi build karta." }
      ]}
      exclusiveFeatures={[
        { icon: "🪑", title: "Reservation Bot", description: "Inquiry to Booking — AI table availability check karta hai aur confirm karta hai." },
        { icon: "📜", title: "Menu Dispatch", description: "WhatsApp pe hello bhejte hi AI digital menu aur day's special share kar deta hai." },
        { icon: "⭐", title: "Feedback Automation", description: "Khana khane ke 2 ghante baad automated feedback link bhejta hai — Google Reviews badhao." },
        { icon: "🎁", title: "Smart Offers", description: "Birthday, Anniversary, ya Weekend — automated gift vouchers bhej ke wapas bulao." }
      ]}
      benefits={[
        { icon: "🚀", title: "More Bookings", description: "Raat ko 1 baje bhi booking hogi jab restaurant band hota hai.", result: "40% Increase" },
        { icon: "💰", title: "Brand Trust", description: "Professional WhatsApp updates se customer trust build hota hai.", result: "95% Satisfaction" },
        { icon: "❤️", title: "Repeat Customers", description: "Personal touch aur care se dine-ins repeat rates badh jaata hai.", result: "2x Loyal" }
      ]}
      testimonial={{
        quote: "Pehele reservation manual call se hoti thhi. Ab TurantReply automated 80% bookings khud handle kar leta hai. Customers loved the quick responses!",
        name: "Vikram Malhotra",
        role: "Owner",
        location: "Spice Fusion, Hyderabad",
        result: "₹30k Extra Sales"
      }}
      faqs={[
        { question: "Multiple tables manage honge?", answer: "Haan! Dashboard se capacity load dalo aur AI bookings handle karega." },
        { question: "Payment reminders bhej sakte hain?", answer: "Bilkul. Direct payment links bhej sakte hain reservation confirm karne ke liye." }
      ]}
      ctaText="Mera Restaurant Dashboard Setup Karo →"
      ctaSubtext="60 seconds setup • 14 din free trial"
    />
  );
}

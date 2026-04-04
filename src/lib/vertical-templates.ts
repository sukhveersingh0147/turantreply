export type VerticalType = 
  "salon" | "gym" | "coaching" | "realestate" | "restaurant" | "other"

export interface CatalogItem {
  name: string
  category: string
  price: number        // in ₹
  description: string
}

export interface AutomationRule {
  name: string
  trigger: string      // keyword or event that fires this
  triggerType: "keyword" | "event" | "schedule"
  action: string       // what happens
  messageTemplate: string  // actual WhatsApp message sent
  delayMinutes: number // 0 = instant
  isActive: boolean
}

export interface MessageTemplate {
  name: string
  category: "appointment" | "reminder" | "offer" | 
            "followup" | "winback" | "broadcast" | "inquiry"
  message: string
  variables: string[]  // e.g. ["name", "date", "time"]
}

export interface ContactTag {
  name: string
  color: string   // hex color for UI badge
}

export interface OverviewKPI {
  key: string     // maps to existing analytics key
  label: string   // renamed label for this vertical
  icon: string    // emoji icon
  description: string
}

export interface VerticalData {
  label: string
  emoji: string
  aiSystemPrompt: string
  catalogItems: CatalogItem[]
  automationRules: AutomationRule[]
  messageTemplates: MessageTemplate[]
  contactTags: ContactTag[]
  overviewKPIs: OverviewKPI[]
}

export type VerticalDataMap = Record<VerticalType, VerticalData>

export const VERTICAL_DATA: VerticalDataMap = {
  salon: {
    label: "Salon & Beauty",
    emoji: "💇",
    aiSystemPrompt: "Aap [Business Name] ke WhatsApp assistant hain. Aapka kaam hai customers ki help karna — appointments book karna, services aur prices batana, aur queries resolve karna.\n\nBehavior rules:\n- Hamesha polite aur friendly raho\n- Hindi ya Hinglish mein baat karo jab customer kare\n- Appointment book karne ke liye puchho: naam, service chahiye, preferred date aur time\n- Agar slot confirm nahi kar sakte toh bolo: 'Main abhi check karta/karti hun, 2 minute mein batata/batati hun'\n- Price poochhe toh catalog se exact price batao\n- Festival offers automatically mention karo agar current month mein koi festival hai\n\nServices available: [catalog se auto-fill]\nTiming: [business settings se auto-fill]\nAddress: [business settings se auto-fill]",
    catalogItems: [
      { name: "Haircut (Women)", category: "Hair", price: 400, description: "Professional cut with wash and blow dry" },
      { name: "Haircut (Men)", category: "Hair", price: 200, description: "Clean cut with styling" },
      { name: "Hair Color (Full)", category: "Hair", price: 1200, description: "Full head color with premium products" },
      { name: "Highlights", category: "Hair", price: 1800, description: "Partial or full highlights" },
      { name: "Basic Facial", category: "Skin", price: 600, description: "Deep cleansing facial, 45 mins" },
      { name: "Gold Facial", category: "Skin", price: 1200, description: "Gold infused anti-aging facial" },
      { name: "Waxing (Full Body)", category: "Waxing", price: 800, description: "Full body waxing with soothing lotion" },
      { name: "Manicure + Pedicure", category: "Nails", price: 700, description: "Complete nail care with polish" },
      { name: "Bridal Package", category: "Bridal", price: 8000, description: "Full day bridal makeup + hair + skin" },
      { name: "Keratin Treatment", category: "Hair", price: 2500, description: "Smoothing treatment, lasts 3 months" }
    ],
    automationRules: [
      {
        name: "Appointment Inquiry Auto-Reply",
        trigger: "appointment|booking|book|slot|available",
        triggerType: "keyword",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "Namaste! 😊 [Business Name] mein aapka swagat hai!\n\nAppointment book karne ke liye batayein:\n1️⃣ Konsi service chahiye?\n2️⃣ Preferred date aur time?\n3️⃣ Aapka naam?\n\nHamare available slots:\n📅 Mon-Sat: 10 AM – 8 PM\n📅 Sunday: 11 AM – 6 PM"
      },
      {
        name: "Price Inquiry Auto-Reply",
        trigger: "price|rate|kitna|cost|charge|fees",
        triggerType: "keyword",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "Hमारी services aur prices:\n\n💇 Hair:\n• Haircut (Women): ₹400\n• Haircut (Men): ₹200\n• Hair Color: ₹1,200 onwards\n\n✨ Skin:\n• Basic Facial: ₹600\n• Gold Facial: ₹1,200\n\n💅 Nails:\n• Mani + Pedi: ₹700\n\n👰 Bridal Package: ₹8,000\n\nAppointment ke liye reply karein BOOK 📅"
      },
      {
        name: "24hr Appointment Reminder",
        trigger: "appointment_tomorrow",
        triggerType: "event",
        action: "send_reminder",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "⏰ Reminder: Kal aapka appointment hai!\n\nHi [Name]! Kal [Date] ko [Time] baje [Business Name] mein milte hain.\n\nService: [Service]\n\nReschedule karna ho toh abhi reply karein.\nSee you tomorrow! 💆‍♀️"
      },
      {
        name: "1hr Before Reminder",
        trigger: "appointment_1hr",
        triggerType: "event",
        action: "send_reminder",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "📍 Aapka appointment 1 ghante mein hai!\n\nHi [Name]! [Time] baje [Business Name] mein milte hain.\n\nAddress: [Address]\n\nLate ho toh inform kar dena 😊"
      },
      {
        name: "Post-Service Feedback",
        trigger: "appointment_completed",
        triggerType: "event",
        action: "send_message",
        delayMinutes: 60,
        isActive: true,
        messageTemplate: "💖 Thank you for visiting [Business Name]!\n\nHi [Name]! Aaj ka experience kaisa raha?\n1-5 mein rate karein:\n⭐ ⭐⭐ ⭐⭐⭐ ⭐⭐⭐⭐ ⭐⭐⭐⭐⭐\n\nAapka feedback humein aur better banata hai 🙏"
      },
      {
        name: "Win-Back (45 days inactive)",
        trigger: "no_visit_45_days",
        triggerType: "schedule",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "Hi [Name]! Aapko miss kar rahe hain 🌸\n\nKaafi time ho gaya [Business Name] aaye.\nIs hafte wapas aayein aur paayein:\n✨ 20% off kisi bhi service pe\n\nValid till [Date+7days]\nAppointment: Reply BOOK \nLimited slots! 💆‍♀️"
      }
    ],
    messageTemplates: [
      {
        name: "Appointment Confirmed",
        category: "appointment",
        variables: ["name", "date", "time", "service"],
        message: "✂️ Appointment Confirmed!\n\nHi [Name]! [Business Name] mein aapka appointment confirm ho gaya.\n\n📅 Date: [Date]\n⏰ Time: [Time]\n💆 Service: [Service]\n\nCancel ya reschedule ke liye reply karein.\nSee you soon! 😊"
      },
      {
        name: "Festival Offer",
        category: "offer",
        variables: ["festival_name", "discount", "valid_till"],
        message: "🎉 [Festival] Special Offer!\n\n[Business Name] ki taraf se [Festival] pe special gift:\n\n🌟 [Discount]% OFF sab services pe\n📅 Valid till: [Valid_Till]\n\nLimited slots hain!\nAbhi book karein: Reply BOOK ✨"
      },
      {
        name: "New Service Launch",
        category: "broadcast",
        variables: ["service_name", "price", "description"],
        message: "✨ New Service Launch!\n\n[Business Name] mein ab available:\n💫 [Service_Name]\n💰 Price: ₹[Price]\n📝 [Description]\n\nPehle 10 customers ko special introductory price!\nBook karein: Reply NOW 🎊"
      },
      {
        name: "Membership / Loyalty Reward",
        category: "offer",
        variables: ["name", "visit_count", "reward"],
        message: "🏆 Congratulations [Name]!\n\nAapka [Visit_Count]va visit complete hua [Business Name] pe.\n\n🎁 Aapka reward: [Reward]\n\nAgli visit pe redeem karein.\nThank you for being our valued client! 💖"
      },
      {
        name: "Appointment Reminder (24hr)",
        category: "reminder",
        variables: ["name", "date", "time", "service"],
        message: "⏰ Kal milte hain!\n\nHi [Name]! Kal [Date] ko [Time] baje appointment hai.\nService: [Service]\n\nAa rahe hain na? ✅ ke liye reply karein.\nChange karna ho toh bhi batayein 😊"
      },
      {
        name: "Win-Back Offer",
        category: "winback",
        variables: ["name", "days_since", "discount"],
        message: "Hum aapko miss kar rahe hain, [Name]! 🌸\n\n[Days_Since] din ho gaye — wapas aaiye aur paayein:\n💝 [Discount]% off\n\nSpecial offer sirf aapke liye!\nReply BOOK karein 💆‍♀️"
      }
    ],
    contactTags: [
      { name: "VIP Client", color: "#f59e0b" },
      { name: "Regular", color: "#3b82f6" },
      { name: "First Timer", color: "#8b5cf6" },
      { name: "Bridal Inquiry", color: "#ec4899" },
      { name: "Lapsed (45+ days)", color: "#ef4444" },
      { name: "Birthday This Month", color: "#f97316" },
      { name: "Feedback Pending", color: "#6b7280" },
      { name: "Referred Client", color: "#10b981" }
    ],
    overviewKPIs: [
      { key: "conversations_today", label: "Appointments Today", icon: "📅", description: "Aaj ke confirmed appointments" },
      { key: "leads_recovered", label: "No-shows Recovered", icon: "🔄", description: "Missed clients jo wapas aaye" },
      { key: "new_contacts_week", label: "New Clients This Week", icon: "👤", description: "Is hafte ke naye customers" },
      { key: "pending_replies", label: "Pending Queries", icon: "❓", description: "Unanswered customer questions" },
      { key: "revenue_this_month", label: "Est. Revenue This Month", icon: "💰", description: "WhatsApp se aaye bookings ki value" }
    ]
  },
  gym: {
    label: "Gym & Fitness",
    emoji: "💪",
    aiSystemPrompt: "Aap [Business Name] ke WhatsApp fitness consultant hain. Aapka kaam: visitors ko free trial book karana, membership plans explain karna, aur queries resolve karna.\n\nBehavior rules:\n- Energetic aur motivating tone rakhein\n- Trial ke liye hamesha push karein: 'Ek free trial se shuru karo!'\n- Membership renewal ke liye proactively remind karein\n- Class schedule, timings, trainer info poochhe toh settings se fetch karein\n- Hindi/Hinglish mein comfortable rahein\n\nPlans available: [catalog se auto-fill]\nTiming: [business settings se]\nAddress: [business settings se]",
    catalogItems: [
      { name: "Monthly Membership", category: "Membership", price: 1500, description: "Full gym access, all equipment" },
      { name: "Quarterly Membership", category: "Membership", price: 3999, description: "3 months, save ₹501" },
      { name: "Annual Membership", category: "Membership", price: 9999, description: "12 months, best value — save ₹8,001" },
      { name: "Personal Training (1 mo)", category: "Training", price: 5000, description: "12 PT sessions with certified trainer" },
      { name: "Zumba / Dance Classes", category: "Classes", price: 1200, description: "Monthly, 3 sessions per week" },
      { name: "Yoga Classes", category: "Classes", price: 1200, description: "Monthly, daily morning sessions" },
      { name: "Diet Consultation", category: "Wellness", price: 800, description: "One-time session with nutritionist" },
      { name: "Couple Membership", category: "Membership", price: 2500, description: "Monthly for 2 people, save ₹500" }
    ],
    automationRules: [
      {
        name: "Trial Booking Reply",
        trigger: "trial|free|join|membership|fees|charges",
        triggerType: "keyword",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "💪 Welcome to [Business Name]!\n\nFitness journey shuru karo FREE trial se!\n\nChoose your slot:\n🌅 Morning: 6 AM – 9 AM\n🌆 Evening: 5 PM – 8 PM\n\nKonsa time suit karta hai?\n1️⃣ Morning\n2️⃣ Evening\n\nReply 1 ya 2 karein! 🏋️"
      },
      {
        name: "Membership Plans Reply",
        trigger: "plan|price|rate|monthly|fees|kitna",
        triggerType: "keyword",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "🏋️ [Business Name] Membership Plans:\n\n💪 Monthly:   ₹1,500/month\n💪 Quarterly: ₹3,999 (save ₹501)\n💪 Annual:    ₹9,999 (save ₹8,001)\n\n➕ Add-ons:\n🎯 Personal Training: ₹5,000/month\n🕺 Zumba Classes: ₹1,200/month\n🧘 Yoga: ₹1,200/month\n\nFREE trial available!\nReply TRIAL to book yours 🔥"
      },
      {
        name: "Renewal Reminder (7 days before)",
        trigger: "membership_expiring_7days",
        triggerType: "event",
        action: "send_reminder",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "⚠️ Membership 7 din mein expire ho rahi hai!\n\nHi [Name]! Apni fitness streak mat todna!\n\nAbhi renew karo aur pao:\n🎁 [X] extra days FREE\n\nReply RENEW ya call: [Phone]\n\nChalte raho! 💪🔥"
      },
      {
        name: "Expiry Day Urgent",
        trigger: "membership_expiring_today",
        triggerType: "event",
        action: "send_reminder",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "🚨 Aaj membership expire ho rahi hai!\n\nHi [Name]! Aaj midnight tak renew karo.\n\nSame-day offer: [Discount]% OFF\n\nMiss mat karna — kal price wapas normal!\nReply RENEW now 💪"
      },
      {
        name: "Post-Trial Follow-Up",
        trigger: "trial_completed",
        triggerType: "event",
        action: "send_message",
        delayMinutes: 120,
        isActive: true,
        messageTemplate: "Hi [Name]! \n\nTrial kaisa laga? 🏋️\n\nAbhi join karo aur pao:\n🌟 First month: [Discount]% OFF\n⚡ Offer sirf aaj ke liye!\n\nReady to start your journey?\nReply JOIN 💪"
      },
      {
        name: "Win-Back (30 days lapsed)",
        trigger: "no_visit_30_days",
        triggerType: "schedule",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "Hi [Name]! [Business Name] mein aapko miss kar rahe hain! 🏃\n\nWapas aao is hafte:\n💥 [Discount]% off any plan\n\nSirf aapke liye special offer!\nReply REJOIN 💪"
      }
    ],
    messageTemplates: [
      {
        name: "Trial Confirmed",
        category: "appointment",
        variables: ["name", "date", "time"],
        message: "✅ Free Trial Confirmed!\n\nHi [Name]! Aapka free trial booked hai:\n📅 [Date] | ⏰ [Time]\n📍 [Business Name], [Address]\n\nComfortable sportswear pehenna.\nWater bottle saath lana.\nSee you! 💪"
      },
      {
        name: "Membership Renewal Reminder",
        category: "reminder",
        variables: ["name", "expiry_date", "plan"],
        message: "⏰ Renewal Reminder\n\nHi [Name]! [Plan] membership [Expiry_Date] ko expire ho rahi hai.\n\nRenew karein aur streak jaari rakhein:\nReply RENEW 🏋️"
      },
      {
        name: "Referral Program",
        category: "offer",
        variables: ["name"],
        message: "🎁 Refer karo, Earn karo!\n\nHi [Name]! Har ek dost jo [Business Name] join kare, aapko milenge 7 FREE gym days!\n\nUnhe yeh message forward karo.\nUnka pehla month: 20% OFF 🔥"
      },
      {
        name: "New Batch / Class Announcement",
        category: "broadcast",
        variables: ["class_name", "start_date", "timing", "price"],
        message: "🎉 New Batch Starting!\n\n[Class_Name] ka naya batch:\n📅 Starting: [Start_Date]\n⏰ Timing: [Timing]\n💰 Price: ₹[Price]/month\n\nLimited seats!\nReply JOIN to register 🏃"
      },
      {
        name: "Challenge Campaign",
        category: "offer",
        variables: ["challenge_name", "duration", "prize"],
        message: "🔥 [Challenge_Name] Challenge!\n\n[Duration] ka challenge join karo.\nWinner ko milega: [Prize]\n\nReady?\nReply CHALLENGE 💪🏆"
      }
    ],
    contactTags: [
      { name: "Active Member", color: "#22c55e" },
      { name: "Expiring This Week", color: "#f59e0b" },
      { name: "Expired", color: "#ef4444" },
      { name: "Trial Pending", color: "#8b5cf6" },
      { name: "PT Client", color: "#3b82f6" },
      { name: "Referred", color: "#10b981" },
      { name: "Lapsed (30+ days)", color: "#6b7280" }
    ],
    overviewKPIs: [
      { key: "conversations_today", label: "Trial Requests Today", icon: "🆓", description: "Aaj ke free trial bookings" },
      { key: "leads_recovered", label: "Renewals Recovered", icon: "🔄", description: "Expired jo renew hue" },
      { key: "new_contacts_week", label: "New Members This Week", icon: "💪", description: "Is hafte ke naye members" },
      { key: "pending_replies", label: "Renewals Due This Week", icon: "⚠️", description: "7 din mein expire hone wale" },
      { key: "revenue_this_month", label: "Membership Revenue", icon: "💰", description: "Is mahine ki membership income" }
    ]
  },
  coaching: {
    label: "Coaching & Tuition",
    emoji: "📚",
    aiSystemPrompt: "Aap [Business Name] ke admissions assistant hain. Kaam: students/parents ki help karna — courses samjhana, demo class book karna, fees batana, batches ki info dena.\n\nBehavior rules:\n- Professional lekin friendly tone\n- Parents se baat karte waqt respectful raho\n- Demo class ke liye hamesha encourage karo: 'Pehle ek FREE demo attend karo!'\n- Fee structure clearly batao, koi confusion nahi\n- Exam results, toppers ka mention karo confidence banane ke liye\n\nCourses: [catalog se auto-fill]\nBatches: [business settings se]\nAddress: [business settings se]",
    catalogItems: [
      { name: "Class 9-10 (Science+Maths)", category: "School", price: 2500, description: "Monthly, all subjects, small batches" },
      { name: "Class 11-12 (Science)", category: "School", price: 3000, description: "Monthly, PCM/PCB, expert faculty" },
      { name: "JEE Mains Preparation", category: "Entrance", price: 5000, description: "Monthly, comprehensive course" },
      { name: "NEET Preparation", category: "Entrance", price: 5000, description: "Monthly, Biology focus" },
      { name: "Spoken English", category: "Language", price: 1500, description: "Monthly, 5 days/week" },
      { name: "Coding for Kids (6-14 yrs)", category: "Skills", price: 2000, description: "Monthly, Scratch + Python basics" },
      { name: "CA Foundation", category: "Commerce", price: 3500, description: "Monthly, all subjects" },
      { name: "Government Exam Prep", category: "Entrance", price: 2500, description: "Monthly, SSC/Bank/Railway" }
    ],
    automationRules: [
      {
        name: "Demo Class Inquiry Reply",
        trigger: "demo|admission|join|class|coaching|tuition|batch",
        triggerType: "keyword",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "Namaste! 🙏 [Business Name] mein aapka swagat hai!\n\nKaunsi class/course mein interest hai?\n1️⃣ Class 9-10\n2️⃣ Class 11-12\n3️⃣ JEE/NEET Preparation\n4️⃣ Spoken English / Skills\n5️⃣ Government Exams\n\nReply karein — FREE demo class arrange karte hain! 📚"
      },
      {
        name: "Fee Inquiry Reply",
        trigger: "fees|fee|price|kitna|charges|cost",
        triggerType: "keyword",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "📋 [Business Name] — Fee Structure:\n\n📚 School Classes:\n• Class 9-10: ₹2,500/month\n• Class 11-12: ₹3,000/month\n\n🎯 Entrance Exam Prep:\n• JEE Mains: ₹5,000/month\n• NEET: ₹5,000/month\n\n💬 Skills:\n• Spoken English: ₹1,500/month\n• Coding: ₹2,000/month\n\nFREE demo class available!\nReply DEMO to book 🎓"
      },
      {
        name: "Demo Attended — Follow Up",
        trigger: "demo_attended_not_enrolled",
        triggerType: "event",
        action: "send_message",
        delayMinutes: 2880,
        isActive: true,
        messageTemplate: "Namaste [Name]! 🙏\n\nDemo class kaisi lagi? \nKoi questions hain toh poochh sakte hain.\n\nIs hafte admission lene pe:\n🎁 Registration fees WAIVED\n📚 Free study material\n\nSeats limited hain!\nReply ENROLL 🎓"
      },
      {
        name: "Fee Due Reminder (5 days before)",
        trigger: "fee_due_5days",
        triggerType: "event",
        action: "send_reminder",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "📌 Fee Reminder — [Business Name]\n\nNamaste [Parent Name]! 🙏\n\n[Student Name] ki fees due hai:\n💰 Amount: ₹[Amount]\n📅 Due Date: [Date]\n📚 Course: [Course]\n\nUPI: [UPI ID]\n\nPay hone pe reply PAID karein.\nDhanyawad! 🙏"
      },
      {
        name: "Fee Overdue Notice",
        trigger: "fee_overdue",
        triggerType: "event",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "⚠️ Fee Overdue — [Business Name]\n\nNamaste [Parent Name],\n\n[Student Name] ki [Date] wali fees abhi pending hai.\n\nClasses continuity ke liye aaj payment karein.\n\nHelp chahiye? Reply karein 🙏"
      },
      {
        name: "New Batch Announcement",
        trigger: "new_batch_starting",
        triggerType: "schedule",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "🎉 New Batch Starting!\n\n[Business Name] mein naya batch:\n📚 Course: [Course]\n📅 Starting: [Date]\n⏰ Timing: [Time]\n👥 Seats: Limited\n\nEarly bird offer: ₹[Discount] off\n\nAbhi register karein:\nReply ENROLL 🎓"
      }
    ],
    messageTemplates: [
      {
        name: "Demo Class Confirmed",
        category: "appointment",
        variables: ["name", "date", "time", "subject", "address"],
        message: "✅ Demo Class Confirmed!\n\nNamaste [Name]! 🎓\nFREE demo class booked:\n📅 [Date] | ⏰ [Time]\n📚 Subject: [Subject]\n📍 [Address]\n\nNotebook aur pen saath lana.\nKoi bhi doubt leke aana — poora clear karenge! 🙏"
      },
      {
        name: "Fee Payment Confirmation",
        category: "reminder",
        variables: ["parent_name", "student_name", "amount", "month"],
        message: "✅ Payment Received!\n\nNamaste [Parent_Name]! 🙏\n\n[Student_Name] ki [Month] ki fees ₹[Amount] receive ho gayi.\n\nReceipt aapko email/WhatsApp pe bhej di jayegi.\nDhanyawad! 📚"
      },
      {
        name: "Exam Tips Broadcast",
        category: "broadcast",
        variables: ["exam_name", "exam_date", "tip"],
        message: "📝 [Exam_Name] Exam Tips!\n\nExam date: [Exam_Date]\n\nTip of the day:\n💡 [Tip]\n\nAll the best from [Business Name] family! 🎓"
      },
      {
        name: "Result Announcement",
        category: "broadcast",
        variables: ["topper_name", "marks", "course"],
        message: "🏆 Results Declared!\n\n[Business Name] ke students ne kiya kamaal!\n\n🌟 Top performer:\n[Topper_Name] — [Marks]\nCourse: [Course]\n\nCongratulations to all students!\nNext batch ke liye: Reply ENROLL 🎓"
      },
      {
        name: "Holiday Notice",
        category: "broadcast",
        variables: ["holiday_name", "date", "resume_date"],
        message: "📢 Holiday Notice\n\n[Business Name] [Holiday_Name] ki wajah se [Date] ko band rahega.\n\nClasses resume: [Resume_Date]\n\nHappy [Holiday_Name]! 🎊🙏"
      }
    ],
    contactTags: [
      { name: "Enrolled Student", color: "#22c55e" },
      { name: "Demo Attended", color: "#3b82f6" },
      { name: "Inquiry Pending", color: "#f59e0b" },
      { name: "Fee Due", color: "#ef4444" },
      { name: "Parent Contact", color: "#8b5cf6" },
      { name: "Exam Appearing", color: "#f97316" },
      { name: "Alumni", color: "#10b981" }
    ],
    overviewKPIs: [
      { key: "conversations_today", label: "Demo Classes Today", icon: "📅", description: "Aaj ke scheduled demo classes" },
      { key: "leads_recovered", label: "Demos Converted", icon: "🎓", description: "Demo ke baad enrolled students" },
      { key: "new_contacts_week", label: "New Inquiries This Week", icon: "📚", description: "Is hafte aaye naye inquiries" },
      { key: "pending_replies", label: "Pending Fee Collections", icon: "💰", description: "Due/overdue fee payments" },
      { key: "revenue_this_month", label: "Fee Collection This Month", icon: "📊", description: "Is mahine ki total fee income" }
    ]
  },
  realestate: {
    label: "Real Estate",
    emoji: "🏠",
    aiSystemPrompt: "Aap [Agency Name] ke property consultant assistant hain. Kaam: buyers/investors ki queries handle karna, properties suggest karna, site visit book karna.\n\nBehavior rules:\n- Professional tone, confidence dikhao\n- Pehle qualify karo: budget, location, BHK\n- Har inquiry ke liye SPEED sabse important hai — 0.3 second mein reply hona chahiye\n- Site visit ke liye hamesha push karo\n- Property details mein hamesha key benefits highlight karo\n- NRI buyers ke saath extra detail dena\n\nQualification sequence:\n1. Budget range kya hai?\n2. Location preference?\n3. BHK requirement?\n4. Ready-to-move ya under-construction?\n5. Investment ya self-use?\n\nProperties: [catalog se auto-fill]\nAgent contact: [business settings se]",
    catalogItems: [
      { name: "1 BHK Apartment", category: "Residential", price: 2500000, description: "800 sq.ft., prime location, ready to move" },
      { name: "2 BHK Apartment", category: "Residential", price: 4500000, description: "1200 sq.ft., modern amenities" },
      { name: "3 BHK Apartment", category: "Residential", price: 7500000, description: "1800 sq.ft., premium society" },
      { name: "Residential Plot", category: "Plot", price: 3000000, description: "200 sq.yd., residential zone approved" },
      { name: "Commercial Shop", category: "Commercial", price: 5000000, description: "Ground floor, high footfall area" },
      { name: "Commercial Office", category: "Commercial", price: 8000000, description: "2nd floor, 1500 sq.ft." },
      { name: "Villa / Independent", category: "Residential", price: 15000000, description: "3BHK+Study, private garden" },
      { name: "Agricultural Land", category: "Land", price: 2000000, description: "Per bigha, highway facing" }
    ],
    automationRules: [
      {
        name: "Property Inquiry Instant Reply",
        trigger: "property|flat|bhk|plot|buy|purchase|available|price",
        triggerType: "keyword",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "Namaste! 🏠 [Agency Name] mein aapka swagat hai!\n\nPerfect property dhundhne mein help karta/karti hun.\n\nKuch quick questions:\n1️⃣ Budget kya hai?\n2️⃣ Location preference?\n3️⃣ BHK requirement?\n\nReply karein — matching properties instantly bhejta/bhejti hun! 📍"
      },
      {
        name: "Budget Matched — Send Listings",
        trigger: "budget_received",
        triggerType: "event",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "🏡 Aapke budget mein best options:\n\n1️⃣ [Property 1 Name]\n   📍 [Location] | 💰 ₹[Price]\n   🛏️ [BHK] | 📐 [Sqft]\n\n2️⃣ [Property 2 Name]\n   📍 [Location] | 💰 ₹[Price]\n   🛏️ [BHK] | 📐 [Sqft]\n\n3️⃣ [Property 3 Name]\n   📍 [Location] | 💰 ₹[Price]\n   🛏️ [BHK] | 📐 [Sqft]\n\nPhotos chahiye ya site visit book karein?\nReply VISIT 🗺️"
      },
      {
        name: "Site Visit Confirmation",
        trigger: "site_visit_booked",
        triggerType: "event",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "✅ Site Visit Confirmed!\n\nHi [Name]!\n📅 [Date] | ⏰ [Time]\n📍 [Property Address]\n\nAgent: [Agent Name]\n📞 [Agent Phone]\n\nWoh aapko property pe milenge.\nDirections: Reply DIRECTIONS 🗺️"
      },
      {
        name: "Post Site Visit Follow-Up",
        trigger: "site_visit_completed",
        triggerType: "event",
        action: "send_message",
        delayMinutes: 1440,
        isActive: true,
        messageTemplate: "Hi [Name]! 👋\n\nKal [Property Name] visit kaisi lagi?\n\nKoi questions hain? \nSimilar options dekhne hain?\n\nSpecial pre-booking offer abhi available:\n💰 [Offer Details]\n\nReply YES to know more! 🏠"
      },
      {
        name: "Cold Lead Reactivation (7 days)",
        trigger: "no_response_7_days",
        triggerType: "schedule",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "Hi [Name]! \n\n[Location] mein properties dekh rahe the aap kuch din pehle.\n\nAbhi ek NEW listing aayi hai jo exactly match karti hai!\n\nBudget: ₹[Range] | [BHK] in [Location]\n\nDetails chahiye? Reply YES 🏡"
      },
      {
        name: "New Project Launch Broadcast",
        trigger: "new_project_launch",
        triggerType: "schedule",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "🏗️ NEW Project Launch!\n\n[Project Name] — [Location]\n\n🛏️ [BHK Options]\n💰 Starting ₹[Price]\n✅ [Key Feature 1]\n✅ [Key Feature 2]\n✅ [Key Feature 3]\n\nPre-launch price sirf limited time ke liye!\n\nSite visit book karein:\nReply VISIT 🏠"
      }
    ],
    messageTemplates: [
      {
        name: "Property Details",
        category: "inquiry",
        variables: ["property_name", "location", "price", "bhk", "sqft", "features", "photos_link"],
        message: "🏡 [Property_Name]\n\n📍 Location: [Location]\n💰 Price: ₹[Price]\n🛏️ [BHK] | 📐 [Sqft] sq.ft.\n\n✅ [Features]\n\n📸 Photos: [Photos_Link]\n\nSite visit book karein?\nReply VISIT 🗺️"
      },
      {
        name: "Site Visit Reminder",
        category: "reminder",
        variables: ["name", "date", "time", "address", "agent_name"],
        message: "⏰ Site Visit Reminder\n\nHi [Name]! Kal ka visit:\n📅 [Date] | ⏰ [Time]\n📍 [Address]\n👤 Agent: [Agent_Name]\n\nConfirm? Reply YES ✅"
      },
      {
        name: "Price Drop Alert",
        category: "broadcast",
        variables: ["property_name", "old_price", "new_price", "location"],
        message: "🔥 Price Drop Alert!\n\n[Property_Name] in [Location]:\n\nWas:  ₹[Old_Price]\nNow:  ₹[New_Price]\nSave: ₹[Saving]\n\nLimited units at this price!\nReply INTERESTED 🏠"
      },
      {
        name: "EMI Calculator",
        category: "inquiry",
        variables: ["property_price", "emi_amount", "tenure"],
        message: "📊 EMI Estimate\n\nProperty: ₹[Property_Price]\nDown payment (20%): ₹[Down]\nLoan amount: ₹[Loan]\n\nEMI approx: ₹[EMI_Amount]/month\nTenure: [Tenure] years\n\nHome loan assistance chahiye?\nReply LOAN 🏦"
      },
      {
        name: "Referral Program",
        category: "offer",
        variables: ["name"],
        message: "🎁 Refer & Earn!\n\nHi [Name]! Kisi ko property dhundhhne mein help karo.\n\nUnka deal close hone pe:\n💰 Aapko milega ₹[Amount] cash\n\nRefer karo: Forward this message to anyone buying property! 🏠"
      }
    ],
    contactTags: [
      { name: "Hot Lead", color: "#ef4444" },
      { name: "Site Visit Done", color: "#f59e0b" },
      { name: "Warm Lead", color: "#f97316" },
      { name: "Cold Lead", color: "#6b7280" },
      { name: "Investor", color: "#8b5cf6" },
      { name: "NRI Buyer", color: "#3b82f6" },
      { name: "Deal Closed", color: "#22c55e" },
      { name: "Referral Source", color: "#10b981" }
    ],
    overviewKPIs: [
      { key: "conversations_today", label: "New Inquiries Today", icon: "📩", description: "Aaj aayi property inquiries" },
      { key: "leads_recovered", label: "Cold Leads Reactivated", icon: "🔄", description: "Cold leads jo wapas respond kiye" },
      { key: "new_contacts_week", label: "Site Visits This Week", icon: "🗺️", description: "Is hafte ke site visits" },
      { key: "pending_replies", label: "Hot Leads Pending", icon: "🔥", description: "Follow-up pending hot leads" },
      { key: "revenue_this_month", label: "Deals Pipeline Value", icon: "💰", description: "Active deals ki estimated value" }
    ]
  },
  restaurant: {
    label: "Restaurant & Cafe",
    emoji: "🍽️",
    aiSystemPrompt: "Aap [Restaurant Name] ke WhatsApp assistant hain. Kaam: table booking, menu sharing, daily specials batana, catering inquiries handle karna.\n\nBehavior rules:\n- Warm aur welcoming tone\n- Table booking ke liye puchho: date, time, guest count, occasion\n- Aaj ka special hamesha mention karo\n- Large orders (10+ people) ke liye manager se confirm karne ko kaho\n- Delivery available hai toh mention karo\n\nTimings: [business settings se]\nAddress: [business settings se]\nReservation contact: [business settings se]",
    catalogItems: [
      { name: "Veg Thali", category: "Main Course", price: 180, description: "Dal, sabzi, roti, rice, salad, dessert" },
      { name: "Non-Veg Thali", category: "Main Course", price: 250, description: "Chicken curry, roti, rice, salad" },
      { name: "Paneer Butter Masala", category: "Main Course", price: 220, description: "Rich tomato-based gravy" },
      { name: "Tandoori Platter", category: "Starters", price: 350, description: "Mixed tandoori items for 2" },
      { name: "Cafe Special Coffee", category: "Beverages", price: 120, description: "Signature cold coffee blend" },
      { name: "Birthday Package", category: "Packages", price: 1500, description: "Table decoration + cake + meal for 2" },
      { name: "Corporate Lunch", category: "Catering", price: 350, description: "Per person, minimum 20 people" },
      { name: "Private Dining Setup", category: "Packages", price: 3000, description: "Private room, decoration, set menu" }
    ],
    automationRules: [
      {
        name: "Table Booking Reply",
        trigger: "table|booking|reservation|available|seat",
        triggerType: "keyword",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "🍽️ [Restaurant Name] mein aapka swagat hai!\n\nTable book karne ke liye batayein:\n👥 Kitne guests honge?\n📅 Konsi date?\n⏰ Konsa time?\n🎂 Koi special occasion? \n\nReply karein — confirm karte hain!"
      },
      {
        name: "Menu Inquiry Reply",
        trigger: "menu|food|kya|dishes|available|price",
        triggerType: "keyword",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "🍛 [Restaurant Name] — Menu Highlights:\n\n🥗 Starters:\n• Tandoori Platter: ₹350\n\n🍲 Main Course:\n• Veg Thali: ₹180\n• Non-Veg Thali: ₹250\n• Paneer Butter Masala: ₹220\n\n☕ Beverages:\n• Special Coffee: ₹120\n\n🎉 Special Packages available!\n\nTable book karein? Reply BOOK 📅"
      },
      {
        name: "Booking Confirmation",
        trigger: "booking_confirmed",
        triggerType: "event",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "✅ Table Booked!\n\nHi [Name]! Aapka table confirm hai:\n📅 [Date] | ⏰ [Time]\n👥 [Guests] guests\n📍 [Restaurant Name], [Address]\n\n2 ghante pehle reminder milega.\n\nSpecial request hai toh reply karein 🍽️"
      },
      {
        name: "2hr Before Reminder",
        trigger: "booking_2hrs_before",
        triggerType: "event",
        action: "send_reminder",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "⏰ 2 ghante mein milte hain!\n\nHi [Name]! Aaj [Time] baje [Restaurant Name] mein aapka table ready hai.\n\nLate ho jaao toh inform kar dena.\nSee you soon! 🍽️😊"
      },
      {
        name: "Post-Visit Feedback + Offer",
        trigger: "visit_completed",
        triggerType: "event",
        action: "send_message",
        delayMinutes: 90,
        isActive: true,
        messageTemplate: "💖 Thank you for dining with us, [Name]!\n\nAaj ka experience kaisa raha?\n⭐⭐⭐⭐⭐ Reply 1-5\n\nNext visit pe 10% off — yeh message billing pe dikhayein 🎁\n\nSee you again! 🍽️"
      },
      {
        name: "Daily Special Broadcast",
        trigger: "daily_special_broadcast",
        triggerType: "schedule",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "🔥 Aaj ka Special!\n\n[Restaurant Name]:\n🍛 [Dish Name] — ₹[Price]\n📝 [Description]\n\nSirf aaj [Time] tak!\n\nTable reserve karein:\nReply TABLE 🍽️"
      }
    ],
    messageTemplates: [
      {
        name: "Table Confirmed",
        category: "appointment",
        variables: ["name", "date", "time", "guests", "address"],
        message: "✅ Reservation Confirmed!\n\nHi [Name]! 🍽️\n📅 [Date] | ⏰ [Time]\n👥 [Guests] guests\n📍 [Address]\n\nSpecial request? Reply karein.\nSee you! 😊"
      },
      {
        name: "Weekend Special",
        category: "broadcast",
        variables: ["special_dish", "price", "valid_days"],
        message: "🎉 Weekend Special!\n\n[Restaurant Name] mein is weekend:\n🍛 [Special_Dish] — ₹[Price]\n📅 [Valid_Days]\n\nTable: Reply BOOK 🍽️"
      },
      {
        name: "Birthday / Anniversary Package",
        category: "offer",
        variables: ["occasion_type", "package_details", "price"],
        message: "🎂 [Occasion_Type] Special Package!\n\n[Restaurant Name] mein celebrate karein:\n✨ [Package_Details]\n💰 Starting ₹[Price]\n\nPrivate setup available!\nBook karein: Reply CELEBRATE 🎊"
      },
      {
        name: "Catering Inquiry Reply",
        category: "inquiry",
        variables: ["min_people", "price_per_head"],
        message: "🍽️ Catering Services\n\n[Restaurant Name] catering available hai:\n\n👥 Minimum: [Min_People] people\n💰 Per person: ₹[Price_Per_Head]\n\nCorporate lunch, parties, events — sab ke liye available.\n\nDate aur requirement batayein!\nReply CATERING 📋"
      },
      {
        name: "Lapsed Customer Win-Back",
        category: "winback",
        variables: ["name", "days_since", "offer"],
        message: "Hi [Name]! Aapko miss kar rahe hain 🍽️\n\n[Days_Since] din ho gaye [Restaurant Name] aaye.\n\nWapas aaiye aur paayein:\n🎁 [Offer]\n\nTable: Reply BOOK 😊"
      }
    ],
    contactTags: [
      { name: "Regular Customer", color: "#22c55e" },
      { name: "First Timer", color: "#3b82f6" },
      { name: "Birthday This Month", color: "#f59e0b" },
      { name: "Catering/Bulk", color: "#8b5cf6" },
      { name: "Lapsed (30+ days)", color: "#ef4444" },
      { name: "VIP / Corporate", color: "#f97316" },
      { name: "Feedback Pending", color: "#6b7280" }
    ],
    overviewKPIs: [
      { key: "conversations_today", label: "Reservations Today", icon: "📅", description: "Aaj ke confirmed table bookings" },
      { key: "leads_recovered", label: "Repeat Customers", icon: "🔄", description: "Wapas aane wale customers" },
      { key: "new_contacts_week", label: "New Customers This Week", icon: "👤", description: "Is hafte ke naye diners" },
      { key: "pending_replies", label: "Pending Bookings", icon: "⏳", description: "Unconfirmed reservations" },
      { key: "revenue_this_month", label: "Booking Revenue", icon: "💰", description: "Table bookings ki estimated value" }
    ]
  },
  other: {
    label: "Other Business",
    emoji: "🏢",
    aiSystemPrompt: "Aap [Business Name] ke WhatsApp assistant hain. Aapka kaam customer queries handle karna, services/products ki info dena, aur appointments/orders manage karna hai.\n\nBehavior rules:\n- Professional aur helpful tone\n- Customer ki query ko dhyan se samjho\n- Agar koi specific info nahi hai toh humane agent se connect karne ka option do\n- Service/product list catalog se lo\n\nServices: [catalog se auto-fill]\nContact: [business settings se]",
    catalogItems: [
      { name: "Service 1", category: "Services", price: 500, description: "Add your service description" },
      { name: "Service 2", category: "Services", price: 1000, description: "Add your service description" },
      { name: "Product 1", category: "Products", price: 750, description: "Add your product description" },
      { name: "Package Deal", category: "Packages", price: 2000, description: "Combo offer — customize as needed" },
      { name: "Consultation", category: "Services", price: 300, description: "30-minute expert consultation" }
    ],
    automationRules: [
      {
        name: "General Inquiry Reply",
        trigger: "hi|hello|namaste|info|help|query|price|available",
        triggerType: "keyword",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "Namaste! 😊 [Business Name] mein aapka swagat hai!\n\nHum aapki kya help kar sakte hain?\n1️⃣ Services / Products dekhein\n2️⃣ Price list\n3️⃣ Appointment/Order book karein\n4️⃣ Existing order status\n\nReply karein — hum turant help karenge!"
      },
      {
        name: "Price Inquiry",
        trigger: "price|rate|kitna|cost|fees",
        triggerType: "keyword",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "💰 [Business Name] — Price List:\n\n[Auto-populated from your catalog]\n\nKoi specific service ya product ke baare mein poochhna ho toh batayein!\n\nAppointment/order ke liye:\nReply BOOK 📅"
      },
      {
        name: "Follow-Up (2 days no response)",
        trigger: "no_response_2days",
        triggerType: "schedule",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "Hi [Name]! 👋\n\nKuch din pehle aapne [Business Name] se contact kiya tha.\n\nKya hum kisi tarah help kar sakte hain?\n\nReply karein — hum yahan hain! 😊"
      },
      {
        name: "Booking Confirmation",
        trigger: "booking_confirmed",
        triggerType: "event",
        action: "send_message",
        delayMinutes: 0,
        isActive: true,
        messageTemplate: "✅ Booking Confirmed!\n\nHi [Name]!\n📅 [Date] | ⏰ [Time]\n📍 [Location/Address]\n\nQuestions hain? Reply karein.\nSee you! 😊"
      },
      {
        name: "Feedback Request",
        trigger: "service_completed",
        triggerType: "event",
        action: "send_message",
        delayMinutes: 60,
        isActive: true,
        messageTemplate: "💖 Thank you, [Name]!\n\n[Business Name] se aapka experience kaisa raha?\n\n1-5 mein rate karein ⭐\n\nAapka feedback humare liye bahut important hai! 🙏"
      }
    ],
    messageTemplates: [
      {
        name: "General Offer",
        category: "offer",
        variables: ["offer_details", "valid_till"],
        message: "🎉 Special Offer!\n\n[Business Name] ki taraf se:\n✨ [Offer_Details]\n📅 Valid till: [Valid_Till]\n\nBook karein: Reply NOW 📩"
      },
      {
        name: "Appointment Confirmation",
        category: "appointment",
        variables: ["name", "date", "time"],
        message: "✅ Appointment Confirmed!\n\nHi [Name]!\n📅 [Date] | ⏰ [Time]\n\nAgar change karna ho toh pehle inform karein.\nSee you! 😊"
      },
      {
        name: "Follow-Up Message",
        category: "followup",
        variables: ["name"],
        message: "Hi [Name]! \n\n[Business Name] se follow up.\nKya aapko kisi cheez mein help chahiye?\n\nReply karein 😊"
      },
      {
        name: "Win-Back",
        category: "winback",
        variables: ["name", "offer"],
        message: "Hi [Name]! Aapko miss kar rahe hain!\n\nWapas aaiye aur paayein:\n🎁 [Offer]\n\nReply BOOK 📅"
      },
      {
        name: "Broadcast Announcement",
        category: "broadcast",
        variables: ["announcement"],
        message: "📢 [Business Name] — Update!\n\n[Announcement]\n\nQuestions? Reply karein 😊"
      }
    ],
    contactTags: [
      { name: "Customer", color: "#22c55e" },
      { name: "Hot Lead", color: "#ef4444" },
      { name: "Follow-Up Needed", color: "#f59e0b" },
      { name: "VIP", color: "#f97316" },
      { name: "Inactive", color: "#6b7280" },
      { name: "New Inquiry", color: "#3b82f6" }
    ],
    overviewKPIs: [
      { key: "conversations_today", label: "Inquiries Today", icon: "📩", description: "Aaj aayi customer queries" },
      { key: "leads_recovered", label: "Leads Recovered", icon: "🔄", description: "Follow-up se wapas aaye leads" },
      { key: "new_contacts_week", label: "New Contacts This Week", icon: "👤", description: "Is hafte ke naye contacts" },
      { key: "pending_replies", label: "Pending Replies", icon: "⏳", description: "Unanswered customer messages" },
      { key: "revenue_this_month", label: "Revenue This Month", icon: "💰", description: "Is mahine ki estimated income" }
    ]
  }
}

export default VERTICAL_DATA

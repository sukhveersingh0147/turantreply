"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVerticalSetup } from '@/hooks/useVerticalSetup';
import ActionCard from './ActionCard';
import { VerticalType } from '@/lib/verticals';
import { 
  MessageCircle, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Zap, 
  Plus, 
  BarChart3, 
  Users,
  AlertCircle,
  GraduationCap,
  Building2,
  UtensilsCrossed,
  Gift,
  Search,
  DollarSign,
  Trophy,
  History,
  Info
} from 'lucide-react';

interface QuickStats {
    pendingQueries: number;
    todayAppointments: number;
    todayReminders: number;
    expiringThisWeek: number;
    feeDueCount: number;
    hotLeadsCount: number;
    lapsedCount: number;
}

interface QuickAction {
    icon: string | React.ReactNode;
    label: string;
    description: string;
    onClick: () => void;
    badgeCount?: number;
}

export default function QuickActionsPanel({ 
    businessType = 'OTHER' 
}: { 
    businessType?: string 
}) {
    const router = useRouter();
    const [stats, setStats] = useState<QuickStats>({
        pendingQueries: 0,
        todayAppointments: 0,
        todayReminders: 0,
        expiringThisWeek: 0,
        feeDueCount: 0,
        hotLeadsCount: 0,
        lapsedCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const { verticalLabel, verticalEmoji } = useVerticalSetup(businessType);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/overview/quick-stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch quick stats", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const openBroadcastModal = (config: { message: string, segment: string }) => {
        const params = new URLSearchParams({
            prefill_message: config.message,
            prefill_segment: config.segment
        });
        router.push(`/broadcast?${params.toString()}`);
    };

    const getActions = (type: string): QuickAction[] => {
        const vertical = (type.toUpperCase() as VerticalType) || 'OTHER';

        const commonActions = {
            analytics: {
                icon: "📊",
                label: "Analytics dekho",
                description: "Is hafte ka performance",
                onClick: () => router.push("/analytics")
            }
        };

        const actions: Record<VerticalType, QuickAction[]> = {
            SALON: [
                {
                    icon: "📢",
                    label: "Aaj ka offer bhejo",
                    description: "Salon offer broadcast karo",
                    onClick: () => openBroadcastModal({
                        message: "🌸 Aaj ka special offer!\n\n[Business Name] mein aaj:\n✨ [X]% OFF sab services pe\n\nLimited slots — Reply BOOK 💆‍♀️",
                        segment: "all"
                    })
                },
                {
                    icon: "📅",
                    label: "Appointments dekho",
                    description: "Aaj ke scheduled appointments",
                    onClick: () => router.push("/appointments?filter=today"),
                    badgeCount: stats.todayAppointments
                },
                {
                    icon: "⏰",
                    label: "Reminders bhejo",
                    description: "Pending appointment reminders",
                    onClick: () => router.push("/reminders?filter=today"),
                    badgeCount: stats.todayReminders
                },
                {
                    icon: "💬",
                    label: "Pending queries",
                    description: "Unanswered customer messages",
                    onClick: () => router.push("/queries?filter=pending"),
                    badgeCount: stats.pendingQueries
                },
                {
                    icon: "🎂",
                    label: "Birthday wishes bhejo",
                    description: "Is mahine ke birthdays",
                    onClick: () => openBroadcastModal({
                        message: "🎂 Happy Birthday [Name]!\n\n[Business Name] ki taraf se special gift:\n🎁 20% OFF aapki next visit pe\n\nEnjoy your special day! 🌸",
                        segment: "birthday_this_month"
                    })
                },
                {
                    icon: "🔄",
                    label: "Lapsed clients",
                    description: "45+ din se nahi aaye",
                    onClick: () => router.push("/contacts?tag=Lapsed+(45%2B+days)"),
                    badgeCount: stats.lapsedCount
                },
                commonActions.analytics,
                {
                    icon: "➕",
                    label: "New appointment",
                    description: "Manually add karo",
                    onClick: () => router.push("/appointments?action=new")
                }
            ],
            GYM: [
                {
                    icon: "🆓",
                    label: "Trial slots bhejo",
                    description: "Free trial offer broadcast",
                    onClick: () => openBroadcastModal({
                        message: "💪 FREE Trial Session!\n\n[Business Name] mein join karo:\n🌅 Morning: 6-9 AM\n🌆 Evening: 5-8 PM\n\nReply TRIAL to book yours! 🏋️",
                        segment: "all"
                    })
                },
                {
                    icon: "⚠️",
                    label: "Renewals due",
                    description: "7 din mein expire hone wale",
                    onClick: () => router.push("/contacts?tag=Expiring+This+Week"),
                    badgeCount: stats.expiringThisWeek
                },
                {
                    icon: "📅",
                    label: "Aaj ke trials",
                    description: "Scheduled trial sessions",
                    onClick: () => router.push("/appointments?filter=today"),
                    badgeCount: stats.todayAppointments
                },
                {
                    icon: "💬",
                    label: "Pending queries",
                    description: "Unanswered customer messages",
                    onClick: () => router.push("/queries?filter=pending"),
                    badgeCount: stats.pendingQueries
                },
                {
                    icon: "🏆",
                    label: "Challenge announce karo",
                    description: "Fitness challenge broadcast",
                    onClick: () => openBroadcastModal({
                        message: "🔥 New Fitness Challenge!\n\n[Challenge Name] — [Duration]\n\nWinner ko milega: [Prize]\n\nReady? Reply CHALLENGE 💪🏆",
                        segment: "all"
                    })
                },
                {
                    icon: "🔄",
                    label: "Expired members",
                    description: "Win-back campaign bhejo",
                    onClick: () => router.push("/contacts?tag=Expired")
                },
                commonActions.analytics,
                {
                    icon: "➕",
                    label: "New trial book karo",
                    description: "Manually schedule trial",
                    onClick: () => router.push("/appointments?action=new")
                }
            ],
            COACHING: [
                {
                    icon: "🎓",
                    label: "Demo class announce",
                    description: "New batch broadcast",
                    onClick: () => openBroadcastModal({
                        message: "📚 New Batch Starting!\n\n[Business Name] mein:\n📅 Starting: [Date]\n⏰ Timing: [Time]\n\nFREE demo available!\nReply DEMO to register 🎓",
                        segment: "all"
                    })
                },
                {
                    icon: "💰",
                    label: "Fee reminders bhejo",
                    description: "Due/overdue fees",
                    onClick: () => router.push("/contacts?tag=Fee+Due"),
                    badgeCount: stats.feeDueCount
                },
                {
                    icon: "📅",
                    label: "Aaj ke demos",
                    description: "Scheduled demo classes",
                    onClick: () => router.push("/appointments?filter=today"),
                    badgeCount: stats.todayAppointments
                },
                {
                    icon: "💬",
                    label: "Pending queries",
                    description: "Parent/student queries",
                    onClick: () => router.push("/queries?filter=pending"),
                    badgeCount: stats.pendingQueries
                },
                {
                    icon: "📢",
                    label: "Result announce karo",
                    description: "Exam results broadcast",
                    onClick: () => openBroadcastModal({
                        message: "🏆 Results Declared!\n\n[Business Name] ke students ne kiya kamaal!\n\n🌟 Top performer:\n[Name] — [Marks]\n\nCongratulations! Next batch: Reply ENROLL 🎓",
                        segment: "all"
                    })
                },
                {
                    icon: "🔄",
                    label: "Follow-up pending",
                    description: "Demo attended, not enrolled",
                    onClick: () => router.push("/contacts?tag=Demo+Attended")
                },
                commonActions.analytics,
                {
                    icon: "➕",
                    label: "Demo book karo",
                    description: "Schedule new demo class",
                    onClick: () => router.push("/appointments?action=new")
                }
            ],
            REAL_ESTATE: [
                {
                    icon: "🏗️",
                    label: "New listing broadcast",
                    description: "Property launch announcement",
                    onClick: () => openBroadcastModal({
                        message: "🏠 NEW Property Alert!\n\n[Property Name] — [Location]\n💰 Starting ₹[Price]\n🛏️ [BHK] | 📐 [Sqft]\n\nLimited units!\nReply INTERESTED 📍",
                        segment: "all"
                    })
                },
                {
                    icon: "🔥",
                    label: "Hot leads dekho",
                    description: "Site visit done leads",
                    onClick: () => router.push("/contacts?tag=Hot+Lead"),
                    badgeCount: stats.hotLeadsCount
                },
                {
                    icon: "📅",
                    label: "Aaj ke site visits",
                    description: "Scheduled visits today",
                    onClick: () => router.push("/appointments?filter=today"),
                    badgeCount: stats.todayAppointments
                },
                {
                    icon: "💬",
                    label: "Pending queries",
                    description: "Property inquiries pending",
                    onClick: () => router.push("/queries?filter=pending"),
                    badgeCount: stats.pendingQueries
                },
                {
                    icon: "📉",
                    label: "Price drop alert",
                    description: "Price revision broadcast",
                    onClick: () => openBroadcastModal({
                        message: "🔥 Price Drop Alert!\n\n[Property Name] in [Location]:\nWas: ₹[Old Price]\nNow: ₹[New Price]\n\nLimited units at this price!\nReply INTERESTED 🏠",
                        segment: "all"
                    })
                },
                {
                    icon: "🔄",
                    label: "Cold leads reactivate",
                    description: "7+ din se silent leads",
                    onClick: () => router.push("/contacts?tag=Cold+Lead")
                },
                commonActions.analytics,
                {
                    icon: "➕",
                    label: "Site visit schedule",
                    description: "Book new site visit",
                    onClick: () => router.push("/appointments?action=new")
                }
            ],
            RESTAURANT: [
                {
                    icon: "🍛",
                    label: "Aaj ka special bhejo",
                    description: "Daily special broadcast",
                    onClick: () => openBroadcastModal({
                        message: "🔥 Aaj ka Special!\n\n[Restaurant Name]:\n🍛 [Dish Name] — ₹[Price]\n[Description]\n\nSirf aaj [Time] tak!\nTable reserve: Reply TABLE 🍽️",
                        segment: "all"
                    })
                },
                {
                    icon: "📅",
                    label: "Aaj ke reservations",
                    description: "Today's table bookings",
                    onClick: () => router.push("/appointments?filter=today"),
                    badgeCount: stats.todayAppointments
                },
                {
                    icon: "⏰",
                    label: "2hr reminders bhejo",
                    description: "Pre-dining reminders",
                    onClick: () => router.push("/reminders?filter=today"),
                    badgeCount: stats.todayReminders
                },
                {
                    icon: "💬",
                    label: "Pending queries",
                    description: "Unanswered inquiries",
                    onClick: () => router.push("/queries?filter=pending"),
                    badgeCount: stats.pendingQueries
                },
                {
                    icon: "🎉",
                    label: "Weekend special",
                    description: "Weekend offer broadcast",
                    onClick: () => openBroadcastModal({
                        message: "🎉 Weekend Special!\n\n[Restaurant Name] mein is weekend:\n🍛 [Special Dish] — ₹[Price]\n\nTable book karein:\nReply BOOK 🍽️",
                        segment: "all"
                    })
                },
                {
                    icon: "🔄",
                    label: "Lapsed customers",
                    description: "30+ din se nahi aaye",
                    onClick: () => router.push("/contacts?tag=Lapsed+(30%2B+days)"),
                    badgeCount: stats.lapsedCount
                },
                commonActions.analytics,
                {
                    icon: "➕",
                    label: "Table book karo",
                    description: "Manual reservation add",
                    onClick: () => router.push("/appointments?action=new")
                }
            ],
            OTHER: [
                {
                    icon: "📢",
                    label: "Offer broadcast karo",
                    description: "Special offer sab ko bhejo",
                    onClick: () => openBroadcastModal({
                        message: "🎉 Special Offer!\n\n[Business Name] ki taraf se:\n✨ [Offer Details]\n📅 Valid till: [Date]\n\nReply NOW 📩",
                        segment: "all"
                    })
                },
                {
                    icon: "💬",
                    label: "Pending queries",
                    description: "Unanswered messages",
                    onClick: () => router.push("/queries?filter=pending"),
                    badgeCount: stats.pendingQueries
                },
                {
                    icon: "📅",
                    label: "Appointments dekho",
                    description: "Today's schedule",
                    onClick: () => router.push("/appointments?filter=today"),
                    badgeCount: stats.todayAppointments
                },
                {
                    icon: "⏰",
                    label: "Reminders bhejo",
                    description: "Pending follow-ups",
                    onClick: () => router.push("/reminders?filter=today"),
                    badgeCount: stats.todayReminders
                },
                {
                    icon: "🔄",
                    label: "Follow-up leads",
                    description: "Pending follow-ups",
                    onClick: () => router.push("/contacts?tag=Follow-Up+Needed")
                },
                {
                    icon: "🔥",
                    label: "Hot leads dekho",
                    description: "High priority leads",
                    onClick: () => router.push("/contacts?tag=Hot+Lead"),
                    badgeCount: stats.hotLeadsCount
                },
                commonActions.analytics,
                {
                    icon: "➕",
                    label: "New appointment",
                    description: "Manually add karo",
                    onClick: () => router.push("/appointments?action=new")
                }
            ]
        };

        return actions[vertical] || actions.OTHER;
    };

    const actions = getActions(businessType);

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                        <span>⚡</span> Quick Actions
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#25D36615] text-[#25D366] border border-[#25D36630] text-[10px] font-bold uppercase tracking-wider">
                        {verticalEmoji} {verticalLabel} Mode
                    </span>
                </div>
                <button 
                   disabled
                   className="text-xs text-[#71717a] hover:text-white transition-colors cursor-not-allowed"
                >
                    Customize →
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {actions.map((action, i) => (
                    <ActionCard 
                        key={i} 
                        {...action} 
                        isLoading={isLoading} 
                    />
                ))}
            </div>
        </section>
    );
}

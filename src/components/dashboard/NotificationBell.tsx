"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Trash2, ExternalLink, ShieldCheck } from "lucide-react";
import { 
    getNotifications, 
    markNotificationAsRead, 
    clearAllNotifications,
    savePushSubscription 
} from "@/app/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { urlBase64ToUint8Array } from "@/lib/utils-web";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPushSupported, setIsPushSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsPushSupported(true);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
    };

    const handleEnablePush = async () => {
        setLoading(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error("Permission not granted for notifications");
            }

            // Unregister old workers if any for a clean slate
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let reg of registrations) {
                await reg.unregister();
            }

            await navigator.serviceWorker.register('/sw.js');
            
            // Wait for service worker to be ready and active
            let registration = await navigator.serviceWorker.ready;
            
            // If the worker is not yet active, wait for it
            if (!registration.active) {
                await new Promise<void>((resolve) => {
                    const worker = registration.installing || registration.waiting;
                    if (worker) {
                        worker.addEventListener('statechange', (e: any) => {
                            if (e.target.state === 'activated') resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            }

            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) throw new Error("VAPID public key not found");

            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            // Convert subscription to JSON and send to server
            const subJson = JSON.parse(JSON.stringify(subscription));
            await savePushSubscription(subJson);
            
            setIsSubscribed(true);
            toast.success("Desktop notifications enabled!");
        } catch (error: any) {
            console.error("Push registration failed:", error);
            toast.error(error.message || "Failed to enable notifications");
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        await markNotificationAsRead(id);
    };

    const handleClearAll = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        await clearAllNotifications();
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all group"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-[#25D366] animate-pulse" : ""}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#25D366] rounded-full ring-2 ring-[#060a0f] shadow-[0_0_10px_rgba(37,211,102,0.5)]" />
                )}
            </button>

            {isOpen && (
                <>
                    {/* Overlay for mobile to close when clicking outside */}
                    <div 
                        className="fixed inset-0 z-[90] md:hidden bg-black/20 backdrop-blur-[2px]" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 md:right-0 -right-2 md:-right-0 mt-3 w-[min(calc(100vw-1rem),320px)] bg-[#0a0f14] border border-white/5 rounded-2xl shadow-2xl z-[100] overflow-hidden font-[Outfit] transform-gpu transition-all">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <h3 className="text-sm font-bold">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleClearAll}
                                    className="text-[10px] font-bold text-[#25D366] hover:underline"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    {isPushSupported && !isSubscribed && (
                        <div className="p-3 bg-[#25D366]/10 border-b border-white/5">
                            <button 
                                onClick={handleEnablePush}
                                disabled={loading}
                                className="w-full py-2 px-3 bg-[#25D366] text-black text-[10px] font-black rounded-lg flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all disabled:opacity-50"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                ENABLE DESKTOP ALERTS
                            </button>
                            <p className="text-[8px] text-white/40 mt-1.5 text-center px-2">
                                Get notified even when you're not on the website.
                            </p>
                        </div>
                    )}

                    <div className="max-h-[350px] overflow-y-auto scrollbar-hide">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-white/20 text-xs">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    className={`p-4 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors relative group ${!n.isRead ? "bg-[#25D366]/5" : ""}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-[11px] font-bold ${!n.isRead ? "text-white" : "text-white/60"}`}>
                                            {n.title}
                                        </p>
                                        <span className="text-[9px] text-white/30">
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-white/40 leading-relaxed pr-4">
                                        {n.message}
                                    </p>
                                    
                                    <div className="mt-2 flex items-center gap-3">
                                        {n.link && (
                                            <Link 
                                                href={n.link}
                                                onClick={() => {
                                                    handleMarkAsRead(n.id);
                                                    setIsOpen(false);
                                                }}
                                                className="text-[10px] font-bold text-[#25D366] flex items-center gap-1 hover:underline"
                                            >
                                                View Action <ExternalLink className="w-2.5 h-2.5" />
                                            </Link>
                                        )}
                                        {!n.isRead && (
                                            <button 
                                                onClick={() => handleMarkAsRead(n.id)}
                                                className="text-[10px] font-bold text-white/40 hover:text-white flex items-center gap-1"
                                            >
                                                Mark Read <Check className="w-2.5 h-2.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </>
        )}
        </div>
    );
}

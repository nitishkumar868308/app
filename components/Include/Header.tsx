"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
    Bell, TrendingUp, X,
    Gift, Coins, ShieldCheck, ArrowDownLeft, AlertCircle,
    CheckCircle2, Trash2, Sparkles,
} from "lucide-react";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";

// ─── Ticker messages ─────────────────────────────────────────────────────────
// NOTE: Static promo ticker until an admin-panel endpoint is available.
// Swap this list for an API-driven one once the admin panel ships.

const tickerMessages = [
    "🎁 Get $7 Welcome Bonus on signup",
    "🚀 Complete KYC & earn instant rewards",
    "💎 Stake YTP and earn up to 1000% P.A. with Super Booster",
    "🎯 Refer friends to unlock Free Earning Pass worth ₹10,000",
    "📱 Win iPhone 16 Pro — join the giveaway",
    "⚡ Instant P2P transfers with zero platform fees",
];

// ─── Notification types ───────────────────────────────────────────────────────

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: "reward" | "transaction" | "security" | "system" | "offer";
}

const iconMap = {
    reward:      { icon: Gift,          color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
    transaction: { icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    security:    { icon: ShieldCheck,   color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20" },
    system:      { icon: AlertCircle,   color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20" },
    offer:       { icon: Coins,         color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20" },
};

const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: "n1",
        title: "Signup Bonus Credited",
        message: "965.0065 YTP has been added to your wallet as a welcome reward.",
        time: "2 hours ago",
        read: false,
        type: "reward",
    },
    {
        id: "n2",
        title: "KYC Verification Complete",
        message: "Your identity has been successfully verified. All features are now unlocked.",
        time: "1 day ago",
        read: false,
        type: "security",
    },
    {
        id: "n3",
        title: "Staking Reward Received",
        message: "You earned 12.50 YTP from your EARNER staking plan.",
        time: "2 days ago",
        read: false,
        type: "transaction",
    },
    {
        id: "n4",
        title: "New Offer: Staking Pass",
        message: "Complete tasks to unlock 10,000 YTP. Limited time offer!",
        time: "3 days ago",
        read: true,
        type: "offer",
    },
    {
        id: "n5",
        title: "Fund Added Successfully",
        message: "₹2,000 has been credited to your account via UPI.",
        time: "5 days ago",
        read: true,
        type: "transaction",
    },
    {
        id: "n6",
        title: "Security Alert",
        message: "New login detected from Mumbai, India. If this wasn't you, secure your account.",
        time: "1 week ago",
        read: true,
        type: "security",
    },
];

// ─── Header ───────────────────────────────────────────────────────────────────

const Header = () => {
    const { user: authUser } = useAuth();
    const userName = authUser
        ? `${authUser.first_name}${authUser.last_name ? " " + authUser.last_name : ""}`.trim()
        : "User";
    const initials = authUser
        ? `${authUser.first_name?.[0] || ""}${authUser.last_name?.[0] || ""}`.toUpperCase() || "U"
        : "U";
    const [open, setOpen]                   = useState(false);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const panelRef                          = useRef<HTMLDivElement>(null);
    const [ytpInrPrice, setYtpInrPrice]     = useState<number | null>(null);

    // Fetch YTP INR price
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get(ENDPOINTS.COIN_VALUE("YTP"));
                const data = res.data?.data ?? res.data;
                if (data?.INR) setYtpInrPrice(parseFloat(data.INR));
                else if (data?.USD) setYtpInrPrice(parseFloat(data.USD));
            } catch { /* silent */ }
        })();
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const markRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <header className="w-full sticky top-0 z-50 bg-[#000000]">
            {/* ── Ticker Bar ── */}
            <div className="w-full bg-[#050d06] border-b border-emerald-500/10 overflow-hidden py-2">
                <div className="flex animate-marquee whitespace-nowrap gap-0">
                    {[...tickerMessages, ...tickerMessages].map((msg, i) => (
                        <span key={i} className="inline-flex items-center gap-2 px-6 text-[13px] font-medium border-r border-white/5 last:border-0">
                            <Sparkles size={11} className="text-emerald-400 shrink-0" />
                            <span className="text-gray-300 font-semibold">{msg}</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Main Header ── */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-[#000000]/95 backdrop-blur-xl border-b border-emerald-500/8">
                {/* Logo + YTP Price */}
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center group">
                        <Image
                            src="/logo.png"
                            alt="YatriPay"
                            width={160}
                            height={40}
                            className="h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
                            priority
                        />
                    </Link>
                    {ytpInrPrice !== null && (
                        <div className="flex items-center gap-1.5 bg-white/4 border border-white/8 rounded-xl px-2.5 py-1.5">
                            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">YTP</span>
                            <span className="text-[13px] font-black text-emerald-400">₹{ytpInrPrice.toFixed(4)}</span>
                        </div>
                    )}
                </div>

                {/* Right: Welcome + Bell + Avatar */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[12px] text-gray-500 uppercase tracking-wider">Welcome,</span>
                        <span className="text-sm font-bold text-white leading-tight">{userName}</span>
                    </div>

                    {/* Notification bell + panel */}
                    <div className="relative" ref={panelRef}>
                        <button
                            onClick={() => setOpen((v) => !v)}
                            className={`relative h-9 w-9 rounded-xl flex items-center justify-center transition-all ${
                                open
                                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                    : "bg-white/4 border border-white/8 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30"
                            }`}
                        >
                            <Bell size={16} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-4.5 w-4.5 min-w-4.5 rounded-full bg-emerald-500 border-2 border-[#000000] flex items-center justify-center text-[12px] font-black text-black leading-none">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification panel */}
                        <AnimatePresence>
                            {open && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                    transition={{ duration: 0.18 }}
                                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-white/8 shadow-2xl shadow-black/40 overflow-hidden z-50"
                                    style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
                                >
                                    {/* Panel header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xs font-black text-white">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="h-4.5 min-w-4.5 px-1 rounded-full bg-emerald-500 flex items-center justify-center text-[12px] font-black text-black">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllRead}
                                                    className="text-[13px] text-emerald-400 font-bold hover:underline flex items-center gap-1"
                                                >
                                                    <CheckCircle2 size={10} /> Mark all read
                                                </button>
                                            )}
                                            {notifications.length > 0 && (
                                                <button
                                                    onClick={clearAll}
                                                    className="text-[13px] text-gray-600 font-bold hover:text-red-400 flex items-center gap-1 transition-colors"
                                                >
                                                    <Trash2 size={10} /> Clear
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setOpen(false)}
                                                className="h-6 w-6 rounded-md bg-white/4 flex items-center justify-center text-gray-500 hover:text-white transition-colors ml-1"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Notification list */}
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="py-12 flex flex-col items-center gap-2">
                                                <div className="h-10 w-10 rounded-xl bg-white/4 border border-white/6 flex items-center justify-center">
                                                    <Bell size={18} className="text-gray-700" />
                                                </div>
                                                <p className="text-[13px] text-gray-600 font-bold">No notifications</p>
                                                <p className="text-[13px] text-gray-700">You&apos;re all caught up!</p>
                                            </div>
                                        ) : (
                                            notifications.map((n) => {
                                                const cfg  = iconMap[n.type];
                                                const Icon = cfg.icon;

                                                return (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => markRead(n.id)}
                                                        className={`flex gap-3 px-4 py-3.5 border-b border-white/4 last:border-0 cursor-pointer transition-colors ${
                                                            n.read ? "hover:bg-white/2" : "bg-emerald-500/3 hover:bg-emerald-500/5"
                                                        }`}
                                                    >
                                                        {/* Icon */}
                                                        <div className={`h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                                                            <Icon size={14} className={cfg.color} />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <p className={`text-[13px] font-bold leading-tight ${n.read ? "text-gray-400" : "text-white"}`}>
                                                                    {n.title}
                                                                </p>
                                                                {!n.read && (
                                                                    <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 mt-1" />
                                                                )}
                                                            </div>
                                                            <p className="text-[12px] text-gray-600 mt-0.5 leading-relaxed line-clamp-2">
                                                                {n.message}
                                                            </p>
                                                            <p className="text-[13px] text-gray-700 mt-1">{n.time}</p>
                                                        </div>

                                                        {/* Remove */}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                                                            className="h-6 w-6 rounded-md flex items-center justify-center text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0 mt-0.5 opacity-0 group-hover:opacity-100"
                                                            style={{ opacity: 1 }}
                                                        >
                                                            <X size={11} />
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Avatar */}
                    <Link href="/profile" className="h-9 w-9 rounded-xl bg-linear-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/20 cursor-pointer hover:shadow-emerald-500/40 transition-all">
                        {initials}
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;

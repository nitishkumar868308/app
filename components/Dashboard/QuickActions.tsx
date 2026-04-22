"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ShieldCheck, CreditCard, PlusCircle, TrendingUp,
    ArrowLeftRight, Send, Lock, Fingerprint,
    ChevronRight, CheckCircle2, LucideIcon, TrendingDown
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";

// ─── Action definitions ──────────────────────────────────────────────────────

export interface QuickAction {
    id: string;
    label: string;
    icon: LucideIcon;
    href: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
    activeBorder: string;
    completable?: boolean; // can be "done" and hidden on dashboard
}

export const ALL_ACTIONS: QuickAction[] = [
    {
        id: "kyc",
        label: "KYC",
        icon: ShieldCheck,
        href: "/kyc",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(16,185,129,0.15)]",
        activeBorder: "hover:border-emerald-400/40",
        completable: true,
    },
    {
        id: "bank",
        label: "Bank Details",
        icon: CreditCard,
        href: "/bank",
        color: "text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(14,165,233,0.15)]",
        activeBorder: "hover:border-sky-400/40",
        completable: true,
    },
    {
        id: "addfund",
        label: "Add Fund",
        icon: PlusCircle,
        href: "/addfund",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(16,185,129,0.15)]",
        activeBorder: "hover:border-emerald-400/40",
    },
    {
        id: "buy",
        label: "Buy YTP",
        icon: TrendingUp,
        href: "/buy-assets",
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(139,92,246,0.15)]",
        activeBorder: "hover:border-violet-400/40",
    },
    {
        id: "exchange",
        label: "Sell",
        icon: TrendingDown,
        href: "/exchange",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(245,158,11,0.15)]",
        activeBorder: "hover:border-amber-400/40",
    },
    {
        id: "transfer",
        label: "Transfer",
        icon: Send,
        href: "/transfer",
        color: "text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(14,165,233,0.15)]",
        activeBorder: "hover:border-sky-400/40",
    },
    {
        id: "2fa",
        label: "2FA Security",
        icon: Fingerprint,
        href: "/2fa",
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(244,63,94,0.15)]",
        activeBorder: "hover:border-rose-400/40",
    },
    {
        id: "pin",
        label: "Set PIN",
        icon: Lock,
        href: "/profile",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(245,158,11,0.15)]",
        activeBorder: "hover:border-amber-400/40",
    },
];

// ─── Hook to check completed actions ─────────────────────────────────────────

export const useCompletedActions = () => {
    const { token } = useAuth();
    const [completed, setCompleted] = useState<Set<string>>(new Set());
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        if (!token) return;

        const check = async () => {
            const done = new Set<string>();

            try {
                const [kycRes, bankRes] = await Promise.allSettled([
                    api.get(ENDPOINTS.KYC_STATUS),
                    api.get(ENDPOINTS.BANK_DETAILS_LIST),
                ]);

                // KYC check — match any success-like status or a truthy boolean flag
                if (kycRes.status === "fulfilled") {
                    const kycData = kycRes.value.data?.data;
                    const raw = (kycData?.kyc_status || kycData?.status || "").toString().toUpperCase();
                    const isApprovedString = [
                        "APPROVED", "COMPLETED", "VERIFIED", "SUCCESS",
                        "SUCCESSFUL", "DONE", "ACTIVE",
                    ].includes(raw) || raw.includes("APPROVED") || raw.includes("VERIFIED");
                    const isApprovedFlag = kycData?.is_verified === true || kycData?.verified === true || kycData?.is_approved === true;
                    if (isApprovedString || isApprovedFlag) {
                        done.add("kyc");
                    }
                }

                // Bank details check
                if (bankRes.status === "fulfilled") {
                    const bankData = bankRes.value.data?.data ?? bankRes.value.data;
                    if (Array.isArray(bankData) && bankData.length > 0) {
                        done.add("bank");
                    }
                }
            } catch { /* silent */ }

            setCompleted(done);
            setLoading(false);
        };

        check();
    }, [token]);

    return { completed, loading };
};

// ─── Dashboard QuickActions (hides completed, shows max 4 + See All) ─────────

const QuickActions = () => {
    const { completed, loading } = useCompletedActions();

    // Filter out completed completable actions, keep the rest
    const visible = ALL_ACTIONS.filter(
        (a) => !(a.completable && completed.has(a.id))
    );

    // Show first 3 on dashboard + "See All" as 4th
    const displayed = visible.slice(0, 3);

    return (
        <div className="grid grid-cols-4 gap-3">
            {displayed.map((item, i) => {
                const Icon = item.icon;
                return (
                    <Link href={item.href} key={item.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className={`flex flex-col items-center justify-center gap-2.5 p-3 md:p-4 rounded-2xl bg-[#0a1a0f]/70 border ${item.border} ${item.activeBorder} ${item.glow} cursor-pointer transition-all duration-200`}
                        >
                            <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} transition-all`}>
                                <Icon size={19} strokeWidth={1.8} />
                            </div>
                            <span className="text-[12px] md:text-[13px] font-bold text-gray-400 text-center leading-tight">
                                {item.label}
                            </span>
                        </motion.div>
                    </Link>
                );
            })}

            {/* See All button */}
            <Link href="/quick-actions">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center justify-center gap-2.5 p-3 md:p-4 rounded-2xl bg-[#0a1a0f]/70 border border-white/8 hover:border-emerald-400/40 hover:shadow-[0_4px_20px_rgba(16,185,129,0.15)] cursor-pointer transition-all duration-200"
                >
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 transition-all">
                        <ChevronRight size={19} strokeWidth={1.8} />
                    </div>
                    <span className="text-[12px] md:text-[13px] font-bold text-gray-400 text-center leading-tight">
                        See All
                    </span>
                </motion.div>
            </Link>
        </div>
    );
};

export default QuickActions;

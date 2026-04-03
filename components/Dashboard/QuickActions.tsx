"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CreditCard, PlusCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

const actions = [
    {
        label: "KYC",
        icon: ShieldCheck,
        href: "/kyc",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(16,185,129,0.15)]",
        activeBorder: "hover:border-emerald-400/40",
    },
    {
        label: "Bank Details",
        icon: CreditCard,
        href: "/bank",
        color: "text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(14,165,233,0.15)]",
        activeBorder: "hover:border-sky-400/40",
    },
    {
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
        label: "Buy Asset",
        icon: TrendingUp,
        href: "/buy-assets",
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(139,92,246,0.15)]",
        activeBorder: "hover:border-violet-400/40",
    },
];

const QuickActions = () => (
    <div className="grid grid-cols-4 gap-3">
        {actions.map((item, i) => {
            const Icon = item.icon;
            return (
                <Link href={item.href} key={i}>
                    <motion.div
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex flex-col items-center justify-center gap-2.5 p-3 md:p-4 rounded-2xl bg-[#0a1a0f]/70 border ${item.border} ${item.activeBorder} ${item.glow} cursor-pointer transition-all duration-200`}
                    >
                        <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} transition-all`}>
                            <Icon size={19} strokeWidth={1.8} />
                        </div>
                        <span className="text-[10px] md:text-[11px] font-bold text-gray-400 text-center leading-tight">
                            {item.label}
                        </span>
                    </motion.div>
                </Link>
            );
        })}
    </div>
);

export default QuickActions;

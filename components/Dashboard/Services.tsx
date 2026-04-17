"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { QrCode, BedDouble, Plane, ChevronRight, LucideIcon } from "lucide-react";

interface Service {
    id: string;
    label: string;
    sub: string;
    href: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    border: string;
    glow: string;
    activeBorder: string;
}

const SERVICES: Service[] = [
    {
        id: "scan-pay",
        label: "Scan & Pay",
        sub: "Instant QR",
        href: "/scan-pay",
        icon: QrCode,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(16,185,129,0.15)]",
        activeBorder: "hover:border-emerald-400/40",
    },
    {
        id: "hotel",
        label: "Hotels",
        sub: "Book stays",
        href: "/hotel",
        icon: BedDouble,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(245,158,11,0.15)]",
        activeBorder: "hover:border-amber-400/40",
    },
    {
        id: "flight",
        label: "Flights",
        sub: "Book travel",
        href: "/flight",
        icon: Plane,
        color: "text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
        glow: "hover:shadow-[0_4px_20px_rgba(14,165,233,0.15)]",
        activeBorder: "hover:border-sky-400/40",
    },
];

const Services = () => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
                <h2 className="text-xs font-bold text-emerald-400/60 uppercase tracking-[0.22em]">
                    Travel & Pay
                </h2>
                <span className="text-[11px] text-gray-500 font-semibold">Quick services</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {SERVICES.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <Link href={s.href} key={s.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                className={`group relative overflow-hidden h-full flex flex-col justify-between gap-3 p-3 md:p-4 rounded-2xl bg-[#0a1a0f]/70 border ${s.border} ${s.activeBorder} ${s.glow} cursor-pointer transition-all duration-200`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`h-10 w-10 md:h-11 md:w-11 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
                                        <Icon size={19} strokeWidth={1.9} />
                                    </div>
                                    <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-300 transition-colors" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13px] md:text-sm font-bold text-white truncate">
                                        {s.label}
                                    </p>
                                    <p className="text-[11px] text-gray-500 font-medium truncate">
                                        {s.sub}
                                    </p>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Services;

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, LucideIcon, Sparkles } from "lucide-react";

interface Props {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    accent?: "emerald" | "amber" | "sky";
}

const ACCENT = {
    emerald: {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        glow: "bg-emerald-500/10",
    },
    amber: {
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        glow: "bg-amber-500/10",
    },
    sky: {
        text: "text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
        glow: "bg-sky-500/10",
    },
};

const ComingSoon = ({ title, subtitle, icon: Icon, accent = "emerald" }: Props) => {
    const a = ACCENT[accent];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-6"
            >
                <ArrowLeft size={14} /> Back to dashboard
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="relative overflow-hidden rounded-3xl border border-emerald-500/15 p-6 md:p-10 text-center"
                style={{ background: "linear-gradient(135deg, #0d1f12 0%, #0a1a0f 50%, #071209 100%)" }}
            >
                <div className={`absolute -top-16 -right-16 w-60 h-60 ${a.glow} rounded-full blur-[80px] pointer-events-none`} />
                <div className={`absolute -bottom-10 -left-10 w-44 h-44 ${a.glow} rounded-full blur-[60px] pointer-events-none`} />

                <div className="relative z-10 flex flex-col items-center gap-4 md:gap-5">
                    <div className={`h-16 w-16 md:h-20 md:w-20 rounded-2xl ${a.bg} ${a.border} border flex items-center justify-center ${a.text}`}>
                        <Icon size={34} strokeWidth={1.8} />
                    </div>

                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                        {title}
                    </h1>

                    <p className="text-sm md:text-base text-gray-400 font-medium max-w-md">
                        {subtitle}
                    </p>

                    <span className={`inline-flex items-center gap-1.5 ${a.bg} ${a.text} text-[12px] font-bold px-3 py-1.5 rounded-full border ${a.border}`}>
                        <Sparkles size={12} /> Coming soon
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

export default ComingSoon;

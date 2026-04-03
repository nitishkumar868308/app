"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Globe, ArrowRight, Sparkles, LucideIcon } from "lucide-react";
import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────────────────────

interface Plan {
    tier: string;
    tagline: string;
    icon: LucideIcon;
    apy: string;
    minStake: string;
    referral: string;
    lockPeriod: string;
    hike: string;
    cost: string;
    highlight: boolean;
}

const plans: Plan[] = [
    {
        tier: "LEARNER",
        tagline: "Start your journey",
        icon: ShieldCheck,
        apy: "30%",
        minStake: "500 YTP",
        referral: "30% P.A.",
        lockPeriod: "7 Days",
        hike: "+0%",
        cost: "Free",
        highlight: false,
    },
    {
        tier: "EARNER",
        tagline: "Boost your earnings",
        icon: Zap,
        apy: "40%",
        minStake: "10,000 YTP",
        referral: "40% P.A.",
        lockPeriod: "50 Days",
        hike: "+40%",
        cost: "$2",
        highlight: true,
    },
    {
        tier: "TRAVELER",
        tagline: "Unlock premium rewards",
        icon: Globe,
        apy: "50%",
        minStake: "20,000 YTP",
        referral: "50% P.A.",
        lockPeriod: "100 Days",
        hike: "+50%",
        cost: "$5",
        highlight: false,
    },
];

// ─── Stat row ────────────────────────────────────────────────────────────────

const StatRow = ({
    label,
    value,
    highlight,
    green,
}: {
    label: string;
    value: string;
    highlight: boolean;
    green?: boolean;
}) => (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
        <span className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{label}</span>
        <span className={`text-xs font-bold ${green ? "text-emerald-400" : highlight ? "text-white" : "text-gray-300"}`}>
            {value}
        </span>
    </div>
);

// ─── Plan card ───────────────────────────────────────────────────────────────

const PlanCard = ({ plan, index }: { plan: Plan; index: number }) => {
    const Icon = plan.icon;
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -6 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            className={`relative flex flex-col rounded-3xl border p-6 transition-all duration-300 ${
                plan.highlight
                    ? "border-emerald-400/40 shadow-[0_0_40px_rgba(16,185,129,0.12)]"
                    : "border-white/6 hover:border-emerald-500/25"
            }`}
            style={{
                background: plan.highlight
                    ? "linear-gradient(160deg, rgba(16,185,129,0.13) 0%, #0d1f12 40%, #0a1a0f 100%)"
                    : "rgba(10,26,15,0.7)",
            }}
        >
            {/* BEST CHOICE badge */}
            {plan.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-linear-to-r from-emerald-400 to-green-500 text-black text-[9px] font-black px-4 py-1 rounded-full tracking-widest shadow-lg shadow-emerald-500/30 z-10 whitespace-nowrap">
                    BEST CHOICE
                </span>
            )}

            {/* Top accent line */}
            {plan.highlight && (
                <div className="absolute top-0 left-8 right-8 h-px bg-linear-to-r from-transparent via-emerald-400/60 to-transparent" />
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pt-1">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    plan.highlight
                        ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                        : "bg-emerald-500/10 border border-emerald-500/20"
                }`}>
                    <Icon
                        size={20}
                        className={plan.highlight ? "text-black" : "text-emerald-400"}
                        strokeWidth={2}
                    />
                </div>
                <div>
                    <h3 className={`text-sm font-black tracking-widest uppercase ${plan.highlight ? "text-emerald-300" : "text-white/80"}`}>
                        {plan.tier}
                    </h3>
                    <p className="text-[10px] text-gray-600 mt-0.5">{plan.tagline}</p>
                </div>
            </div>

            {/* APY */}
            <div className="mb-6 pb-5 border-b border-white/5">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Annual Yield</p>
                <div className="flex items-baseline gap-1.5">
                    <span className={`text-5xl font-black tracking-tighter ${plan.highlight ? "text-emerald-400" : "text-emerald-500/80"}`}>
                        {plan.apy}
                    </span>
                    <span className="text-gray-500 text-sm font-bold mb-1">P.A.</span>
                </div>
            </div>

            {/* Stats */}
            <div className="flex-1 mb-6">
                <StatRow label="Min. Stake"     value={plan.minStake}   highlight={plan.highlight} />
                <StatRow label="Referral Bonus" value={plan.referral}   highlight={plan.highlight} />
                <StatRow label="Lock Period"    value={plan.lockPeriod} highlight={plan.highlight} />
                <StatRow label="Staking Hike"   value={plan.hike}       highlight={plan.highlight} green />
            </div>

            {/* Cost + CTA */}
            <div className={`pt-5 border-t ${plan.highlight ? "border-emerald-500/20" : "border-white/5"}`}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
                        Subscription Cost
                    </span>
                    <span className={`text-lg font-black ${plan.cost === "Free" ? "text-emerald-400" : "text-white"}`}>
                        {plan.cost}
                    </span>
                </div>

                <Link href="/stakingSummry">
                    <button
                        className={`w-full py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                            plan.highlight
                                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)]"
                                : "bg-white/5 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400/40"
                        }`}
                    >
                        Stake Now
                        <motion.span animate={{ x: hovered ? 3 : 0 }} transition={{ duration: 0.2 }}>
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </motion.span>
                    </button>
                </Link>
            </div>
        </motion.div>
    );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const Staking = () => (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 pb-28 space-y-10">

        {/* Hero */}
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-4"
        >
            <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                <Sparkles size={11} />
                High Yield Staking
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                Smart{" "}
                <span className="bg-linear-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                    Staking
                </span>
            </h1>

            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Choose your tier and start generating passive rewards.
                Premium assets deserve premium yields.
            </p>
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 items-stretch">
            {plans.map((plan, i) => (
                <PlanCard key={plan.tier} plan={plan} index={i} />
            ))}
        </div>

        {/* Footnote */}
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-[11px] text-gray-700 pb-2"
        >
            Staking rewards are calculated and distributed daily.
            Funds can be withdrawn after the lock period ends.
        </motion.p>

    </div>
);

export default Staking;

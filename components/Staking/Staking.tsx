"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Zap, Globe, ArrowRight, ArrowLeft, Sparkles, LucideIcon, Users, Lock, HelpCircle, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useStaking, type StakingPlan } from "@/context/StakingContext";
import { SectionLoader } from "@/components/Include/Loader";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";

// ─── Icon map (fallback rotation for plans) ─────────────────────────────────

const PLAN_ICONS: LucideIcon[] = [ShieldCheck, Zap, Globe];

// ─── Stat row ───────────────────────────────────────────────────────────────

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
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</span>
        <span className={`text-sm font-bold ${green ? "text-emerald-400" : highlight ? "text-white" : "text-gray-300"}`}>
            {value}
        </span>
    </div>
);

// ─── Plan card ──────────────────────────────────────────────────────────────

const PlanCard = ({ plan, index, isBest }: { plan: StakingPlan; index: number; isBest: boolean }) => {
    const Icon = PLAN_ICONS[index % PLAN_ICONS.length];
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
                isBest
                    ? "border-emerald-400/40 shadow-[0_0_40px_rgba(16,185,129,0.12)]"
                    : "border-white/6 hover:border-emerald-500/25"
            }`}
            style={{
                background: isBest
                    ? "linear-gradient(160deg, rgba(16,185,129,0.13) 0%, #0d1f12 40%, #0a1a0f 100%)"
                    : "rgba(10,26,15,0.7)",
            }}
        >
            {isBest && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-linear-to-r from-emerald-400 to-green-500 text-black text-[12px] font-black px-4 py-1 rounded-full tracking-widest shadow-lg shadow-emerald-500/30 z-10 whitespace-nowrap">
                    BEST CHOICE
                </span>
            )}

            {isBest && (
                <div className="absolute top-0 left-8 right-8 h-px bg-linear-to-r from-transparent via-emerald-400/60 to-transparent" />
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pt-1">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isBest
                        ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                        : "bg-emerald-500/10 border border-emerald-500/20"
                }`}>
                    <Icon
                        size={20}
                        className={isBest ? "text-black" : "text-emerald-400"}
                        strokeWidth={2}
                    />
                </div>
                <div>
                    <h3 className={`text-base font-black tracking-widest uppercase ${isBest ? "text-emerald-300" : "text-white/80"}`}>
                        {plan.name}
                    </h3>
                    <p className="text-[12px] text-gray-600 mt-0.5">{plan.description}</p>
                </div>
            </div>

            {/* APY */}
            <div className="mb-6 pb-5 border-b border-white/5">
                <p className="text-[12px] text-gray-600 uppercase tracking-wider mb-1">Annual Yield</p>
                <div className="flex items-baseline gap-1.5">
                    <span className={`text-5xl font-black tracking-tighter ${isBest ? "text-emerald-400" : "text-emerald-500/80"}`}>
                        {plan.per_annum}%
                    </span>
                    <span className="text-gray-500 text-sm font-bold mb-1">P.A.</span>
                </div>
            </div>

            {/* Stats */}
            <div className="flex-1 mb-6">
                <StatRow label="Min. Stake"   value={`${plan.min_stake.toLocaleString()} YTP`} highlight={isBest} />
                {plan.referral_reward > 0 && (
                    <StatRow label="Referral Bonus" value={`${plan.referral_reward}% P.A.`} highlight={isBest} />
                )}
                <StatRow label="Lock Period"  value={`${plan.validity} Days`}                  highlight={isBest} />
                <StatRow
                    label="Hike"
                    value={plan.staking_hike > 0 ? `+${plan.staking_hike}%` : "—"}
                    highlight={isBest}
                    green={plan.staking_hike > 0}
                />
            </div>

            {/* Cost + CTA */}
            <div className={`pt-5 border-t ${isBest ? "border-emerald-500/20" : "border-white/5"}`}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] text-gray-600 uppercase tracking-wider font-bold">
                        Subscription Cost
                    </span>
                    <span className={`text-lg font-black ${plan.price === 0 ? "text-emerald-400" : "text-white"}`}>
                        {plan.price === 0 ? "Free" : `$${plan.price}`}
                    </span>
                </div>

                <Link href={`/stakingSummry?plan=${plan.name}`}>
                    <button
                        className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                            isBest
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

// ─── Main ───────────────────────────────────────────────────────────────────

const Staking = () => {
    const { plans, loading, totalSubscribers, totalStakedAssets } = useStaking();

    const [faqs, setFaqs]               = useState<{ id: number; name: string; description: string }[]>([]);
    const [faqOpenId, setFaqOpenId]     = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get(ENDPOINTS.FAQ_LIST, { params: { code: "staking" } });
                const raw = res.data?.data ?? res.data;
                if (Array.isArray(raw)) {
                    setFaqs(
                        raw
                            .filter((f) => f?.name && f?.description)
                            .map((f) => ({ id: f.id, name: f.name, description: f.description }))
                    );
                }
            } catch { /* silent — FAQ section hidden if fetch fails */ }
        })();
    }, []);

    const statBadges = [
        { icon: Users, label: `${totalSubscribers.toLocaleString()} Subscribers`,                                             color: "text-sky-400"    },
        { icon: Lock,  label: `${totalStakedAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })} YTP Locked`,      color: "text-emerald-400" },
    ];

    const maxApy = plans.length > 0 ? Math.max(...plans.map((p) => p.per_annum)) : 50;

    // Middle card is featured when exactly 3 plans (sorted: LEARNER → EARNER → TRAVELER)
    const bestIdx = plans.length === 3 ? 1 : plans.findIndex((p) => p.per_annum === maxApy);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 pb-28 space-y-10">

            {/* ── Back button row ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-4"
            >
                <Link href="/dashboard">
                    <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                        <ArrowLeft size={16} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Staking</h1>
                    <p className="text-sm text-gray-600 mt-0.5">Choose your plan and start earning</p>
                </div>
            </motion.div>

            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center space-y-4"
            >
                <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[13px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                    <Sparkles size={11} />
                    High Yield Staking
                </span>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                    AI Powered{" "}
                    <span className="bg-linear-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                        Staking
                    </span>
                </h1>

                <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed pt-2">
                    <span className="font-black text-white">YatriPay:</span>{" "}
                    <span className="text-emerald-400 font-bold">Daily earning</span>{" "}
                    App / Platform
                </p>
            </motion.div>

            {/* Trust badges */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto"
            >
                {statBadges.map((b, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 rounded-2xl border border-white/6 px-5 py-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <b.icon size={20} className={b.color} />
                        <span className="text-base md:text-lg font-black text-white tracking-tight truncate">{b.label}</span>
                    </div>
                ))}
            </motion.div>

            {/* Plan cards */}
            {loading && plans.length === 0 ? (
                <SectionLoader />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 items-stretch">
                    {plans.map((plan, i) => (
                        <PlanCard key={plan.id} plan={plan} index={i} isBest={i === bestIdx} />
                    ))}
                </div>
            )}

            {/* FAQ section */}
            {faqs.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="max-w-3xl mx-auto space-y-4"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <HelpCircle size={15} className="text-emerald-400" />
                        </div>
                        <h2 className="text-lg md:text-xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-2.5">
                        {faqs.map((f) => {
                            const open = faqOpenId === f.id;
                            return (
                                <div
                                    key={f.id}
                                    className={`rounded-2xl border transition-all ${
                                        open ? "border-emerald-500/25" : "border-white/6 hover:border-white/15"
                                    }`}
                                    style={{ background: "rgba(10,26,15,0.7)" }}
                                >
                                    <button
                                        onClick={() => setFaqOpenId(open ? null : f.id)}
                                        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                                    >
                                        <span className="text-sm md:text-base font-bold text-white">{f.name}</span>
                                        <ChevronDown
                                            size={16}
                                            className={`shrink-0 transition-transform ${open ? "rotate-180 text-emerald-400" : "text-gray-500"}`}
                                        />
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {open && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.22 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed whitespace-pre-line border-t border-white/5 pt-4">
                                                    {f.description}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </motion.section>
            )}

        </div>
    );
};

export default Staking;

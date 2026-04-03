"use client";

import { useState } from "react";
import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet, Users, Database, PieChart,
    Clock, ShieldCheck, Zap, Globe, TrendingUp,
    ArrowRight, ArrowLeft, Receipt, CheckCircle2, LucideIcon,
} from "lucide-react";
import Link from "next/link";

// ─── Plan data ────────────────────────────────────────────────────────────────

interface PlanDef {
    id: "LEARNER" | "EARNER" | "TRAVELER";
    icon: LucideIcon;
    apy: string;
    apyNum: number;
    lockDays: number;
    minStake: number;
    cost: string;
    hike: string;
    highlight: boolean;
    endLabel: string;
}

const PLANS: PlanDef[] = [
    {
        id: "LEARNER",
        icon: ShieldCheck,
        apy: "30%",
        apyNum: 30,
        lockDays: 7,
        minStake: 500,
        cost: "Free",
        hike: "+0%",
        highlight: false,
        endLabel: "2026-04-10",
    },
    {
        id: "EARNER",
        icon: Zap,
        apy: "40%",
        apyNum: 40,
        lockDays: 50,
        minStake: 10000,
        cost: "$2",
        hike: "+40%",
        highlight: true,
        endLabel: "2026-05-23",
    },
    {
        id: "TRAVELER",
        icon: Globe,
        apy: "50%",
        apyNum: 50,
        lockDays: 100,
        minStake: 20000,
        cost: "$5",
        hike: "+50%",
        highlight: false,
        endLabel: "2026-07-12",
    },
];

const TOP_STATS = [
    { label: "Balance",     value: "966.01 YTP", icon: Wallet,   color: "text-emerald-400" },
    { label: "Subscribers", value: "766",        icon: Users,    color: "text-violet-400"  },
    { label: "Staked",      value: "6.4M YTP",   icon: Database, color: "text-sky-400"     },
    { label: "Quota",       value: "103M YTP",   icon: PieChart, color: "text-amber-400"   },
];

// ─── Summary row ─────────────────────────────────────────────────────────────

const SummaryRow = ({
    label,
    value,
    sub,
    green,
    sky,
}: {
    label: string;
    value: string;
    sub?: string;
    green?: boolean;
    sky?: boolean;
}) => (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
        <span className="text-[11px] text-gray-500 font-medium">{label}</span>
        <div className="text-right">
            <span className={`text-xs font-bold ${green ? "text-emerald-400" : sky ? "text-sky-400" : "text-white"}`}>
                {value}
            </span>
            {sub && <span className="text-[9px] text-gray-600 ml-1.5">{sub}</span>}
        </div>
    </div>
);

// ─── Custom checkbox ──────────────────────────────────────────────────────────

const Checkbox = ({
    checked,
    onChange,
    children,
}: {
    checked: boolean;
    onChange: () => void;
    children: ReactNode;
}) => (
    <button onClick={onChange} className="flex items-start gap-2.5 text-left group w-full">
        <span className={`mt-0.5 shrink-0 h-4 w-4 rounded flex items-center justify-center border transition-all duration-200 ${
            checked
                ? "bg-emerald-500 border-emerald-500"
                : "border-white/20 bg-white/4 group-hover:border-emerald-500/50"
        }`}>
            {checked && <CheckCircle2 size={11} className="text-black" />}
        </span>
        <span className="text-[11px] text-gray-500 leading-relaxed">{children}</span>
    </button>
);

// ─── Main ────────────────────────────────────────────────────────────────────

const StakingSummary = () => {
    const [selectedId, setSelectedId] = useState<PlanDef["id"]>("EARNER");
    const [amount, setAmount]         = useState("");
    const [agreed, setAgreed]         = useState(false);
    const [autoStake, setAutoStake]   = useState(false);

    const plan      = PLANS.find((p) => p.id === selectedId)!;
    const numAmount = parseFloat(amount) || 0;
    const estReturn = numAmount > 0
        ? ((numAmount * plan.apyNum) / 100 * plan.lockDays / 365).toFixed(2)
        : "0.00";
    const subPriceYTP = plan.cost === "Free" ? 0 : plan.cost === "$2" ? 253.16 : 632.91;
    const totalYTP    = numAmount > 0 ? numAmount + subPriceYTP : 0;
    const canConfirm  = agreed && numAmount >= plan.minStake;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── Page title ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-4"
            >
                <Link href="/staking">
                    <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                        <ArrowLeft size={16} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Staking Summary</h1>
                    <p className="text-[11px] text-gray-600 mt-0.5">Configure your stake and confirm details below</p>
                </div>
            </motion.div>

            {/* ── Top stats ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.35 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
                {TOP_STATS.map((s, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 rounded-2xl border border-white/6 p-3.5"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                            <s.icon size={15} className={s.color} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold truncate">{s.label}</p>
                            <p className="text-xs font-black text-white truncate">{s.value}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ── Main two-column grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ── LEFT: Configuration ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="rounded-3xl border border-white/6 p-6 space-y-6"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    {/* Section title */}
                    <div className="flex items-center gap-2.5">
                        <div className="h-5 w-1 rounded-full bg-emerald-400" />
                        <h2 className="text-sm font-black text-white tracking-wide">Choose Your Plan</h2>
                    </div>

                    {/* Plan selector */}
                    <div className="grid grid-cols-3 gap-3">
                        {PLANS.map((p) => {
                            const Icon   = p.icon;
                            const active = p.id === selectedId;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedId(p.id)}
                                    className={`relative p-4 rounded-2xl border transition-all duration-200 text-center ${
                                        active
                                            ? "border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.10)]"
                                            : "border-white/6 hover:border-emerald-500/25"
                                    }`}
                                    style={{
                                        background: active
                                            ? "linear-gradient(160deg,rgba(16,185,129,0.13) 0%,#0d1f12 100%)"
                                            : "rgba(5,13,7,0.6)",
                                    }}
                                >
                                    {p.highlight && (
                                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-linear-to-r from-emerald-400 to-green-500 text-black text-[7px] font-black px-2 py-0.5 rounded-full tracking-widest whitespace-nowrap">
                                            BEST
                                        </span>
                                    )}
                                    <div className={`h-8 w-8 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                                        active ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-emerald-500/10"
                                    }`}>
                                        <Icon
                                            size={16}
                                            className={active ? "text-black" : "text-emerald-500"}
                                            strokeWidth={2}
                                        />
                                    </div>
                                    <p className={`text-[10px] font-black tracking-wider uppercase ${active ? "text-white" : "text-gray-500"}`}>
                                        {p.id}
                                    </p>
                                    <p className={`text-sm font-black ${active ? "text-emerald-400" : "text-gray-600"}`}>
                                        {p.apy}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Amount input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">Lock Amount</span>
                            <span className="text-[10px] text-gray-600 font-medium">
                                Min:{" "}
                                <span className="text-emerald-400 font-bold">{plan.minStake.toLocaleString()} YTP</span>
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-2xl border border-white/8 py-4 pl-5 pr-28 text-2xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                style={{ background: "rgba(5,13,7,0.8)" }}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button
                                    onClick={() => setAmount(plan.minStake.toString())}
                                    className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[9px] font-black px-2.5 py-1 rounded-lg tracking-wider transition-all"
                                >
                                    MIN
                                </button>
                                <span className="text-sm font-black text-gray-600">YTP</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[9px] text-gray-700">Quota: 103,111,642 YTP available</span>
                            <span className="text-[9px] text-gray-700">
                                Max:{" "}
                                <span className="text-gray-500">{(plan.minStake * 2).toLocaleString()} YTP</span>
                            </span>
                        </div>
                    </div>

                    {/* Quick metrics */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: Clock,      label: "Lock Period",  value: `${plan.lockDays} Days`, green: false },
                            { icon: TrendingUp, label: "Annual Yield", value: plan.apy,                green: true  },
                            { icon: Zap,        label: "Staking Hike", value: plan.hike,               green: true  },
                        ].map((m, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-white/5 p-3 text-center"
                                style={{ background: "rgba(5,13,7,0.6)" }}
                            >
                                <m.icon
                                    size={14}
                                    className={`mx-auto mb-1.5 ${m.green ? "text-emerald-400" : "text-gray-500"}`}
                                />
                                <p className="text-[8px] text-gray-600 uppercase tracking-wider font-bold mb-0.5">
                                    {m.label}
                                </p>
                                <p className={`text-xs font-black ${m.green ? "text-emerald-400" : "text-white"}`}>
                                    {m.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── RIGHT: Summary ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="rounded-3xl border border-white/6 p-6 flex flex-col gap-5"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    {/* Section title */}
                    <div className="flex items-center gap-2.5">
                        <Receipt size={16} className="text-emerald-400" />
                        <h2 className="text-sm font-black text-white tracking-wide">Order Summary</h2>
                    </div>

                    {/* Summary rows — animate on plan change */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            <SummaryRow label="Start Date"         value="2026-04-03 06:23" />
                            <SummaryRow label="End Date"           value={`${plan.endLabel} 06:23`} />
                            <SummaryRow label="Refund Period"      value={`${plan.lockDays} Days`} />
                            <SummaryRow label="Annual Yield (APY)" value={plan.apy}             green />
                            <SummaryRow
                                label="Est. Return"
                                value={`${estReturn} YTP`}
                                sky
                            />
                            <SummaryRow
                                label="Subscription Price"
                                value={plan.cost === "Free" ? "Free" : `${plan.cost} USD`}
                                sub={subPriceYTP > 0 ? `≈ ${subPriceYTP} YTP` : undefined}
                                green={plan.cost === "Free"}
                            />
                            <SummaryRow label="Transaction Fees"  value="0.00 YTP" />
                        </motion.div>
                    </AnimatePresence>

                    {/* Total box */}
                    <div
                        className="rounded-2xl border border-emerald-500/20 p-4"
                        style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">
                                    Total to Stake
                                </p>
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={`${totalYTP.toFixed(2)}-${selectedId}`}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.18 }}
                                        className="text-2xl font-black text-white tabular-nums"
                                    >
                                        {totalYTP > 0 ? `${totalYTP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} YTP` : "—"}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <Wallet size={16} className="text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                        <Checkbox checked={agreed} onChange={() => setAgreed((v) => !v)}>
                            I agree to the{" "}
                            <span className="text-emerald-400 underline underline-offset-2">Staking Service Agreement</span>
                            {" "}and understand the lock-up terms
                        </Checkbox>
                        <Checkbox checked={autoStake} onChange={() => setAutoStake((v) => !v)}>
                            Enable{" "}
                            <span className="text-emerald-400 underline underline-offset-2">YatriPay Auto-Staking</span>
                            {" "}to automatically restake upon maturity
                        </Checkbox>
                    </div>

                    {/* Confirm button */}
                    <div className="mt-auto space-y-2">
                        <button
                            disabled={!canConfirm}
                            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                canConfirm
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                            }`}
                        >
                            Confirm Stake
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </button>

                        {/* Hint text */}
                        {!agreed && (
                            <p className="text-center text-[9px] text-gray-700">
                                Please agree to the service agreement to continue
                            </p>
                        )}
                        {agreed && numAmount > 0 && numAmount < plan.minStake && (
                            <p className="text-center text-[9px] text-amber-600/80">
                                Minimum stake is {plan.minStake.toLocaleString()} YTP for this plan
                            </p>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default StakingSummary;

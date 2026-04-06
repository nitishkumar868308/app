"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Copy, Share2, UserPlus, Award, Zap,
    CheckCircle2, Clock, X, ArrowRight, Gift,
    TrendingUp, Link2,
} from "lucide-react";
import Image from "next/image";

// ─── Data ─────────────────────────────────────────────────────────────────────

const REFERRAL_CODE = "6359728012";
const REFERRAL_LINK = `https://webapp.yatripay.com/#/signup?ref=${REFERRAL_CODE}`;

const REFERRED_USERS = [
    { id: 1, name: "Rahul Sharma",   date: "22/02/2026", status: "Active" as const,      reward: "+10 YTP",  kycDone: true },
    { id: 2, name: "Testing User",   date: "22/02/2026", status: "Active" as const,      reward: "+10 YTP",  kycDone: true },
    { id: 3, name: "Priya Kapoor",   date: "28/03/2026", status: "Active" as const,      reward: "+10 YTP",  kycDone: true },
    { id: 4, name: "Amit Patel",     date: "01/04/2026", status: "Pending KYC" as const, reward: "Pending",  kycDone: false },
    { id: 5, name: "Sneha Joshi",    date: "03/04/2026", status: "Pending KYC" as const, reward: "Pending",  kycDone: false },
];

const MILESTONES = [
    { range: "1–5 Friends",  apy: "100% APY",  current: true },
    { range: "6–10 Friends", apy: "500% APY",  current: false },
    { range: "10+ Friends",  apy: "1000% APY", current: false },
];

// ─── Copy helper ──────────────────────────────────────────────────────────────

const CopyButton = ({ value, label }: { value: string; label?: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className={`shrink-0 h-8 px-3 rounded-lg flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-all ${
                copied
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border border-white/8 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30"
            }`}
        >
            {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
            {label ?? (copied ? "Copied" : "Copy")}
        </button>
    );
};

// ─── Add Sponsor Modal ────────────────────────────────────────────────────────

const AddSponsorModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const [sponsorCode, setSponsorCode] = useState("");

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-sm rounded-3xl border border-white/8 p-6 space-y-5 relative"
                        style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>

                        <div className="text-center space-y-1">
                            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                <UserPlus size={20} className="text-emerald-400" />
                            </div>
                            <h3 className="text-base font-black text-white">Add Sponsor</h3>
                            <p className="text-[11px] text-gray-500">Enter your sponsor&apos;s referral code to connect</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold px-1">
                                Sponsor Code <span className="text-emerald-500 text-[8px]">*</span>
                            </label>
                            <input
                                type="text"
                                value={sponsorCode}
                                onChange={(e) => setSponsorCode(e.target.value)}
                                placeholder="e.g. 6359728012"
                                className="w-full rounded-2xl border border-white/8 py-3.5 px-4 text-sm font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                style={{ background: "rgba(5,13,7,0.8)" }}
                            />
                        </div>

                        <button
                            disabled={!sponsorCode.trim()}
                            className={`w-full py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                sponsorCode.trim()
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                            }`}
                        >
                            Add Sponsor
                            <ArrowRight size={14} strokeWidth={2.5} />
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const ReferralPage = () => {
    const [showSponsor, setShowSponsor] = useState(false);

    const activeCount  = REFERRED_USERS.filter((u) => u.status === "Active").length;
    const pendingCount = REFERRED_USERS.filter((u) => u.status === "Pending KYC").length;
    const totalEarned  = activeCount * 10;
    const progress     = Math.min((REFERRED_USERS.length / 10) * 100, 100);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            <AddSponsorModal open={showSponsor} onClose={() => setShowSponsor(false)} />

            {/* ── Page header ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <Image src="/logo.png" alt="YatriPay" width={120} height={32} className="h-7 w-auto object-contain" />
                    <div className="h-5 w-px bg-white/10" />
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Referral Program</h1>
                        <p className="text-[11px] text-gray-600 mt-0.5">Invite friends and earn rewards together</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowSponsor(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-widest shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all shrink-0"
                >
                    <UserPlus size={14} strokeWidth={2.5} />
                    Add Sponsor
                </button>
            </motion.div>

            {/* ── Stats row ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
                {[
                    { label: "Total Referrals",  value: String(REFERRED_USERS.length).padStart(2, "0"), icon: Users,        color: "text-emerald-400" },
                    { label: "Active Users",     value: String(activeCount).padStart(2, "0"),            icon: CheckCircle2, color: "text-sky-400" },
                    { label: "Pending KYC",      value: String(pendingCount).padStart(2, "0"),           icon: Clock,        color: "text-amber-400" },
                    { label: "Total Earned",     value: `${totalEarned} YTP`,                            icon: Award,        color: "text-violet-400" },
                ].map((s, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 rounded-2xl border border-white/6 p-3.5"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                            <s.icon size={16} className={s.color} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold truncate">{s.label}</p>
                            <p className="text-sm font-black text-white">{s.value}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT: Code + Link + Actions (3 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="lg:col-span-3 space-y-5"
                >
                    {/* Referral code & link */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-5"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Your Referral Details</h2>
                        </div>

                        {/* Code */}
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold px-1 flex items-center gap-1.5">
                                Referral Code
                            </p>
                            <div
                                className="rounded-2xl border border-white/8 p-4 flex items-center justify-between"
                                style={{ background: "rgba(5,13,7,0.8)" }}
                            >
                                <span className="text-xl font-black text-white font-mono tracking-widest">{REFERRAL_CODE}</span>
                                <CopyButton value={REFERRAL_CODE} />
                            </div>
                        </div>

                        {/* Link */}
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold px-1 flex items-center gap-1.5">
                                <Link2 size={10} /> Referral Link
                            </p>
                            <div
                                className="rounded-2xl border border-white/8 p-4 flex items-center gap-3"
                                style={{ background: "rgba(5,13,7,0.8)" }}
                            >
                                <p className="text-[11px] font-mono font-bold text-gray-400 truncate flex-1 select-all">
                                    {REFERRAL_LINK}
                                </p>
                                <CopyButton value={REFERRAL_LINK} />
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] uppercase tracking-widest shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98] transition-all">
                                <Share2 size={15} strokeWidth={2.5} />
                                Invite Friends
                            </button>
                            <button
                                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/8 text-white font-black text-[11px] uppercase tracking-widest hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.98] transition-all"
                                style={{ background: "rgba(5,13,7,0.6)" }}
                            >
                                <Link2 size={15} strokeWidth={2.5} />
                                Custom Link
                            </button>
                        </div>
                    </div>

                    {/* Referred Users Table */}
                    <div
                        className="rounded-3xl border border-white/6 overflow-hidden"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
                            <div className="flex items-center gap-2.5">
                                <Users size={16} className="text-emerald-400" />
                                <h2 className="text-sm font-black text-white tracking-wide">Referred Users</h2>
                                <span className="text-[9px] font-black text-gray-500 bg-white/4 px-2 py-0.5 rounded-full">
                                    {REFERRED_USERS.length}
                                </span>
                            </div>
                        </div>

                        {/* Desktop table header */}
                        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-2.5 border-b border-white/4 text-[9px] text-gray-600 uppercase tracking-widest font-black">
                            <div className="col-span-4">User</div>
                            <div className="col-span-3">Joining Date</div>
                            <div className="col-span-3">Status</div>
                            <div className="col-span-2 text-right">Reward</div>
                        </div>

                        {/* Rows */}
                        {REFERRED_USERS.map((user, i) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.25 }}
                                className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors"
                            >
                                {/* Desktop */}
                                <div className="hidden sm:grid grid-cols-12 gap-4 items-center px-6 py-3.5">
                                    <div className="col-span-4 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-[10px] font-black text-emerald-400">
                                            {user.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <span className="text-xs font-bold text-white truncate">{user.name}</span>
                                    </div>
                                    <div className="col-span-3">
                                        <span className="text-[11px] text-gray-500 tabular-nums">{user.date}</span>
                                    </div>
                                    <div className="col-span-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${
                                            user.status === "Active"
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                        }`}>
                                            {user.status === "Active" ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                                            {user.status}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <span className={`text-xs font-black ${user.kycDone ? "text-emerald-400" : "text-gray-600"}`}>
                                            {user.reward}
                                        </span>
                                    </div>
                                </div>

                                {/* Mobile */}
                                <div className="sm:hidden px-5 py-3.5 flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-[10px] font-black text-emerald-400">
                                        {user.name.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                                        <p className="text-[9px] text-gray-600">{user.date}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-widest mb-0.5 ${
                                            user.status === "Active"
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                        }`}>
                                            {user.status}
                                        </span>
                                        <p className={`text-[10px] font-black ${user.kycDone ? "text-emerald-400" : "text-gray-600"}`}>
                                            {user.reward}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ── RIGHT: Earnings + Milestones + Progress (2 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="lg:col-span-2 space-y-5"
                >
                    {/* Earnings card */}
                    <div
                        className="rounded-3xl border border-emerald-500/20 p-6 relative overflow-hidden"
                        style={{ background: "linear-gradient(150deg, rgba(16,185,129,0.15) 0%, rgba(10,26,15,0.9) 100%)" }}
                    >
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <Award size={28} className="text-emerald-400" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400/60 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                    Rewards
                                </span>
                            </div>

                            <div>
                                <p className="text-[9px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">Total Earned</p>
                                <p className="text-4xl font-black text-white tabular-nums">
                                    {totalEarned} <span className="text-base text-gray-500">YTP</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-emerald-500/15 p-3 text-center" style={{ background: "rgba(16,185,129,0.06)" }}>
                                    <p className="text-[8px] text-emerald-400/60 uppercase tracking-wider font-bold">Friends</p>
                                    <p className="text-xl font-black text-white">{String(REFERRED_USERS.length).padStart(2, "0")}</p>
                                </div>
                                <div className="rounded-xl border border-emerald-500/15 p-3 text-center" style={{ background: "rgba(16,185,129,0.06)" }}>
                                    <p className="text-[8px] text-emerald-400/60 uppercase tracking-wider font-bold">APY Boost</p>
                                    <p className="text-xl font-black text-white">+5%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress toward next milestone */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <TrendingUp size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Progress</h2>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] text-gray-500 font-bold">{REFERRED_USERS.length}/10 Friends</span>
                                <span className="text-[9px] text-emerald-400 font-black">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${progress}%`,
                                        background: "linear-gradient(90deg, #10b981, #34d399)",
                                    }}
                                />
                            </div>
                            <p className="text-[9px] text-gray-700">Invite 5 more to unlock 500% APY Boost</p>
                        </div>
                    </div>

                    {/* APY Milestones */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-3"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Zap size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">APY Milestones</h2>
                        </div>

                        <div className="space-y-2">
                            {MILESTONES.map((m, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                                        m.current
                                            ? "border-emerald-500/25 bg-emerald-500/5"
                                            : "border-white/5"
                                    }`}
                                    style={!m.current ? { background: "rgba(5,13,7,0.6)" } : undefined}
                                >
                                    <span className={`text-[10px] font-bold ${m.current ? "text-white" : "text-gray-600"}`}>
                                        {m.range}
                                    </span>
                                    <span className={`text-[11px] font-black ${m.current ? "text-emerald-400" : "text-gray-600"}`}>
                                        {m.apy}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reward per referral */}
                    <div
                        className="rounded-2xl border border-white/5 p-4 flex items-start gap-3"
                        style={{ background: "rgba(5,13,7,0.6)" }}
                    >
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
                            <Gift size={14} className="text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-white">+10 YTP per referral</p>
                            <p className="text-[9px] text-gray-600 leading-relaxed mt-0.5">
                                Rewards are credited after your friend completes KYC verification. APY boost is valid for 30 days.
                            </p>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default ReferralPage;

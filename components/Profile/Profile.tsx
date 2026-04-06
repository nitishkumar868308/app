"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    User, Mail, Phone, MapPin, Calendar, Shield,
    CheckCircle2, AlertCircle, Edit3, Camera,
    Copy, Star, Award, Users,
    Wallet, TrendingUp, Clock, LogOut, Settings,
    ChevronRight, Lock, KeyRound,ExternalLink
} from "lucide-react";
import Link from "next/link";
import PinModal from "@/components/Include/PinModal";

// ─── User data (hardcoded for now) ────────────────────────────────────────────

const USER = {
    name: "Nitish Kumar",
    email: "nitish@example.com",
    phone: "+91 98765 43210",
    address: "Mumbai, Maharashtra, India",
    dob: "1998-05-15",
    joined: "2026-02-22",
    uid: "YTP-00042891",
    referralCode: "NITISH10",
    kycStatus: "Verified" as const,
    tier: "Gold",
    initials: "NK",
};

const STATS = [
    { label: "Total Balance",    value: "₹13,299.50", icon: Wallet,     color: "text-emerald-400" },
    { label: "Total Staked",     value: "10,000 YTP",  icon: TrendingUp, color: "text-amber-400" },
    { label: "Referrals",        value: "5 Users",     icon: Users,      color: "text-violet-400" },
    { label: "Member Since",     value: "Feb 2026",    icon: Clock,      color: "text-sky-400" },
];

const ACTIVITY = [
    { label: "Last Login",          value: "Today, 10:32 AM" },
    { label: "Last Transaction",    value: "Apr 04, 2026" },
    { label: "KYC Completed",       value: "Mar 01, 2026" },
    { label: "First Staking",       value: "Mar 15, 2026" },
];

const QUICK_LINKS = [
    { label: "Account Settings",   icon: Settings,    href: "/settings" },
    { label: "KYC Verification",   icon: Shield,      href: "/kyc" },
    { label: "Transaction History", icon: Clock,       href: "/transactions" },
    { label: "Support Center",     icon: ExternalLink, href: "/support" },
];

// ─── Info row ─────────────────────────────────────────────────────────────────

const InfoRow = ({
    icon: Icon,
    label,
    value,
    verified,
    copyable,
}: {
    icon: typeof User;
    label: string;
    value: string;
    verified?: boolean;
    copyable?: boolean;
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-3 py-3 border-b border-white/4 last:border-0">
            <div className="h-8 w-8 rounded-xl bg-white/4 border border-white/6 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">{label}</p>
                <p className="text-xs font-bold text-white truncate">{value}</p>
            </div>
            {verified && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
            {copyable && (
                <button
                    onClick={handleCopy}
                    className="shrink-0 h-7 px-2 rounded-lg bg-white/4 border border-white/6 flex items-center gap-1 text-[8px] font-bold text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                >
                    <Copy size={10} />
                    {copied ? "Copied" : "Copy"}
                </button>
            )}
        </div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const Profile = () => {
    const [pinModal, setPinModal] = useState<{ open: boolean; mode: "create" | "change" | "verify" }>({ open: false, mode: "create" });
    const [hasPin, setHasPin]     = useState(false);

    const handlePinSuccess = () => {
        setPinModal({ open: false, mode: "create" });
        if (!hasPin) setHasPin(true);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* PIN Modal */}
            <PinModal
                open={pinModal.open}
                onClose={() => setPinModal((p) => ({ ...p, open: false }))}
                onSuccess={handlePinSuccess}
                mode={pinModal.mode}
            />

            {/* ── Profile hero ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="rounded-3xl border border-white/6 p-6 relative overflow-hidden"
                style={{ background: "rgba(10,26,15,0.7)" }}
            >
                {/* Background gradient */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, transparent 50%)" }} />

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-emerald-500/20">
                            {USER.initials}
                        </div>
                        <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all">
                            <Camera size={12} />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h1 className="text-xl font-black text-white tracking-tight">{USER.name}</h1>
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                                    <CheckCircle2 size={9} /> {USER.kycStatus}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-[8px] font-black text-amber-400 uppercase tracking-widest">
                                    <Star size={9} /> {USER.tier}
                                </span>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono">{USER.uid}</p>
                        <p className="text-[10px] text-gray-600 mt-1">Member since {USER.joined}</p>
                    </div>

                    {/* Edit button */}
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/8 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-emerald-500/30 hover:text-emerald-400 transition-all shrink-0"
                        style={{ background: "rgba(5,13,7,0.6)" }}
                    >
                        <Edit3 size={12} />
                        Edit Profile
                    </button>
                </div>
            </motion.div>

            {/* ── Stats row ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
                {STATS.map((s, i) => (
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
                            <p className="text-sm font-black text-white truncate">{s.value}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT: Personal details (3 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="lg:col-span-3 space-y-5"
                >
                    {/* Personal information */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-1"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Personal Information</h2>
                        </div>

                        <InfoRow icon={User}     label="Full Name"      value={USER.name} />
                        <InfoRow icon={Mail}     label="Email Address"  value={USER.email}   verified />
                        <InfoRow icon={Phone}    label="Phone Number"   value={USER.phone}   verified />
                        <InfoRow icon={MapPin}   label="Address"        value={USER.address} />
                        <InfoRow icon={Calendar} label="Date of Birth"  value={USER.dob} />
                        <InfoRow icon={Shield}   label="KYC Status"     value={USER.kycStatus} verified />
                    </div>

                    {/* Referral section */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Referral Program</h2>
                        </div>

                        <div
                            className="rounded-2xl border border-emerald-500/15 p-4 flex items-center justify-between"
                            style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.06) 0%,rgba(16,185,129,0.02) 100%)" }}
                        >
                            <div>
                                <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold mb-1">Your Referral Code</p>
                                <p className="text-lg font-black text-emerald-400 font-mono tracking-wider">{USER.referralCode}</p>
                            </div>
                            <InfoCopyBtn value={USER.referralCode} />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "Total Referrals", value: "5",    icon: Users },
                                { label: "Active Users",    value: "3",    icon: CheckCircle2 },
                                { label: "Earned",          value: "50 YTP", icon: Award },
                            ].map((r, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl border border-white/5 p-3 text-center"
                                    style={{ background: "rgba(5,13,7,0.6)" }}
                                >
                                    <r.icon size={14} className="text-emerald-400 mx-auto mb-1.5" />
                                    <p className="text-[8px] text-gray-600 uppercase tracking-wider font-bold">{r.label}</p>
                                    <p className="text-sm font-black text-white">{r.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ── RIGHT: Activity + Quick links (2 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="lg:col-span-2 space-y-5"
                >
                    {/* Recent activity */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Clock size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Recent Activity</h2>
                        </div>

                        <div className="space-y-0">
                            {ACTIVITY.map((a, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
                                    <span className="text-[11px] text-gray-500 font-medium">{a.label}</span>
                                    <span className="text-[11px] font-bold text-white">{a.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-3"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Settings size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Quick Links</h2>
                        </div>

                        <div className="space-y-2">
                            {QUICK_LINKS.map((link, i) => (
                                <Link key={i} href={link.href}>
                                    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/4 hover:border-emerald-500/20 hover:bg-emerald-500/3 transition-all cursor-pointer group">
                                        <div className="h-8 w-8 rounded-lg bg-white/4 border border-white/6 flex items-center justify-center shrink-0 group-hover:border-emerald-500/20 transition-all">
                                            <link.icon size={14} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-400 flex-1 group-hover:text-white transition-colors">{link.label}</span>
                                        <ChevronRight size={14} className="text-gray-700 group-hover:text-emerald-400 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Transaction PIN */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Lock size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Transaction PIN</h2>
                        </div>

                        <div
                            className={`rounded-2xl border p-4 flex items-center gap-3 ${
                                hasPin ? "border-emerald-500/15 bg-emerald-500/3" : "border-amber-500/15 bg-amber-500/3"
                            }`}
                        >
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                                hasPin ? "bg-emerald-500 text-black" : "bg-amber-500/15 border border-amber-500/25 text-amber-400"
                            }`}>
                                {hasPin ? <CheckCircle2 size={16} /> : <KeyRound size={16} />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className={`text-[11px] font-bold ${hasPin ? "text-emerald-400" : "text-amber-400"}`}>
                                    {hasPin ? "PIN is active" : "PIN not set"}
                                </p>
                                <p className="text-[9px] text-gray-600 mt-0.5">
                                    {hasPin
                                        ? "Your 4-digit PIN secures all transactions"
                                        : "Set a PIN to secure withdrawals and transfers"}
                                </p>
                            </div>
                        </div>

                        <div className={`grid gap-2 ${hasPin ? "grid-cols-2" : "grid-cols-1"}`}>
                            {!hasPin ? (
                                <button
                                    onClick={() => setPinModal({ open: true, mode: "create" })}
                                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all"
                                >
                                    <Lock size={13} /> Create PIN
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setPinModal({ open: true, mode: "change" })}
                                        className="py-3 rounded-xl border border-white/8 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.98] transition-all"
                                        style={{ background: "rgba(5,13,7,0.6)" }}
                                    >
                                        <KeyRound size={13} /> Change
                                    </button>
                                    <button
                                        onClick={() => setPinModal({ open: true, mode: "verify" })}
                                        className="py-3 rounded-xl border border-white/8 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.98] transition-all"
                                        style={{ background: "rgba(5,13,7,0.6)" }}
                                    >
                                        <Shield size={13} /> Test PIN
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Security & Tier */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Shield size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Account Security</h2>
                        </div>

                        <div className="space-y-2.5">
                            {[
                                { label: "Transaction PIN",  status: hasPin ? "Active" : "Not Set", ok: hasPin },
                                { label: "Two-Factor Auth", status: "Enabled",  ok: true },
                                { label: "Email Verified",  status: "Verified", ok: true },
                                { label: "Phone Verified",  status: "Verified", ok: true },
                                { label: "KYC Level",       status: "Advanced", ok: true },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-white/4 last:border-0">
                                    <span className="text-[11px] text-gray-500 font-medium">{s.label}</span>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${s.ok ? "text-emerald-400" : "text-amber-400"}`}>
                                        {s.ok ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                        {s.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Logout */}
                    <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-500/15 text-red-400 font-black text-[11px] uppercase tracking-widest hover:bg-red-500/5 hover:border-red-500/25 transition-all"
                        style={{ background: "rgba(5,13,7,0.6)" }}
                    >
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

// ─── Small copy button helper ─────────────────────────────────────────────────

const InfoCopyBtn = ({ value }: { value: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className={`h-9 px-3.5 rounded-xl flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-all ${
                copied
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border border-white/8 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30"
            }`}
        >
            <Copy size={11} />
            {copied ? "Copied" : "Copy"}
        </button>
    );
};

export default Profile;

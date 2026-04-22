"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User, Mail, Phone, MapPin, Calendar, Shield,
    CheckCircle2, AlertCircle, Edit3, Camera,
    Copy, Award, Users, ArrowLeft,
    Wallet, TrendingUp, Clock, LogOut, Settings,
    ChevronRight, Lock, KeyRound, ExternalLink,
    Coins, Lock as LockIcon,
} from "lucide-react";
import Link from "next/link";
import PinModal from "@/components/Include/PinModal";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { getUserData, setUserData } from "@/lib/auth";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";

// ─── Info row ────────────────────────────────────────────────────────────────

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
                <p className="text-[13px] text-gray-600 uppercase tracking-wider font-bold">{label}</p>
                <p className="text-xs font-bold text-white truncate">{value}</p>
            </div>
            {verified && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
            {copyable && (
                <button
                    onClick={handleCopy}
                    className="shrink-0 h-7 px-2 rounded-lg bg-white/4 border border-white/6 flex items-center gap-1 text-[12px] font-bold text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                >
                    <Copy size={10} />
                    {copied ? "Copied" : "Copy"}
                </button>
            )}
        </div>
    );
};

// ─── Small copy button helper ────────────────────────────────────────────────

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
            className={`h-9 px-3.5 rounded-xl flex items-center gap-1.5 text-[13px] font-black uppercase tracking-wider transition-all ${
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

// ─── Quick links ─────────────────────────────────────────────────────────────

const QUICK_LINKS = [
    { label: "Account Settings",   icon: Settings,    href: "/settings" },
    { label: "KYC Verification",   icon: Shield,      href: "/kyc" },
    { label: "Transaction History", icon: Clock,       href: "/transactions" },
    { label: "Support Center",     icon: ExternalLink, href: "/support" },
];

// ─── Main ────────────────────────────────────────────────────────────────────

const Profile = () => {
    const { user: authUser, logout, refreshUser } = useAuth();
    const { ytpBalance, inrBalance } = useWallet();

    const [pinModal, setPinModal] = useState<{ open: boolean; mode: "create" | "change" | "verify" }>({ open: false, mode: "create" });
    const [hasPin, setHasPin]     = useState(authUser?.pin_status ?? false);
    const [balCurrency, setBalCurrency] = useState<"YTP" | "INR">("YTP");

    // KYC details for address/dob
    const [kycData, setKycData] = useState<{
        firstName: string | null;
        lastName: string | null;
        district: string | null;
        state: string | null;
        country: string | null;
        dob: string | null;
        kycDate: string | null;
        kycStatus: string;
    }>({ firstName: null, lastName: null, district: null, state: null, country: null, dob: null, kycDate: null, kycStatus: "—" });

    const [referralCodeFromApi, setReferralCodeFromApi] = useState("");

    // Referral + staking stats
    const [totalReferred, setTotalReferred]   = useState(0);
    const [activeReferrals, setActiveReferrals] = useState(0);
    const [referralEarned, setReferralEarned] = useState(0);
    const [totalStaked, setTotalStaked]       = useState(0);

    // Sync hasPin
    useEffect(() => {
        if (authUser?.pin_status) setHasPin(true);
    }, [authUser?.pin_status]);

    // Fetch KYC + Referral + Staking data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statusRes, listRes, refRes, refListRes, portfolioRes, refTxnRes] = await Promise.allSettled([
                    api.get(ENDPOINTS.KYC_STATUS),
                    api.get(ENDPOINTS.KYC_LIST),
                    api.get(ENDPOINTS.USER_REFERRAL),
                    api.get(ENDPOINTS.REFERRED_USER_LIST),
                    api.get(ENDPOINTS.STAKING_PORTFOLIO),
                    api.post(ENDPOINTS.TRANSACTION_FILTER, { trans_type_filter: ["Referral Reward"] }),
                ]);

                // KYC
                const statusData = statusRes.status === "fulfilled" ? statusRes.value.data?.data : null;

                let details: any = {};
                if (listRes.status === "fulfilled") {
                    const raw = listRes.value.data?.data ?? listRes.value.data;
                    if (Array.isArray(raw)) {
                        const uid = statusData?.user_id || authUser?.id;
                        details = raw.find((k: any) => k.user === uid || k.user_id === uid) || raw[raw.length - 1] || {};
                    } else if (raw && typeof raw === "object") {
                        details = raw;
                    }
                }

                const rawStatus = (statusData?.kyc_status || statusData?.status || "").toUpperCase();
                const isApproved = ["APPROVED", "COMPLETED", "VERIFIED"].includes(rawStatus);

                setKycData({
                    firstName: details.first_name || details.firstName || null,
                    lastName:  details.last_name || details.lastName || null,
                    district: details.district || null,
                    state:    details.state || null,
                    country:  details.country || null,
                    dob:      details.dob || null,
                    kycDate:  details.created_at || details.updated_at || null,
                    kycStatus: isApproved ? "Verified" : rawStatus || "—",
                });

                // Referral code
                if (refRes.status === "fulfilled") {
                    const refData = refRes.value.data?.data ?? refRes.value.data;
                    const code = refData?.code || refData?.referral_code || "";
                    if (code) setReferralCodeFromApi(code);
                }

                // Referred users list → Total / Active
                if (refListRes.status === "fulfilled") {
                    const raw = refListRes.value.data?.data ?? refListRes.value.data;
                    if (Array.isArray(raw)) {
                        setTotalReferred(raw.length);
                        setActiveReferrals(raw.filter((u: any) => u?.reward_given).length);
                    }
                }

                // Referral Reward transactions → Earned
                if (refTxnRes.status === "fulfilled") {
                    const raw = refTxnRes.value.data?.data ?? refTxnRes.value.data?.results ?? refTxnRes.value.data;
                    if (Array.isArray(raw)) {
                        const earned = raw.reduce((sum: number, t: any) => {
                            const amt = Number(t?.amount ?? 0);
                            return Number.isFinite(amt) ? sum + amt : sum;
                        }, 0);
                        setReferralEarned(earned);
                    }
                }

                // Staking portfolio → Total Staked
                if (portfolioRes.status === "fulfilled") {
                    const raw = portfolioRes.value.data?.data ?? portfolioRes.value.data;
                    if (Array.isArray(raw)) {
                        const sum = raw.reduce((acc: number, item: any) => {
                            const amt = Number(item?.lock_amount ?? item?.amount ?? 0);
                            return Number.isFinite(amt) ? acc + amt : acc;
                        }, 0);
                        setTotalStaked(sum);
                    }
                }
            } catch { /* silent */ }
        };

        fetchData();
    }, [authUser?.id]);

    const handlePinSuccess = async () => {
        setPinModal({ open: false, mode: "create" });
        setHasPin(true);
        const current = getUserData();
        if (current) setUserData({ ...current, pin_status: true });
        await refreshUser();
    };

    // Derived
    // Prefer KYC name (legal/verified) over signup name once KYC is verified
    const isKycVerified = kycData.kycStatus === "Verified";
    const effectiveFirstName = (isKycVerified && kycData.firstName) ? kycData.firstName : (authUser?.first_name || "");
    const effectiveLastName  = (isKycVerified && kycData.lastName)  ? kycData.lastName  : (authUser?.last_name  || "");
    const fullName     = authUser ? `${effectiveFirstName} ${effectiveLastName}`.trim() || "—" : "—";
    const initials     = authUser ? `${effectiveFirstName?.[0] || ""}${effectiveLastName?.[0] || ""}`.toUpperCase() || "U" : "U";
    const userEmail    = authUser?.email || "—";
    const userPhone    = authUser?.phone_no || "—";
    const referralCode = referralCodeFromApi || authUser?.referral_id || "—";
    const referredBy   = authUser?.referred_by_name || null;

    // Address from KYC
    const addressParts = [kycData.district, kycData.state, kycData.country].filter(Boolean);
    const address = addressParts.length > 0 ? addressParts.join(", ") : "—";

    // DOB from KYC
    const dob = kycData.dob || "—";

    // Balance display
    const balanceDisplay = balCurrency === "YTP"
        ? `${ytpBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} YTP`
        : `₹${inrBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const fmtYtp = (n: number) =>
        `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} YTP`;

    const STATS = [
        { label: "Total Balance",    value: balanceDisplay,                 icon: Wallet,     color: "text-emerald-400", toggle: true },
        { label: "Total Staked",     value: fmtYtp(totalStaked),            icon: TrendingUp, color: "text-amber-400" },
        { label: "Referral Earned",  value: fmtYtp(referralEarned),         icon: Users,      color: "text-violet-400" },
        { label: "Referred By",      value: referredBy || "None",           icon: Clock,      color: "text-sky-400" },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* PIN Modal */}
            <PinModal
                open={pinModal.open}
                onClose={() => setPinModal((p) => ({ ...p, open: false }))}
                onSuccess={handlePinSuccess}
                mode={pinModal.mode}
            />

            {/* ── Page header with back button ── */}
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
                    <h1 className="text-xl font-black text-white tracking-tight">Profile</h1>
                    <p className="text-sm text-gray-600 mt-0.5">Manage your account and security</p>
                </div>
            </motion.div>

            {/* ── Profile hero ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="rounded-3xl border border-white/6 p-6 relative overflow-hidden"
                style={{ background: "rgba(10,26,15,0.7)" }}
            >
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, transparent 50%)" }} />

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="relative">
                        <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-emerald-500/20">
                            {initials}
                        </div>
                        <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all">
                            <Camera size={12} />
                        </button>
                    </div>

                    <div className="flex-1 text-center sm:text-left min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h1 className="text-xl font-black text-white tracking-tight">{fullName}</h1>
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[12px] font-black text-emerald-400 uppercase tracking-widest">
                                    <CheckCircle2 size={9} /> Verified
                                </span>
                            </div>
                        </div>
                        <p className="text-[12px] text-gray-500">{userEmail}</p>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/8 text-[12px] font-black text-gray-400 uppercase tracking-widest hover:border-emerald-500/30 hover:text-emerald-400 transition-all shrink-0"
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
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <p className="text-[13px] text-gray-600 uppercase tracking-wider font-bold truncate">{s.label}</p>
                                {s.toggle && (
                                    <button
                                        onClick={() => setBalCurrency((c) => c === "YTP" ? "INR" : "YTP")}
                                        className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md hover:bg-emerald-500/20 transition-all shrink-0"
                                    >
                                        {balCurrency}
                                    </button>
                                )}
                            </div>
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
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-1"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Personal Information</h2>
                        </div>

                        <InfoRow icon={User}     label="Full Name"      value={fullName} />
                        <InfoRow icon={Mail}     label="Email Address"  value={userEmail}  verified />
                        <InfoRow icon={Phone}    label="Phone Number"   value={userPhone}  verified />
                        <InfoRow icon={MapPin}   label="Address"        value={address} />
                        <InfoRow icon={Calendar} label="Date of Birth"  value={dob} />
                        <InfoRow icon={Shield}   label="KYC Status"     value={kycData.kycStatus} verified={kycData.kycStatus === "Verified"} />
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
                                <p className="text-[13px] text-gray-600 uppercase tracking-wider font-bold mb-1">Your Referral Code</p>
                                <p className="text-lg font-black text-emerald-400 font-mono tracking-wider">{referralCode}</p>
                            </div>
                            <InfoCopyBtn value={referralCode} />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "Total Referrals", value: String(totalReferred).padStart(2, "0"),    icon: Users },
                                { label: "Active Users",    value: String(activeReferrals).padStart(2, "0"),  icon: CheckCircle2 },
                                { label: "Earned",          value: fmtYtp(referralEarned),                    icon: Award },
                            ].map((r, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl border border-white/5 p-3 text-center"
                                    style={{ background: "rgba(5,13,7,0.6)" }}
                                >
                                    <r.icon size={14} className="text-emerald-400 mx-auto mb-1.5" />
                                    <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">{r.label}</p>
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
                    {/* Wallet Snapshot */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Wallet size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Wallet Snapshot</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div
                                className="rounded-2xl border border-emerald-500/15 p-4"
                                style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.02) 100%)" }}
                            >
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Coins size={11} className="text-emerald-400" />
                                    <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">YTP</p>
                                </div>
                                <p className="text-sm font-black text-white tabular-nums truncate">
                                    {ytpBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                </p>
                            </div>

                            <div
                                className="rounded-2xl border border-sky-500/15 p-4"
                                style={{ background: "linear-gradient(135deg,rgba(56,189,248,0.07) 0%,rgba(56,189,248,0.02) 100%)" }}
                            >
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Wallet size={11} className="text-sky-400" />
                                    <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">INR</p>
                                </div>
                                <p className="text-sm font-black text-white tabular-nums truncate">
                                    ₹{inrBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div
                                className="rounded-2xl border border-amber-500/15 p-4"
                                style={{ background: "linear-gradient(135deg,rgba(251,191,36,0.07) 0%,rgba(251,191,36,0.02) 100%)" }}
                            >
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <LockIcon size={11} className="text-amber-400" />
                                    <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">Staked</p>
                                </div>
                                <p className="text-sm font-black text-white tabular-nums truncate">
                                    {totalStaked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div
                                className="rounded-2xl border border-violet-500/15 p-4"
                                style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.07) 0%,rgba(167,139,250,0.02) 100%)" }}
                            >
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Award size={11} className="text-violet-400" />
                                    <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">Earned</p>
                                </div>
                                <p className="text-sm font-black text-white tabular-nums truncate">
                                    {referralEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
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
                                        <span className="text-[13px] font-bold text-gray-400 flex-1 group-hover:text-white transition-colors">{link.label}</span>
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
                                <p className={`text-[13px] font-bold ${hasPin ? "text-emerald-400" : "text-amber-400"}`}>
                                    {hasPin ? "PIN is active" : "PIN not set"}
                                </p>
                                <p className="text-[13px] text-gray-600 mt-0.5">
                                    {hasPin
                                        ? "Your 4-digit PIN secures all transactions"
                                        : "Set a PIN to secure withdrawals and transfers"}
                                </p>
                            </div>
                        </div>

                        <div className={`grid gap-2 ${hasPin ? "grid-cols-1" : "grid-cols-1"}`}>
                            {!hasPin ? (
                                <button
                                    onClick={() => setPinModal({ open: true, mode: "create" })}
                                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all"
                                >
                                    <Lock size={13} /> Create PIN
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setPinModal({ open: true, mode: "change" })}
                                        className="py-3 rounded-xl border border-white/8 text-white font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.98] transition-all"
                                        style={{ background: "rgba(5,13,7,0.6)" }}
                                    >
                                        <KeyRound size={13} /> Change
                                    </button>
                                    {/* <button
                                        onClick={() => setPinModal({ open: true, mode: "verify" })}
                                        className="py-3 rounded-xl border border-white/8 text-white font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.98] transition-all"
                                        style={{ background: "rgba(5,13,7,0.6)" }}
                                    >
                                        <Shield size={13} /> Test PIN
                                    </button> */}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Account Security */}
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
                                { label: "Two-Factor Auth", status: authUser?.google2fa_enable ? "Enabled" : "Disabled", ok: !!authUser?.google2fa_enable },
                                { label: "Email Verified",  status: "Verified", ok: true },
                                { label: "Phone Verified",  status: "Verified", ok: true },
                                { label: "KYC Level",       status: kycData.kycStatus === "Verified" ? "Advanced" : "Pending", ok: kycData.kycStatus === "Verified" },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-white/4 last:border-0">
                                    <span className="text-[13px] text-gray-500 font-medium">{s.label}</span>
                                    <span className={`inline-flex items-center gap-1 text-[12px] font-bold ${s.ok ? "text-emerald-400" : "text-amber-400"}`}>
                                        {s.ok ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                        {s.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-500/15 text-red-400 font-black text-[13px] uppercase tracking-widest hover:bg-red-500/5 hover:border-red-500/25 transition-all"
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

export default Profile;

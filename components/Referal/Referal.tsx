"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Copy, Share2, UserPlus, Award, Zap,
    CheckCircle2, Clock, X, ArrowRight, ArrowLeft, Gift,
    TrendingUp, Link2, Loader2, Smartphone,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { getApiError } from "@/lib/helpers";
import { useAuth } from "@/context/AuthContext";
import { SectionLoader } from "@/components/Include/Loader";

const WEB_REFERRAL_LINK = "https://webapp.yatripay.com/#/signup?ref=";

// ─── Copy helper ─────────────────────────────────────────────────────────────

const CopyButton = ({ value, iconOnly = false }: { value: string; iconOnly?: boolean }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };
    if (iconOnly) {
        return (
            <button
                onClick={handleCopy}
                className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center border transition-all ${
                    copied
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                        : "bg-white/4 border-white/8 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30"
                }`}
                aria-label="Copy"
            >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            </button>
        );
    }
    return (
        <button
            onClick={handleCopy}
            className={`shrink-0 h-8 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-black uppercase tracking-wider transition-all ${
                copied
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border border-white/8 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30"
            }`}
        >
            {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy"}
        </button>
    );
};

// ─── Add Sponsor Modal ───────────────────────────────────────────────────────

const AddSponsorModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const [sponsorCode, setSponsorCode] = useState("");
    const [loading, setLoading]         = useState(false);

    const handleSubmit = async () => {
        if (!sponsorCode.trim()) return;
        setLoading(true);
        try {
            await api.post(ENDPOINTS.ADD_SPONSOR, { referral_code: sponsorCode.trim() });
            toast.success("Sponsor added successfully!");
            onClose();
            setSponsorCode("");
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-sm rounded-3xl border border-white/8 p-6 space-y-5 relative"
                        style={{ background: "linear-gradient(170deg,#0a0f0b 0%,#000000 100%)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                            <X size={14} />
                        </button>

                        <div className="text-center space-y-1">
                            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                <UserPlus size={20} className="text-emerald-400" />
                            </div>
                            <h3 className="text-base font-black text-white">Add Sponsor</h3>
                            <p className="text-[13px] text-gray-500">Enter your sponsor&apos;s referral code</p>
                        </div>

                        <input
                            type="text"
                            value={sponsorCode}
                            onChange={(e) => setSponsorCode(e.target.value)}
                            placeholder="e.g. 6359728012"
                            className="w-full rounded-2xl border border-white/8 py-3.5 px-4 text-sm font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                            style={{ background: "rgba(0,0,0,0.8)" }}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={!sponsorCode.trim() || loading}
                            className={`w-full py-3.5 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                sponsorCode.trim() && !loading
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                            }`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                            {loading ? "Adding..." : "Add Sponsor"}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─── Custom Link Modal ───────────────────────────────────────────────────────

const CustomLinkModal = ({
    open,
    onClose,
    onCreated,
    referralLinkId,
}: {
    open: boolean;
    onClose: () => void;
    onCreated: (code: string) => void;
    referralLinkId: number | null;
}) => {
    const [customCode, setCustomCode] = useState("");
    const [loading, setLoading]       = useState(false);

    const handleCreate = async () => {
        if (!customCode.trim()) return;
        setLoading(true);
        try {
            await api.post(ENDPOINTS.CUSTOM_REFERRAL_LINK, {
                referral_link_id: referralLinkId,
                new_referral_code: customCode.trim(),
            });
            toast.success("Custom referral link created!");
            onCreated(customCode.trim());
            onClose();
            setCustomCode("");
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-sm rounded-3xl border border-white/8 p-6 space-y-5 relative"
                        style={{ background: "linear-gradient(170deg,#0a0f0b 0%,#000000 100%)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                            <X size={14} />
                        </button>

                        <div className="text-center space-y-1">
                            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                <Link2 size={20} className="text-emerald-400" />
                            </div>
                            <h3 className="text-base font-black text-white">Custom Referral Link</h3>
                            <p className="text-[13px] text-gray-500">Create a personalized referral code</p>
                        </div>

                        <div className="space-y-1.5">
                            <input
                                type="text"
                                value={customCode}
                                onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                                placeholder="e.g. nitish-ytp"
                                className="w-full rounded-2xl border border-white/8 py-3.5 px-4 text-sm font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                style={{ background: "rgba(0,0,0,0.8)" }}
                            />
                            {customCode && (
                                <p className="text-[12px] text-gray-600 px-1">
                                    Link: <span className="text-emerald-400 font-mono">{WEB_REFERRAL_LINK}{customCode}</span>
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={!customCode.trim() || loading}
                            className={`w-full py-3.5 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                customCode.trim() && !loading
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                            }`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                            {loading ? "Creating..." : "Create Link"}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─── Share Modal ─────────────────────────────────────────────────────────────

const ShareModal = ({
    open,
    onClose,
    link,
    code,
}: {
    open: boolean;
    onClose: () => void;
    link: string;
    code: string;
}) => {
    const shareText = `Join YatriPay and start earning! Use my referral code: ${code}\n${link}`;

    const platforms = [
        { name: "WhatsApp", color: "bg-[#25D366]", url: `https://wa.me/?text=${encodeURIComponent(shareText)}` },
        { name: "Telegram", color: "bg-[#0088cc]", url: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`Join YatriPay! Code: ${code}`)}` },
        { name: "Twitter",  color: "bg-[#1DA1F2]", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join YatriPay! Code: ${code}`)}&url=${encodeURIComponent(link)}` },
        { name: "Email",    color: "bg-[#EA4335]", url: `mailto:?subject=${encodeURIComponent("Join YatriPay!")}&body=${encodeURIComponent(shareText)}` },
    ];

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                    style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 60 }}
                        transition={{ duration: 0.3, type: "spring", damping: 25 }}
                        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl border border-white/8 p-6 space-y-5 relative"
                        style={{ background: "linear-gradient(170deg,#0a0f0b 0%,#000000 100%)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                            <X size={14} />
                        </button>

                        <div className="text-center">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                <Gift size={22} className="text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-black text-white">Share & Earn</h3>
                            <p className="text-[13px] text-gray-500 mt-1">Invite friends via your favorite platform</p>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {platforms.map((p) => (
                                <a
                                    key={p.name}
                                    href={p.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-white/6 hover:border-emerald-500/25 transition-all group"
                                >
                                    <div className={`h-10 w-10 rounded-xl ${p.color} flex items-center justify-center text-white text-sm font-black`}>
                                        {p.name[0]}
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-500 group-hover:text-white transition-colors">{p.name}</span>
                                </a>
                            ))}
                        </div>

                        <div className="rounded-2xl border border-white/8 p-3 flex items-center gap-2" style={{ background: "rgba(0,0,0,0.8)" }}>
                            <p className="text-[12px] font-mono text-gray-500 truncate flex-1">{link}</p>
                            <CopyButton value={link} />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const ReferralPage = () => {
    const { token, user: authUser } = useAuth();
    const hasSponsor = !!authUser?.referred_by_name;

    const [referralId, setReferralId]         = useState<number | null>(null);
    const [referralCode, setReferralCode]     = useState("");
    const [referralLink, setReferralLink]     = useState("");
    const [referredUsers, setReferredUsers]   = useState<any[]>([]);
    const [referralEarned, setReferralEarned] = useState(0);
    const [pageLoading, setPageLoading]       = useState(true);
    const [showSponsor, setShowSponsor]       = useState(false);
    const [showCustom, setShowCustom]         = useState(false);
    const [showShare, setShowShare]           = useState(false);
    const [showAllReferrals, setShowAllReferrals] = useState(false);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            setPageLoading(true);
            try {
                const [refRes, listRes, refTxnRes] = await Promise.allSettled([
                    api.get(ENDPOINTS.USER_REFERRAL),
                    api.get(ENDPOINTS.REFERRED_USER_LIST),
                    api.post(ENDPOINTS.TRANSACTION_FILTER, { trans_type_filter: ["Referral Reward"] }),
                ]);

                if (refRes.status === "fulfilled") {
                    const raw = refRes.value.data;
                    const data = raw?.data ?? raw;
                    const code = data?.code || data?.referral_code || "";
                    const linkId = data?.id || data?.referral_link_id || raw?.id || null;
                    setReferralId(linkId);
                    setReferralCode(code);
                    setReferralLink(`${WEB_REFERRAL_LINK}${code}`);
                }

                let refLinkIdFromList: number | null = null;
                if (listRes.status === "fulfilled") {
                    const data = listRes.value.data?.data ?? listRes.value.data;
                    if (Array.isArray(data)) {
                        setReferredUsers(data);
                        if (data.length > 0 && data[0].referral_link) {
                            refLinkIdFromList = data[0].referral_link;
                        }
                    }
                }

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

                setReferralId((prev) => prev || refLinkIdFromList);
            } catch { /* silent */ }
            finally { setPageLoading(false); }
        };

        fetchData();
    }, [token]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Join YatriPay",
                text: `Join YatriPay using my referral code: ${referralCode}`,
                url: referralLink,
            }).catch(() => setShowShare(true));
        } else {
            setShowShare(true);
        }
    };

    const handleAddSponsor = () => {
        if (hasSponsor) {
            toast.error(`You already have a sponsor: ${authUser?.referred_by_name}`);
            return;
        }
        setShowSponsor(true);
    };

    // ── Derived stats ────────────────────────────────────────────────────────
    const totalReferred = referredUsers.length;
    const kycDoneCount  = referredUsers.filter((u: any) => u.reward_given).length;

    // Tiered milestones (1x → 2x → 4x → 10x multiplier on base earnings)
    const tier          = totalReferred >= 10 ? 3 : totalReferred >= 5 ? 2 : totalReferred >= 1 ? 1 : 0;
    const MULT_LABELS   = ["1x", "2x", "4x", "10x"];
    const currentMult   = MULT_LABELS[tier];
    const nextMult      = tier < 3 ? MULT_LABELS[tier + 1] : "MAX";
    const tierTargets   = [1, 5, 10, 10];
    const tierPrev      = [0, 1, 5, 10];
    const nextTarget    = tierTargets[tier];
    const prevTarget    = tierPrev[tier];
    const remaining     = Math.max(0, nextTarget - totalReferred);
    const progressPct   = tier === 3
        ? 100
        : Math.min(100, Math.max(4, ((totalReferred - prevTarget) / (nextTarget - prevTarget)) * 100));
    const boostPct      = Math.min(totalReferred, 100);

    const isCustomLinkSet = !!referralCode && /[^0-9]/.test(referralCode);

    if (pageLoading) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8">
                <SectionLoader />
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-5">

            <AddSponsorModal open={showSponsor} onClose={() => setShowSponsor(false)} />
            <ShareModal
                open={showShare}
                onClose={() => setShowShare(false)}
                link={referralLink}
                code={referralCode}
            />
            <CustomLinkModal
                open={showCustom}
                onClose={() => setShowCustom(false)}
                referralLinkId={referralId}
                onCreated={(code) => {
                    setReferralCode(code);
                    setReferralLink(`${WEB_REFERRAL_LINK}${code}`);
                }}
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
                    <h1 className="text-xl font-black text-white tracking-tight">Referrals</h1>
                    <p className="text-sm text-gray-600 mt-0.5">Invite friends, boost your earnings</p>
                </div>
            </motion.div>

            {/* ── Hero: Boost Your Earnings ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl border border-white/6 px-6 md:px-10 py-8 md:py-10 text-center relative overflow-hidden"
                style={{ background: "linear-gradient(180deg,#0a0f0b 0%,#000000 100%)" }}
            >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-5">
                    <Zap size={10} className="text-emerald-400" fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Growth Machine</span>
                </div>

                <h1 className="text-3xl md:text-[42px] font-black text-white tracking-tight leading-tight">
                    Boost Your Earnings <span className="text-emerald-400">10x</span>
                </h1>

                <p className="text-[13px] md:text-sm text-gray-400 mt-3">
                    {tier === 3
                        ? <>You&apos;ve maxed out the <span className="italic font-black text-white">Super Booster (10x)</span>.</>
                        : <>Invite <span className="font-black text-white">{remaining}</span> more friend{remaining === 1 ? "" : "s"} to unlock <span className="italic font-black text-white">{nextMult} Booster</span>.</>
                    }
                </p>

                <div className="max-w-2xl mx-auto mt-8 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500 italic">Current: <span className="text-white font-bold not-italic">{currentMult}</span></span>
                        <span className="text-emerald-400 font-black">Target: {nextMult}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="h-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-300"
                            style={{ boxShadow: "0 0 12px rgba(16,185,129,0.65)" }}
                        />
                    </div>
                    <div className="grid grid-cols-4 text-[10px] uppercase tracking-widest font-black pt-1">
                        <span className={tier >= 0 ? "text-emerald-400 text-left" : "text-gray-500 text-left"}>0 Friend · 1x</span>
                        <span className={tier >= 1 ? "text-emerald-400 text-center" : "text-gray-500 text-center"}>1 Friend · 2x</span>
                        <span className={tier >= 2 ? "text-emerald-400 text-center" : "text-gray-500 text-center"}>5 Friends · 4x</span>
                        <span className={tier >= 3 ? "text-emerald-400 text-right" : "text-gray-600 text-right"}>10+ · 10x</span>
                    </div>
                </div>
            </motion.div>

            {/* ── Share Code + Total Earned ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Share Your Secret Code */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.35 }}
                    className="lg:col-span-2 rounded-3xl border border-white/6 p-6 md:p-7 space-y-5"
                    style={{ background: "linear-gradient(180deg,#0a0f0b 0%,#040605 100%)" }}
                >
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[11px] uppercase tracking-widest text-gray-400 font-black">Share Your Secret Code</span>
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest text-gray-600 font-black px-1">Referral Code</p>
                        <div className="rounded-2xl border border-white/8 px-4 py-3.5 flex items-center justify-between gap-3" style={{ background: "rgba(0,0,0,0.7)" }}>
                            <span className="text-xl md:text-2xl font-black text-white font-mono tracking-[0.15em] truncate">
                                {referralCode || "—"}
                            </span>
                            {referralCode && <CopyButton value={referralCode} iconOnly />}
                        </div>
                    </div>

                    <div className={`grid gap-3 ${isCustomLinkSet ? "grid-cols-1" : "grid-cols-2"}`}>
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[12px] uppercase tracking-widest shadow-[0_8px_24px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all"
                        >
                            <Share2 size={14} strokeWidth={2.5} />
                            Invite Now
                        </button>
                        {!isCustomLinkSet && (
                            <button
                                onClick={() => setShowCustom(true)}
                                className="flex items-center justify-center py-3.5 rounded-2xl border border-white/10 text-white font-black text-[13px] tracking-wide hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.98] transition-all"
                                style={{ background: "rgba(0,0,0,0.4)" }}
                            >
                                Custom Link
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-5 pt-1">
                        <button
                            onClick={handleShare}
                            className="text-gray-600 hover:text-emerald-400 transition-colors"
                            aria-label="Mobile share"
                        >
                            <Smartphone size={16} strokeWidth={2} />
                        </button>
                        <button
                            onClick={() => setShowShare(true)}
                            className="text-gray-600 hover:text-emerald-400 transition-colors"
                            aria-label="Share stats"
                        >
                            <TrendingUp size={16} strokeWidth={2} />
                        </button>
                        {!hasSponsor && (
                            <button
                                onClick={handleAddSponsor}
                                className="text-gray-600 hover:text-emerald-400 transition-colors"
                                aria-label="Add sponsor"
                            >
                                <UserPlus size={16} strokeWidth={2} />
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Total Earned - bright green card */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.35 }}
                    className="rounded-3xl p-6 relative overflow-hidden flex flex-col"
                    style={{ background: "linear-gradient(140deg,#22c55e 0%,#15803d 100%)" }}
                >
                    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex-1 flex flex-col">
                        <Award size={32} className="text-white" strokeWidth={1.75} />

                        <p className="text-[10px] uppercase tracking-widest text-black/70 font-black mt-5">Total Earned</p>
                        <div className="mt-0.5 flex items-baseline gap-1.5">
                            <span className="text-3xl md:text-4xl font-black text-black leading-none">
                                {referralEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-sm font-black text-black/75">YTP</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 mt-auto pt-6">
                            <div className="rounded-xl border border-white/20 p-2.5" style={{ background: "rgba(255,255,255,0.18)" }}>
                                <p className="text-[9px] uppercase tracking-widest text-black/70 font-black">Friends</p>
                                <p className="text-base font-black text-black mt-0.5">{String(totalReferred).padStart(2, "0")}</p>
                            </div>
                            <div className="rounded-xl border border-white/20 p-2.5" style={{ background: "rgba(255,255,255,0.18)" }}>
                                <p className="text-[9px] uppercase tracking-widest text-black/70 font-black">Boost</p>
                                <p className="text-base font-black text-black mt-0.5">+{boostPct}%</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── APY Milestones + Recent Referrals ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* APY Milestones */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.35 }}
                    className="rounded-3xl border border-white/6 p-6"
                    style={{ background: "linear-gradient(180deg,#0a0f0b 0%,#040605 100%)" }}
                >
                    <div className="flex items-center gap-2 mb-5">
                        <Zap size={14} className="text-emerald-400" fill="currentColor" />
                        <h2 className="text-[15px] font-black text-white tracking-tight">Milestones</h2>
                    </div>

                    <div className="space-y-2.5">
                        {[
                            { range: "0 Friends",    mult: "1x",  tier: 0 },
                            { range: "1 Friend",     mult: "2x",  tier: 1 },
                            { range: "5 Friends",    mult: "4x",  tier: 2 },
                            { range: "10+ Friends",  mult: "10x", tier: 3 },
                        ].map((m) => {
                            const active = m.tier === tier;
                            const unlocked = m.tier <= tier;
                            return (
                                <div
                                    key={m.range}
                                    className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-all ${
                                        active
                                            ? "border-emerald-500/30 bg-emerald-500/5"
                                            : unlocked
                                                ? "border-emerald-500/15"
                                                : "border-white/6"
                                    }`}
                                    style={!active ? { background: "rgba(0,0,0,0.5)" } : undefined}
                                >
                                    <span className={`text-[11px] uppercase tracking-widest font-black ${unlocked ? "text-gray-300" : "text-gray-500"}`}>{m.range}</span>
                                    <span className={`text-[13px] font-black ${active ? "text-emerald-400" : unlocked ? "text-white" : "text-gray-500"}`}>{m.mult}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Recent Referrals */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.35 }}
                    className="lg:col-span-2 rounded-3xl border border-white/6 p-6"
                    style={{ background: "linear-gradient(180deg,#0a0f0b 0%,#040605 100%)" }}
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-[15px] font-black text-white tracking-tight">
                            {showAllReferrals ? "All Referrals" : "Recent Referrals"}
                        </h2>
                        {referredUsers.length > 5 && (
                            <button
                                onClick={() => setShowAllReferrals((v) => !v)}
                                className="text-[11px] uppercase tracking-widest font-black text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
                            >
                                {showAllReferrals ? "Show Less" : `View All (${referredUsers.length})`} <ArrowRight size={10} />
                            </button>
                        )}
                    </div>

                    {referredUsers.length === 0 ? (
                        <div className="py-10 text-center">
                            <Users size={28} className="text-gray-800 mx-auto mb-2" />
                            <p className="text-[13px] text-gray-600 font-medium">No referrals yet</p>
                            <p className="text-[12px] text-gray-700 mt-1">Share your link to start earning</p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden sm:grid grid-cols-12 gap-3 pb-2.5 border-b border-white/6 text-[10px] uppercase tracking-widest font-black text-gray-600">
                                <span className="col-span-3">User</span>
                                <span className="col-span-3">Date</span>
                                <span className="col-span-3 text-center">Status</span>
                                <span className="col-span-3 text-right">Reward</span>
                            </div>

                            <div className={`divide-y divide-white/4 ${showAllReferrals ? "max-h-96 overflow-y-auto" : ""}`}>
                                {(showAllReferrals ? referredUsers : referredUsers.slice(0, 5)).map((item: any, i: number) => {
                                    const refUser = item.referred_to || {};
                                    const firstName = refUser.first_name || "";
                                    const lastName  = refUser.last_name || "";
                                    const rawName   = `${firstName} ${lastName}`.trim();
                                    const lastInitial = lastName ? ` ${lastName[0].toUpperCase()}.` : "";
                                    const displayName = firstName
                                        ? `${firstName}${lastInitial}`
                                        : (refUser.email || `User #${item.id || i + 1}`);
                                    const joinDate = item.created_at || refUser.created_at;
                                    const formattedDate = joinDate ? new Date(joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                                    const kycDone = !!item.reward_given;

                                    return (
                                        <motion.div
                                            key={item.id ?? i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.25 + i * 0.04 }}
                                            className="grid grid-cols-12 gap-3 items-center py-3.5"
                                        >
                                            <span className="col-span-5 sm:col-span-3 text-[13px] font-black text-white truncate" title={rawName}>
                                                {displayName}
                                            </span>
                                            <span className="hidden sm:block col-span-3 text-[12px] text-gray-500 tabular-nums">{formattedDate}</span>
                                            <div className="col-span-4 sm:col-span-3 flex justify-center">
                                                {kycDone ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                                                        <CheckCircle2 size={8} /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/12 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-widest">
                                                        <Clock size={8} /> Pending KYC
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`col-span-3 text-right text-[12px] font-black ${kycDone ? "text-emerald-400" : "text-gray-500"}`}>
                                                {kycDone ? "+5% P.A." : "Pending"}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            {/* ── Footer note ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="rounded-2xl border border-white/5 px-6 py-5 text-center"
                style={{ background: "rgba(0,0,0,0.4)" }}
            >
                <p className="text-[10px] md:text-[11px] uppercase tracking-widest text-gray-600 font-black">
                    *Rewards are credited after KYC verification. P.A. boost is valid for 30 days.
                </p>
                {/* <button className="text-[12px] text-gray-400 hover:text-emerald-400 underline underline-offset-4 mt-2 font-black transition-colors">
                    Read full referral policy & terms
                </button> */}
            </motion.div>

            {/* Inline banner if earned missing but we want a subtle Gift cue - removed for clean layout */}
            {kycDoneCount === 0 && totalReferred > 0 && (
                <div className="rounded-2xl border border-white/5 p-4 flex items-start gap-3" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
                        <Gift size={14} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-[13px] font-black text-white">Waiting on KYC</p>
                        <p className="text-[12px] text-gray-500 leading-relaxed mt-0.5">
                            Your rewards will be credited once your friends complete KYC verification.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralPage;

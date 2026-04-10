"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Copy, Share2, UserPlus, Award, Zap,
    CheckCircle2, Clock, X, ArrowRight, Gift,
    TrendingUp, Link2, Loader2, Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { getApiError } from "@/lib/helpers";
import { useAuth } from "@/context/AuthContext";
import { SectionLoader } from "@/components/Include/Loader";

const WEB_REFERRAL_LINK = "https://webapp.yatripay.com/#/signup?ref=";

// ─── Copy helper ─────────────────────────────────────────────────────────────

const CopyButton = ({ value, label }: { value: string; label?: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className={`shrink-0 h-8 px-3 rounded-lg flex items-center gap-1.5 text-[13px] font-black uppercase tracking-wider transition-all ${
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
                            style={{ background: "rgba(5,13,7,0.8)" }}
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
                                style={{ background: "rgba(5,13,7,0.8)" }}
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
                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 60 }}
                        transition={{ duration: 0.3, type: "spring", damping: 25 }}
                        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl border border-white/8 p-6 space-y-5 relative"
                        style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
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

                        <div className="rounded-2xl border border-white/8 p-3 flex items-center gap-2" style={{ background: "rgba(5,13,7,0.8)" }}>
                            <p className="text-[12px] font-mono text-gray-500 truncate flex-1">{link}</p>
                            <CopyButton value={link} label="Copy" />
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

    const [referralId, setReferralId]           = useState<number | null>(null);
    const [referralCode, setReferralCode]     = useState("");
    const [referralLink, setReferralLink]     = useState("");
    const [referredUsers, setReferredUsers]   = useState<any[]>([]);
    const [pageLoading, setPageLoading]       = useState(true);
    const [showSponsor, setShowSponsor]       = useState(false);
    const [showCustom, setShowCustom]         = useState(false);
    const [showShare, setShowShare]           = useState(false);

    // Fetch all data
    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            setPageLoading(true);
            try {
                const [refRes, listRes] = await Promise.allSettled([
                    api.get(ENDPOINTS.USER_REFERRAL),
                    api.get(ENDPOINTS.REFERRED_USER_LIST),
                ]);

                if (refRes.status === "fulfilled") {
                    const raw = refRes.value.data;
                    const data = raw?.data ?? raw;
                    console.log("[Referral] API response:", raw);
                    const code = data?.code || data?.referral_code || "";
                    // id could be at data.id, data.referral_link_id, or top level
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
                        // Fallback: get referral_link id from the first referred user
                        if (data.length > 0 && data[0].referral_link) {
                            refLinkIdFromList = data[0].referral_link;
                        }
                    }
                }

                // Use fallback ID from referred users list if main one is null
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

    // Stats — reward_given means KYC is done
    const totalReferred = referredUsers.length;
    const kycDoneCount  = referredUsers.filter((u: any) => u.reward_given).length;
    const pendingCount  = totalReferred - kycDoneCount;

    if (pageLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
                <SectionLoader />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

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

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Referral Program</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Invite friends and earn rewards together</p>
                </div>

                <button
                    onClick={handleAddSponsor}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[12px] uppercase tracking-widest shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all shrink-0"
                >
                    <UserPlus size={14} strokeWidth={2.5} />
                    {hasSponsor ? "Sponsor Added" : "Add Sponsor"}
                </button>
            </motion.div>

            {/* ── Stats ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
                {[
                    { label: "Total Referrals", value: String(totalReferred).padStart(2, "0"), icon: Users,        color: "text-emerald-400" },
                    { label: "KYC Done",        value: String(kycDoneCount).padStart(2, "0"),  icon: CheckCircle2, color: "text-sky-400" },
                    { label: "Pending KYC",     value: String(pendingCount).padStart(2, "0"),  icon: Clock,        color: "text-amber-400" },
                    { label: "Referral Code",   value: referralCode || "—",                    icon: Award,        color: "text-violet-400" },
                ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/6 p-3.5" style={{ background: "rgba(10,26,15,0.7)" }}>
                        <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                            <s.icon size={16} className={s.color} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13px] text-gray-600 uppercase tracking-wider font-bold truncate">{s.label}</p>
                            <p className="text-sm font-black text-white truncate">{s.value}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT (3 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="lg:col-span-3 space-y-5"
                >
                    {/* Referral code & link */}
                    <div className="rounded-3xl border border-white/6 p-6 space-y-5" style={{ background: "rgba(10,26,15,0.7)" }}>
                        <div className="flex items-center gap-2.5">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">Your Referral Details</h2>
                        </div>

                        <div className="space-y-1.5">
                            <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold px-1">Referral Code</p>
                            <div className="rounded-2xl border border-white/8 p-4 flex items-center justify-between" style={{ background: "rgba(5,13,7,0.8)" }}>
                                <span className="text-xl font-black text-white font-mono tracking-widest">{referralCode || "—"}</span>
                                {referralCode && <CopyButton value={referralCode} />}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold px-1 flex items-center gap-1.5">
                                <Link2 size={10} /> Referral Link
                            </p>
                            <div className="rounded-2xl border border-white/8 p-4 flex items-center gap-3" style={{ background: "rgba(5,13,7,0.8)" }}>
                                <p className="text-[13px] font-mono font-bold text-gray-400 truncate flex-1 select-all">
                                    {referralLink || "—"}
                                </p>
                                {referralLink && <CopyButton value={referralLink} />}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[13px] uppercase tracking-widest shadow-[0_8px_24px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all"
                            >
                                <Share2 size={15} strokeWidth={2.5} />
                                Invite Friends
                            </button>
                            <button
                                onClick={() => setShowCustom(true)}
                                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/8 text-white font-black text-[13px] uppercase tracking-widest hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.98] transition-all"
                                style={{ background: "rgba(5,13,7,0.6)" }}
                            >
                                <Link2 size={15} strokeWidth={2.5} />
                                Custom Link
                            </button>
                        </div>
                    </div>

                    {/* Referred Users Table */}
                    <div className="rounded-3xl border border-white/6 overflow-hidden" style={{ background: "rgba(10,26,15,0.7)" }}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
                            <div className="flex items-center gap-2.5">
                                <Users size={16} className="text-emerald-400" />
                                <h2 className="text-base font-black text-white tracking-wide">Referred Users</h2>
                                <span className="text-[12px] font-black text-gray-500 bg-white/4 px-2 py-0.5 rounded-full">{totalReferred}</span>
                            </div>
                        </div>

                        {referredUsers.length === 0 ? (
                            <div className="p-12 text-center">
                                <Users size={40} className="text-gray-700 mx-auto mb-3" />
                                <p className="text-sm text-gray-600 font-medium">No referrals yet</p>
                                <p className="text-[13px] text-gray-700 mt-1">Share your link to start earning rewards</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop header */}
                                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-2.5 border-b border-white/4 text-[12px] text-gray-600 uppercase tracking-widest font-black">
                                    <div className="col-span-4">User</div>
                                    <div className="col-span-3">Joined</div>
                                    <div className="col-span-3">KYC Status</div>
                                    <div className="col-span-2 text-right">Status</div>
                                </div>

                                {referredUsers.map((item: any, i: number) => {
                                    // referred_to has the user details
                                    const refUser = item.referred_to || {};
                                    const firstName = refUser.first_name || "";
                                    const lastName = refUser.last_name || "";
                                    const name = `${firstName} ${lastName}`.trim() || refUser.email || `User #${item.id || i + 1}`;
                                    const initials = name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
                                    const joinDate = item.created_at || refUser.created_at;
                                    const formattedDate = joinDate ? new Date(joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                                    const kycDone = !!item.reward_given;

                                    return (
                                        <motion.div
                                            key={item.id ?? i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="border-b border-white/4 last:border-0 hover:bg-white/[0.02] transition-colors"
                                        >
                                            {/* Desktop */}
                                            <div className="hidden sm:grid grid-cols-12 gap-4 items-center px-6 py-3.5">
                                                <div className="col-span-4 flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-[11px] font-black text-emerald-400">
                                                        {initials}
                                                    </div>
                                                    <span className="text-sm font-bold text-white truncate">{name}</span>
                                                </div>
                                                <div className="col-span-3">
                                                    <span className="text-[13px] text-gray-500 tabular-nums">{formattedDate}</span>
                                                </div>
                                                <div className="col-span-3">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider ${
                                                        kycDone
                                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                                    }`}>
                                                        {kycDone ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                                                        {kycDone ? "KYC Done" : "Pending"}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider ${
                                                        kycDone
                                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                            : "bg-white/5 border-white/8 text-gray-500"
                                                    }`}>
                                                        {kycDone ? <Shield size={9} /> : <Clock size={9} />}
                                                        {kycDone ? "Active" : "Waiting"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Mobile */}
                                            <div className="sm:hidden px-5 py-3.5 flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-[11px] font-black text-emerald-400">
                                                    {initials}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-white truncate">{name}</p>
                                                    <p className="text-[12px] text-gray-600">{formattedDate}</p>
                                                </div>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                                    kycDone
                                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                                }`}>
                                                    {kycDone ? "KYC Done" : "Pending"}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </motion.div>

                {/* ── RIGHT (2 cols) ── */}
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
                                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400/60 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                    Rewards
                                </span>
                            </div>

                            <div>
                                <p className="text-[12px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">Summary</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-emerald-500/15 p-3 text-center" style={{ background: "rgba(16,185,129,0.06)" }}>
                                        <p className="text-[11px] text-emerald-400/60 uppercase tracking-wider font-bold">Friends</p>
                                        <p className="text-xl font-black text-white">{String(totalReferred).padStart(2, "0")}</p>
                                    </div>
                                    <div className="rounded-xl border border-emerald-500/15 p-3 text-center" style={{ background: "rgba(16,185,129,0.06)" }}>
                                        <p className="text-[11px] text-emerald-400/60 uppercase tracking-wider font-bold">KYC Done</p>
                                        <p className="text-xl font-black text-white">{String(kycDoneCount).padStart(2, "0")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="rounded-3xl border border-white/6 p-6 space-y-4" style={{ background: "rgba(10,26,15,0.7)" }}>
                        <div className="flex items-center gap-2.5">
                            <Zap size={16} className="text-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">How It Works</h2>
                        </div>

                        <div className="space-y-3">
                            {[
                                { step: "1", text: "Share your unique referral link with friends" },
                                { step: "2", text: "Friend signs up using your link" },
                                { step: "3", text: "Friend completes KYC verification" },
                                { step: "4", text: "Both of you earn rewards!" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-[11px] font-black text-emerald-400">
                                        {item.step}
                                    </div>
                                    <p className="text-[13px] text-gray-400 font-medium leading-relaxed pt-1">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info note */}
                    <div className="rounded-2xl border border-white/5 p-4 flex items-start gap-3" style={{ background: "rgba(5,13,7,0.6)" }}>
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
                            <Gift size={14} className="text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Referral Rewards</p>
                            <p className="text-[13px] text-gray-600 leading-relaxed mt-0.5">
                                Rewards are credited after your friend completes KYC verification.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ReferralPage;

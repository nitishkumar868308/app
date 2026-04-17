"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Copy, CheckCircle2, ArrowRight,
    Gift, Sparkles, X, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";

const WEB_REFERRAL_LINK = "https://webapp.yatripay.com/#/signup?ref=";

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
        {
            name: "WhatsApp",
            color: "bg-[#25D366]",
            icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/whatsapp.svg",
            url: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        },
        {
            name: "Telegram",
            color: "bg-[#0088cc]",
            icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/telegram.svg",
            url: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`Join YatriPay! Code: ${code}`)}`,
        },
        {
            name: "Twitter",
            color: "bg-[#1DA1F2]",
            icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/x.svg",
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join YatriPay! Use my referral code: ${code}`)}&url=${encodeURIComponent(link)}`,
        },
        {
            name: "Email",
            color: "bg-[#EA4335]",
            icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/gmail.svg",
            url: `mailto:?subject=${encodeURIComponent("Join YatriPay!")}&body=${encodeURIComponent(shareText)}`,
        },
    ];

    const handleCopy = async () => {
        await navigator.clipboard.writeText(link);
        toast.success("Link copied!");
    };

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
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>

                        <div className="text-center">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                <Gift size={22} className="text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-black text-white">Share & Earn</h3>
                            <p className="text-[13px] text-gray-500 mt-1">Invite friends via your favorite platform</p>
                        </div>

                        {/* Platforms */}
                        <div className="grid grid-cols-4 gap-3">
                            {platforms.map((p) => (
                                <a
                                    key={p.name}
                                    href={p.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-white/6 hover:border-emerald-500/25 hover:bg-white/[0.02] transition-all group"
                                >
                                    <div className={`h-10 w-10 rounded-xl ${p.color} flex items-center justify-center shadow-lg`}>
                                        <img src={p.icon} alt={p.name} className="h-5 w-5 brightness-0 invert" />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-500 group-hover:text-white transition-colors">{p.name}</span>
                                </a>
                            ))}
                        </div>

                        {/* Copy link */}
                        <div className="rounded-2xl border border-white/8 p-3 flex items-center gap-2" style={{ background: "rgba(5,13,7,0.8)" }}>
                            <p className="text-[12px] font-mono text-gray-500 truncate flex-1">{link}</p>
                            <button
                                onClick={handleCopy}
                                className="shrink-0 h-8 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-emerald-500/20 transition-all"
                            >
                                <Copy size={10} /> Copy
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const ReferralSection = () => {
    const { token } = useAuth();
    const [copied, setCopied]             = useState(false);
    const [showShare, setShowShare]       = useState(false);
    const [referralCode, setReferralCode] = useState("");
    const [referralLink, setReferralLink] = useState("");
    const [totalReferred, setTotalReferred] = useState(0);
    const [kycDoneCount, setKycDoneCount]   = useState(0);
    const [referralEarned, setReferralEarned] = useState(0);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                const [refRes, listRes, refTxnRes] = await Promise.allSettled([
                    api.get(ENDPOINTS.USER_REFERRAL),
                    api.get(ENDPOINTS.REFERRED_USER_LIST),
                    api.post(ENDPOINTS.TRANSACTION_FILTER, { trans_type_filter: ["Referral Reward"] }),
                ]);

                if (refRes.status === "fulfilled") {
                    const data = refRes.value.data?.data ?? refRes.value.data;
                    const code = data?.code || data?.referral_code || "";
                    setReferralCode(code);
                    setReferralLink(`${WEB_REFERRAL_LINK}${code}`);
                }

                if (listRes.status === "fulfilled") {
                    const data = listRes.value.data?.data ?? listRes.value.data;
                    if (Array.isArray(data)) {
                        setTotalReferred(data.length);
                        setKycDoneCount(data.filter((u: any) => u.reward_given).length);
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
            } catch { /* silent */ }
        };

        fetchData();
    }, [token]);

    const handleCopy = async () => {
        if (!referralLink) return;
        await navigator.clipboard.writeText(referralLink);
        setCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Join YatriPay",
                text: `Join YatriPay using my referral code: ${referralCode}`,
                url: referralLink,
            }).catch(() => {
                // User cancelled or not supported — open modal
                setShowShare(true);
            });
        } else {
            setShowShare(true);
        }
    };

    const pendingCount = totalReferred - kycDoneCount;

    return (
        <>
            <ShareModal
                open={showShare}
                onClose={() => setShowShare(false)}
                link={referralLink}
                code={referralCode}
            />

            <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-2xl border border-emerald-500/15 p-5"
                style={{ background: "linear-gradient(160deg, rgba(16,185,129,0.08) 0%, rgba(10,26,15,0.8) 60%, #0a1a0f 100%)" }}
            >
                {/* Decorative elements */}
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-4">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                                <Sparkles size={13} className="text-emerald-400" />
                            </div>
                            <span className="text-[12px] uppercase tracking-[0.2em] text-emerald-400/80 font-black">
                                Referral Program
                            </span>
                        </div>
                        <Link href="/referal" className="text-[12px] text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1 transition-colors">
                            Details <ArrowRight size={10} />
                        </Link>
                    </div>

                    {/* Code display */}
                    {referralCode && (
                        <div
                            className="rounded-xl border border-emerald-500/20 p-3 flex items-center justify-between"
                            style={{ background: "rgba(16,185,129,0.06)" }}
                        >
                            <div>
                                <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest font-bold mb-0.5">Your Code</p>
                                <p className="text-lg font-black text-white font-mono tracking-[0.15em]">{referralCode}</p>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                                    copied
                                        ? "bg-emerald-500 text-black"
                                        : "bg-white/5 border border-white/10 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30"
                                }`}
                            >
                                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                    )}

                    {/* Mini stats */}
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: "Referred", value: String(totalReferred).padStart(2, "0"),                                                                  icon: Users,        color: "text-emerald-400" },
                            { label: "KYC Done", value: String(kycDoneCount).padStart(2, "0"),                                                                   icon: CheckCircle2, color: "text-sky-400" },
                            { label: "Pending",  value: String(pendingCount).padStart(2, "0"),                                                                   icon: Gift,         color: "text-amber-400" },
                            { label: "Earned",   value: `${referralEarned.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,    icon: TrendingUp,   color: "text-violet-400" },
                        ].map((s, i) => (
                            <div key={i} className="rounded-lg border border-white/5 py-2 text-center" style={{ background: "rgba(5,13,7,0.5)" }}>
                                <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">{s.label}</p>
                                <p className={`text-sm font-black ${s.color} truncate px-1`}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="grid grid-cols-5 gap-2">
                        <button
                            onClick={handleCopy}
                            className={`col-span-3 flex items-center justify-center gap-1.5 text-[12px] font-bold py-2.5 rounded-xl border transition-all ${
                                copied
                                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                    : "bg-white/4 border-white/8 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/25"
                            }`}
                        >
                            {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                            {copied ? "Copied!" : "Copy Link"}
                        </button>
                        <button
                            onClick={handleShare}
                            className="col-span-2 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[12px] font-black py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.97]"
                        >
                            <Gift size={13} /> Share
                        </button>
                    </div>
                </div>
            </motion.section>
        </>
    );
};

export default ReferralSection;

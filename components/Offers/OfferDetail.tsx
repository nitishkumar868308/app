"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ArrowRight, CheckCircle2, Circle,
    ChevronDown, ChevronUp, Trophy, Upload,
    Loader2, X, Gift, Flame, Lock as LockIcon,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { getApiError } from "@/lib/helpers";
import { SectionLoader } from "@/components/Include/Loader";
import { OFFERS } from "./offersData";

// ─── Share Platform Modal ────────────────────────────────────────────────────

const SharePlatformModal = ({
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
                            <h3 className="text-lg font-black text-white">Share</h3>
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
                            <button
                                onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copied!"); }}
                                className="shrink-0 h-8 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-wider hover:bg-emerald-500/20 transition-all"
                            >
                                Copy
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─── Copy button ─────────────────────────────────────────────────────────────

const CopyBtn = ({ value }: { value: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success("Copied!");
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className={`shrink-0 h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider transition-all ${
                copied
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border border-white/8 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30"
            }`}
        >
            {copied ? <CheckCircle2 size={10} /> : <span>Copy</span>}
        </button>
    );
};

// ─── Challenge Detail Modal ──────────────────────────────────────────────────

const ChallengeModal = ({
    open,
    onClose,
    amount,
}: {
    open: boolean;
    onClose: () => void;
    amount: number;
}) => (
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
                    className="w-full sm:max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-white/8 relative flex flex-col overflow-hidden"
                    style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-5 border-b border-white/6 shrink-0">
                        <h3 className="text-base font-black text-white">Terms & Conditions</h3>
                        <button onClick={onClose} className="h-8 w-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                        <div className="text-center">
                            <div className="h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto mb-3">
                                <Gift size={24} className="text-amber-400" />
                            </div>
                            <p className="text-3xl font-black text-white">₹{amount.toLocaleString()} Staking Pass</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-black text-white mb-2">How It Works</h4>
                                <div className="space-y-2">
                                    {["Refer 2 users who complete KYC within 2 days", `Receive a ₹${amount.toLocaleString()} YTP Staking Pass`, "The staking period is 15 days"].map((t, i) => (
                                        <div key={i} className="flex items-start gap-2.5">
                                            <div className="h-5 w-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black text-emerald-400">{i + 1}</div>
                                            <p className="text-[13px] text-gray-400">{t}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white mb-2">After 14 Days</h4>
                                <div className="space-y-2">
                                    <div className="rounded-xl border border-white/5 p-3" style={{ background: "rgba(5,13,7,0.6)" }}>
                                        <p className="text-[13px] text-gray-400"><span className="text-emerald-400 font-bold">Option 1:</span> Pay ₹{amount.toLocaleString()} and keep all YTP</p>
                                    </div>
                                    <div className="rounded-xl border border-white/5 p-3" style={{ background: "rgba(5,13,7,0.6)" }}>
                                        <p className="text-[13px] text-gray-400"><span className="text-amber-400 font-bold">Option 2:</span> Return voucher YTP, keep staking rewards</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-white/6 shrink-0">
                        <button onClick={onClose} className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98]">
                            Got It
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// ─── Main ────────────────────────────────────────────────────────────────────

const OfferDetail = ({ slug }: { slug: string }) => {
    const { token } = useAuth();
    const offerConfig = OFFERS.find((o) => o.slug === slug);

    const [tasks, setTasks]             = useState<any[]>([]);
    const [loading, setLoading]         = useState(true);
    const [claiming, setClaiming]       = useState(false);
    const [showChallenge, setShowChallenge] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [referralCode, setReferralCode] = useState("");
    const [referralLink, setReferralLink] = useState("");
    const [screenshotTask, setScreenshotTask] = useState<any>(null);
    const [followTask, setFollowTask]         = useState<any>(null);

    // Get the right endpoint for this offer
    const taskEndpoint = offerConfig?.api === "iphone" ? ENDPOINTS.IPHONE_TASK_LIST : ENDPOINTS.TASK_LIST;

    // Filter tasks — iphone endpoint returns all tasks directly, task endpoint needs task_type filter
    const filterTasks = (data: any[]) => {
        if (!offerConfig) return [];
        if (offerConfig.api === "iphone") return data; // iphone returns all relevant tasks
        return data.filter((t: any) => t.task_type === offerConfig.task_type);
    };

    // Fetch tasks + referral code
    useEffect(() => {
        if (!token || !offerConfig) return;
        (async () => {
            setLoading(true);
            try {
                const [taskRes, refRes] = await Promise.allSettled([
                    api.get(taskEndpoint),
                    api.get(ENDPOINTS.USER_REFERRAL),
                ]);

                if (taskRes.status === "fulfilled") {
                    const data = taskRes.value.data?.data ?? taskRes.value.data;
                    if (Array.isArray(data)) {
                        setTasks(filterTasks(data));
                    }
                }

                if (refRes.status === "fulfilled") {
                    const rd = refRes.value.data?.data ?? refRes.value.data;
                    const code = rd?.code || rd?.referral_code || "";
                    setReferralCode(code);
                    setReferralLink(`https://webapp.yatripay.com/#/signup?ref=${code}`);
                }
            } catch { /* silent */ }
            finally { setLoading(false); }
        })();
    }, [token, offerConfig]);

    // Mega reward from last task that has it
    const megaReward = tasks.find((t) => t.mega_reward)?.mega_reward || null;
    const megaRewardStatus = megaReward?.status || null;
    const isRewardClaimed = !!megaReward; // any mega_reward means challenge is done
    const isRewardUsed = megaRewardStatus === "USED";

    // Count completed
    const completedCount = tasks.filter((t) => t.status === "COMPLETED" || t.status === "DONE").length;
    const totalCount = tasks.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    // Claim handler
    const handleClaim = async () => {
        if (!offerConfig || isRewardUsed || claiming) return;

        setClaiming(true);
        try {
            const payload: any = { id: offerConfig.claim_id };

            const res = await api.post(ENDPOINTS.CLAIM_REWARD, payload);
            if (res.data?.success) {
                toast.success(res.data.message || "Reward claimed!");
                // Refresh tasks
                try {
                    const refreshRes = await api.get(taskEndpoint);
                    const data = refreshRes.data?.data ?? refreshRes.data;
                    if (Array.isArray(data)) {
                        setTasks(filterTasks(data));
                    }
                } catch { /* silent */ }
            } else {
                toast.error(res.data?.message || "Failed to claim");
            }
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setClaiming(false);
        }
    };

    if (!offerConfig) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-16 text-center">
                <p className="text-gray-500 text-sm font-bold">Offer not found</p>
                <Link href="/offers" className="text-emerald-400 text-xs font-bold hover:underline mt-2 inline-block">Back to Offers</Link>
            </div>
        );
    }

    const Icon = offerConfig.icon;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            <ChallengeModal
                open={showChallenge}
                onClose={() => setShowChallenge(false)}
                amount={10000}
            />

            {/* Screenshot Modal */}
            <ScreenshotModal
                open={!!screenshotTask}
                onClose={() => setScreenshotTask(null)}
                task={screenshotTask}
                onDone={async () => {
                    try {
                        const res = await api.get(taskEndpoint);
                        const data = res.data?.data ?? res.data;
                        if (Array.isArray(data)) setTasks(filterTasks(data));
                    } catch { /* silent */ }
                }}
            />

            {/* Social Follow Modal */}
            <SocialFollowModal
                open={!!followTask}
                onClose={() => setFollowTask(null)}
                task={followTask}
                onDone={async () => {
                    try {
                        const res = await api.get(taskEndpoint);
                        const data = res.data?.data ?? res.data;
                        if (Array.isArray(data)) setTasks(filterTasks(data));
                    } catch { /* silent */ }
                }}
            />

            {/* Share Modal */}
            <SharePlatformModal
                open={showShareModal}
                onClose={() => setShowShareModal(false)}
                link={referralLink}
                code={referralCode}
            />

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-4"
            >
                <Link href="/offers">
                    <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                        <ArrowLeft size={16} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">{offerConfig.title}</h1>
                    <p className="text-sm text-gray-600 mt-0.5">{offerConfig.tagline}</p>
                </div>
            </motion.div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT (3 cols) ── */}
                <div className="lg:col-span-3 space-y-5">

                    {/* Reward Unlocked card */}
                    {megaReward && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-3xl border border-emerald-500/20 p-6 space-y-4 relative overflow-hidden"
                            style={{ background: "linear-gradient(150deg, rgba(16,185,129,0.12) 0%, rgba(10,26,15,0.9) 100%)" }}
                        >
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 size={18} className="text-emerald-400" />
                                        <h2 className="text-base font-black text-white">Reward Unlocked</h2>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                                        megaRewardStatus === "ACTIVE"
                                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                                            : megaRewardStatus === "USED"
                                            ? "bg-gray-500/10 border-gray-500/25 text-gray-400"
                                            : "bg-amber-500/10 border-amber-500/25 text-amber-400"
                                    }`}>
                                        {megaRewardStatus}
                                    </span>
                                </div>

                                {/* Amounts */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-emerald-500/15 p-3 text-center" style={{ background: "rgba(16,185,129,0.06)" }}>
                                        <p className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-bold">INR Value</p>
                                        <p className="text-lg font-black text-white">₹{Number(megaReward.inr_amount).toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-xl border border-emerald-500/15 p-3 text-center" style={{ background: "rgba(16,185,129,0.06)" }}>
                                        <p className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-bold">YTP Amount</p>
                                        <p className="text-lg font-black text-white">{Number(megaReward.ytp_amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                    </div>
                                </div>

                                {/* Promo code */}
                                <div className="space-y-1.5">
                                    <p className="text-[11px] text-gray-600 uppercase tracking-wider font-bold px-1">Promo Code</p>
                                    <div className="rounded-2xl border border-emerald-500/20 p-3.5 flex items-center justify-between" style={{ background: "rgba(5,13,7,0.8)" }}>
                                        <span className="text-base font-black text-emerald-400 font-mono tracking-[0.15em]">{megaReward.promo_code}</span>
                                        <CopyBtn value={megaReward.promo_code} />
                                    </div>
                                </div>

                                {/* Expiry */}
                                {megaReward.expires_at && (
                                    <div className="flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/5 p-3">
                                        <Flame size={13} className="text-amber-400 shrink-0" />
                                        <p className="text-[12px] text-amber-400 font-bold">
                                            Expires: {new Date(megaReward.expires_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Referral + Share section */}
                    {referralCode && offerConfig.task_type === "Mega Offer" && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="rounded-3xl border border-white/6 p-5 space-y-3"
                            style={{ background: "rgba(10,26,15,0.7)" }}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="h-5 w-1 rounded-full bg-emerald-400" />
                                <h2 className="text-sm font-black text-white tracking-wide">Refer</h2>
                            </div>

                            <div className="rounded-2xl border border-white/8 p-3.5 flex items-center justify-between" style={{ background: "rgba(5,13,7,0.8)" }}>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold mb-0.5">Your Referral Code</p>
                                    <p className="text-base font-black text-white font-mono tracking-[0.12em] truncate">{referralCode}</p>
                                </div>
                                <CopyBtn value={referralCode} />
                            </div>

                            <div className="rounded-2xl border border-white/8 p-3.5 flex items-center gap-3" style={{ background: "rgba(5,13,7,0.8)" }}>
                                <p className="text-[12px] font-mono text-gray-500 truncate flex-1">{referralLink}</p>
                                <CopyBtn value={referralLink} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(referralLink);
                                        toast.success("Referral link copied!");
                                    }}
                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/4 border border-white/8 text-[12px] font-bold text-gray-400 hover:text-emerald-400 hover:border-emerald-500/25 transition-all"
                                >
                                    <CheckCircle2 size={12} /> Copy Link
                                </button>
                                <button
                                    onClick={() => setShowShareModal(true)}
                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 text-black text-[12px] font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.97] transition-all"
                                >
                                    <Gift size={12} /> Share
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Tasks */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5 px-1">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Challenge Tasks</h2>
                        </div>

                        {loading ? (
                            <SectionLoader />
                        ) : tasks.length === 0 ? (
                            <div
                                className="rounded-3xl border border-white/6 p-12 text-center"
                                style={{ background: "rgba(10,26,15,0.7)" }}
                            >
                                <Trophy size={36} className="text-gray-700 mx-auto mb-3" />
                                <p className="text-sm text-gray-600 font-bold">No tasks available</p>
                                <p className="text-[13px] text-gray-700 mt-1">Check back later</p>
                            </div>
                        ) : (
                            <div className={isRewardClaimed ? "opacity-60 pointer-events-none" : ""}>
                                {tasks.map((task, i) => {
                                    // Lock if previous task is not completed (for iphone giveaway)
                                    const prevCompleted = i === 0 ? true : (() => {
                                        const prev = tasks[i - 1];
                                        return prev.status === "COMPLETED" || prev.status === "DONE" || (prev.completed_subtasks >= 1);
                                    })();
                                    const taskLocked = offerConfig.api === "iphone" && i > 0 && !prevCompleted;

                                    return (
                                        <div key={task.id} className="mb-3">
                                            <ApiTaskCard
                                                task={task}
                                                index={i}
                                                gradient={offerConfig.gradient}
                                                isLocked={taskLocked}
                                                isLast={i === tasks.length - 1}
                                                onTaskClick={(t) => {
                                                    if (t.is_social_media) setScreenshotTask(t);
                                                    else if (t.is_social_follow) setFollowTask(t);
                                                }}
                                                onStartPool={async (t) => {
                                                    try {
                                                        const res = await api.post(ENDPOINTS.START_IPHONE_POOL, { task_id: t.id });
                                                        if (res.data?.success) {
                                                            toast.success(res.data.message || "Task started!");
                                                            // Refresh tasks
                                                            const refreshRes = await api.get(taskEndpoint);
                                                            const data = refreshRes.data?.data ?? refreshRes.data;
                                                            if (Array.isArray(data)) setTasks(filterTasks(data));
                                                        } else {
                                                            toast.error(res.data?.message || "Something went wrong");
                                                        }
                                                    } catch (err: any) {
                                                        toast.error(getApiError(err));
                                                    }
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Offer info (2 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="lg:col-span-2 space-y-5"
                >
                    {/* Hero card */}
                    <div
                        className={`rounded-3xl border ${offerConfig.gradient.border} p-6 relative overflow-hidden`}
                        style={{ background: `linear-gradient(150deg, ${offerConfig.gradient.from} 0%, ${offerConfig.gradient.to} 100%)` }}
                    >
                        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-[40px] pointer-events-none" style={{ background: offerConfig.gradient.from }} />
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center bg-white/5 border ${offerConfig.gradient.border}`}>
                                    <Icon size={22} className={offerConfig.gradient.text} />
                                </div>
                                {offerConfig.live ? (
                                    <span className="flex items-center gap-1 bg-red-500/15 text-red-400 text-[11px] font-black px-2 py-0.5 rounded-full border border-red-500/25">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                                        {offerConfig.badge}
                                    </span>
                                ) : (
                                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full border border-white/10 text-gray-500 bg-white/4">{offerConfig.badge}</span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">{offerConfig.title}</h2>
                                <p className="text-[13px] text-gray-400 mt-1 leading-relaxed">{offerConfig.description}</p>
                            </div>
                            <div className="rounded-2xl border border-emerald-500/20 p-4" style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}>
                                <p className="text-[12px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">Reward</p>
                                <p className="text-xl font-black text-white">{offerConfig.reward}</p>
                            </div>
                        </div>
                    </div>

                    {/* Challenge details (staking pass only) */}
                    {slug === "staking-pass" && (
                        <button
                            onClick={() => setShowChallenge(true)}
                            className="w-full py-3 rounded-2xl border border-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-500/5 transition-all"
                        >
                            <Flame size={14} /> Terms & Conditions
                        </button>
                    )}

                    {/* Progress */}
                    <div className="rounded-3xl border border-white/6 p-6 space-y-4" style={{ background: "rgba(10,26,15,0.7)" }}>
                        <div className="flex items-center gap-2.5">
                            <Trophy size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Progress</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-white/5 p-3 text-center" style={{ background: "rgba(5,13,7,0.6)" }}>
                                <p className="text-[11px] text-gray-600 uppercase tracking-wider font-bold mb-1">Tasks</p>
                                <p className="text-lg font-black text-white">{completedCount}<span className="text-gray-600 text-xs">/{totalCount}</span></p>
                            </div>
                            <div className="rounded-xl border border-white/5 p-3 text-center" style={{ background: "rgba(5,13,7,0.6)" }}>
                                <p className="text-[11px] text-gray-600 uppercase tracking-wider font-bold mb-1">Status</p>
                                <p className={`text-sm font-black ${
                                    isRewardUsed ? "text-gray-500"
                                    : megaReward ? "text-emerald-400"
                                    : "text-amber-400"
                                }`}>
                                    {isRewardUsed ? "Used" : megaReward ? "Active" : "In Progress"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-500 font-bold">Overall</span>
                                <span className="text-[13px] text-emerald-400 font-black">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    className="h-full rounded-full"
                                    style={{ background: progress > 0 ? "linear-gradient(90deg, #10b981, #34d399)" : "transparent" }}
                                />
                            </div>
                        </div>

                        {/* Claim button — disabled when reward already exists */}
                        <button
                            onClick={handleClaim}
                            disabled={isRewardClaimed || claiming}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                isRewardClaimed || claiming
                                    ? "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                            }`}
                        >
                            {claiming ? (
                                <><Loader2 size={15} className="animate-spin" /> Claiming...</>
                            ) : isRewardClaimed ? (
                                <><CheckCircle2 size={15} /> Challenge Completed</>
                            ) : (
                                <>Join the Challenge <ArrowRight size={15} strokeWidth={2.5} /></>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// ─── API Task Card ───────────────────────────────────────────────────────────

const ApiTaskCard = ({
    task,
    index,
    gradient,
    onTaskClick,
    isLocked = false,
    isLast = false,
    onStartPool,
}: {
    task: any;
    index: number;
    gradient: { text: string; border: string };
    onTaskClick?: (task: any) => void;
    isLocked?: boolean;
    isLast?: boolean;
    onStartPool?: (task: any) => void;
}) => {
    const [expanded, setExpanded] = useState(false);
    const [poolLoading, setPoolLoading] = useState(false);

    const isCompleted   = task.status === "COMPLETED" || task.status === "DONE" || (task.completed_subtasks >= 1);
    const isSubmitted   = task.status === "SUBMITTED";
    const subTasks      = task.sub_tasks ?? task.subtasks ?? [];
    const hasSubtasks   = subTasks.length > 0;
    const completedSubs = task.completed_subtasks ?? subTasks.filter((s: any) => s.status === "COMPLETED" || s.is_completed).length;
    const totalSubs     = task.total_subtasks ?? subTasks.length;
    const isClickable   = (task.is_social_media || task.is_social_follow) && !isCompleted && !isSubmitted;

    const handleClick = () => {
        if (isClickable && onTaskClick) {
            onTaskClick(task);
        } else if (hasSubtasks) {
            setExpanded((v) => !v);
        }
    };

    const handleStartPool = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onStartPool || poolLoading) return;
        setPoolLoading(true);
        try {
            await onStartPool(task);
        } finally {
            setPoolLoading(false);
        }
    };

    // Show "Ready" button on last task when not started
    const showReadyBtn = isLast && !isCompleted && !isSubmitted && !task.started_at && onStartPool;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            className={`relative rounded-2xl border overflow-hidden transition-all ${
                isLocked ? "border-white/4 opacity-50"
                : isCompleted ? "border-emerald-500/20 bg-emerald-500/3"
                : isSubmitted ? "border-amber-500/20 bg-amber-500/3"
                : "border-white/6"
            }`}
            style={!isCompleted && !isSubmitted ? { background: "rgba(10,26,15,0.7)" } : undefined}
        >
            {/* Locked overlay */}
            {isLocked && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px] rounded-2xl">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <LockIcon size={11} className="text-gray-500" />
                        <span className="text-[11px] font-bold text-gray-500">Complete previous task first</span>
                    </div>
                </div>
            )}

            <button
                onClick={isLocked ? undefined : handleClick}
                className={`w-full flex items-start gap-4 p-5 text-left ${!isLocked && (isClickable || hasSubtasks) ? "cursor-pointer" : "cursor-default"}`}
            >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${
                    isCompleted ? "bg-emerald-500 text-black"
                    : isSubmitted ? "bg-amber-500 text-black"
                    : "bg-white/5 border border-white/8 text-gray-500"
                }`}>
                    {isCompleted ? <CheckCircle2 size={18} /> : index + 1}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[12px] font-black text-gray-600 uppercase tracking-widest">Task {index + 1}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            isCompleted ? "text-emerald-400 bg-emerald-500/10"
                            : isSubmitted ? "text-amber-400 bg-amber-500/10"
                            : task.status === "PENDING" ? "text-amber-400 bg-amber-500/10"
                            : "text-gray-500 bg-white/5"
                        }`}>
                            {isCompleted ? "COMPLETED" : (task.status || "PENDING")}
                        </span>
                    </div>
                    <h3 className={`text-sm font-black ${isCompleted ? "text-emerald-400" : "text-white"}`}>
                        {task.name}
                    </h3>

                    {/* Description — compact inline */}
                    {task.description && typeof task.description === "object" && (() => {
                        const desc = task.description;
                        const taskSteps: string[] = Array.isArray(desc.tasks) ? desc.tasks : Array.isArray(desc.task) ? desc.task : [];
                        const rewardsList: string[] = Array.isArray(desc.rewards) ? desc.rewards : Array.isArray(desc.reward) ? desc.reward : desc.reward ? [desc.reward] : [];
                        const benefitsList: string[] = Array.isArray(desc.benefits) ? desc.benefits : desc.benefits ? [desc.benefits] : [];
                        const note: string = typeof desc.note === "string" ? desc.note : "";
                        const hasContent = taskSteps.length > 0 || rewardsList.length > 0 || benefitsList.length > 0 || note;

                        if (!hasContent) return null;

                        return (
                            <div className="mt-2 space-y-1.5">
                                {/* Steps — compact list */}
                                {taskSteps.map((t: string, ti: number) => (
                                    <p key={ti} className="text-[12px] text-gray-400 flex items-start gap-1.5">
                                        <span className="text-violet-400 font-bold shrink-0">→</span> {t}
                                    </p>
                                ))}

                                {/* Rewards + Benefits + Note — inline tags */}
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {rewardsList.map((r: string, ri: number) => (
                                        <span key={`r-${ri}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/15 text-[11px] font-bold text-emerald-400">
                                            <Gift size={9} /> {r}
                                        </span>
                                    ))}
                                    {benefitsList.map((b: string, bi: number) => (
                                        <span key={`b-${bi}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/15 text-[11px] font-bold text-sky-400">
                                            <Trophy size={9} /> {b}
                                        </span>
                                    ))}
                                    {note && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/15 text-[11px] font-bold text-amber-400">
                                            <Flame size={9} /> {note}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Action hint for clickable tasks */}
                    {isClickable && (
                        <p className="text-[12px] text-emerald-400 font-bold mt-1.5 animate-pulse">
                            {task.is_social_media ? "Tap to upload screenshot" : "Tap to follow"}
                        </p>
                    )}

                    {hasSubtasks && (
                        <div className="flex items-center gap-2 mt-2.5">
                            <span className="text-[12px] text-gray-500 font-bold">{completedSubs}/{totalSubs} subtasks</span>
                            <div className="flex-1 h-1 rounded-full bg-white/5 max-w-24">
                                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${totalSubs > 0 ? (completedSubs / totalSubs) * 100 : 0}%` }} />
                            </div>
                        </div>
                    )}
                </div>

                {(hasSubtasks && !isClickable) && (
                    <div className="shrink-0 mt-1">
                        {expanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                    </div>
                )}
                {isClickable && (
                    <ArrowRight size={16} className="text-emerald-400 shrink-0 mt-2" />
                )}
            </button>

            <AnimatePresence>
                {expanded && hasSubtasks && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 space-y-2 border-t border-white/4 pt-4 ml-14">
                            {subTasks.map((sub: any, si: number) => {
                                const subDone = sub.status === "COMPLETED" || sub.is_completed;
                                return (
                                    <motion.div
                                        key={sub.id ?? si}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: si * 0.04 }}
                                        className={`flex items-start gap-3 py-3 px-4 rounded-xl border transition-all ${
                                            subDone ? "border-emerald-500/15 bg-emerald-500/3" : "border-white/4"
                                        }`}
                                        style={!subDone ? { background: "rgba(5,13,7,0.5)" } : undefined}
                                    >
                                        {subDone
                                            ? <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                                            : <Circle size={14} className="text-gray-700 mt-0.5 shrink-0" />
                                        }
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-[13px] font-bold ${subDone ? "text-emerald-400 line-through opacity-70" : "text-white"}`}>
                                                {sub.name || sub.title || `Subtask ${si + 1}`}
                                            </p>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 mt-0.5 ${subDone ? "text-emerald-400" : "text-gray-700"}`}>
                                            {subDone ? "Done" : "Pending"}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ready button for last task (iPhone pool) */}
            {showReadyBtn && (
                <div className="px-5 pb-5">
                    <button
                        onClick={handleStartPool}
                        disabled={poolLoading}
                        className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            poolLoading
                                ? "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                        }`}
                    >
                        {poolLoading ? <><Loader2 size={14} className="animate-spin" /> Starting...</> : "Ready"}
                    </button>
                </div>
            )}
        </motion.div>
    );
};

// ─── Screenshot Upload Modal ─────────────────────────────────────────────────

const ScreenshotModal = ({
    open,
    onClose,
    task,
    onDone,
}: {
    open: boolean;
    onClose: () => void;
    task: any;
    onDone: () => void;
}) => {
    const [file, setFile]         = useState<File | null>(null);
    const [preview, setPreview]   = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            if (f.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleSubmit = async () => {
        if (!file || !task) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("task_id", task.is_subtask ? task.subtask_id : task.id.toString());
            fd.append("activity_link", "https://www.yatripay.com");
            fd.append("activity_images", file);

            // Use sub_task endpoint if it's a subtask, otherwise task endpoint
            const endpoint = task.is_subtask ? ENDPOINTS.SUB_TASK_CREATE : ENDPOINTS.TASK_CREATE;
            await api.post(endpoint, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Screenshot submitted successfully!");
            onDone();
            onClose();
            setFile(null);
            setPreview(null);
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setUploading(false);
        }
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
                        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/8 p-6 space-y-5 relative"
                        style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                            <X size={14} />
                        </button>

                        <div className="space-y-1">
                            <h3 className="text-base font-black text-white">Upload Screenshot</h3>
                            <p className="text-[13px] text-gray-500">{task?.name}</p>
                        </div>

                        <div className="space-y-3">
                            {/* Step 1 */}
                            <div className="rounded-xl border border-white/6 p-4 space-y-3" style={{ background: "rgba(5,13,7,0.6)" }}>
                                <p className="text-sm font-bold text-white">Step 1: Rate & Review</p>
                                <p className="text-[13px] text-gray-400">Give a 5 Star rating along with a good review on one of these platforms:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <a
                                        href="https://play.google.com/store/apps/details?id=com.wallet.yatripay"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 p-3 rounded-xl border border-white/6 hover:border-emerald-500/25 hover:bg-emerald-500/5 transition-all group"
                                    >
                                        <div className="h-9 w-9 rounded-lg bg-[#34A853] flex items-center justify-center shrink-0 text-white text-sm font-black">
                                            ▶
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-white group-hover:text-emerald-400 transition-colors">Google Play</p>
                                            <p className="text-[11px] text-gray-600">Rate Now</p>
                                        </div>
                                    </a>
                                    <a
                                        href="https://www.trustpilot.com/review/yatripay.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 p-3 rounded-xl border border-white/6 hover:border-emerald-500/25 hover:bg-emerald-500/5 transition-all group"
                                    >
                                        <div className="h-9 w-9 rounded-lg bg-[#00B67A] flex items-center justify-center shrink-0 text-white text-sm font-black">
                                            ★
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-white group-hover:text-emerald-400 transition-colors">Trustpilot</p>
                                            <p className="text-[11px] text-gray-600">Rate Now</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                            {/* Step 2 */}
                            <div className="rounded-xl border border-white/6 p-4 space-y-2" style={{ background: "rgba(5,13,7,0.6)" }}>
                                <p className="text-sm font-bold text-white">Step 2: Upload Screenshot</p>
                                <p className="text-[13px] text-gray-400">Take a screenshot of your rating & review and upload it below</p>
                            </div>
                        </div>

                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

                        {!file ? (
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="w-full rounded-2xl border border-dashed border-white/10 hover:border-emerald-500/30 py-8 flex flex-col items-center gap-2 transition-all group"
                                style={{ background: "rgba(5,13,7,0.5)" }}
                            >
                                <Upload size={28} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
                                <p className="text-sm text-gray-500 font-bold">Upload Screenshot</p>
                                <p className="text-[12px] text-gray-700">PNG, JPG up to 5MB</p>
                            </button>
                        ) : (
                            <div className="rounded-2xl border border-emerald-500/20 p-3 flex items-center gap-3" style={{ background: "rgba(16,185,129,0.05)" }}>
                                <div className="h-14 w-14 rounded-xl bg-white/5 border border-white/8 shrink-0 overflow-hidden">
                                    {preview && <img src={preview} alt="Screenshot" className="h-full w-full object-cover" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-white truncate">{file.name}</p>
                                    <p className="text-[12px] text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button onClick={() => { setFile(null); setPreview(null); }} className="h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all shrink-0">
                                    <X size={13} />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={!file || uploading}
                            className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                file && !uploading
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                            }`}
                        >
                            {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : "Submit"}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─── Social Follow Modal ─────────────────────────────────────────────────────

const SocialFollowModal = ({
    open,
    onClose,
    task,
    onDone,
}: {
    open: boolean;
    onClose: () => void;
    task: any;
    onDone: () => void;
}) => {
    const [followed, setFollowed] = useState<Set<string>>(new Set());
    const [loading, setLoading]   = useState(false);

    const socials = [
        { name: "Instagram",   key: "instagram", url: "https://www.instagram.com/yatripay/", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
        { name: "Telegram",    key: "telegram",  url: "https://t.me/yatripay",               color: "bg-[#0088cc]" },
        { name: "X (Twitter)", key: "x",         url: "https://twitter.com/YatriPay",        color: "bg-black border border-white/10" },
    ];

    const handleFollow = async (social: typeof socials[0]) => {
        if (followed.has(social.key) || loading) return;
        setLoading(true);
        try {
            await api.post(ENDPOINTS.SOCIAL_MEDIA_FOLLOW, {
                task_id: task?.id,
                platform: social.key,
            });
            setFollowed((prev) => new Set(prev).add(social.key));
            window.open(social.url, "_blank", "noopener,noreferrer");
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
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 60 }}
                        transition={{ duration: 0.3, type: "spring", damping: 25 }}
                        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/8 p-6 space-y-5 relative"
                        style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                            <X size={14} />
                        </button>

                        <div className="text-center space-y-1">
                            <h3 className="text-base font-black text-white">Join the Community</h3>
                            <p className="text-[13px] text-gray-500">Follow us on all platforms</p>
                        </div>

                        <div className="space-y-3">
                            {socials.map((s) => {
                                const done = followed.has(s.key);
                                return (
                                    <div key={s.key} className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/6" style={{ background: "rgba(5,13,7,0.6)" }}>
                                        <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center text-white text-sm font-black shrink-0`}>
                                            {s.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white">{s.name}</p>
                                        </div>
                                        <button
                                            onClick={() => handleFollow(s)}
                                            disabled={done || loading}
                                            className={`px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${
                                                done
                                                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                                    : loading
                                                    ? "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                                    : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                                            }`}
                                        >
                                            {done ? "Followed" : loading ? "..." : "Follow"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="text-center">
                            <p className="text-[13px] text-gray-600 font-bold">
                                {followed.size} of {socials.length} completed
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                if (followed.size >= socials.length) onDone();
                                onClose();
                            }}
                            className={`w-full py-3 rounded-2xl text-sm font-bold transition-all ${
                                followed.size >= socials.length
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black font-black shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                                    : "bg-white/5 border border-white/8 text-gray-400 hover:text-white hover:border-white/15"
                            }`}
                        >
                            Done
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfferDetail;

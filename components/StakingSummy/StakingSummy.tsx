"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet, Users, Database, PieChart,
    Clock, ShieldCheck, Zap, Globe, TrendingUp,
    ArrowRight, ArrowLeft, Receipt, CheckCircle2, LucideIcon,
    Eye, X, Lock, Gift, Layers, CalendarDays, Loader2, Tag,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useStaking } from "@/context/StakingContext";
import { SectionLoader } from "@/components/Include/Loader";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { getApiError } from "@/lib/helpers";
import Image from "next/image";

// ─── Icon map ────────────────────────────────────────────────────────────────

const PLAN_ICONS: LucideIcon[] = [ShieldCheck, Zap, Globe];

// ─── Portfolio types ─────────────────────────────────────────────────────────

interface PortfolioItem {
    id: number;
    staking_number: string;
    staking_type: any; // can be object { id, name } or string
    coin: any;
    lock_amount: number;
    initial_lock_amount: number;
    per_annum: number;
    lock_period: number;
    status: string;
    purchase_method: string;
    auto_stake: boolean;
    start_at: number;
    end_at: number;
    price: number;
    total_amount: number;
    created_at: string;
    [key: string]: any;
}

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
        <span className="text-[13px] text-gray-500 font-medium">{label}</span>
        <div className="text-right">
            <span className={`text-xs font-bold ${green ? "text-emerald-400" : sky ? "text-sky-400" : "text-white"}`}>
                {value}
            </span>
            {sub && <span className="text-[13px] text-gray-600 ml-1.5">{sub}</span>}
        </div>
    </div>
);

// ─── Custom checkbox ─────────────────────────────────────────────────────────

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
        <span className="text-[13px] text-gray-500 leading-relaxed">{children}</span>
    </button>
);

// ─── Status badge ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
    const s = status?.toLowerCase();
    const color =
        s === "active" || s === "running"
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
            : s === "completed" || s === "matured"
            ? "bg-sky-500/15 text-sky-400 border-sky-500/25"
            : s === "cancelled" || s === "expired"
            ? "bg-red-500/15 text-red-400 border-red-500/25"
            : "bg-amber-500/15 text-amber-400 border-amber-500/25";

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${color}`}>
            {status}
        </span>
    );
};

// ─── Detail Modal ────────────────────────────────────────────────────────────

// Helper to parse dates — handles both unix timestamps and date strings
const parseStakingDate = (val: any): Date | null => {
    if (!val) return null;
    if (typeof val === "number") return new Date(val * 1000);
    return new Date(val);
};

const formatStakingDate = (val: any): string => {
    const d = parseStakingDate(val);
    if (!d || isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── Detail Modal ────────────────────────────────────────────────────────────

const DetailModal = ({
    item,
    onClose,
    onRefresh,
}: {
    item: PortfolioItem;
    onClose: () => void;
    onRefresh: () => void;
}) => {
    const amt = item.lock_amount ?? item.amount ?? 0;
    const method = item.purchase_method || "wallet";
    const isPromo = method === "promo_code";

    return (
        <motion.div
            initial={{ opacity: 0, pointerEvents: "auto" }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ duration: 0.25, type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-lg max-h-[calc(100vh-96px)] sm:max-h-[90vh] mb-24 sm:mb-0 rounded-t-3xl sm:rounded-3xl border border-white/8 relative flex flex-col overflow-hidden"
                style={{ background: "linear-gradient(160deg, #0d1f12 0%, #0a1a0f 100%)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/6 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isPromo ? "bg-amber-500/10 border border-amber-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
                            <Layers size={18} className={isPromo ? "text-amber-400" : "text-emerald-400"} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white">{item.staking_number}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <StatusBadge status={item.status} />
                                {isPromo && <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">Pass</span>}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {/* Amount */}
                            <div className="rounded-2xl border border-emerald-500/20 p-4 text-center" style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}>
                                <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest font-bold mb-1">Staked Amount</p>
                                <p className="text-2xl font-black text-white tabular-nums">{Number(amt).toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-sm text-gray-500">YTP</span></p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: "Yearly", value: `${item.per_annum}%`, color: "text-emerald-400" },
                                    { label: "Period", value: `${item.lock_period}d`, color: "text-white" },
                                    { label: "Method", value: isPromo ? "Pass" : "Wallet", color: isPromo ? "text-amber-400" : "text-gray-400" },
                                ].map((s, i) => (
                                    <div key={i} className="rounded-xl border border-white/5 p-2.5 text-center" style={{ background: "rgba(5,13,7,0.6)" }}>
                                        <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">{s.label}</p>
                                        <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Rows */}
                            <div className="space-y-0">
                                {[
                                    { label: "Total Amount",  value: `${Number(item.total_amount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} YTP` },
                                    { label: "Staking Fee",   value: `${Number(item.price ?? 0).toLocaleString(undefined, { maximumFractionDigits: 4 })} YTP` },
                                    { label: "Auto Stake",    value: item.auto_stake ? "Enabled" : "Disabled" },
                                    { label: "Start",         value: formatStakingDate(item.start_at) },
                                    { label: "Unlock",        value: formatStakingDate(item.end_at) },
                                ].map((r, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                        <span className="text-[12px] text-gray-500 font-medium">{r.label}</span>
                                        <span className="text-[13px] font-bold text-white">{r.value}</span>
                                    </div>
                                ))}
                            </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/6 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-2xl bg-white/5 border border-white/8 text-sm font-bold text-gray-400 hover:text-white hover:border-white/15 transition-all"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Portfolio Tab ───────────────────────────────────────────────────────────

// ─── Add/Remove Modal ────────────────────────────────────────────────────────

const AddRemoveModal = ({
    item,
    onClose,
    onDone,
}: {
    item: PortfolioItem;
    onClose: () => void;
    onDone: () => void;
}) => {
    const { ytpBalance, refresh: refreshWallet } = useWallet();
    const [mode, setMode]       = useState<"add" | "remove">("add");
    const [amount, setAmount]   = useState("");
    const [loading, setLoading] = useState(false);
    const amt = item.lock_amount ?? 0;

    const handleSubmit = async () => {
        const num = parseFloat(amount);
        if (!num || num <= 0) { toast.error("Enter a valid amount"); return; }
        setLoading(true);
        try {
            const res = await api.post(ENDPOINTS.STAKING_ADD_REMOVE, {
                staking_number: item.staking_number,
                amount: num,
                mode,
            });
            if (res.data?.success === false) {
                toast.error(res.data.message || "Failed");
            } else {
                toast.success(res.data?.message || `Amount ${mode === "add" ? "added" : "removed"}!`);
                refreshWallet();
                onDone();
                onClose();
            }
        } catch (err: any) { toast.error(getApiError(err)); }
        finally { setLoading(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, pointerEvents: "auto" }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ duration: 0.25, type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/8 p-6 space-y-5 relative"
                style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
            >
                <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                    <X size={14} />
                </button>

                <div>
                    <h3 className="text-base font-black text-white">Add / Remove Amount</h3>
                    <p className="text-[13px] text-gray-500 mt-0.5">{item.staking_number}</p>
                </div>

                {/* Mode toggle */}
                <div className="flex rounded-xl border border-white/6 overflow-hidden">
                    {(["add", "remove"] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => { setMode(m); setAmount(""); }}
                            className={`flex-1 py-2.5 text-[12px] font-black uppercase tracking-widest transition-all ${
                                mode === m
                                    ? m === "add" ? "bg-emerald-500 text-black" : "bg-red-500 text-white"
                                    : "bg-white/4 text-gray-500"
                            }`}
                        >
                            {m === "add" ? "Add" : "Remove"}
                        </button>
                    ))}
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/5 p-3 text-center" style={{ background: "rgba(5,13,7,0.6)" }}>
                        <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">Current Staked</p>
                        <p className="text-sm font-black text-white tabular-nums">{Number(amt).toLocaleString()} YTP</p>
                    </div>
                    <div className="rounded-xl border border-white/5 p-3 text-center" style={{ background: "rgba(5,13,7,0.6)" }}>
                        <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">Available YTP</p>
                        <p className="text-sm font-black text-emerald-400 tabular-nums">{ytpBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* Amount input */}
                <div className="relative">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full rounded-2xl border border-white/8 py-4 pl-5 pr-16 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                        style={{ background: "rgba(5,13,7,0.8)" }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-600">YTP</span>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !amount}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                        amount && !loading
                            ? mode === "add"
                                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                                : "bg-red-500 hover:bg-red-400 text-white shadow-[0_4px_16px_rgba(239,68,68,0.3)] active:scale-[0.98]"
                            : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                    }`}
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                    {loading ? "Processing..." : mode === "add" ? "Add Amount" : "Remove Amount"}
                </button>
            </motion.div>
        </motion.div>
    );
};

// ─── Unlock Modal ────────────────────────────────────────────────────────────

const UnlockModal = ({
    item,
    onClose,
    onDone,
}: {
    item: PortfolioItem;
    onClose: () => void;
    onDone: () => void;
}) => {
    const { refresh: refreshWallet } = useWallet();
    const [loading, setLoading] = useState(false);
    const amt = item.lock_amount ?? 0;

    const handleUnlock = async () => {
        setLoading(true);
        try {
            const res = await api.post(ENDPOINTS.STAKING_UNLOCK, { staking_number: item.staking_number });
            if (res.data?.success === false) {
                toast.error(res.data.message || "Failed");
            } else {
                toast.success(res.data?.message || "Staking unlocked!");
                refreshWallet();
                onDone();
                onClose();
            }
        } catch (err: any) { toast.error(getApiError(err)); }
        finally { setLoading(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, pointerEvents: "auto" }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl border border-white/8 p-6 space-y-5"
                style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
            >
                <div className="text-center space-y-3">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                        <Lock size={24} className="text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-black text-white">Unlock Staking?</h3>
                    <p className="text-[13px] text-gray-500">
                        Release <span className="text-white font-bold">{Number(amt).toLocaleString()} YTP</span> from <span className="text-emerald-400 font-bold">{item.staking_number}</span> back to your wallet.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onClose}
                        className="py-3 rounded-2xl bg-white/5 border border-white/8 text-sm font-bold text-gray-400 hover:text-white transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUnlock}
                        disabled={loading}
                        className="py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                        {loading ? "..." : "Unlock"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Manage Payment Modal ────────────────────────────────────────────────────

const confirmMegaOfferContinue = async (formData: FormData) => {
    const response = await api.post(
        "/finance/deposit/fiat/create/megaOffer",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
};

const ManagePaymentModal = ({
    item,
    onClose,
}: {
    item: PortfolioItem;
    onClose: () => void;
}) => {
    const [txId, setTxId] = useState("");
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const amt = item.lock_amount ?? item.amount ?? 0;

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            if (f.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
            setScreenshot(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleSubmit = async () => {
        if (!txId.trim()) { toast.error("Enter transaction number"); return; }
        if (!screenshot) { toast.error("Upload screenshot"); return; }

        const trimmedTx = txId.trim();
        if (!/^[a-zA-Z0-9]+$/.test(trimmedTx)) {
            toast.error("Transaction ID must be alphanumeric");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("transaction_id", trimmedTx);
            formData.append("screen_shot", screenshot);
            formData.append("amount", String(Math.round(Number(amt))));
            formData.append("fiat", "INR");
            formData.append("staking_number", item.staking_number);

            await confirmMegaOfferContinue(formData);
            toast.success("Thank you. Your request is submitted successfully.");
            onClose();
            // Refresh page after success
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, pointerEvents: "auto" }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ duration: 0.25, type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl border border-white/8 p-6 space-y-5 relative overflow-y-auto"
                style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
            >
                {/* Close */}
                <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                    <X size={14} />
                </button>

                {/* Header */}
                <div>
                    <h3 className="text-base font-black text-white">Manage Payment</h3>
                    <p className="text-[13px] text-gray-500 mt-0.5">{item.staking_number}</p>
                </div>

                {/* Scanner QR */}
                <div className="flex justify-center">
                    <div className="rounded-2xl border border-white/8 p-3 bg-white">
                        <Image
                            src="/scanner.jpeg"
                            alt="Payment Scanner"
                            width={220}
                            height={220}
                            className="rounded-xl"
                        />
                    </div>
                </div>

                {/* Transaction Number */}
                <div className="space-y-1.5">
                    <label className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">Transaction Number</label>
                    <input
                        type="text"
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        placeholder="Enter transaction ID"
                        className="w-full rounded-2xl border border-white/8 py-3.5 pl-5 pr-5 text-sm font-bold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                        style={{ background: "rgba(5,13,7,0.8)" }}
                    />
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-1.5">
                    <label className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">Payment Screenshot</label>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

                    {!screenshot ? (
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="w-full rounded-2xl border border-dashed border-white/10 hover:border-emerald-500/30 py-6 flex flex-col items-center gap-2 transition-all group"
                            style={{ background: "rgba(5,13,7,0.5)" }}
                        >
                            <Gift size={24} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
                            <p className="text-sm text-gray-500 font-bold">Upload Screenshot</p>
                            <p className="text-[12px] text-gray-700">PNG, JPG up to 5MB</p>
                        </button>
                    ) : (
                        <div className="rounded-2xl border border-emerald-500/20 p-3 flex items-center gap-3" style={{ background: "rgba(16,185,129,0.05)" }}>
                            <div className="h-14 w-14 rounded-xl bg-white/5 border border-white/8 shrink-0 overflow-hidden">
                                {preview && <img src={preview} alt="Screenshot" className="h-full w-full object-cover" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-white truncate">{screenshot.name}</p>
                                <p className="text-[12px] text-gray-600">{(screenshot.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button onClick={() => { setScreenshot(null); setPreview(null); }} className="h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all shrink-0">
                                <X size={13} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || !txId.trim() || !screenshot}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                        !loading && txId.trim() && screenshot
                            ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_4px_16px_rgba(245,158,11,0.3)] active:scale-[0.98]"
                            : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                    }`}
                >
                    {loading ? (
                        <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                    ) : (
                        "Submit Payment"
                    )}
                </button>
            </motion.div>
        </motion.div>
    );
};

// ─── Portfolio Tab ───────────────────────────────────────────────────────────

const PortfolioTab = () => {
    const { token } = useAuth();
    const { totalSubscribers, totalStakedAssets } = useStaking();

    const [portfolio, setPortfolio]     = useState<PortfolioItem[]>([]);
    const [rewards, setRewards]         = useState<any[]>([]);
    const [loading, setLoading]         = useState(true);
    const [subTab, setSubTab]           = useState<"all" | "rewards">("all");
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

    const fetchPortfolio = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [resPortfolio, resRewards] = await Promise.all([
                api.get(ENDPOINTS.STAKING_PORTFOLIO),
                api.get(ENDPOINTS.STAKING_REWARDS),
            ]);
            console.log("resPortfolio" , resPortfolio)
            const pData = resPortfolio.data?.data ?? resPortfolio.data;
            console.log("pData" , pData)
            const rData = resRewards.data?.data ?? resRewards.data;
            if (Array.isArray(pData)) setPortfolio(pData);
            if (Array.isArray(rData)) setRewards(rData);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    const [addRemoveItem, setAddRemoveItem] = useState<PortfolioItem | null>(null);
    const [unlockItem, setUnlockItem]     = useState<PortfolioItem | null>(null);
    const [manageItem, setManageItem]     = useState<PortfolioItem | null>(null);

    const displayData = subTab === "all" ? portfolio : rewards;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
        >
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                    className="rounded-2xl border border-white/6 p-5 flex items-center gap-4"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <Users size={20} className="text-violet-400" />
                    </div>
                    <div>
                        <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">Total Subscribers</p>
                        <p className="text-2xl font-black text-white tabular-nums">{totalSubscribers.toLocaleString()}</p>
                    </div>
                </div>
                <div
                    className="rounded-2xl border border-white/6 p-5 flex items-center gap-4"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                        <Lock size={20} className="text-sky-400" />
                    </div>
                    <div>
                        <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">Total Locked YTP</p>
                        <p className="text-2xl font-black text-white tabular-nums">{totalStakedAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>

            {/* Sub-tabs: All Staking / Staking Rewards */}
            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={() => setSubTab("all")}
                    className={`px-6 py-2.5 rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all duration-200 ${
                        subTab === "all"
                            ? "bg-emerald-500 text-black shadow-[0_4px_16px_rgba(16,185,129,0.25)]"
                            : "bg-white/5 border border-white/8 text-gray-400 hover:text-white hover:border-white/15"
                    }`}
                >
                    All Staking
                </button>
                <button
                    onClick={() => setSubTab("rewards")}
                    className={`px-6 py-2.5 rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all duration-200 ${
                        subTab === "rewards"
                            ? "bg-emerald-500 text-black shadow-[0_4px_16px_rgba(16,185,129,0.25)]"
                            : "bg-white/5 border border-white/8 text-gray-400 hover:text-white hover:border-white/15"
                    }`}
                >
                    Staking Rewards
                </button>
            </div>

            {/* Table */}
            <div
                className="rounded-3xl border border-white/6 overflow-hidden"
                style={{ background: "rgba(10,26,15,0.7)" }}
            >
                {loading ? (
                    <div className="p-8">
                        <SectionLoader />
                    </div>
                ) : displayData.length === 0 ? (
                    <div className="p-12 text-center">
                        <Database size={40} className="text-gray-700 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 font-medium">No {subTab === "all" ? "staking" : "reward"} records found</p>
                        <p className="text-[12px] text-gray-700 mt-1">Start staking to see your portfolio here</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/8">
                                        <th className="text-left text-[12px] text-gray-600 uppercase tracking-wider font-bold px-4 py-4">Staking</th>
                                        <th className="text-left text-[12px] text-gray-600 uppercase tracking-wider font-bold px-4 py-4">Amount</th>
                                        {subTab === "all" && <th className="text-left text-[12px] text-gray-600 uppercase tracking-wider font-bold px-4 py-4">Yearly</th>}
                                        <th className="text-left text-[12px] text-gray-600 uppercase tracking-wider font-bold px-4 py-4">Method</th>
                                        {subTab === "all" && <th className="text-left text-[12px] text-gray-600 uppercase tracking-wider font-bold px-4 py-4">Status</th>}
                                        {subTab === "all" && <th className="text-center text-[12px] text-gray-600 uppercase tracking-wider font-bold px-4 py-4">Unlock</th>}
                                        {subTab === "all" && <th className="text-center text-[12px] text-gray-600 uppercase tracking-wider font-bold px-4 py-4">Add / Remove</th>}
                                        {subTab === "all" && <th className="text-center text-[12px] text-gray-600 uppercase tracking-wider font-bold px-4 py-4">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayData.map((item, i) => {
                                        const amt = item.lock_amount ?? item.amount ?? 0;
                                        const method = item.purchase_method || "wallet";
                                        const isPromo = method === "promo_code";

                                        return (
                                        <motion.tr
                                            key={item.id ?? i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                        isPromo ? "bg-amber-500/10 border border-amber-500/20" : "bg-emerald-500/10 border border-emerald-500/20"
                                                    }`}>
                                                        <Layers size={14} className={isPromo ? "text-amber-400" : "text-emerald-400"} />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-white block">{item.staking_number || "—"}</span>
                                                        {isPromo && <span className="text-[10px] font-bold text-amber-400">Staking Pass</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-bold text-white tabular-nums">
                                                    {Number(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            {subTab === "all" && (
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-bold text-emerald-400">{item.per_annum}%</span>
                                            </td>
                                            )}
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                                    isPromo ? "bg-amber-500/10 border border-amber-500/15 text-amber-400" : "bg-white/5 border border-white/8 text-gray-400"
                                                }`}>
                                                    {isPromo ? "Staking Pass" : "Wallet"}
                                                </span>
                                            </td>
                                            {subTab === "all" && (
                                            <td className="px-4 py-4">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            )}

                                            {/* Unlock / Manage / Locked column */}
                                            {subTab === "all" && (
                                            <td className="px-4 py-4 text-center">
                                                {item.status === "RUNNING" ? (
                                                    isPromo ? (
                                                        <button
                                                            onClick={() => setManageItem(item)}
                                                            className="h-8 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-black text-amber-400 uppercase tracking-wider hover:bg-amber-500/20 transition-all"
                                                        >
                                                            Manage
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setUnlockItem(item)}
                                                            className="h-8 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-black text-emerald-400 uppercase tracking-wider hover:bg-emerald-500/20 transition-all"
                                                        >
                                                            Unlock
                                                        </button>
                                                    )
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="h-8 px-3 rounded-lg bg-white/4 border border-white/8 text-[11px] font-black text-gray-600 uppercase tracking-wider flex items-center justify-center gap-1 mx-auto cursor-not-allowed"
                                                    >
                                                        <Lock size={10} /> Locked
                                                    </button>
                                                )}
                                            </td>
                                            )}

                                            {/* Add / Remove column */}
                                            {subTab === "all" && (
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => item.status === "RUNNING" && setAddRemoveItem(item)}
                                                    disabled={item.status !== "RUNNING"}
                                                    className={`h-8 px-3 rounded-lg border text-[11px] font-black uppercase tracking-wider transition-all ${
                                                        item.status === "RUNNING"
                                                            ? "bg-white/5 border-white/8 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/25"
                                                            : "bg-white/4 border-white/8 text-gray-600 cursor-not-allowed"
                                                    }`}
                                                >
                                                    +/− Amount
                                                </button>
                                            </td>
                                            )}

                                            {/* View only Actions */}
                                            {subTab === "all" && (
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => setSelectedItem(item)}
                                                    className="h-8 w-8 mx-auto rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={13} />
                                                </button>
                                            </td>
                                            )}
                                        </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden space-y-0">
                            {displayData.map((item, i) => {
                                const typeName = typeof item.staking_type === "object" ? item.staking_type?.name : item.staking_type;
                                const amt = item.lock_amount ?? item.amount ?? 0;
                                const method = item.purchase_method || "wallet";
                                const endAt = item.end_at ? new Date(item.end_at * 1000) : null;

                                return (
                                <motion.div
                                    key={item.id ?? i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-b border-white/5 last:border-0 p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                                <Layers size={15} className="text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{typeName || "—"}</p>
                                                <p className="text-[12px] text-gray-600">{method === "promo_code" ? "Promo" : "Wallet"}</p>
                                            </div>
                                        </div>
                                        {/* <StatusBadge status={item.status} /> */}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <p className="text-[11px] text-gray-600 font-medium">Amount</p>
                                            <p className="text-sm font-bold text-white tabular-nums">{Number(amt).toLocaleString()}</p>
                                        </div>
                                        {/* <div>
                                            <p className="text-[11px] text-gray-600 font-medium">Yearly</p>
                                            <p className="text-sm font-bold text-emerald-400">{item.per_annum}%</p>
                                        </div> */}
                                        <div>
                                            <p className="text-[11px] text-gray-600 font-medium">Unlock</p>
                                            <p className="text-sm font-medium text-gray-400">
                                                {endAt
                                                    ? endAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                                                    : "—"}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedItem(item)}
                                        className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[12px] font-bold text-emerald-400 flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all"
                                    >
                                        <Eye size={14} />
                                        View Details
                                    </button>
                                </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Detail modal */}
            <AnimatePresence>
                {selectedItem !== null && (
                    <DetailModal
                        item={selectedItem!}
                        onClose={() => setSelectedItem(null)}
                        onRefresh={fetchPortfolio}
                    />
                )}
            </AnimatePresence>

            {/* Add/Remove modal */}
            <AnimatePresence>
                {addRemoveItem !== null && (
                    <AddRemoveModal
                        item={addRemoveItem!}
                        onClose={() => setAddRemoveItem(null)}
                        onDone={fetchPortfolio}
                    />
                )}
            </AnimatePresence>

            {/* Unlock modal */}
            <AnimatePresence>
                {unlockItem !== null && (
                    <UnlockModal
                        item={unlockItem!}
                        onClose={() => setUnlockItem(null)}
                        onDone={fetchPortfolio}
                    />
                )}
            </AnimatePresence>

            {/* Manage Payment modal */}
            <AnimatePresence>
                {manageItem !== null && (
                    <ManagePaymentModal
                        item={manageItem!}
                        onClose={() => setManageItem(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const StakingSummary = () => {
    const { ytpBalance, refresh: refreshWallet } = useWallet();
    const { plans, loading, totalSubscribers, totalStakedAssets, refresh: refreshStaking } = useStaking();

    // Auto-refresh wallet balance + staking data every 15s while on this page
    useEffect(() => {
        const interval = setInterval(() => {
            refreshWallet();
            refreshStaking();
        }, 15000);
        return () => clearInterval(interval);
    }, [refreshWallet, refreshStaking]);

    const searchParams = useSearchParams();
    const planFromUrl  = searchParams.get("plan");

    const [activeTab, setActiveTab]     = useState<"staking" | "portfolio">("staking");
    const [selectedIdx, setSelectedIdx] = useState(1);
    const [amount, setAmount]           = useState("");
    const [agreed, setAgreed]           = useState(false);
    const [autoStake, setAutoStake]     = useState(false);
    const [coinValueUSD, setCoinValueUSD] = useState(0);
    const [promoCode, setPromoCode]     = useState("");
    const [activePromo, setActivePromo] = useState<{ code: string; ytpAmount: number; validityDays: number | null } | null>(null);
    const [confirming, setConfirming]   = useState(false);
    const [cashbackCode, setCashbackCode] = useState("");
    const [hasCashbackVoucher, setHasCashbackVoucher] = useState(false);

    // Fetch YTP coin value + check for active mega offer promo + cashback voucher
    useEffect(() => {
        (async () => {
            try {
                const [coinRes, taskRes, voucherRes] = await Promise.allSettled([
                    api.get(ENDPOINTS.COIN_VALUE("YTP")),
                    api.get(ENDPOINTS.TASK_LIST),
                    api.get(ENDPOINTS.STAKING_CASH_VOUCHER),
                ]);

                if (coinRes.status === "fulfilled") {
                    const data = coinRes.value.data?.data ?? coinRes.value.data;
                    if (data?.USD) setCoinValueUSD(parseFloat(data.USD));
                }

                // Check for active mega offer promo code
                if (taskRes.status === "fulfilled") {
                    const data = taskRes.value.data?.data ?? taskRes.value.data;
                    if (Array.isArray(data)) {
                        const megaTasks = data.filter((t: any) => t.task_type === "Mega Offer");
                        const taskWithPromo = megaTasks.find((t: any) =>
                            t.mega_reward?.promo_code && t.mega_reward?.status === "ACTIVE"
                        );
                        if (taskWithPromo) {
                            const mr = taskWithPromo.mega_reward;
                            const vd = mr.validity_days ?? mr.validity ?? mr.staking_pass?.validity_days ?? null;
                            setActivePromo({
                                code: mr.promo_code,
                                ytpAmount: mr.ytp_amount,
                                validityDays: vd !== null && vd !== undefined ? Number(vd) : null,
                            });
                            setPromoCode(mr.promo_code);
                            setAmount(String(mr.ytp_amount));
                        }
                    }
                }

                // Check for staking cash voucher — API returns { results: [...] }
                if (voucherRes.status === "fulfilled") {
                    const vd = voucherRes.value.data?.data ?? voucherRes.value.data;
                    const list = Array.isArray(vd?.results) ? vd.results
                        : Array.isArray(vd) ? vd
                        : [];
                    const first = list[0];
                    const code = first?.voucher_code || first?.code || vd?.voucher_code || vd?.code || "";
                    if (code) {
                        setHasCashbackVoucher(true);
                        setCashbackCode(code);
                    }
                }
            } catch { /* silent */ }
        })();
    }, []);

    // Once plans load, set the correct index from URL param
    useEffect(() => {
        if (plans.length > 0 && planFromUrl) {
            const idx = plans.findIndex((p) => p.name === planFromUrl);
            if (idx !== -1) setSelectedIdx(idx);
        }
    }, [plans, planFromUrl]);

    const plan = plans[selectedIdx] ?? plans[0];

    const topStats = useMemo(() => [
        { label: "Balance",     value: `${ytpBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} YTP`, icon: Wallet,   color: "text-emerald-400" },
        { label: "Subscribers", value: totalSubscribers.toLocaleString(),                                                                      icon: Users,    color: "text-violet-400"  },
        { label: "Staked",      value: `${(totalStakedAssets / 1_000_000).toFixed(1)}M YTP`,                                                   icon: Database, color: "text-sky-400"     },
        { label: "Quota",       value: plan ? `${(plan.quota_left / 1_000_000).toFixed(0)}M YTP` : "—",                                        icon: PieChart, color: "text-amber-400"   },
    ], [ytpBalance, totalSubscribers, totalStakedAssets, plan]);

    if (loading && plans.length === 0) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
                <SectionLoader />
            </div>
        );
    }

    if (!plan) return null;

    const numAmount = parseFloat(amount) || 0;
    const isPromoApplied = !!(activePromo && promoCode.trim() && activePromo.code === promoCode.trim());
    const effectiveValidityDays = isPromoApplied && activePromo?.validityDays
        ? activePromo.validityDays
        : plan.validity;
    const estReturn = numAmount > 0
        ? ((numAmount * plan.per_annum) / 100 * effectiveValidityDays / 365).toFixed(2)
        : "0.00";
    // Subscription price in YTP = plan.price (USD) / coin USD value
    const subscriptionPriceYTP = coinValueUSD > 0 ? parseFloat((plan.price / coinValueUSD).toFixed(2)) : 0;
    const totalYTP    = numAmount > 0 ? numAmount + subscriptionPriceYTP : 0;
    const canConfirm  = agreed && numAmount >= plan.min_stake;

    const now = new Date();
    const endDate = new Date(now.getTime() + effectiveValidityDays * 24 * 60 * 60 * 1000);
    const formatDate = (d: Date) => d.toISOString().slice(0, 10);
    const formatTime = (d: Date) => d.toTimeString().slice(0, 5);

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
                    {/* <p className="text-[13px] text-gray-600 mt-0.5">Configure your stake and manage portfolio</p> */}
                </div>
            </motion.div>

            {/* ── Tabs: STAKING / PORTFOLIO ── */}
            <div className="flex items-center justify-center gap-3">
                {(["staking", "portfolio"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-200 ${
                            activeTab === tab
                                ? "bg-emerald-500 text-black shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                                : "bg-white/5 border border-white/8 text-gray-400 hover:text-white hover:border-white/15"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Tab content ── */}
            <AnimatePresence mode="wait">
                {activeTab === "staking" ? (
                    <motion.div
                        key="staking"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6"
                    >
                        {/* ── Top stats ── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {topStats.map((s, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 rounded-2xl border border-white/6 p-3.5"
                                    style={{ background: "rgba(10,26,15,0.7)" }}
                                >
                                    <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                                        <s.icon size={15} className={s.color} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold truncate">{s.label}</p>
                                        <p className="text-xs font-black text-white truncate">{s.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Main two-column grid ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                            {/* ── LEFT: Configuration ── */}
                            <div
                                className="rounded-3xl border border-white/6 p-6 space-y-6"
                                style={{ background: "rgba(10,26,15,0.7)" }}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="h-5 w-1 rounded-full bg-emerald-400" />
                                    <h2 className="text-sm font-black text-white tracking-wide">Choose Your Plan</h2>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {plans.map((p, idx) => {
                                        const Icon   = PLAN_ICONS[idx % PLAN_ICONS.length];
                                        const active = idx === selectedIdx;
                                        const isBest = plans.length === 3 ? idx === 1 : false;
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => setSelectedIdx(idx)}
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
                                                {isBest && (
                                                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-linear-to-r from-emerald-400 to-green-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full tracking-widest whitespace-nowrap">
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
                                                <p className={`text-[12px] font-black tracking-wider uppercase ${active ? "text-white" : "text-gray-500"}`}>
                                                    {p.name}
                                                </p>
                                                <p className={`text-sm font-black ${active ? "text-emerald-400" : "text-gray-600"}`}>
                                                    {p.per_annum}%
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">Lock Amount</span>
                                        <span className="text-[12px] text-gray-600 font-medium">
                                            Min:{" "}
                                            <span className="text-emerald-400 font-bold">{plan.min_stake.toLocaleString()} YTP</span>
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
                                                onClick={() => setAmount(plan.min_stake.toString())}
                                                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[13px] font-black px-2.5 py-1 rounded-lg tracking-wider transition-all"
                                            >
                                                MIN
                                            </button>
                                            <span className="text-sm font-black text-gray-600">YTP</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[12px] text-gray-700">Quota: {Math.round(plan.quota_left).toLocaleString()} YTP available</span>
                                        <span className="text-[12px] text-gray-700">
                                            Max:{" "}
                                            <span className="text-gray-500">{plan.max_stake.toLocaleString()} YTP</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Promo Code (shows when active mega offer exists) */}
                                {activePromo && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[12px] text-gray-600 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                                <Tag size={10} className="text-emerald-400" /> Promo Code
                                            </span>
                                            <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                Staking Pass
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                placeholder="Enter promo code"
                                                className="w-full rounded-2xl border border-emerald-500/20 py-3.5 pl-5 pr-5 text-sm font-mono font-bold text-emerald-400 placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                                style={{ background: "rgba(16,185,129,0.04)" }}
                                            />
                                        </div>
                                        {activePromo.code === promoCode && (
                                            <p className="text-[12px] text-emerald-400/70 px-1 flex items-center gap-1">
                                                <CheckCircle2 size={10} /> Promo applied — ≈ {activePromo.ytpAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} YTP
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Cashback Code (shows when user has staking cash voucher — separate from promo_code) */}
                                {hasCashbackVoucher && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[12px] text-gray-600 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                                <Gift size={10} className="text-teal-400" /> Cashback Code
                                            </span>
                                            <span className="text-[11px] text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full">
                                                Voucher
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={cashbackCode}
                                                onChange={(e) => setCashbackCode(e.target.value.toUpperCase())}
                                                placeholder="Cashback code"
                                                className="w-full rounded-2xl border border-teal-500/20 py-3.5 pl-5 pr-5 text-sm font-mono font-bold text-teal-400 placeholder-gray-700 focus:outline-none focus:border-teal-500/50 transition-all"
                                                style={{ background: "rgba(20,184,166,0.04)" }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {(() => {
                                    const metrics = [
                                        { icon: Clock,      label: "Lock Period",  value: `${plan.validity} Days`,    green: false },
                                        { icon: TrendingUp, label: "Annual Yield", value: `${plan.per_annum}%`,       green: true  },
                                        ...(plan.staking_hike > 0
                                            ? [{ icon: Zap, label: "Staking Hike", value: `+${plan.staking_hike}%`, green: true }]
                                            : []),
                                    ];
                                    return (
                                <div className={`grid gap-3 ${metrics.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                                    {metrics.map((m, i) => (
                                        <div
                                            key={i}
                                            className="rounded-2xl border border-white/5 p-3 text-center"
                                            style={{ background: "rgba(5,13,7,0.6)" }}
                                        >
                                            <m.icon
                                                size={14}
                                                className={`mx-auto mb-1.5 ${m.green ? "text-emerald-400" : "text-gray-500"}`}
                                            />
                                            <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold mb-0.5">
                                                {m.label}
                                            </p>
                                            <p className={`text-xs font-black ${m.green ? "text-emerald-400" : "text-white"}`}>
                                                {m.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                    );
                                })()}
                            </div>

                            {/* ── RIGHT: Summary ── */}
                            <div
                                className="rounded-3xl border border-white/6 p-6 flex flex-col gap-5"
                                style={{ background: "rgba(10,26,15,0.7)" }}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Receipt size={16} className="text-emerald-400" />
                                    <h2 className="text-sm font-black text-white tracking-wide">Order Summary</h2>
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.18 }}
                                    >
                                        <SummaryRow label="Start Date"         value={`${formatDate(now)} ${formatTime(now)}`} />
                                        <SummaryRow label="End Date"           value={`${formatDate(endDate)} ${formatTime(now)}`} />
                                        <SummaryRow label="Refund Period"      value={`${effectiveValidityDays} Days`} sub={isPromoApplied ? "(Staking Pass)" : undefined} />
                                        <SummaryRow label="Annual Yield (Yearly)" value={`${plan.per_annum}%`}    green />
                                        <SummaryRow
                                            label="Est. Return"
                                            value={`${estReturn} YTP`}
                                            sky
                                        />
                                        <SummaryRow
                                            label="Subscription Price"
                                            value={plan.price === 0 ? "Free" : `$${plan.price} USD`}
                                            sub={subscriptionPriceYTP > 0 ? `≈ ${subscriptionPriceYTP} YTP` : undefined}
                                            green={plan.price === 0}
                                        />
                                        <SummaryRow label="Transaction Fees"  value="0.00 YTP" />
                                    </motion.div>
                                </AnimatePresence>

                                <div
                                    className="rounded-2xl border border-emerald-500/20 p-4"
                                    style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[13px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">
                                                Total to Stake
                                            </p>
                                            <AnimatePresence mode="wait">
                                                <motion.p
                                                    key={`${totalYTP.toFixed(2)}-${plan.id}`}
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

                                <div className="mt-auto space-y-2">
                                    <button
                                        onClick={async () => {
                                            if (!canConfirm || confirming) return;
                                            setConfirming(true);
                                            try {
                                                const payload: any = {
                                                    staking_type_id: plan.id,
                                                    amount: amount,
                                                    agreement: agreed,
                                                    auto_stake: autoStake,
                                                    voucher_code: promoCode || null,
                                                    cashback_code: cashbackCode || null,
                                                    apply_voucher: false,
                                                    cameFromBuyNow: false,
                                                };
                                                await api.post(ENDPOINTS.CREATE_STAKING, payload);
                                                toast.success("Staking created successfully!");
                                                setActiveTab("portfolio");
                                                setAmount("");
                                                setPromoCode("");
                                                setAgreed(false);
                                                setActivePromo(null); // promo used, clear it
                                                refreshWallet();
                                                refreshStaking();
                                            } catch (err: any) {
                                                toast.error(getApiError(err));
                                            } finally {
                                                setConfirming(false);
                                            }
                                        }}
                                        disabled={!canConfirm || confirming}
                                        className={`w-full py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                            canConfirm && !confirming
                                                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                                : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                        }`}
                                    >
                                        {confirming ? (
                                            <><Loader2 size={15} className="animate-spin" /> Creating...</>
                                        ) : (
                                            <>Confirm Stake <ArrowRight size={15} strokeWidth={2.5} /></>
                                        )}
                                    </button>

                                    {!agreed && (
                                        <p className="text-center text-[13px] text-gray-700">
                                            Please agree to the service agreement to continue
                                        </p>
                                    )}
                                    {agreed && numAmount > 0 && numAmount < plan.min_stake && (
                                        <p className="text-center text-[13px] text-amber-600/80">
                                            Minimum stake is {plan.min_stake.toLocaleString()} YTP for this plan
                                        </p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="portfolio"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        <PortfolioTab />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StakingSummary;

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet as WalletIcon, Copy, CheckCircle2,
    ArrowUpRight, ArrowDownLeft, Shield,
    ExternalLink, Clock, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { SectionLoader } from "@/components/Include/Loader";

// ─── Recent transactions (hardcoded until API) ───────────────────────────────

const RECENT_TXN = [
    { type: "in",  label: "Staking Reward",  amount: "+12.50 YTP",   time: "2 hours ago",  from: "EARNER Plan" },
    { type: "in",  label: "Welcome Bonus",   amount: "+965.00 YTP",  time: "1 day ago",    from: "Signup Reward" },
    { type: "out", label: "Staking Deposit",  amount: "-10,000 YTP", time: "3 days ago",   from: "EARNER Plan" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

const Wallet = () => {
    const {
        wallet, loading, ytpBalance, inrBalance, ytpToInrRate,
        address, qrCodeUrl, refresh, selectedAsset, setSelectedAsset,
    } = useWallet();

    const [copied, setCopied]             = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const ASSET_OPTIONS = ["YTP", "BNB", "USDT"];

    const copyAddress = async () => {
        if (!address) return;
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shortAddr  = address ? `${address.slice(0, 8)}...${address.slice(-6)}` : "—";
    const coinName   = wallet?.coin?.name || "YatriPay";
    const coinTicker = wallet?.coin?.ticker || selectedAsset;
    const balance    = wallet?.balance ?? 0;
    const balanceInr = balance * ytpToInrRate;
    const isBep20    = coinTicker === "BNB" || coinTicker === "USDT";
    const networkSuffix = isBep20 ? " - BEP-20" : "";

    if (loading && !wallet) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
                <SectionLoader />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── Page header ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Wallet Details</h1>
                    <p className="text-[13px] text-gray-600 mt-0.5">Manage your {coinName} wallet</p>
                </div>
                <button
                    onClick={refresh}
                    className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </motion.div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT: Wallet info (3 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.4 }}
                    className="lg:col-span-3 space-y-5"
                >
                    {/* Balance card */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-5"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        {/* Header with asset selector */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="h-5 w-1 rounded-full bg-emerald-400" />
                                <h2 className="text-sm font-black text-white tracking-wide">{coinName} ({coinTicker}){networkSuffix}</h2>
                            </div>

                            {/* Asset dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown((v) => !v)}
                                    className="flex items-center gap-2 rounded-xl border border-white/8 px-3.5 py-2 text-xs font-black text-white hover:border-emerald-500/30 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                >
                                    {selectedAsset}
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform ${showDropdown ? "rotate-180" : ""}`}>
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500" />
                                    </svg>
                                </button>
                                <AnimatePresence>
                                    {showDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-1 z-20 rounded-xl border border-white/8 overflow-hidden min-w-28"
                                            style={{ background: "#0a1a0f" }}
                                        >
                                            {ASSET_OPTIONS.map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => { setSelectedAsset(t); setShowDropdown(false); setCopied(false); }}
                                                    className={`w-full px-4 py-2.5 text-left text-xs font-black transition-all ${
                                                        t === selectedAsset
                                                            ? "bg-emerald-500/10 text-emerald-400"
                                                            : "text-gray-400 hover:bg-white/4 hover:text-white"
                                                    }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Balance display */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={coinTicker}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2 }}
                                className="rounded-2xl border border-emerald-500/15 p-5"
                                style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.06) 0%,rgba(16,185,129,0.02) 100%)" }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[13px] text-gray-600 uppercase tracking-wider font-bold mb-1">
                                            Available Balance
                                        </p>
                                        <p className="text-3xl font-black text-white tabular-nums">
                                            {balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                                            <span className="text-base text-gray-500 ml-1.5">{coinTicker}</span>
                                        </p>
                                        {coinTicker === "YTP" && ytpToInrRate > 0 && (
                                            <p className="text-xs text-gray-500 mt-1 tabular-nums">
                                                ≈ ₹{balanceInr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                <span className="text-[13px] text-gray-700 ml-2">@ ₹{ytpToInrRate}/{coinTicker}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                        <WalletIcon size={20} className="text-emerald-400" />
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Extra balances */}
                        {wallet && (
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: "Locked",    value: wallet.lock_balance },
                                    { label: "Staking ROI", value: wallet.staking_roi },
                                    { label: "Bonus",     value: wallet.welcome_bonus },
                                ].map((b, i) => (
                                    <div
                                        key={i}
                                        className="rounded-xl border border-white/5 p-3 text-center"
                                        style={{ background: "rgba(5,13,7,0.6)" }}
                                    >
                                        <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">{b.label}</p>
                                        <p className="text-sm font-black text-white tabular-nums">{b.value.toLocaleString()} {coinTicker}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Wallet address */}
                        <div className="space-y-2">
                            <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold px-1">
                                Wallet Address
                            </p>
                            <div
                                className="rounded-2xl border border-white/8 p-4 flex items-center gap-3"
                                style={{ background: "rgba(5,13,7,0.8)" }}
                            >
                                <p className="text-[13px] font-mono font-bold text-gray-400 truncate flex-1 select-all">
                                    {address || "—"}
                                </p>
                                <button
                                    onClick={copyAddress}
                                    className={`shrink-0 h-8 px-3 rounded-lg flex items-center gap-1.5 text-[13px] font-black uppercase tracking-wider transition-all ${
                                        copied
                                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                            : "bg-white/5 border border-white/8 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30"
                                    }`}
                                >
                                    {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                            <p className="text-[13px] text-gray-700 px-1">
                                Only send {coinTicker} to this address. Sending other assets may result in permanent loss.
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/transfer" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[13px] uppercase tracking-widest shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98] transition-all">
                                <ArrowUpRight size={15} strokeWidth={2.5} />
                                Transfer
                            </Link>
                            <Link href="/addfund" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/8 text-white font-black text-[13px] uppercase tracking-widest hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.98] transition-all"
                                style={{ background: "rgba(5,13,7,0.6)" }}
                            >
                                <ArrowDownLeft size={15} strokeWidth={2.5} />
                                Add Fund
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* ── RIGHT: QR + Transactions (2 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="lg:col-span-2 space-y-5"
                >
                    {/* QR Code card */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 flex flex-col items-center gap-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5 self-start">
                            <WalletIcon size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Receive {coinTicker}{networkSuffix}</h2>
                        </div>

                        {/* QR from API */}
                        <div className="rounded-2xl bg-white p-3">
                            <div className="w-44 h-44 sm:w-48 sm:h-48 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                                {qrCodeUrl ? (
                                    <img
                                        src={qrCodeUrl}
                                        alt={`${coinTicker} Wallet QR`}
                                        className="w-full h-full object-contain"
                                    />
                                ) : wallet?.qr_code ? (
                                    <img
                                        src={`data:image/png;base64,${wallet.qr_code}`}
                                        alt={`${coinTicker} Wallet QR`}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-gray-400 text-xs">No QR</div>
                                )}
                            </div>
                        </div>

                        <p className="text-[12px] text-gray-500 font-bold tabular-nums">{shortAddr}</p>

                        <button
                            onClick={copyAddress}
                            className="flex items-center gap-1.5 text-[12px] font-black text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                            {copied ? "Address Copied!" : "Copy Address"}
                        </button>

                        <div className="flex items-center gap-2 rounded-xl border border-white/5 p-2.5 w-full" style={{ background: "rgba(5,13,7,0.6)" }}>
                            <Shield size={13} className="text-emerald-500/60 shrink-0" />
                            <span className="text-[13px] text-gray-600 font-bold">
                                Only send {coinTicker} coins to this address
                            </span>
                        </div>
                    </div>

                    {/* Recent transactions */}
                    {/* <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Clock size={16} className="text-emerald-400" />
                                <h2 className="text-sm font-black text-white tracking-wide">Recent Activity</h2>
                            </div>
                            <Link href="/transactions" className="text-[13px] text-emerald-400 font-bold hover:underline flex items-center gap-1">
                                View All <ExternalLink size={9} />
                            </Link>
                        </div>

                        <div className="space-y-0">
                            {RECENT_TXN.map((txn, i) => (
                                <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                                        txn.type === "in"
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-red-500/10 text-red-400"
                                    }`}>
                                        {txn.type === "in" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-bold text-white truncate">{txn.label}</p>
                                        <p className="text-[13px] text-gray-600">{txn.from} &middot; {txn.time}</p>
                                    </div>
                                    <span className={`text-[13px] font-black tabular-nums shrink-0 ${
                                        txn.type === "in" ? "text-emerald-400" : "text-red-400"
                                    }`}>
                                        {txn.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div> */}
                </motion.div>

            </div>
        </div>
    );
};

export default Wallet;

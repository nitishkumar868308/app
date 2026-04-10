"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight, ArrowDownUp, Wallet, Send,
    IndianRupee, Coins, Shield, Clock,
    Receipt, AlertCircle, CheckCircle2,
    Loader2,
} from "lucide-react";
import PinModal from "@/components/Include/PinModal";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { getApiError } from "@/lib/helpers";

// ─── Main ────────────────────────────────────────────────────────────────────

const Transfer = () => {
    const { token } = useAuth();
    const { ytpBalance, refresh: refreshWallet } = useWallet();

    const [address, setAddress]         = useState("");
    const [ytpInput, setYtpInput]       = useState("");
    const [inrInput, setInrInput]       = useState("");
    const [assetPriceINR, setAssetPriceINR] = useState(0);
    const [showPin, setShowPin]         = useState(false);
    const [sending, setSending]         = useState(false);

    const selectedAsset = "YTP";
    const balance = ytpBalance;

    // Fetch coin value in INR
    useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                const res = await api.get(ENDPOINTS.COIN_VALUE(selectedAsset));
                const data = res.data?.data ?? res.data;
                if (data?.INR) {
                    setAssetPriceINR(parseFloat(data.INR));
                }
            } catch { /* silent */ }
        })();
    }, [token, selectedAsset]);

    // Two-way sync
    const handleYtpChange = (val: string) => {
        setYtpInput(val);
        const num = parseFloat(val) || 0;
        if (num > 0 && assetPriceINR > 0) {
            setInrInput((num * assetPriceINR).toFixed(2));
        } else {
            setInrInput("");
        }
    };

    const handleInrChange = (val: string) => {
        setInrInput(val);
        const num = parseFloat(val) || 0;
        if (num > 0 && assetPriceINR > 0) {
            setYtpInput((num / assetPriceINR).toFixed(8));
        } else {
            setYtpInput("");
        }
    };

    const numYtp        = parseFloat(ytpInput) || 0;
    const numInr        = parseFloat(inrInput) || 0;
    const canTransfer   = address.trim().length > 10 && numYtp > 0 && numYtp <= balance;
    const insufficient  = numYtp > 0 && numYtp > balance;

    // Transfer → show PIN modal
    const handleTransfer = () => {
        if (!canTransfer) return;
        setShowPin(true);
    };

    // PIN verified → call send API
    const handlePinSuccess = useCallback(async (pin: string) => {
        setShowPin(false);
        setSending(true);
        try {
            const res = await api.post(ENDPOINTS.SEND_AMOUNT, {
                transaction_pin: pin,
                amount: ytpInput,
                ticker: selectedAsset,
                address: address.trim(),
            });

            const data = res.data;
            if (data?.success === false) {
                toast.error(data.message || "Transaction failed!");
                return false;
            }

            toast.success(data?.message || "Transaction successful!");
            setAddress("");
            setYtpInput("");
            setInrInput("");
            refreshWallet();
        } catch (err: any) {
            toast.error(getApiError(err));
            return false;
        } finally {
            setSending(false);
        }
    }, [ytpInput, selectedAsset, address, refreshWallet]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* PIN Modal */}
            <PinModal
                open={showPin}
                onClose={() => setShowPin(false)}
                onSuccess={handlePinSuccess}
                mode="verify"
                title="Authorize Transfer"
                subtitle={`Sending ${numYtp.toFixed(2)} ${selectedAsset}`}
            />

            {/* ── Page header ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Transfer Fund</h1>
                    <p className="text-sm text-gray-600 mt-0.5">Send {selectedAsset} to any wallet address</p>
                </div>

                <div
                    className="flex items-center gap-3 rounded-2xl border border-white/6 px-4 py-3"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Wallet size={15} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">Available Balance</p>
                        <p className="text-sm font-black text-white tabular-nums">
                            {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {selectedAsset}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Sending overlay */}
            <AnimatePresence>
                {sending && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                    >
                        <div className="text-center space-y-3">
                            <Loader2 size={36} className="text-emerald-400 animate-spin mx-auto" />
                            <p className="text-sm font-black text-white">Processing Transfer...</p>
                            <p className="text-[13px] text-gray-500">Please wait while we confirm your transaction</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT: Transfer form (3 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.4 }}
                    className="lg:col-span-3 rounded-3xl border border-white/6 p-6 space-y-6"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    {/* Receiving address */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">Recipient</h2>
                        </div>

                        <div className="space-y-1.5">
                            <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold px-1">
                                Receiving Address
                            </span>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors">
                                    <Send size={16} strokeWidth={2} />
                                </span>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="0x... or wallet address"
                                    className="w-full rounded-2xl border border-white/8 py-3.5 lg:py-4 pl-11 pr-5 text-sm lg:text-base font-mono font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Amount inputs */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">Amount</h2>
                        </div>

                        {/* YTP input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold">
                                    {selectedAsset} Amount
                                </span>
                                <button
                                    onClick={() => handleYtpChange(Math.floor(balance).toString())}
                                    className="text-[13px] text-emerald-400 font-bold hover:underline"
                                >
                                    MAX
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <Coins size={18} strokeWidth={2} />
                                </span>
                                <input
                                    type="number"
                                    value={ytpInput}
                                    onChange={(e) => handleYtpChange(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full rounded-2xl border border-white/8 py-4 pl-12 pr-16 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-500">
                                    {selectedAsset}
                                </span>
                            </div>
                        </div>

                        {/* Swap icon */}
                        <div className="flex justify-center">
                            <div className="h-8 w-8 rounded-full bg-white/4 border border-white/8 flex items-center justify-center">
                                <ArrowDownUp size={14} className="text-gray-600" />
                            </div>
                        </div>

                        {/* INR input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold">
                                    INR Amount
                                </span>
                                <span className="text-[13px] text-gray-600">
                                    1 {selectedAsset} = <span className="text-emerald-400 font-bold">₹{assetPriceINR.toFixed(2)}</span>
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <IndianRupee size={18} strokeWidth={2.5} />
                                </span>
                                <input
                                    type="number"
                                    value={inrInput}
                                    onChange={(e) => handleInrChange(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full rounded-2xl border border-white/8 py-4 pl-12 pr-16 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-600">
                                    INR
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Insufficient warning */}
                    <AnimatePresence>
                        {insufficient && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                                    <AlertCircle size={13} className="text-red-400 shrink-0" />
                                    <span className="text-[13px] text-red-400 font-bold">
                                        Insufficient balance. You need {(numYtp - balance).toFixed(4)} more {selectedAsset}.
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Transfer button */}
                    <button
                        onClick={handleTransfer}
                        disabled={!canTransfer || sending}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                            canTransfer && !sending
                                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                        }`}
                    >
                        Transfer
                        <ArrowRight size={15} strokeWidth={2.5} />
                    </button>
                </motion.div>

                {/* ── RIGHT: Summary (2 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="lg:col-span-2 space-y-5"
                >
                    {/* Transfer summary */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Receipt size={16} className="text-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">Transfer Summary</h2>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${numYtp}-${address}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                {[
                                    { label: "Sending",     value: numYtp > 0 ? `${numYtp} ${selectedAsset}` : "—" },
                                    { label: "Value (INR)", value: numInr > 0 ? `₹${numInr.toFixed(2)}` : "—" },
                                    { label: "Recipient",   value: address.trim() ? `${address.slice(0, 10)}...${address.slice(-6)}` : "—" },
                                    { label: "Network",     value: "YVM Chain" },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                                        <span className="text-[13px] text-gray-500 font-medium">{row.label}</span>
                                        <span className="text-sm font-bold text-white truncate max-w-32 text-right">{row.value}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        <div
                            className="rounded-2xl border border-emerald-500/20 p-4"
                            style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                        >
                            <p className="text-[12px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">Total Deducted</p>
                            <p className="text-2xl font-black text-white tabular-nums">
                                {numYtp > 0 ? `${numYtp} ${selectedAsset}` : "—"}
                            </p>
                        </div>
                    </div>

                    {/* After transfer */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-3"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Wallet size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">After Transfer</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-white/5 p-3 text-center" style={{ background: "rgba(5,13,7,0.6)" }}>
                                <p className="text-[11px] text-gray-600 uppercase tracking-wider font-bold">Current</p>
                                <p className="text-sm font-black text-white tabular-nums">{balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                                <p className="text-[11px] text-gray-600 font-bold">{selectedAsset}</p>
                            </div>
                            <div className="rounded-xl border border-white/5 p-3 text-center" style={{ background: "rgba(5,13,7,0.6)" }}>
                                <p className="text-[11px] text-gray-600 uppercase tracking-wider font-bold">Remaining</p>
                                <p className={`text-sm font-black tabular-nums ${numYtp > 0 && !insufficient ? "text-emerald-400" : "text-white"}`}>
                                    {numYtp > 0 ? Math.max(0, balance - numYtp).toFixed(4) : balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                </p>
                                <p className="text-[11px] text-gray-600 font-bold">{selectedAsset}</p>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div
                        className="rounded-3xl border border-white/6 p-5 space-y-2.5"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        {[
                            { icon: Shield,       title: "PIN Protected",       desc: "Every transfer requires your 4-digit PIN" },
                            { icon: Clock,        title: "Instant Transfer",    desc: "On-chain transfers complete within seconds" },
                            { icon: CheckCircle2, title: "Verify Address",      desc: "Double-check the receiving address before sending" },
                        ].map((t, i) => (
                            <div key={i} className="flex items-start gap-3 p-2">
                                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                    <t.icon size={12} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{t.title}</p>
                                    <p className="text-[13px] text-gray-600 leading-relaxed">{t.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Transfer;

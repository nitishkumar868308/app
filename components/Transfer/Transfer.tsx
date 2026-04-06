"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight, ArrowDownUp, Wallet, Send,
    IndianRupee, Coins, Shield, Clock,
    Receipt, AlertCircle, CheckCircle2, Users,
    QrCode, Scan,
} from "lucide-react";
import Image from "next/image";
import PinModal from "@/components/Include/PinModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const YTP_RATE  = 0.75; // 1 YTP = ₹0.75
const BALANCE   = 966.0065;

const RECENT_CONTACTS = [
    { name: "Rahul S.",  address: "0x742d...5bD08", initials: "RS" },
    { name: "Priya K.",  address: "0x1a2b...ef12",  initials: "PK" },
    { name: "Amit P.",   address: "0x566f...6e76",  initials: "AP" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

const Transfer = () => {
    const [address, setAddress]     = useState("");
    const [amount, setAmount]       = useState("");
    const [inputMode, setInputMode] = useState<"ytp" | "inr">("ytp");
    const [showPin, setShowPin]     = useState(false);

    const numAmount = parseFloat(amount) || 0;

    const { ytpAmount, inrAmount, fee, total } = useMemo(() => {
        let ytp: number;
        let inr: number;
        if (inputMode === "ytp") {
            ytp = numAmount;
            inr = numAmount * YTP_RATE;
        } else {
            inr = numAmount;
            ytp = numAmount / YTP_RATE;
        }
        const feeVal = ytp * 0.005; // 0.5% fee
        return {
            ytpAmount: ytp,
            inrAmount: inr,
            fee: feeVal,
            total: ytp + feeVal,
        };
    }, [numAmount, inputMode]);

    const canTransfer   = address.trim().length > 10 && numAmount > 0 && total <= BALANCE;
    const insufficient  = numAmount > 0 && total > BALANCE;

    const handleTransfer = () => {
        if (!canTransfer) return;
        setShowPin(true);
    };

    const handlePinSuccess = () => {
        setShowPin(false);
        // Transfer logic here
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* PIN Modal */}
            <PinModal
                open={showPin}
                onClose={() => setShowPin(false)}
                onSuccess={handlePinSuccess}
                mode="verify"
                title="Authorize Transfer"
                subtitle={`Sending ${ytpAmount.toFixed(2)} YTP`}
            />

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
                        <h1 className="text-xl font-black text-white tracking-tight">Transfer Fund</h1>
                        <p className="text-[11px] text-gray-600 mt-0.5">Send YTP to any wallet address</p>
                    </div>
                </div>

                {/* Balance pill */}
                <div
                    className="flex items-center gap-3 rounded-2xl border border-white/6 px-4 py-3"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Wallet size={15} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">Available Balance</p>
                        <p className="text-sm font-black text-white tabular-nums">{BALANCE.toLocaleString()} YTP</p>
                    </div>
                </div>
            </motion.div>

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
                            <h2 className="text-sm font-black text-white tracking-wide">Recipient</h2>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                    Receiving Address
                                </span>
                                <button className="text-[9px] text-emerald-400 font-bold hover:underline flex items-center gap-1">
                                    <Scan size={9} /> Scan QR
                                </button>
                            </div>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors">
                                    <Send size={16} strokeWidth={2} />
                                </span>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="0x... or wallet address"
                                    className="w-full rounded-2xl border border-white/8 py-3.5 pl-11 pr-5 text-sm font-mono font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                            </div>
                        </div>

                        {/* Recent contacts */}
                        <div className="space-y-1.5">
                            <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold px-1">Recent</p>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {RECENT_CONTACTS.map((c, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setAddress(c.address)}
                                        className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                                            address === c.address
                                                ? "border-emerald-400/50 bg-emerald-500/10"
                                                : "border-white/6 hover:border-emerald-500/20"
                                        }`}
                                        style={address !== c.address ? { background: "rgba(5,13,7,0.6)" } : undefined}
                                    >
                                        <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[8px] font-black text-emerald-400">
                                            {c.initials}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-bold text-white">{c.name}</p>
                                            <p className="text-[8px] text-gray-600 font-mono">{c.address}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Amount inputs */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Amount</h2>
                        </div>

                        {/* YTP input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                    YTP Amount
                                </span>
                                <button
                                    onClick={() => { setInputMode("ytp"); setAmount(Math.floor(BALANCE * 0.995).toString()); }}
                                    className="text-[9px] text-emerald-400 font-bold hover:underline"
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
                                    value={inputMode === "ytp" ? amount : (ytpAmount > 0 ? ytpAmount.toFixed(4) : "")}
                                    onChange={(e) => { setInputMode("ytp"); setAmount(e.target.value); }}
                                    onFocus={() => setInputMode("ytp")}
                                    placeholder="0.00"
                                    className="w-full rounded-2xl border border-white/8 py-4 pl-12 pr-16 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-500">
                                    YTP
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
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                    INR Amount
                                </span>
                                <span className="text-[9px] text-gray-600">
                                    1 YTP = <span className="text-emerald-400 font-bold">₹{YTP_RATE}</span>
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <IndianRupee size={18} strokeWidth={2.5} />
                                </span>
                                <input
                                    type="number"
                                    value={inputMode === "inr" ? amount : (inrAmount > 0 ? inrAmount.toFixed(2) : "")}
                                    onChange={(e) => { setInputMode("inr"); setAmount(e.target.value); }}
                                    onFocus={() => setInputMode("inr")}
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
                                    <span className="text-[10px] text-red-400 font-bold">
                                        Insufficient balance. You need {(total - BALANCE).toFixed(4)} more YTP.
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Transfer button */}
                    <button
                        onClick={handleTransfer}
                        disabled={!canTransfer}
                        className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                            canTransfer
                                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                        }`}
                    >
                        Transfer
                        <ArrowRight size={15} strokeWidth={2.5} />
                    </button>
                </motion.div>

                {/* ── RIGHT: Summary + info (2 cols) ── */}
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
                            <h2 className="text-sm font-black text-white tracking-wide">Transfer Summary</h2>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${numAmount}-${inputMode}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                {[
                                    { label: "Sending",         value: numAmount > 0 ? `${ytpAmount.toFixed(4)} YTP` : "—" },
                                    { label: "Value (INR)",     value: numAmount > 0 ? `₹${inrAmount.toFixed(2)}` : "—" },
                                    { label: "Network Fee (0.5%)", value: numAmount > 0 ? `${fee.toFixed(4)} YTP` : "—" },
                                    { label: "Recipient",       value: address.trim() ? `${address.slice(0, 8)}...${address.slice(-4)}` : "—" },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                                        <span className="text-[11px] text-gray-500 font-medium">{row.label}</span>
                                        <span className="text-xs font-bold text-white">{row.value}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {/* Total */}
                        <div
                            className="rounded-2xl border border-emerald-500/20 p-4"
                            style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                        >
                            <p className="text-[9px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">Total Deducted</p>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={total.toFixed(4)}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.18 }}
                                    className="text-2xl font-black text-white tabular-nums"
                                >
                                    {numAmount > 0 ? `${total.toFixed(4)} YTP` : "—"}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Remaining balance */}
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
                                <p className="text-[8px] text-gray-600 uppercase tracking-wider font-bold">Current</p>
                                <p className="text-sm font-black text-white tabular-nums">{BALANCE.toLocaleString()}</p>
                                <p className="text-[8px] text-gray-600 font-bold">YTP</p>
                            </div>
                            <div className="rounded-xl border border-white/5 p-3 text-center" style={{ background: "rgba(5,13,7,0.6)" }}>
                                <p className="text-[8px] text-gray-600 uppercase tracking-wider font-bold">Remaining</p>
                                <p className={`text-sm font-black tabular-nums ${numAmount > 0 && !insufficient ? "text-emerald-400" : "text-white"}`}>
                                    {numAmount > 0 ? (BALANCE - total).toFixed(4) : BALANCE.toLocaleString()}
                                </p>
                                <p className="text-[8px] text-gray-600 font-bold">YTP</p>
                            </div>
                        </div>
                    </div>

                    {/* Security & trust */}
                    <div
                        className="rounded-3xl border border-white/6 p-5 space-y-2.5"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        {[
                            { icon: Shield,       title: "PIN Protected",        desc: "Every transfer requires your 4-digit PIN" },
                            { icon: Clock,        title: "Instant Transfer",     desc: "On-chain transfers complete within seconds" },
                            { icon: CheckCircle2, title: "Verified Recipients",  desc: "Double-check the receiving address before sending" },
                        ].map((t, i) => (
                            <div key={i} className="flex items-start gap-3 p-2">
                                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                    <t.icon size={12} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-white">{t.title}</p>
                                    <p className="text-[9px] text-gray-600 leading-relaxed">{t.desc}</p>
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

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight, TrendingDown, Banknote, Wallet,
    ChevronDown, Clock, Shield, Receipt,
    ArrowDownLeft, ArrowUpRight, IndianRupee, Coins,
} from "lucide-react";

// ─── Assets ───────────────────────────────────────────────────────────────────

interface Asset {
    id: string;
    name: string;
    symbol: string;
    rateINR: number;
    balance: number;
}

const ASSETS: Asset[] = [
    { id: "ytp",  name: "YatriPay", symbol: "YTP",  rateINR: 0.75,  balance: 966.0065 },
    { id: "bnb",  name: "BNB",      symbol: "BNB",  rateINR: 52000, balance: 0.025 },
    { id: "usdt", name: "Tether",   symbol: "USDT", rateINR: 83.50, balance: 50.00 },
];

// ─── Tab type ─────────────────────────────────────────────────────────────────

type Tab = "sell" | "withdraw";

// ─── Sell Tab ─────────────────────────────────────────────────────────────────

const SellTab = () => {
    const [assetId, setAssetId]       = useState("ytp");
    const [amount, setAmount]         = useState("");
    const [showDrop, setShowDrop]     = useState(false);

    const asset    = ASSETS.find((a) => a.id === assetId)!;
    const numAmt   = parseFloat(amount) || 0;
    const inrValue = numAmt * asset.rateINR;
    const tds      = inrValue * 0.01;
    const netINR   = inrValue - tds;
    const canSell  = numAmt > 0 && numAmt <= asset.balance;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* LEFT: Sell form */}
            <div
                className="lg:col-span-3 rounded-3xl border border-white/6 p-6 space-y-6"
                style={{ background: "rgba(10,26,15,0.7)" }}
            >
                {/* Choose asset */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <div className="h-5 w-1 rounded-full bg-emerald-400" />
                        <h2 className="text-sm font-black text-white tracking-wide">Choose Asset</h2>
                    </div>

                    {/* Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDrop((v) => !v)}
                            className="w-full flex items-center justify-between rounded-2xl border border-white/8 px-5 py-3.5 text-sm font-black text-white hover:border-emerald-500/30 transition-all"
                            style={{ background: "rgba(5,13,7,0.8)" }}
                        >
                            <span>{asset.symbol} — {asset.name}</span>
                            <ChevronDown size={16} className={`text-gray-500 transition-transform ${showDrop ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                            {showDrop && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border border-white/8 overflow-hidden"
                                    style={{ background: "#0a1a0f" }}
                                >
                                    {ASSETS.map((a) => (
                                        <button
                                            key={a.id}
                                            onClick={() => { setAssetId(a.id); setShowDrop(false); setAmount(""); }}
                                            className={`w-full flex items-center justify-between px-5 py-3 text-left transition-all ${
                                                a.id === assetId
                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                    : "text-gray-400 hover:bg-white/4 hover:text-white"
                                            }`}
                                        >
                                            <span className="text-xs font-black">{a.symbol} <span className="text-gray-600 font-medium">— {a.name}</span></span>
                                            <span className="text-[10px] text-gray-600">{a.balance} {a.symbol}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Quick select pills */}
                    <div className="flex items-center gap-2">
                        {ASSETS.map((a) => (
                            <button
                                key={a.id}
                                onClick={() => { setAssetId(a.id); setAmount(""); setShowDrop(false); }}
                                className={`px-3.5 py-1.5 rounded-lg border text-[10px] font-black transition-all ${
                                    a.id === assetId
                                        ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-400"
                                        : "border-white/6 text-gray-600 hover:border-emerald-500/25"
                                }`}
                            >
                                {a.symbol}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amount inputs side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Token amount */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                {asset.symbol} Amount
                            </span>
                            <button
                                onClick={() => setAmount(asset.balance.toString())}
                                className="text-[9px] text-emerald-400 font-bold hover:underline"
                            >
                                MAX
                            </button>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                <Coins size={16} strokeWidth={2} />
                            </span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-2xl border border-white/8 py-4 pl-11 pr-5 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                style={{ background: "rgba(5,13,7,0.8)" }}
                            />
                        </div>
                        <p className="text-[9px] text-gray-700 px-1">
                            Available: <span className="text-gray-500">{asset.balance} {asset.symbol}</span>
                        </p>
                    </div>

                    {/* INR value (read only) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                {asset.symbol} / INR
                            </span>
                            <span className="text-[9px] text-gray-600">
                                1 {asset.symbol} = ₹{asset.rateINR.toLocaleString()}
                            </span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                <IndianRupee size={16} strokeWidth={2.5} />
                            </span>
                            <div
                                className="w-full rounded-2xl border border-white/6 py-4 pl-11 pr-5 text-xl font-black text-white tabular-nums"
                                style={{ background: "rgba(5,13,7,0.5)" }}
                            >
                                {numAmt > 0 ? `₹${inrValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "0.00"}
                            </div>
                        </div>
                        <p className="text-[9px] text-gray-700 px-1">Estimated value before fees</p>
                    </div>
                </div>

                {/* Sell button */}
                <button
                    disabled={!canSell}
                    className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                        canSell
                            ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                            : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                    }`}
                >
                    Sell {asset.symbol}
                    <ArrowRight size={15} strokeWidth={2.5} />
                </button>
            </div>

            {/* RIGHT: Summary + history */}
            <div className="lg:col-span-2 space-y-5">
                {/* Order summary */}
                <div
                    className="rounded-3xl border border-white/6 p-6 space-y-4"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="flex items-center gap-2.5">
                        <Receipt size={16} className="text-emerald-400" />
                        <h2 className="text-sm font-black text-white tracking-wide">Order Summary</h2>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${assetId}-${numAmt}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            {[
                                { label: "Selling",       value: numAmt > 0 ? `${numAmt} ${asset.symbol}` : "—" },
                                { label: "Price",         value: numAmt > 0 ? `₹${inrValue.toFixed(2)}` : "—" },
                                { label: "TDS (1%)",      value: numAmt > 0 ? `₹${tds.toFixed(2)}` : "—" },
                                { label: "Platform Fee",  value: "Free", green: true },
                                { label: "You Receive",   value: numAmt > 0 ? `₹${netINR.toFixed(2)}` : "—", green: numAmt > 0 },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                                    <span className="text-[11px] text-gray-500 font-medium">{row.label}</span>
                                    <span className={`text-xs font-bold ${row.green ? "text-emerald-400" : "text-white"}`}>{row.value}</span>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Total */}
                    <div
                        className="rounded-2xl border border-emerald-500/20 p-4"
                        style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                    >
                        <p className="text-[9px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">Net Amount</p>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={netINR.toFixed(2)}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.18 }}
                                className="text-2xl font-black text-white tabular-nums"
                            >
                                {numAmt > 0 ? `₹${netINR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Transaction history */}
                <TransactionHistory type="sell" />
            </div>
        </div>
    );
};

// ─── Withdrawal Tab ───────────────────────────────────────────────────────────

const WithdrawTab = () => {
    const [amount, setAmount] = useState("");
    const availableFund       = 4250.00;
    const numAmt              = parseFloat(amount) || 0;
    const platformFee         = numAmt * 0.005;
    const netAmount           = numAmt - platformFee;
    const canWithdraw         = numAmt > 0 && numAmt <= availableFund;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* LEFT: Withdraw form */}
            <div
                className="lg:col-span-3 rounded-3xl border border-white/6 p-6 space-y-6"
                style={{ background: "rgba(10,26,15,0.7)" }}
            >
                {/* Available balance */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <div className="h-5 w-1 rounded-full bg-emerald-400" />
                        <h2 className="text-sm font-black text-white tracking-wide">Withdraw Funds</h2>
                    </div>

                    <div
                        className="rounded-2xl border border-emerald-500/15 p-5 flex items-center justify-between"
                        style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.06) 0%,rgba(16,185,129,0.02) 100%)" }}
                    >
                        <div>
                            <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold mb-1">Available Fund</p>
                            <p className="text-3xl font-black text-white tabular-nums">
                                ₹{availableFund.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <Wallet size={20} className="text-emerald-400" />
                        </div>
                    </div>
                </div>

                {/* Amount input */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                            Amount to Withdraw
                        </span>
                        <button
                            onClick={() => setAmount(availableFund.toString())}
                            className="text-[9px] text-emerald-400 font-bold hover:underline"
                        >
                            MAX
                        </button>
                    </div>
                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600">
                            <IndianRupee size={20} strokeWidth={2.5} />
                        </span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full rounded-2xl border border-white/8 py-5 pl-14 pr-5 text-3xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                            style={{ background: "rgba(5,13,7,0.8)" }}
                        />
                    </div>
                </div>

                {/* You will get */}
                <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold px-1">
                        You Will Get INR
                    </span>
                    <div
                        className="rounded-2xl border border-white/6 py-4 px-5 text-xl font-black text-white tabular-nums"
                        style={{ background: "rgba(5,13,7,0.5)" }}
                    >
                        {numAmt > 0 ? `₹${netAmount.toFixed(2)}` : "0.00"}
                    </div>
                </div>

                {/* Fee bar */}
                <div
                    className="flex items-center justify-between rounded-xl border border-white/6 px-4 py-2.5"
                    style={{ background: "rgba(5,13,7,0.6)" }}
                >
                    <span className="text-[10px] text-gray-500 font-bold">Platform Fee</span>
                    <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                        0.5% = ₹{numAmt > 0 ? platformFee.toFixed(2) : "0.00"} INR
                    </span>
                </div>

                {/* Withdraw button */}
                <button
                    disabled={!canWithdraw}
                    className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                        canWithdraw
                            ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                            : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                    }`}
                >
                    Withdraw
                    <ArrowRight size={15} strokeWidth={2.5} />
                </button>

                {!canWithdraw && numAmt > availableFund && (
                    <p className="text-center text-[9px] text-red-400/80">Insufficient balance</p>
                )}
            </div>

            {/* RIGHT: Summary + history */}
            <div className="lg:col-span-2 space-y-5">
                <div
                    className="rounded-3xl border border-white/6 p-6 space-y-4"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="flex items-center gap-2.5">
                        <Receipt size={16} className="text-emerald-400" />
                        <h2 className="text-sm font-black text-white tracking-wide">Withdrawal Summary</h2>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={numAmt}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            {[
                                { label: "Withdraw Amount", value: numAmt > 0 ? `₹${numAmt.toLocaleString()}` : "—" },
                                { label: "Platform Fee (0.5%)", value: numAmt > 0 ? `₹${platformFee.toFixed(2)}` : "—" },
                                { label: "Processing Time", value: "1-2 Business Days" },
                                { label: "Credited To", value: "Linked Bank Account" },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                                    <span className="text-[11px] text-gray-500 font-medium">{row.label}</span>
                                    <span className="text-xs font-bold text-white">{row.value}</span>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    <div
                        className="rounded-2xl border border-emerald-500/20 p-4"
                        style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                    >
                        <p className="text-[9px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">You Will Receive</p>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={netAmount.toFixed(2)}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.18 }}
                                className="text-2xl font-black text-white tabular-nums"
                            >
                                {numAmt > 0 ? `₹${netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Trust */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: Shield, label: "Secure Transfer" },
                            { icon: Clock,  label: "1-2 Day Processing" },
                        ].map((t, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 rounded-xl border border-white/5 p-2.5"
                                style={{ background: "rgba(5,13,7,0.6)" }}
                            >
                                <t.icon size={13} className="text-emerald-500/60 shrink-0" />
                                <span className="text-[9px] text-gray-600 font-bold">{t.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <TransactionHistory type="withdraw" />
            </div>
        </div>
    );
};

// ─── Transaction history (shared) ─────────────────────────────────────────────

const TransactionHistory = ({ type }: { type: "sell" | "withdraw" }) => (
    <div
        className="rounded-3xl border border-white/6 p-6 space-y-4"
        style={{ background: "rgba(10,26,15,0.7)" }}
    >
        <div className="flex items-center gap-2.5">
            <Clock size={16} className="text-emerald-400" />
            <h2 className="text-sm font-black text-white tracking-wide">
                {type === "sell" ? "Transaction" : "Withdrawal"} History
            </h2>
        </div>

        <div className="py-8 flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center">
                {type === "sell"
                    ? <TrendingDown size={20} className="text-gray-700" />
                    : <Banknote size={20} className="text-gray-700" />
                }
            </div>
            <p className="text-[11px] text-gray-700">No transactions found</p>
            <p className="text-[9px] text-gray-800">Your {type === "sell" ? "sell" : "withdrawal"} history will appear here</p>
        </div>
    </div>
);

// ─── Main component ──────────────────────────────────────────────────────────

const Exchange = () => {
    const [tab, setTab] = useState<Tab>("sell");

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── Page title ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                <h1 className="text-xl font-black text-white tracking-tight">Exchange</h1>
                <p className="text-[11px] text-gray-600 mt-0.5">Sell your assets or withdraw funds to your bank</p>
            </motion.div>

            {/* ── Tab switcher ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                className="flex items-center gap-2 p-1 rounded-2xl border border-white/6 w-fit"
                style={{ background: "rgba(10,26,15,0.7)" }}
            >
                {([
                    { key: "sell" as Tab,     label: "Sell",       icon: TrendingDown },
                    { key: "withdraw" as Tab, label: "Withdrawal", icon: Banknote },
                ]).map((t) => {
                    const active = t.key === tab;
                    const Icon   = t.icon;
                    return (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                active
                                    ? "bg-emerald-500 text-black shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <Icon size={14} strokeWidth={2.5} />
                            {t.label}
                        </button>
                    );
                })}
            </motion.div>

            {/* ── Tab content ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                >
                    {tab === "sell" ? <SellTab /> : <WithdrawTab />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Exchange;

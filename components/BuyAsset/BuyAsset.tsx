"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ArrowRight, ArrowDownUp, IndianRupee,
    Coins, Wallet, Receipt, TrendingUp, Shield, Zap,
} from "lucide-react";
import Link from "next/link";

// ─── Asset config ─────────────────────────────────────────────────────────────

interface Asset {
    id: string;
    name: string;
    symbol: string;
    rate: number;        // 1 token = X INR
    change24h: string;
    color: string;
}

const ASSETS: Asset[] = [
    { id: "ytp",  name: "YatriPay",  symbol: "YTP",  rate: 0.75,  change24h: "+3.5%",  color: "emerald" },
    { id: "btc",  name: "Bitcoin",   symbol: "BTC",  rate: 8750000, change24h: "+1.2%", color: "amber" },
    { id: "eth",  name: "Ethereum",  symbol: "ETH",  rate: 315000,  change24h: "+2.8%", color: "violet" },
    { id: "usdt", name: "Tether",    symbol: "USDT", rate: 83.50,   change24h: "+0.01%", color: "sky" },
];

const QUICK_INR = [500, 1000, 2500, 5000];

// ─── Main ─────────────────────────────────────────────────────────────────────

const BuyAsset = () => {
    const [assetId, setAssetId] = useState("ytp");
    const [inrAmount, setInrAmount] = useState("");
    const [inputMode, setInputMode] = useState<"inr" | "token">("inr");

    const asset = ASSETS.find((a) => a.id === assetId)!;

    const numInr = parseFloat(inrAmount) || 0;

    const { tokenAmount, totalInr, tds, totalPayable } = useMemo(() => {
        const tokens = numInr > 0 ? numInr / asset.rate : 0;
        const tdsVal = numInr * 0.01;
        return {
            tokenAmount: tokens,
            totalInr: numInr,
            tds: tdsVal,
            totalPayable: numInr + tdsVal,
        };
    }, [numInr, asset.rate]);

    const handleTokenInput = (val: string) => {
        const tokenVal = parseFloat(val) || 0;
        setInrAmount(tokenVal > 0 ? (tokenVal * asset.rate).toFixed(2) : "");
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── Page title ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                            <ArrowLeft size={16} />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Buy Asset</h1>
                        <p className="text-[11px] text-gray-600 mt-0.5">Purchase crypto assets with INR</p>
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
                        <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">INR Balance</p>
                        <p className="text-sm font-black text-white">₹4,250.00</p>
                    </div>
                </div>
            </motion.div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT: Asset selection + inputs (3 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.4 }}
                    className="lg:col-span-3 rounded-3xl border border-white/6 p-6 space-y-6"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    {/* Choose asset */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Choose Asset</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {ASSETS.map((a) => {
                                const active = a.id === assetId;
                                return (
                                    <button
                                        key={a.id}
                                        onClick={() => { setAssetId(a.id); setInrAmount(""); }}
                                        className={`p-3 rounded-2xl border text-center transition-all ${
                                            active
                                                ? "border-emerald-400/50 shadow-[0_0_16px_rgba(16,185,129,0.08)]"
                                                : "border-white/6 hover:border-emerald-500/25"
                                        }`}
                                        style={{
                                            background: active
                                                ? "linear-gradient(160deg,rgba(16,185,129,0.13) 0%,#0d1f12 100%)"
                                                : "rgba(5,13,7,0.6)",
                                        }}
                                    >
                                        <p className={`text-sm font-black ${active ? "text-white" : "text-gray-500"}`}>
                                            {a.symbol}
                                        </p>
                                        <p className="text-[9px] text-gray-600 mt-0.5">{a.name}</p>
                                        <p className={`text-[9px] font-bold mt-1 ${
                                            a.change24h.startsWith("+") ? "text-emerald-400" : "text-red-400"
                                        }`}>
                                            {a.change24h}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick amounts */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {QUICK_INR.map((val) => (
                            <motion.button
                                key={val}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setInrAmount(val.toString())}
                                className={`px-4 py-2 rounded-xl border text-[11px] font-black transition-all ${
                                    inrAmount === val.toString()
                                        ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-400"
                                        : "border-white/6 text-gray-500 hover:border-emerald-500/25"
                                }`}
                                style={inrAmount !== val.toString() ? { background: "rgba(5,13,7,0.6)" } : undefined}
                            >
                                ₹{val.toLocaleString()}
                            </motion.button>
                        ))}
                    </div>

                    {/* Amount inputs — INR & Token */}
                    <div className="space-y-4">

                        {/* INR input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                    Amount INR
                                </span>
                                <span className="text-[10px] text-gray-600">
                                    1 {asset.symbol} = <span className="text-emerald-400 font-bold">₹{asset.rate.toLocaleString()}</span>
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <IndianRupee size={18} strokeWidth={2.5} />
                                </span>
                                <input
                                    type="number"
                                    value={inputMode === "inr" ? inrAmount : (numInr > 0 ? numInr.toFixed(2) : "")}
                                    onChange={(e) => { setInputMode("inr"); setInrAmount(e.target.value); }}
                                    onFocus={() => setInputMode("inr")}
                                    placeholder="0.00"
                                    className="w-full rounded-2xl border border-white/8 py-4 pl-12 pr-5 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                            </div>
                        </div>

                        {/* Swap icon */}
                        <div className="flex justify-center">
                            <div className="h-8 w-8 rounded-full bg-white/4 border border-white/8 flex items-center justify-center">
                                <ArrowDownUp size={14} className="text-gray-600" />
                            </div>
                        </div>

                        {/* Token input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                    Amount {asset.symbol}
                                </span>
                                <span className="text-[10px] text-gray-600">
                                    1 {asset.symbol} = <span className="text-emerald-400 font-bold">₹{asset.rate.toLocaleString()}</span>
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <Coins size={18} strokeWidth={2} />
                                </span>
                                <input
                                    type="number"
                                    value={inputMode === "token"
                                        ? inrAmount
                                        : (tokenAmount > 0 ? tokenAmount.toFixed(asset.rate < 1 ? 2 : 8) : "")
                                    }
                                    onChange={(e) => { setInputMode("token"); handleTokenInput(e.target.value); }}
                                    onFocus={() => setInputMode("token")}
                                    placeholder="0.00"
                                    className="w-full rounded-2xl border border-white/8 py-4 pl-12 pr-16 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-600">
                                    {asset.symbol}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── RIGHT: Summary (2 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="lg:col-span-2 rounded-3xl border border-white/6 p-6 flex flex-col gap-5"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    {/* Section title */}
                    <div className="flex items-center gap-2.5">
                        <Receipt size={16} className="text-emerald-400" />
                        <h2 className="text-sm font-black text-white tracking-wide">Order Summary</h2>
                    </div>

                    {/* Summary rows */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${assetId}-${numInr}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-0"
                        >
                            {[
                                { label: "Asset",        value: `${asset.name} (${asset.symbol})` },
                                { label: "Price",        value: numInr > 0 ? `₹${numInr.toLocaleString()}` : "—" },
                                { label: "You Receive",  value: numInr > 0 ? `${tokenAmount.toLocaleString(undefined, { maximumFractionDigits: asset.rate < 1 ? 2 : 8 })} ${asset.symbol}` : "—", green: true },
                                { label: "TDS (1%)",     value: numInr > 0 ? `₹${tds.toFixed(2)}` : "—" },
                                { label: "Platform Fee", value: "Free", green: true },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                                    <span className="text-[11px] text-gray-500 font-medium">{row.label}</span>
                                    <span className={`text-xs font-bold ${row.green ? "text-emerald-400" : "text-white"}`}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Total payable */}
                    <div
                        className="rounded-2xl border border-emerald-500/20 p-4"
                        style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">
                                    Total Payable
                                </p>
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={totalPayable.toFixed(2)}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.18 }}
                                        className="text-2xl font-black text-white tabular-nums"
                                    >
                                        {numInr > 0 ? `₹${totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <TrendingUp size={16} className="text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    {/* Trust indicators */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: Shield, label: "Secure Transaction" },
                            { icon: Zap,    label: "Instant Delivery" },
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

                    {/* CTA */}
                    <div className="mt-auto space-y-2">
                        <button
                            disabled={numInr <= 0}
                            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                numInr > 0
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                            }`}
                        >
                            Buy {asset.symbol}
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </button>

                        {numInr <= 0 && (
                            <p className="text-center text-[9px] text-gray-700">
                                Enter an amount to continue
                            </p>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default BuyAsset;

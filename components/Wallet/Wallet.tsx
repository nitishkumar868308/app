"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet as WalletIcon, Copy, CheckCircle2, ArrowRight,
    ArrowUpRight, ArrowDownLeft, QrCode, Shield,
    ChevronDown, ExternalLink, Clock,
} from "lucide-react";

// ─── Assets ───────────────────────────────────────────────────────────────────

interface Asset {
    id: string;
    name: string;
    symbol: string;
    balance: string;
    balanceUsd: string;
    address: string;
    color: string;
}

const ASSETS: Asset[] = [
    {
        id: "ytp",
        name: "YatriPay",
        symbol: "YTP",
        balance: "966.0065",
        balanceUsd: "₹724.50",
        address: "0x566f35B59785ac087042EBD08bA802bB7E976e76",
        color: "emerald",
    },
    {
        id: "btc",
        name: "Bitcoin",
        symbol: "BTC",
        balance: "0.00042",
        balanceUsd: "₹3,675.00",
        address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        color: "amber",
    },
    {
        id: "eth",
        name: "Ethereum",
        symbol: "ETH",
        balance: "0.0150",
        balanceUsd: "₹4,725.00",
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08",
        color: "violet",
    },
    {
        id: "usdt",
        name: "Tether",
        symbol: "USDT",
        balance: "50.00",
        balanceUsd: "₹4,175.00",
        address: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
        color: "sky",
    },
];

const RECENT_TXN = [
    { type: "in", label: "Received YTP", amount: "+120.00 YTP", time: "2 hours ago", from: "Staking Reward" },
    { type: "out", label: "Sent BTC", amount: "-0.00010 BTC", time: "1 day ago", from: "External Wallet" },
    { type: "in", label: "Received USDT", amount: "+50.00 USDT", time: "3 days ago", from: "Add Fund" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

const Wallet = () => {
    const [selectedId, setSelectedId] = useState("ytp");
    const [copied, setCopied]         = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const asset = ASSETS.find((a) => a.id === selectedId)!;

    const copyAddress = async () => {
        await navigator.clipboard.writeText(asset.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shortAddr = `${asset.address.slice(0, 8)}...${asset.address.slice(-6)}`;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── Page header ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                <h1 className="text-xl font-black text-white tracking-tight">Wallet Details</h1>
                <p className="text-[11px] text-gray-600 mt-0.5">Manage your assets and wallet addresses</p>
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
                    {/* Asset selector + balance card */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-5"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        {/* Select Asset dropdown */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="h-5 w-1 rounded-full bg-emerald-400" />
                                <h2 className="text-sm font-black text-white tracking-wide">Select Asset</h2>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown((v) => !v)}
                                    className="flex items-center gap-2 rounded-xl border border-white/8 px-3.5 py-2 text-xs font-black text-white hover:border-emerald-500/30 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                >
                                    {asset.symbol}
                                    <ChevronDown size={13} className={`text-gray-500 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                                </button>

                                <AnimatePresence>
                                    {showDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-1 z-20 rounded-xl border border-white/8 overflow-hidden min-w-36"
                                            style={{ background: "#0a1a0f" }}
                                        >
                                            {ASSETS.map((a) => (
                                                <button
                                                    key={a.id}
                                                    onClick={() => { setSelectedId(a.id); setShowDropdown(false); setCopied(false); }}
                                                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-all ${
                                                        a.id === selectedId
                                                            ? "bg-emerald-500/10 text-emerald-400"
                                                            : "text-gray-400 hover:bg-white/4 hover:text-white"
                                                    }`}
                                                >
                                                    <span className="text-xs font-black">{a.symbol}</span>
                                                    <span className="text-[9px] text-gray-600">{a.name}</span>
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
                                key={selectedId}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2 }}
                                className="rounded-2xl border border-emerald-500/15 p-5"
                                style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.06) 0%,rgba(16,185,129,0.02) 100%)" }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold mb-1">
                                            {asset.name} ({asset.symbol})
                                        </p>
                                        <p className="text-3xl font-black text-white tabular-nums">
                                            {asset.balance} <span className="text-base text-gray-500">{asset.symbol}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 tabular-nums">≈ {asset.balanceUsd}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                        <WalletIcon size={20} className="text-emerald-400" />
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Wallet address */}
                        <div className="space-y-2">
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold px-1">
                                Wallet Address
                            </p>
                            <div
                                className="rounded-2xl border border-white/8 p-4 flex items-center gap-3"
                                style={{ background: "rgba(5,13,7,0.8)" }}
                            >
                                <p className="text-[11px] font-mono font-bold text-gray-400 truncate flex-1 select-all">
                                    {asset.address}
                                </p>
                                <button
                                    onClick={copyAddress}
                                    className={`shrink-0 h-8 px-3 rounded-lg flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-all ${
                                        copied
                                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                            : "bg-white/5 border border-white/8 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30"
                                    }`}
                                >
                                    {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                            <p className="text-[9px] text-gray-700 px-1">
                                Only send {asset.symbol} to this address. Sending other assets may result in permanent loss.
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] uppercase tracking-widest shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98] transition-all">
                                <ArrowUpRight size={15} strokeWidth={2.5} />
                                Transfer
                            </button>
                            <button
                                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/8 text-white font-black text-[11px] uppercase tracking-widest hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.98] transition-all"
                                style={{ background: "rgba(5,13,7,0.6)" }}
                            >
                                <ArrowDownLeft size={15} strokeWidth={2.5} />
                                Receive
                            </button>
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
                            <QrCode size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Receive {asset.symbol}</h2>
                        </div>

                        {/* QR */}
                        <div className="rounded-2xl bg-white p-3">
                            <div className="w-44 h-44 sm:w-48 sm:h-48 bg-white rounded-xl flex items-center justify-center relative overflow-hidden">
                                <svg viewBox="0 0 200 200" className="w-full h-full">
                                    <rect x="10" y="10" width="50" height="50" rx="4" fill="none" stroke="#030a05" strokeWidth="6" />
                                    <rect x="20" y="20" width="30" height="30" rx="2" fill="#030a05" />
                                    <rect x="140" y="10" width="50" height="50" rx="4" fill="none" stroke="#030a05" strokeWidth="6" />
                                    <rect x="150" y="20" width="30" height="30" rx="2" fill="#030a05" />
                                    <rect x="10" y="140" width="50" height="50" rx="4" fill="none" stroke="#030a05" strokeWidth="6" />
                                    <rect x="20" y="150" width="30" height="30" rx="2" fill="#030a05" />
                                    {[70,80,90,100,110,120,130].map(x =>
                                        [70,80,90,100,110,120,130].map(y => (
                                            <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="1"
                                                fill={(x + y) % 20 === 0 ? "transparent" : "#030a05"}
                                                opacity={(x * y) % 7 === 0 ? 0.3 : 1} />
                                        ))
                                    )}
                                    {[10,20,30,40,50,60].map(x =>
                                        [70,80,90,100,110,120].map(y => (
                                            <rect key={`s-${x}-${y}`} x={x} y={y} width="6" height="6" rx="1"
                                                fill="#030a05" opacity={(x + y) % 3 === 0 ? 1 : 0.2} />
                                        ))
                                    )}
                                    {[70,80,90,100,110,120].map(x =>
                                        [10,20,30,40,50,60].map(y => (
                                            <rect key={`t-${x}-${y}`} x={x} y={y} width="6" height="6" rx="1"
                                                fill="#030a05" opacity={(x * y) % 5 === 0 ? 0.2 : 1} />
                                        ))
                                    )}
                                    {[140,150,160,170,180].map(x =>
                                        [70,80,90,100,110,120,130,140,150,160,170,180].map(y => (
                                            <rect key={`r-${x}-${y}`} x={x} y={y} width="6" height="6" rx="1"
                                                fill="#030a05" opacity={(x + y) % 4 === 0 ? 1 : 0.15} />
                                        ))
                                    )}
                                    {[70,80,90,100,110,120,130].map(x =>
                                        [140,150,160,170,180].map(y => (
                                            <rect key={`b-${x}-${y}`} x={x} y={y} width="6" height="6" rx="1"
                                                fill="#030a05" opacity={(x * y) % 6 === 0 ? 0.15 : 1} />
                                        ))
                                    )}
                                    <rect x="80" y="80" width="40" height="40" rx="8" fill="white" />
                                    <rect x="84" y="84" width="32" height="32" rx="6" fill="#059669" />
                                    <text x="100" y="105" textAnchor="middle" fill="white" fontSize="14" fontWeight="900">Y</text>
                                </svg>
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-500 font-bold tabular-nums">{shortAddr}</p>

                        <button
                            onClick={copyAddress}
                            className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                            {copied ? "Address Copied!" : "Copy Address"}
                        </button>

                        <div className="flex items-center gap-2 rounded-xl border border-white/5 p-2.5 w-full" style={{ background: "rgba(5,13,7,0.6)" }}>
                            <Shield size={13} className="text-emerald-500/60 shrink-0" />
                            <span className="text-[9px] text-gray-600 font-bold">
                                Only send {asset.symbol} tokens to this address
                            </span>
                        </div>
                    </div>

                    {/* Recent transactions */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Clock size={16} className="text-emerald-400" />
                                <h2 className="text-sm font-black text-white tracking-wide">Recent Activity</h2>
                            </div>
                            <button className="text-[9px] text-emerald-400 font-bold hover:underline flex items-center gap-1">
                                View All <ExternalLink size={9} />
                            </button>
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
                                        <p className="text-[11px] font-bold text-white truncate">{txn.label}</p>
                                        <p className="text-[9px] text-gray-600">{txn.from} &middot; {txn.time}</p>
                                    </div>
                                    <span className={`text-[11px] font-black tabular-nums shrink-0 ${
                                        txn.type === "in" ? "text-emerald-400" : "text-red-400"
                                    }`}>
                                        {txn.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default Wallet;

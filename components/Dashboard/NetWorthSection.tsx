"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Eye, EyeOff } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

type Currency = "INR" | "YTP";

const NetWorthSection = () => {
    const [visible,  setVisible]  = useState(false);
    const [currency, setCurrency] = useState<Currency>("INR");

    const { ytpBalance, inrBalance, ytpToInrRate } = useWallet();

    // Format values from real data
    const inrFormatted = inrBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const ytpFormatted = ytpBalance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });

    const data: Record<Currency, { symbol: string; amount: string; profit: string; profitRaw: string }> = {
        INR: { symbol: "₹", amount: inrFormatted,             profit: `+₹${(inrBalance * 0.035).toFixed(2)}`, profitRaw: "+3.5%" },
        YTP: { symbol: "",  amount: `${ytpFormatted} YTP`,    profit: `+${(ytpBalance * 0.035).toFixed(2)} YTP`, profitRaw: "+3.5%" },
    };

    const { symbol, amount, profit, profitRaw } = data[currency];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl border border-emerald-500/15 p-6 md:p-7"
            style={{ background: "linear-gradient(135deg, #0d1f12 0%, #0a1a0f 50%, #071209 100%)" }}
        >
            {/* Ambient glows */}
            <div className="absolute -top-10 -right-10 w-52 h-52 bg-emerald-500/10 rounded-full blur-[70px] pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-green-600/8 rounded-full blur-[60px] pointer-events-none" />

            {/* Subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)`,
                    backgroundSize: "28px 28px",
                }}
            />

            <div className="relative z-10">
                {/* ── Top row: label + currency toggle ── */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <p className="text-[12px] uppercase tracking-[0.22em] text-emerald-400/60 font-bold">
                            Total Net Worth
                        </p>
                        <button
                            onClick={() => setVisible((v) => !v)}
                            aria-label={visible ? "Hide balance" : "Show balance"}
                            className="text-gray-600 hover:text-emerald-400 transition-colors p-0.5 rounded"
                        >
                            {visible ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                    </div>

                    {/* Currency switcher pill */}
                    <div className="flex items-center bg-white/5 border border-white/8 rounded-xl p-0.5 gap-0.5">
                        {(["INR", "YTP"] as Currency[]).map((c) => (
                            <button
                                key={c}
                                onClick={() => setCurrency(c)}
                                className={`px-3 py-1 rounded-[9px] text-[12px] font-black tracking-wider transition-all duration-200 ${
                                    currency === c
                                        ? "bg-emerald-500 text-black shadow-sm"
                                        : "text-gray-500 hover:text-gray-300"
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Amount ── */}
                <div className="flex items-end justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.h1
                                key={`${currency}-${visible}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 tabular-nums"
                            >
                                {visible
                                    ? `${symbol}${amount}`
                                    : <span className="tracking-widest text-gray-400">••••••</span>
                                }
                            </motion.h1>
                        </AnimatePresence>

                        {/* Profit badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={`profit-${currency}-${visible}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.18 }}
                                    className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm"
                                >
                                    <TrendingUp size={11} />
                                    {visible ? profit : "••••"}
                                </motion.span>
                            </AnimatePresence>
                            <span className="text-gray-500 text-xs">Profit last 24h</span>
                        </div>
                    </div>

                    {/* Right: % badge */}
                    <div className="shrink-0 flex flex-col items-center justify-center h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-emerald-400 text-base font-black leading-none">{profitRaw}</span>
                        <span className="text-[13px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Today</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default NetWorthSection;

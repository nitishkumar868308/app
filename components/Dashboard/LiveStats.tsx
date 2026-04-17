"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

const LiveStats = () => {
    const { ytpToInrRate } = useWallet();

    const ytpPrice = ytpToInrRate > 0
        ? `₹${ytpToInrRate.toFixed(4)}`
        : "₹0.0000";

    return (
        <div className="grid grid-cols-2 gap-3">
            {/* Total Subscribers */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="relative overflow-hidden rounded-2xl border border-emerald-500/15 p-4 md:p-5"
                style={{ background: "linear-gradient(135deg, #0d1f12 0%, #0a1a0f 60%, #071209 100%)" }}
            >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />
                <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-400/60 font-bold">
                            Total Subscribers
                        </p>
                        <p className="mt-2 text-2xl md:text-3xl font-black text-white tabular-nums truncate">
                            12,845<span className="text-emerald-400">+</span>
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500 font-medium">
                            Global community
                        </p>
                    </div>
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Users size={18} strokeWidth={1.9} />
                    </div>
                </div>
            </motion.div>

            {/* YTP Live Price */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.06 }}
                className="relative overflow-hidden rounded-2xl border border-emerald-500/15 p-4 md:p-5"
                style={{ background: "linear-gradient(135deg, #0d1f12 0%, #0a1a0f 60%, #071209 100%)" }}
            >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />
                <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-400/60 font-bold">
                            YTP Live Price
                        </p>
                        <p className="mt-2 text-2xl md:text-3xl font-black text-white tabular-nums truncate">
                            {ytpPrice}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                            <TrendingUp size={11} /> Live rate
                        </p>
                    </div>
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <TrendingUp size={18} strokeWidth={1.9} />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LiveStats;

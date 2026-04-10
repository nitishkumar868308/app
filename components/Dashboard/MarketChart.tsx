"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const ranges = ["1W", "1M"] as const;

// Simple decorative SVG sparkline — replace with real chart data as needed
const SparkLine = () => (
    <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0"    />
            </linearGradient>
        </defs>
        {/* Fill area */}
        <path
            d="M0,80 C40,75 60,60 90,55 C120,50 140,65 170,52 C200,39 220,30 260,25 C300,20 340,12 400,8 L400,100 L0,100 Z"
            fill="url(#chartGrad)"
        />
        {/* Line */}
        <path
            d="M0,80 C40,75 60,60 90,55 C120,50 140,65 170,52 C200,39 220,30 260,25 C300,20 340,12 400,8"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* End dot */}
        <circle cx="400" cy="8" r="4" fill="#10b981" />
        <circle cx="400" cy="8" r="8" fill="#10b981" fillOpacity="0.25" />
    </svg>
);

const MarketChart = () => {
    const [activeRange, setActiveRange] = useState<"1W" | "1M">("1W");

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-3xl bg-[#0a1a0f]/60 border border-emerald-500/12 p-5 md:p-6 overflow-hidden"
        >
            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-[12px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-1">
                        Market Analytics
                    </p>
                    <div className="flex items-end gap-2.5">
                        <span className="text-2xl font-black text-white">₹0.7165</span>
                        <span className="flex items-center gap-1 text-emerald-400 text-sm font-bold mb-0.5">
                            <TrendingUp size={13} />
                            +2.4%
                        </span>
                    </div>
                </div>

                {/* Range toggle */}
                <div className="flex items-center gap-1 bg-white/4 border border-white/8 rounded-xl p-0.5">
                    {ranges.map((r) => (
                        <button
                            key={r}
                            onClick={() => setActiveRange(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                activeRange === r
                                    ? "bg-emerald-500 text-black shadow-sm"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart area */}
            <div className="h-28 md:h-36 w-full">
                <SparkLine />
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <span className="text-[12px] text-gray-600">YTP / INR</span>
                <span className="flex items-center gap-1.5 text-[12px] text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Market is live
                </span>
            </div>
        </motion.section>
    );
};

export default MarketChart;

import React from 'react'
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    Gift,
    Users,
} from "lucide-react";
import Link from 'next/link';

const stakingOffers = [
    {
        label: "Mega Reward",
        title: "Win ₹10,000",
        subtitle: "Grab your Staking Pass today",
        cta: "Go to Staking",
        bgGradient: "from-yellow-500/20 to-yellow-400/10",
        borderColor: "border-yellow-400/30",
        labelColor: "text-yellow-400"
    },
    {
        label: "AI Powered",
        title: "50% APY",
        subtitle: "Grow your wealth with AI-staking",
        cta: "Start Staking",
        bgGradient: "from-indigo-600 to-blue-700",
        borderColor: "border-indigo-500/30",
        labelColor: "text-indigo-400"
    },
    {
        label: "High Yield",
        title: "Up to 1000% APY",
        subtitle: "Activate staking hike now",
        cta: "Claim Now",
        bgGradient: "from-green-600 to-green-500",
        borderColor: "border-green-400/30",
        labelColor: "text-green-400"
    },
    {
        label: "Giveaway",
        title: "iPhone Giveaway",
        subtitle: "Stake and win the latest iPhone",
        cta: "Go to Staking",
        bgGradient: "from-pink-600 to-pink-500",
        borderColor: "border-pink-400/30",
        labelColor: "text-pink-400"
    }
];

const Section3 = () => {
    return (
        <>

            {/* Staking & Rewards Hub */}
            <section className="space-y-6">
                {/* Section Header */}
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Staking Hub</h2>
                        <p className="text-gray-500 text-sm">Maximize your earnings with AI-powered plans</p>
                    </div>
                    <div className="hidden md:block">
                        <span className="bg-green-500/10 text-green-500 text-[12px] font-bold px-3 py-1 rounded-full border border-green-500/20">
                            LIVE APY: 50%
                        </span>
                    </div>
                </div>

                {/* Responsive Grid System */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 1. Main Featured Staking (Takes 2 columns on Desktop) */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 rounded-[2.5rem] p-1 shadow-2xl shadow-blue-500/20"
                    >
                        <div className="bg-[#000]/10 backdrop-blur-md h-full w-full rounded-[2.3rem] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="space-y-4 text-center md:text-left">
                                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                    Most Popular
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                    UPTO 50% <br /> <span className="text-blue-200 text-2xl md:text-3xl font-bold">ANNUAL RETURNS</span>
                                </h2>
                                <p className="text-blue-100/80 max-w-sm">
                                    Our AI-driven protocol automatically stakes your assets for the highest possible yield.
                                </p>
                                <Link href="/staking">
                                    <button className="bg-white text-blue-700 font-bold py-4 px-8 rounded-2xl shadow-lg hover:scale-105 transition-transform active:scale-95">
                                        Start Staking Now 🚀
                                    </button>
                                </Link>
                            </div>

                            {/* Floating Icon Decoration */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <TrendingUp className="w-32 h-32 md:w-48 md:h-48 text-white/20 relative z-10" />
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. Side Offers Column (Stack vertically) */}
                    <div className="grid grid-cols-1 gap-4">
                        {/* Mega Reward Card */}
                        <motion.div
                            whileHover={{ x: 5 }}
                            className="bg-[#111] border border-yellow-500/20 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-yellow-500/[0.03] transition-all cursor-pointer"
                        >
                            <div className="space-y-1">
                                <p className="text-yellow-500 font-bold text-[12px] uppercase tracking-[0.2em]">Mega Reward</p>
                                <h3 className="text-xl font-bold text-white">Win ₹10,000</h3>
                                <p className="text-gray-500 text-xs italic font-medium underline decoration-yellow-500/30">Get Staking Pass</p>
                            </div>
                            <div className="bg-yellow-500/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                <Gift className="w-8 h-8 text-yellow-500" />
                            </div>
                        </motion.div>

                        {/* Map through small offers if any, otherwise static */}
                        <motion.div
                            whileHover={{ x: 5 }}
                            className="bg-[#111] border border-purple-500/20 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-purple-500/[0.03] transition-all cursor-pointer"
                        >
                            <div className="space-y-1">
                                <p className="text-purple-400 font-bold text-[12px] uppercase tracking-[0.2em]">Referral Bonus</p>
                                <h3 className="text-xl font-bold text-white">20% Cashback</h3>
                                <p className="text-gray-500 text-xs">On every new friend</p>
                            </div>
                            <div className="bg-purple-500/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                <Users className="w-8 h-8 text-purple-400" />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* 3. Bottom Small Offers (Secondary Grid) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {stakingOffers.map((offer, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -3 }}
                            className={`p-4 rounded-[1.5rem] border ${offer.borderColor} bg-[#111] flex flex-col justify-between hover:bg-white/[0.02] transition-colors`}
                        >
                            <div>
                                <p className={`text-[12px] font-black uppercase ${offer.labelColor}`}>{offer.label}</p>
                                <h4 className="text-sm font-bold mt-1">{offer.title}</h4>
                            </div>
                            <p className="text-blue-400 text-xs mt-2 font-bold">{offer.cta} →</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </>
    )
}

export default Section3
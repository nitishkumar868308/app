import React, { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet,
    TrendingUp,
    ArrowUpRight,
    Users,
    Repeat,
    CreditCard,
    PlusCircle,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import Link from 'next/link';

const features = [
    { title: "Add fund", icon: PlusCircle, color: "text-green-400", href: "/addfund" },
    { title: "Wallet", icon: Wallet, color: "text-blue-400" , href: "/wallet" },
    { title: "Transactions", icon: Repeat, color: "text-green-400", href: "/transactions" },
    { title: "Buy Assets", icon: TrendingUp, color: "text-purple-400", href: "/buy-assets" },
    { title: "Referrals", icon: Users, color: "text-yellow-400", href: "/referal" },
    { title: "Sell YTP", icon: CreditCard, color: "text-red-400", href: "/sell-ytp" },
    { title: "Withdraw", icon: ArrowUpRight, color: "text-orange-400", href: "/withdraw" },
];

const Section1 = () => {
    const [showAll, setShowAll] = useState(false);
    const displayed = showAll ? features : features.slice(0, 6);
    return (
        <>
            {/* 2. Main Action Grid - Yahan Icons ko prominence di hai */}
            <section>
                <h2 className="text-sm font-semibold text-gray-500 mb-4 ml-1">QUICK ACTIONS</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {displayed.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <Link href={item.href} key={i}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    key={i}
                                    className="bg-[#111] border border-white/5 hover:border-blue-500/50 cursor-pointer p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all"
                                >
                                    <div className={`p-3 rounded-xl bg-white/5 ${item.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <p className="text-[12px] md:text-xs font-medium text-gray-300">{item.title}</p>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>

                {/* Show More / Collapse Button */}
                {features.length > 6 && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="group relative flex items-center gap-2 px-6 py-3 bg-[#111] border border-white/10 rounded-2xl text-sm font-semibold overflow-hidden transition-all hover:border-blue-500/50 hover:bg-blue-500/5"
                        >
                            {/* Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <span className="relative z-10 text-gray-300 group-hover:text-blue-400">
                                {showAll ? "Show Less" : "View All"}
                            </span>

                            {/* Animated Icon */}
                            <div className="relative z-10 flex-shrink-0">
                                <AnimatePresence initial={false} mode="wait">
                                    {showAll ? (
                                        <motion.div
                                            key="up"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                        >
                                            <ChevronUp className="w-4 h-4 text-blue-400" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="down"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                        >
                                            <ChevronDown className="w-4 h-4 text-gray-500" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </button>
                    </div>
                )}
            </section>
        </>
    )
}

export default Section1
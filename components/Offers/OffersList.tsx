"use client";

import { motion } from "framer-motion";
import {
    ArrowRight, CheckCircle2, ListChecks, Flame,
} from "lucide-react";
import Link from "next/link";
import { OFFERS } from "./offersData";

const OffersList = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── Page header ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="text-center space-y-2"
            >
                <div className="flex items-center justify-center gap-2 mb-1">
                    <Flame size={20} className="text-amber-400" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">All Offers</h1>
                <p className="text-[11px] text-gray-600 max-w-md mx-auto">
                    Complete tasks to unlock rewards, boosts, and exclusive drops
                </p>
            </motion.div>

            {/* ── Offers grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {OFFERS.map((offer, i) => {
                    const Icon          = offer.icon;
                    const totalTasks    = offer.tasks.length;
                    const completedTasks = offer.tasks.filter((t) => t.completed).length;
                    const progress      = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                    return (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, duration: 0.35 }}
                        >
                            <Link href={`/offers/${offer.slug}`}>
                                <div
                                    className={`relative overflow-hidden rounded-3xl border ${offer.gradient.border} p-5 cursor-pointer hover:scale-[1.01] transition-all duration-200 h-full flex flex-col`}
                                    style={{
                                        background: `linear-gradient(150deg, ${offer.gradient.from} 0%, ${offer.gradient.to} 100%)`,
                                    }}
                                >
                                    {/* Glow */}
                                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-[40px] pointer-events-none" style={{ background: offer.gradient.from }} />

                                    {/* Top bar */}
                                    <div className="relative z-10 flex items-center justify-between mb-3">
                                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${offer.gradient.text}`}>
                                            {offer.tagline}
                                        </span>
                                        {offer.live ? (
                                            <span className="flex items-center gap-1 bg-red-500/15 text-red-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-red-500/25">
                                                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                                                {offer.badge}
                                            </span>
                                        ) : (
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border border-white/10 text-gray-500 bg-white/4`}>
                                                {offer.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Icon + title */}
                                    <div className="relative z-10 flex items-start gap-3 mb-3">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${offer.gradient.badge}/15 border ${offer.gradient.border}`}>
                                            <Icon size={18} className={offer.gradient.text} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-black text-white leading-tight">{offer.title}</h3>
                                            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{offer.description}</p>
                                        </div>
                                    </div>

                                    {/* Reward */}
                                    <div className="relative z-10 mb-4">
                                        <span className={`text-xs font-black ${offer.gradient.text}`}>
                                            Reward: {offer.reward}
                                        </span>
                                    </div>

                                    {/* Progress */}
                                    <div className="relative z-10 mt-auto space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <ListChecks size={11} className="text-gray-600" />
                                                <span className="text-[9px] text-gray-500 font-bold">
                                                    {completedTasks}/{totalTasks} Tasks
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-gray-600 font-bold">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${progress}%`,
                                                    background: progress > 0
                                                        ? "linear-gradient(90deg, #10b981, #34d399)"
                                                        : "transparent",
                                                }}
                                            />
                                        </div>

                                        {/* CTA */}
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-[10px] text-gray-600 font-bold">
                                                {completedTasks === totalTasks && totalTasks > 0 ? (
                                                    <span className="text-emerald-400 flex items-center gap-1">
                                                        <CheckCircle2 size={11} /> Completed
                                                    </span>
                                                ) : (
                                                    "In Progress"
                                                )}
                                            </span>
                                            <span className={`flex items-center gap-1 text-[10px] font-bold ${offer.gradient.text}`}>
                                                View Tasks <ArrowRight size={10} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default OffersList;

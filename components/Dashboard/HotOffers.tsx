"use client";

import { motion } from "framer-motion";
import { Flame, ArrowRight, Gift, Zap, Trophy, Rocket } from "lucide-react";
import Link from "next/link";

const HotOffers = () => (
    <section className="space-y-3">
        {/* Section label */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
                <Flame size={13} className="text-orange-400" />
                <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Hot Offers</p>
            </div>
            <Link href="/offers" className="text-[9px] text-emerald-400 font-bold hover:underline flex items-center gap-1">
                View All <ArrowRight size={9} />
            </Link>
        </div>

        {/* ── Staking Pass (Exclusive Drop) ── */}
        <Link href="/offers/staking-pass">
            <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 }}
                className="relative overflow-hidden rounded-2xl border border-amber-500/25 p-4 cursor-pointer hover:border-amber-500/40 transition-all"
                style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(234,179,8,0.08) 50%, #0a1a0f 100%)" }}
            >
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-amber-400/10 rounded-full blur-[35px] pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">
                            Exclusive Drop
                        </span>
                        <span className="flex items-center gap-1 bg-red-500/15 text-red-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-red-500/25">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                            LIVE
                        </span>
                    </div>
                    <h3 className="text-base font-black text-white mb-0.5">Staking Pass</h3>
                    <p className="text-xs text-gray-400 mb-3">
                        Unlock <span className="text-amber-400 font-bold">10,000 YTP</span>
                    </p>
                    <span className="inline-flex items-center gap-2 bg-amber-500 text-black text-xs font-black px-4 py-2 rounded-xl shadow-[0_4px_16px_rgba(245,158,11,0.3)]">
                        Claim Reward <ArrowRight size={12} />
                    </span>
                </div>
            </motion.div>
        </Link>

        {/* ── Four small cards ── */}
        <div className="grid grid-cols-2 gap-3 mt-10">
            {/* Giveaway */}
            <Link href="/offers/giveaway-iphone">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="relative overflow-hidden rounded-2xl border border-teal-500/20 p-3.5 cursor-pointer hover:border-teal-500/35 transition-all"
                    style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.12) 0%, #0a1a0f 100%)" }}
                >
                    <span className="text-[8px] font-black uppercase tracking-[0.18em] text-teal-400 mb-1 block">Giveaway</span>
                    <h4 className="text-sm font-bold text-white leading-tight">Win iPhone</h4>
                    <p className="text-[10px] text-gray-500 mb-3">Lucky Draw</p>
                    <span className="w-full flex items-center justify-center gap-1.5 bg-teal-500/12 text-teal-400 text-[10px] font-bold py-1.5 rounded-lg border border-teal-500/20">
                        <Gift size={10} /> Join Now
                    </span>
                </motion.div>
            </Link>

            {/* Boost */}
            <Link href="/offers/staking-hike">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-2xl border border-rose-500/20 p-3.5 cursor-pointer hover:border-rose-500/35 transition-all"
                    style={{ background: "linear-gradient(135deg, rgba(159,18,57,0.25) 0%, #0a1a0f 100%)" }}
                >
                    <span className="text-[8px] font-black uppercase tracking-[0.18em] text-rose-400 mb-1 block">Boost</span>
                    <h4 className="text-sm font-bold text-white leading-tight">Up to</h4>
                    <p className="text-[11px] text-emerald-400 font-black mb-3">1000% APY</p>
                    <span className="w-full flex items-center justify-center gap-1.5 bg-rose-500/12 text-rose-400 text-[10px] font-bold py-1.5 rounded-lg border border-rose-500/20">
                        <Zap size={10} /> Activate
                    </span>
                </motion.div>
            </Link>

            {/* Referral Race — NEW */}
            <Link href="/offers/referral-race">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="relative overflow-hidden rounded-2xl border border-violet-500/20 p-3.5 cursor-pointer hover:border-violet-500/35 transition-all"
                    style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15) 0%, #0a1a0f 100%)" }}
                >
                    <span className="text-[8px] font-black uppercase tracking-[0.18em] text-violet-400 mb-1 block">Competition</span>
                    <h4 className="text-sm font-bold text-white leading-tight">Referral</h4>
                    <p className="text-[10px] text-gray-500 mb-3">50K YTP Pool</p>
                    <span className="w-full flex items-center justify-center gap-1.5 bg-violet-500/12 text-violet-400 text-[10px] font-bold py-1.5 rounded-lg border border-violet-500/20">
                        <Trophy size={10} /> Compete
                    </span>
                </motion.div>
            </Link>

            {/* Early Bird — NEW */}
            <Link href="/offers/early-bird-bonus">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-2xl border border-sky-500/20 p-3.5 cursor-pointer hover:border-sky-500/35 transition-all"
                    style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.15) 0%, #0a1a0f 100%)" }}
                >
                    <span className="text-[8px] font-black uppercase tracking-[0.18em] text-sky-400 mb-1 block">Limited</span>
                    <h4 className="text-sm font-bold text-white leading-tight">Early Bird</h4>
                    <p className="text-[10px] text-gray-500 mb-3">+5% Bonus</p>
                    <span className="w-full flex items-center justify-center gap-1.5 bg-sky-500/12 text-sky-400 text-[10px] font-bold py-1.5 rounded-lg border border-sky-500/20">
                        <Rocket size={10} /> Claim
                    </span>
                </motion.div>
            </Link>
        </div>
    </section>
);

export default HotOffers;

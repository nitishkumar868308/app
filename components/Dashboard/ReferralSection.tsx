"use client";

import { motion } from "framer-motion";
import { Users, Copy, Share2 } from "lucide-react";

const ReferralSection = () => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl bg-[#0a1a0f]/80 border border-emerald-500/15 p-4"
        >
            {/* Background glow */}
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/6 rounded-full blur-[50px] pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold flex items-center gap-1.5">
                        <Users size={11} className="text-emerald-400" />
                        Referral Program
                    </p>
                </div>

                {/* Main content */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wide">Invite Friends</h3>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed max-w-[160px]">
                            Share your link and earn rewards for every successful referral.
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400/70 block mb-0.5">Limited Reward</span>
                        <div className="bg-emerald-500/15 border border-emerald-500/25 rounded-xl px-3 py-2 text-center">
                            <span className="text-2xl font-black text-emerald-400">+10</span>
                            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider leading-tight">YTP per<br/>friend</p>
                        </div>
                    </div>
                </div>

                {/* CTA buttons */}
                <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold py-2.5 rounded-xl border border-emerald-500/20 transition-all">
                        <Copy size={12} /> Copy Invite Link
                    </button>
                    <button className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                        <Share2 size={12} /> Share
                    </button>
                </div>
            </div>
        </motion.section>
    );
};

export default ReferralSection;

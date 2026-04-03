"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
    {
        tier: "LEARNER",
        tagline: "Start your journey",
        apy: "30%",
        minStake: "500 YTP",
        referral: "30% P.A.",
        locking: "7 Days",
        hike: "+0%",
        subPrice: "$0",
        featured: false,
    },
    {
        tier: "EARNER",
        tagline: "Boost your earnings",
        apy: "40%",
        minStake: "10k YTP",
        referral: "40% P.A.",
        locking: "60 Days",
        hike: "+40%",
        subPrice: "$2",
        featured: true,
    },
    {
        tier: "TRAVELER",
        tagline: "Unlock premium rewards",
        apy: "50%",
        minStake: "20k YTP",
        referral: "50% P.A.",
        locking: "100 Days",
        hike: "+50%",
        subPrice: "$5",
        featured: false,
    },
];

const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
        <span className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">{label}</span>
        <span className="text-[11px] font-bold text-gray-300">{value}</span>
    </div>
);

const StakingPlans = () => (
    <section>
        <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                High Yield Staking
            </p>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold tracking-wider">
                LIVE · UP TO 50% APY
            </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plans.map((plan, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -3 }}
                    className={`relative flex flex-col rounded-2xl p-4 border transition-all duration-200 ${
                        plan.featured
                            ? "border-emerald-400/35 shadow-[0_0_28px_rgba(16,185,129,0.1)]"
                            : "border-white/6 hover:border-emerald-500/20"
                    }`}
                    style={{
                        background: plan.featured
                            ? "linear-gradient(160deg, rgba(16,185,129,0.12) 0%, #0d1f12 40%, #0a1a0f 100%)"
                            : "rgba(10,26,15,0.6)",
                    }}
                >
                    {/* BEST badge */}
                    {plan.featured && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-emerald-400 to-green-500 text-black text-[9px] font-black px-3 py-0.5 rounded-full tracking-widest shadow-lg shadow-emerald-500/30 z-10">
                            BEST
                        </span>
                    )}

                    {/* Tier */}
                    <div className="mb-3 pt-1">
                        <h3 className={`text-xs font-black tracking-widest uppercase ${plan.featured ? "text-emerald-300" : "text-white/80"}`}>
                            {plan.tier}
                        </h3>
                        <p className="text-[10px] text-gray-600 mt-0.5">{plan.tagline}</p>
                    </div>

                    {/* APY */}
                    <div className="mb-4">
                        <span className="text-[9px] text-gray-600 uppercase tracking-wider">APY</span>
                        <p className={`text-3xl font-black leading-none mt-0.5 ${plan.featured ? "text-emerald-400" : "text-emerald-500/80"}`}>
                            {plan.apy}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 mb-4 space-y-0">
                        <Row label="Min. Stake" value={plan.minStake} />
                        <Row label="Referral"   value={plan.referral}  />
                        <Row label="Locking"    value={plan.locking}   />
                        <Row label="Hike"       value={plan.hike}      />
                    </div>

                    {/* CTA */}
                    <Link href="/staking">
                        <button
                            className={`w-full py-2.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200 ${
                                plan.featured
                                    ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.25)]"
                                    : "bg-white/5 border border-emerald-500/15 text-emerald-500/80 hover:bg-emerald-500/10 hover:text-emerald-400"
                            }`}
                        >
                            Sub: {plan.subPrice} · Stake Now
                        </button>
                    </Link>
                </motion.div>
            ))}
        </div>
    </section>
);

export default StakingPlans;

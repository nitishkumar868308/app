"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useStaking } from "@/context/StakingContext";
import { SectionLoader } from "@/components/Include/Loader";

const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
        <span className="text-[13px] text-gray-600 uppercase tracking-wider font-medium">{label}</span>
        <span className="text-xs font-bold text-gray-300">{value}</span>
    </div>
);

const StakingPlans = () => {
    const { plans, loading } = useStaking();

    if (loading && plans.length === 0) {
        return (
            <section>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[13px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                        High Yield Staking
                    </p>
                </div>
                <SectionLoader />
            </section>
        );
    }

    if (plans.length === 0) return null;

    const maxApy = Math.max(...plans.map((p) => p.per_annum));

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                    High Yield Staking
                </p>
                {/* <span className="text-[12px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold tracking-wider">
                    LIVE · UP TO {maxApy}% APY
                </span> */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.map((plan, i) => {
                    // Middle card (index 1) is featured when exactly 3 plans
                    const featured = plans.length === 3 ? i === 1 : plan.per_annum === maxApy;

                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            whileHover={{ y: -3 }}
                            className={`relative flex flex-col rounded-2xl p-4 border transition-all duration-200 ${
                                featured
                                    ? "border-emerald-400/35 shadow-[0_0_28px_rgba(16,185,129,0.1)]"
                                    : "border-white/6 hover:border-emerald-500/20"
                            }`}
                            style={{
                                background: featured
                                    ? "linear-gradient(160deg, rgba(16,185,129,0.12) 0%, #0d1f12 40%, #0a1a0f 100%)"
                                    : "rgba(10,26,15,0.6)",
                            }}
                        >
                            {featured && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-emerald-400 to-green-500 text-black text-[13px] font-black px-3 py-0.5 rounded-full tracking-widest shadow-lg shadow-emerald-500/30 z-10">
                                    BEST
                                </span>
                            )}

                            <div className="mb-3 pt-1">
                                <h3 className={`text-sm font-black tracking-widest uppercase ${featured ? "text-emerald-300" : "text-white/80"}`}>
                                    {plan.name}
                                </h3>
                                {/* <p className="text-[12px] text-gray-600 mt-0.5">{plan.description}</p> */}
                            </div>

                            <div className="mb-4">
                                <span className="text-[12px] text-gray-600 uppercase tracking-wider">Yearly</span>
                                <p className={`text-3xl font-black leading-none mt-0.5 ${featured ? "text-emerald-400" : "text-emerald-500/80"}`}>
                                    {plan.per_annum}%
                                </p>
                            </div>

                            <div className="flex-1 mb-4 space-y-0">
                                <Row label="Min. Stake" value={`${plan.min_stake.toLocaleString()} YTP`} />
                                <Row label="Referral"   value={`${plan.referral_reward}% P.A.`} />
                                <Row label="Locking"    value={`${plan.validity} Days`} />
                                {plan.staking_hike > 0 && (
                                    <Row label="Hike" value={`+${plan.staking_hike}%`} />
                                )}
                            </div>

                            <Link href={`/stakingSummry?plan=${plan.name}`}>
                                <button
                                    className={`w-full py-2.5 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-200 ${
                                        featured
                                            ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.25)]"
                                            : "bg-white/5 border border-emerald-500/15 text-emerald-500/80 hover:bg-emerald-500/10 hover:text-emerald-400"
                                    }`}
                                >
                                    {/* Sub: {plan.price === 0 ? "Free" : `$${plan.price}`} · Stake Now */}Start Now
                                </button>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
};

export default StakingPlans;

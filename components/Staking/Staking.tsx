import React from 'react';
import { ShieldCheck, Zap, Globe, ArrowRight, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface StakingCardProps {
    title: string;
    icon: LucideIcon;
    apy: number | string;
    minStake: number | string;
    referral?: string | number;
    lockPeriod?: string;
    hike?: string;
    cost?: string | number;
    highlight?: boolean;
}

const StakingCard: React.FC<StakingCardProps> = ({
    title,
    icon: Icon,
    apy,
    minStake,
    referral,
    lockPeriod,
    hike,
    cost,
    highlight,
}) => {
    return (
        <div
            className={`relative flex flex-col p-8 rounded-[2rem] border transition-all duration-500 hover:-translate-y-3 ${highlight
                ? 'bg-gradient-to-br from-blue-600/20 to-blue-900/10 border-blue-500 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]'
                : 'bg-[#121212] border-slate-800 hover:border-slate-600 shadow-2xl'
                }`}
        >
            {highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-blue-500/50">
                    Best Choice
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div
                    className={`p-3 rounded-2xl ${highlight ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                >
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                    <div
                        className={`h-1 w-8 rounded-full mt-1 ${highlight ? 'bg-blue-500' : 'bg-slate-700'}`}
                    ></div>
                </div>
            </div>

            {/* Yield Info */}
            <div className="mb-8">
                <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-black tracking-tighter ${highlight ? 'text-white' : 'text-slate-100'}`}>
                        {apy}
                    </span>
                    <span className="text-blue-500 font-bold text-lg">P.A.</span>
                </div>
                <p className="text-slate-400 text-sm mt-2 font-medium uppercase tracking-widest opacity-60">
                    Annual Yield
                </p>
            </div>

            {/* Stats List */}
            <div className="space-y-5 mb-10">
                {[
                    { label: 'Minimum Stake', value: `${minStake} YTP` },
                    { label: 'Referral Bonus', value: referral },
                    { label: 'Locking Period', value: lockPeriod },
                    { label: 'Staking Hike', value: hike, color: 'text-green-400' },
                ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center group">
                        <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                            {item.label}
                        </span>
                        <span className={`font-bold text-sm ${item.color || 'text-slate-100'}`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer & CTA */}
            <div className={`mt-auto pt-6 border-t ${highlight ? 'border-blue-500/30' : 'border-slate-800'}`}>
                <div className="flex justify-between items-center mb-6 px-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Sub. Cost</span>
                    <span className="text-xl font-black text-white">{cost === '$ 0' ? 'FREE' : cost}</span>
                </div>

                <Link href="/stakingSummry">
                    <button
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${highlight
                            ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_10px_20px_-5px_rgba(59,130,246,0.5)]'
                            : 'bg-white hover:bg-slate-200 text-black'
                            }`}
                    >
                        Stake Now <ArrowRight size={18} strokeWidth={3} />
                    </button>
                </Link>
            </div>
        </div>
    );
};

// ---- Separate Staking Component ----
const Staking: React.FC = () => {
    const plans = [
        { title: 'LEARNER', icon: ShieldCheck, apy: '30%', minStake: '500', referral: '30% P.A.', lockPeriod: '7 days', hike: '+0%', cost: '$ 0', highlight: false },
        { title: 'EARNER', icon: Zap, apy: '40%', minStake: '10000', referral: '40% P.A.', lockPeriod: '50 days', hike: '+40%', cost: '$ 2', highlight: true },
        { title: 'TRAVELER', icon: Globe, apy: '50%', minStake: '20000', referral: '50% P.A.', lockPeriod: '100 days', hike: '+50%', cost: '$ 5', highlight: false },
    ];

    return (
        <section className="bg-[#000] py-6 px-6 font-sans selection:bg-blue-500 selection:text-white">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                        Smart <span className="text-blue-500 text-glow">Staking</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Choose your tier and start generating passive rewards. Premium assets deserve premium yields.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                    {plans.map((plan, index) => (
                        <StakingCard key={index} {...plan} />
                    ))}
                </div>
            </div>

            {/* Background Decor */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] -z-10 rounded-full"></div>
            <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] -z-10 rounded-full"></div>
        </section>
    );
};

export default Staking;
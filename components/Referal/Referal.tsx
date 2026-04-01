import React from 'react';
import { Share2, Copy, Users, TrendingUp, Smartphone, Zap, Award, ChevronRight } from 'lucide-react';

const ReferralPage = () => {
    const referrals = [
        { id: 1, name: "Rahul S.", date: "28 Mar 2026", status: "Active", reward: "+5% APY" },
        { id: 2, name: "Priya K.", date: "25 Mar 2026", status: "Pending KYC", reward: "Pending" },
    ];

    return (
        <div className=" bg-black text-white p-4 md:p-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* --- 1. HERO SECTION: Benefit & Progress --- */}
                <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black rounded-[2rem] p-8 border border-zinc-800 text-center shadow-2xl">
                    {/* Neon Glow effect */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-green-500/10 rounded-full blur-[100px]"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                            <Zap size={14} fill="currentColor" /> Growth Machine
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                            Boost Your Earnings <span className="text-green-500">10x</span>
                        </h2>
                        <p className="text-zinc-400 mt-4 max-w-lg mx-auto">
                            Invite 3 more friends to unlock the <span className="text-white font-bold italic">Super Booster (500% APY)</span>.
                        </p>

                        {/* Premium Progress Bar */}
                        <div className="mt-8 max-w-2xl mx-auto">
                            <div className="flex justify-between mb-3 text-sm font-medium">
                                <span className="text-zinc-500 italic">Current: 100%</span>
                                <span className="text-green-400 font-bold">Target: 500% APY</span>
                            </div>
                            <div className="w-full bg-zinc-800 h-3 rounded-full p-0.5 border border-zinc-700">
                                <div className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-1000" style={{ width: '40%' }}></div>
                            </div>
                            <div className="flex justify-between mt-3 text-[10px] md:text-xs font-bold text-zinc-600 uppercase tracking-tighter">
                                <span>0 Friends</span>
                                <span className="text-green-500/50">5 Friends (Unlock)</span>
                                <span>10+ Friends</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 2. ACTION & STATS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Referral Code Box (7 Cols on Desktop) */}
                    <div className="md:col-span-7 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 flex flex-col justify-between backdrop-blur-sm">
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Share Your Secret Code
                            </h3>
                            <div className="flex items-center gap-4 bg-black border border-zinc-700 p-4 rounded-2xl group hover:border-green-500/50 transition-all">
                                <div className="flex-1">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Referral Code</p>
                                    <span className="text-2xl md:text-3xl font-mono font-bold text-white tracking-widest">INDIA2026</span>
                                </div>
                                <button className="bg-zinc-800 hover:bg-green-600 p-4 rounded-xl transition-all group-hover:scale-105 active:scale-95">
                                    <Copy size={24} className="text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button className="bg-green-600 hover:bg-green-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(22,163,74,0.2)] transition-all">
                                    <Share2 size={20} /> INVITE NOW
                                </button>
                                <button className="border-2 border-zinc-700 hover:border-white text-white font-bold py-4 rounded-2xl transition-all">
                                    Custom Link
                                </button>
                            </div>

                            {/* Socials */}
                            <div className="flex items-center justify-center gap-8 py-2">
                                <Smartphone className="cursor-pointer text-zinc-600 hover:text-green-500 transition-colors" size={22} />
                                <TrendingUp className="cursor-pointer text-zinc-600 hover:text-blue-400 transition-colors" size={22} />
                                <Users className="cursor-pointer text-zinc-600 hover:text-blue-600 transition-colors" size={22} />
                            </div>
                        </div>
                    </div>

                    {/* Earnings Summary (5 Cols on Desktop) */}
                    <div className="md:col-span-5 bg-gradient-to-b from-green-600 to-green-800 rounded-[2rem] p-8 text-black relative overflow-hidden group shadow-2xl">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <Award size={40} className="mb-4 opacity-80" />
                                <h3 className="text-black/60 text-sm font-black uppercase">Total Earned</h3>
                                <div className="text-5xl font-black mt-1">50.00 <span className="text-lg">YTP</span></div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="bg-black/10 backdrop-blur-md p-4 rounded-2xl border border-black/5">
                                    <p className="text-[10px] font-bold uppercase opacity-60 text-black">Friends</p>
                                    <p className="text-2xl font-black">05</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-bold uppercase opacity-60 text-black">Boost</p>
                                    <p className="text-2xl font-black">+5%</p>
                                </div>
                            </div>
                        </div>
                        {/* Decoration */}
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                </div>

                {/* --- 3. MILESTONES & HISTORY --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Milestone Table */}
                    <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 shadow-xl">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <Zap size={18} className="text-green-500" /> APY Milestones
                        </h3>
                        <div className="space-y-4">
                            {[
                                { range: "1-5 Friends", apy: "100%", color: "text-zinc-400" },
                                { range: "6-10 Friends", apy: "500%", color: "text-green-400" },
                                { range: "10+ Friends", apy: "1000%", color: "text-green-500 font-black animate-pulse" }
                            ].map((m, i) => (
                                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-black border border-zinc-800 hover:border-zinc-600 transition-all">
                                    <span className="text-xs font-bold uppercase text-zinc-500">{m.range}</span>
                                    <span className={`text-sm font-bold ${m.color}`}>{m.apy} APY</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 shadow-xl overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Recent Referrals</h3>
                            <button className="text-xs text-green-500 font-bold flex items-center gap-1 hover:underline">View All <ChevronRight size={14} /></button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-800">
                                        <th className="pb-4 font-bold">User</th>
                                        <th className="pb-4 font-bold">Date</th>
                                        <th className="pb-4 font-bold text-center">Status</th>
                                        <th className="pb-4 font-bold text-right">Reward</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {referrals.map((user) => (
                                        <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="py-5 font-bold text-zinc-200">{user.name}</td>
                                            <td className="py-5 text-zinc-500 text-xs">{user.date}</td>
                                            <td className="py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.status === 'Active'
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="py-5 text-right font-mono font-bold text-green-400">{user.reward}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="bg-zinc-900/30 p-6 rounded-2xl border border-dashed border-zinc-800">
                    <p className="text-center text-[10px] text-zinc-500 leading-relaxed uppercase tracking-widest">
                        *Rewards are credited after KYC verification. APY Boost is valid for 30 days. <br />
                        <span className="text-white hover:text-green-500 cursor-pointer underline transition-colors">Read Full Referral Policy & Terms</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReferralPage;
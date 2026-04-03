"use client";
import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const YatriPayPage = () => {
    const ticks = [
        { name: 'YTP', p: '₹0.78', c: '+4.2%', u: true },
        { name: 'BTC', p: '₹58.2L', c: '-1.2%', u: false },
        { name: 'ETH', p: '₹2.4L', c: '+0.8%', u: true },
    ];

    const chartData = {
        labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        datasets: [{
            data: [0.65, 0.68, 0.66, 0.72, 0.70, 0.75, 0.78],
            borderColor: '#00C896',
            backgroundColor: (context: any) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 150);
                gradient.addColorStop(0, 'rgba(0,200,150,0.3)');
                gradient.addColorStop(1, 'rgba(0,200,150,0)');
                return gradient;
            },
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } },
    };

    return (
        <div className="bg-[#040705] text-[#ECEEF8] font-sans selection:bg-[#00C896] selection:text-black">

            {/* TICKER - Full Width */}
            <div className="bg-[#060A08] border-b border-[#1F2E26] py-2 overflow-hidden">
                <div className="flex w-max animate-marquee">
                    {[...ticks, ...ticks, ...ticks].map((t, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 px-4 sm:px-6 border-r border-[#1F2E26] shrink-0"
                        >
                            <span className="text-[10px] sm:text-[11px] font-extrabold">
                                {t.name}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-mono text-[#94A39A]">
                                {t.p}
                            </span>
                            <span
                                className={`text-[9px] sm:text-[10px] font-extrabold ${t.u ? 'text-[#00C896]' : 'text-[#F0465A]'
                                    }`}
                            >
                                {t.c}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN CONTAINER - Desktop mein width badh jayegi */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-[120px]">

                {/* TOPBAR */}
                <header className="sticky top-0 z-[100] bg-[#040705]/80 backdrop-blur-md border-b border-[#1F2E26] py-4 flex justify-between items-center mb-6">
                    <div className="text-2xl font-[800] tracking-tight">
                        {/* Yatri<span className="text-[#00C896]">Pay</span> */}
                        <img src="/logo.png" alt="Logo1" className="w-40 h-10" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right mr-2">
                            <p className="text-[10px] text-[#5C6E64] font-bold">Welcome,</p>
                            <p className="text-xs font-bold text-[#00C896]">Nitish Kumar</p>
                        </div>
                        <div className="w-10 h-10 bg-[#111A15] border border-[#1F2E26] rounded-xl flex items-center justify-center cursor-pointer hover:border-[#00C896] transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00C896] to-[#006B4F] rounded-xl shadow-lg shadow-[#00C896]/20"></div>
                    </div>
                </header>

                {/* DESKTOP GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN: HERO & QUICK ACTIONS (8/12 on desktop) */}
                    <div className="lg:col-span-8 space-y-6">
                        <section className="rounded-[32px] bg-gradient-to-br from-[#0D1E16] via-[#07120D] to-[#040705] border border-[#2A3D33] p-8 shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-xs text-[#94A39A] font-bold tracking-widest uppercase mb-2">Total Net Worth</p>
                                <div className="text-5xl md:text-6xl font-extrabold font-mono tracking-tighter text-white mb-4">₹4,250.00</div>
                                <div className="flex items-center gap-3">
                                    <span className="bg-[#00C896]/10 text-[#00C896] px-3 py-1 rounded-full text-sm font-bold border border-[#00C896]/20">+₹142.50</span>
                                    <span className="text-sm text-[#5C6E64] font-medium">Profit last 24h</span>
                                </div>
                            </div>
                            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#00C896]/5 blur-[100px] rounded-full"></div>
                        </section>

                        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                {
                                    label: 'KYC',
                                    icon: (
                                        <>
                                            <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
                                            <path d="M9 12l2 2 4-4" />
                                        </>
                                    )
                                },
                                {
                                    label: 'Bank Details',
                                    icon: (
                                        <>
                                            <rect x="2" y="6" width="20" height="12" rx="2" />
                                            <path d="M2 10h20" />
                                            <circle cx="16" cy="14" r="1" />
                                        </>
                                    )
                                },
                                {
                                    label: 'Add Fund',
                                    icon: (
                                        <>
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 8v8M8 12h8" />
                                        </>
                                    )
                                },
                                {
                                    label: 'Buy Asset',
                                    icon: (
                                        <>
                                            <path d="M3 7h18l-2 10H5L3 7z" />
                                            <path d="M16 7a4 4 0 10-8 0" />
                                        </>
                                    )
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-[#111A15] border border-[#1F2E26] p-4 rounded-[24px] flex items-center gap-4 hover:border-[#00C896] transition-all cursor-pointer group">
                                    <div className="w-12 h-12 bg-[#040705] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2">{item.icon}</svg>
                                    </div>
                                    <span className="font-bold text-sm text-[#94A39A] group-hover:text-white">{item.label}</span>
                                </div>
                            ))}
                        </section>

                        <div className="p-4 bg-black ">
                            <div className="space-y-4">
                                <h2 className="text-xs font-bold text-[#5C6E64] uppercase tracking-widest ml-2">High Yield Staking</h2>

                                {/* Grid Container: Mobile par 1 column, Desktop par 3 columns */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* 1. LEARNER PLAN */}
                                    <div className="bg-[#111A15] border-[1.2px] border-[#5C6E64]/30 rounded-[24px] p-5 flex flex-col justify-between hover:border-[#00C896] transition-all group">
                                        <div>
                                            <h3 className="text-lg font-black text-white">LEARNER</h3>
                                            <p className="text-[10px] text-[#5C6E64] mb-4">Start your journey</p>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] text-[#5C6E64] font-bold">APY</span>
                                                    <span className="text-2xl font-black text-[#00C896] leading-none">30%</span>
                                                </div>
                                                <div className="h-[1px] bg-[#5C6E64]/20 w-full" />
                                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                    <div><p className="text-[#5C6E64]">Min. Stake</p><p className="font-bold text-white">500 YTP</p></div>
                                                    <div className="text-right"><p className="text-[#5C6E64]">Referral</p><p className="font-bold text-white">30% P.A.</p></div>
                                                    <div><p className="text-[#5C6E64]">Locking</p><p className="font-bold text-white">7 Days</p></div>
                                                    <div className="text-right"><p className="text-[#5C6E64]">Hike</p><p className="font-bold text-[#00C896]">+0%</p></div>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white hover:text-black transition-all">
                                            Sub: $0 • Stake Now
                                        </button>
                                    </div>

                                    {/* 2. EARNER PLAN (Featured/Bestseller) */}
                                    <div className="bg-[#111A15] border-[1.5px] border-[#00C896] rounded-[24px] p-5 flex flex-col justify-between relative overflow-hidden group shadow-[0_0_30px_rgba(0,200,150,0.1)]">
                                        <div className="absolute top-0 right-0 bg-[#00C896] text-black text-[9px] font-black px-3 py-1 rounded-bl-lg">BEST</div>
                                        <div>
                                            <h3 className="text-lg font-black text-white">EARNER</h3>
                                            <p className="text-[10px] text-[#5C6E64] mb-4">Boost your earnings</p>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] text-[#5C6E64] font-bold">APY</span>
                                                    <span className="text-2xl font-black text-[#00C896] leading-none">40%</span>
                                                </div>
                                                <div className="h-[1px] bg-[#00C896]/20 w-full" />
                                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                    <div><p className="text-[#5C6E64]">Min. Stake</p><p className="font-bold text-white">10k YTP</p></div>
                                                    <div className="text-right"><p className="text-[#5C6E64]">Referral</p><p className="font-bold text-white">40% P.A.</p></div>
                                                    <div><p className="text-[#5C6E64]">Locking</p><p className="font-bold text-white">50 Days</p></div>
                                                    <div className="text-right"><p className="text-[#5C6E64]">Hike</p><p className="font-bold text-[#00C896]">+40%</p></div>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="w-full py-3 rounded-xl bg-[#00C896] text-black font-black text-sm group-hover:shadow-[0_0_15px_rgba(0,200,150,0.4)] transition-all">
                                            Sub: $2 • Stake Now
                                        </button>
                                    </div>

                                    {/* 3. TRAVELER PLAN */}
                                    <div className="bg-[#111A15] border-[1.2px] border-[#5C6E64]/30 rounded-[24px] p-5 flex flex-col justify-between hover:border-[#00C896] transition-all group">
                                        <div>
                                            <h3 className="text-lg font-black text-white">TRAVELER</h3>
                                            <p className="text-[10px] text-[#5C6E64] mb-4">Unlock premium rewards</p>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] text-[#5C6E64] font-bold">APY</span>
                                                    <span className="text-2xl font-black text-[#00C896] leading-none">50%</span>
                                                </div>
                                                <div className="h-[1px] bg-[#5C6E64]/20 w-full" />
                                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                    <div><p className="text-[#5C6E64]">Min. Stake</p><p className="font-bold text-white">20k YTP</p></div>
                                                    <div className="text-right"><p className="text-[#5C6E64]">Referral</p><p className="font-bold text-white">50% P.A.</p></div>
                                                    <div><p className="text-[#5C6E64]">Locking</p><p className="font-bold text-white">100 Days</p></div>
                                                    <div className="text-right"><p className="text-[#5C6E64]">Hike</p><p className="font-bold text-[#00C896]">+50%</p></div>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white hover:text-black transition-all">
                                            Sub: $5 • Stake Now
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>


                    </div>

                    {/* RIGHT COLUMN: OFFERS & STAKING (4/12 on desktop) */}
                    <div className="lg:col-span-4 space-y-6">

                        <div className="space-y-5">

                            <h2 className="text-xs font-bold text-[#7A8F85] uppercase tracking-widest ml-2 flex items-center gap-2">
                                <span className="animate-pulse">🔥</span> Hot Offers
                            </h2>

                            <div className="space-y-4">

                                {/* MAIN CARD */}
                                <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-[#F5A623] via-[#FFD580] to-transparent group cursor-pointer transition-all duration-500 hover:scale-[1.03]">

                                    <div className="relative rounded-3xl p-6 h-48 bg-[#050706]/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden">

                                        {/* Animated Glow */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
                                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#F5A623]/20 blur-[100px]" />
                                        </div>

                                        {/* TOP */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[11px] text-[#F5A623] font-semibold tracking-widest">
                                                    EXCLUSIVE DROP
                                                </p>
                                                <h3 className="text-2xl font-extrabold leading-tight mt-1">
                                                    Staking Pass
                                                </h3>
                                                <p className="text-sm text-[#AAB8B0] mt-1">
                                                    Unlock <span className="text-white font-bold">10,000 YTP</span>
                                                </p>
                                            </div>

                                            {/* Badge */}
                                            <span className="text-[10px] bg-[#F5A623] text-black px-3 py-1 rounded-full font-bold animate-pulse">
                                                LIVE
                                            </span>
                                        </div>

                                        {/* CTA */}
                                        <button className="relative overflow-hidden bg-[#F5A623] text-black text-xs font-extrabold px-6 py-3 rounded-xl w-fit transition-all duration-300 hover:scale-105">

                                            <span className="relative z-10">Claim Reward →</span>

                                            {/* Shine effect */}
                                            <span className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                                        </button>

                                    </div>
                                </div>


                                {/* SMALL CARDS */}
                                <div className="grid grid-cols-2 gap-4">

                                    {/* Giveaway */}
                                    <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-[#00C896] to-transparent group cursor-pointer hover:scale-[1.04] transition">

                                        <div className="rounded-2xl p-4 h-36 bg-[#06110D]/90 backdrop-blur-xl flex flex-col justify-between">

                                            <p className="text-[10px] text-[#00C896] font-semibold tracking-wide">
                                                🎁 GIVEAWAY
                                            </p>

                                            <p className="text-sm font-bold leading-tight">
                                                Win <span className="text-white">iPhone</span> <br /> Lucky Draw
                                            </p>

                                            <button className="bg-[#00C896] text-black text-[11px] font-bold py-2 rounded-lg transition hover:scale-105">
                                                Join Now
                                            </button>
                                        </div>
                                    </div>

                                    {/* APY Boost */}
                                    <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-[#F0465A] to-transparent group cursor-pointer hover:scale-[1.04] transition">

                                        <div className="rounded-2xl p-4 h-36 bg-[#140708]/90 backdrop-blur-xl flex flex-col justify-between">

                                            <p className="text-[10px] text-[#F0465A] font-semibold tracking-wide">
                                                ⚡ BOOST
                                            </p>

                                            <p className="text-sm font-bold leading-tight">
                                                Up to <span className="text-white">1000% APY</span>
                                            </p>

                                            <button className="bg-white text-black text-[11px] font-bold py-2 rounded-lg transition hover:scale-105">
                                                Activate
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Section Header */}
                            <h2 className="text-xs font-bold text-[#5C6E64] uppercase tracking-widest ml-2">Referral Program</h2>

                            {/* Invite Card */}
                            <div className="bg-[#111A15] border-[1.5px] border-[#00C896] rounded-[28px] p-6 relative overflow-hidden group transition-all duration-300">

                                {/* Top Badge */}
                                <div className="absolute top-0 right-0 bg-[#00C896] text-black text-[10px] font-black px-4 py-1 rounded-bl-xl">
                                    LIMITED REWARD
                                </div>

                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold">INVITE FRIENDS</h3>
                                        <p className="text-xs text-[#5C6E64] mt-1 leading-relaxed">
                                            Share your link and earn rewards <br />
                                            for every successful referral.
                                        </p>
                                    </div>

                                    {/* Reward Visual */}
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-[#00C896] font-mono">+10</div>
                                        <div className="text-[10px] font-bold text-[#00C896]/60 uppercase tracking-tighter">YTP PER FRIEND</div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button className="w-full py-4 rounded-2xl bg-[#00C896] text-black font-black flex justify-between px-6 group-hover:shadow-[0_0_20px_rgba(0,200,150,0.4)] transition-all active:scale-[0.98]">
                                    <span className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" />
                                        </svg>
                                        Copy Invite Link
                                    </span>
                                    <span>Share →</span>
                                </button>

                                {/* Decorative background circle (optional) */}
                                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#00C896]/5 rounded-full blur-2xl group-hover:bg-[#00C896]/10 transition-all"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CHART SECTION */}
                <section className="bg-[#0A0F0C] border border-[#1F2E26] rounded-[32px] p-6 mt-10">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-sm font-bold text-[#5C6E64] uppercase tracking-widest mb-1">Market Analytics</h2>
                            <div className="text-3xl font-bold font-mono">₹0.7165 <span className="text-[#00C896] text-sm ml-2">↑ 2.4%</span></div>
                        </div>
                        <div className="flex gap-2 bg-[#111A15] p-1 rounded-xl">
                            <button className="px-4 py-1.5 bg-[#00C896] text-black text-xs font-bold rounded-lg">1W</button>
                            <button className="px-4 py-1.5 text-[#5C6E64] text-xs font-bold rounded-lg">1M</button>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </section>

                {/* BOTTOM NAV - Only visible on small screens */}
                <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#040705]/95 backdrop-blur-xl border-t border-[#1F2E26] flex justify-around py-4 pb-8 z-[1000]">
                    <a href="#" className="flex flex-col items-center gap-1 text-[10px] font-bold text-[#00C896]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                        Home
                    </a>
                    <a href="#" className="flex flex-col items-center gap-1 text-[10px] font-bold text-[#5C6E64]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M16 8l-4 4-4-4" /></svg>
                        Stake
                    </a>
                    <a href="#" className="flex flex-col items-center gap-1 text-[10px] font-bold text-[#5C6E64]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        Profile
                    </a>
                </nav>

                {/* SIDE NAV / HEADER NAV - Visible on desktop */}
                <div className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#111A15]/80 backdrop-blur-2xl border border-[#2A3D33] px-8 py-4 rounded-full gap-12 z-[1000] shadow-2xl">
                    <a href="#" className="text-sm font-bold text-[#00C896] hover:text-[#00C896] transition-colors">Dashboard</a>
                    <a href="#" className="text-sm font-bold text-[#5C6E64] hover:text-white transition-colors">Exchange</a>
                    <a href="#" className="text-sm font-bold text-[#5C6E64] hover:text-white transition-colors">Staking</a>
                    <a href="#" className="text-sm font-bold text-[#5C6E64] hover:text-white transition-colors">Wallet</a>
                    <a href="#" className="text-sm font-bold text-[#5C6E64] hover:text-white transition-colors">Settings</a>
                </div>

            </div>

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                body {
                    background-color: #040705;
                }
            `}</style>
        </div>
    );
};

export default YatriPayPage;
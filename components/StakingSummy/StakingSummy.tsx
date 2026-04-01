"use client";
import React, { useState } from "react";
import {
    Wallet, Users, Database, PieChart, Info,
    Clock, ShieldCheck, Zap, Globe,
    ArrowRight, Receipt
} from "lucide-react";

const StakingSummary = () => {
    const [agreed, setAgreed] = useState(false);
    const [autoStake, setAutoStake] = useState(false);
    const [amount, setAmount] = useState("");

    const stats = [
        { label: "Subscribers", value: "766", icon: Users, color: "text-purple-400" },
        { label: "Staked", value: "6.4M", icon: Database, color: "text-green-400" },
        { label: "Quota", value: "103M", icon: PieChart, color: "text-orange-400" },
    ];

    const plans = [
        { id: "LEARNER", icon: ShieldCheck, apy: "30%" },
        { id: "EARNER", icon: Zap, apy: "40%" },
        { id: "TRAVELER", icon: Globe, apy: "50%" },
    ];

    const selectedPlan = "EARNER";

    return (
        <div className="bg-[#050505]  font-sans text-slate-300 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* --- Top Stats --- */}
                <div className="flex flex-wrap gap-4 justify-between">
                    <div className="flex-1 min-w-[140px] bg-[#111] border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                        <Wallet className="text-blue-400" size={18} />
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">Balance</p>
                            <p className="text-sm font-extrabold text-white">966.01 YTP</p>
                        </div>
                    </div>
                    {stats.map((s, i) => (
                        <div key={i} className="flex-1 min-w-[120px] bg-[#111] border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                            <s.icon className={`${s.color}`} size={18} />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">{s.label}</p>
                                <p className="text-sm font-extrabold text-white">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* --- Left: Configuration --- */}
                    <div className="bg-[#0A0A0A] border border-slate-900 rounded-3xl p-6 space-y-6">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                            Subscription Type
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                            {plans.map((plan) => (
                                <div key={plan.id} className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${selectedPlan === plan.id ? 'border-blue-500 bg-blue-500/10 shadow-md' : 'border-slate-900 opacity-40'}`}>
                                    <plan.icon size={20} className="mx-auto mb-1 text-blue-400" />
                                    <p className="text-[10px] font-bold text-white tracking-tight">{plan.id}</p>
                                    <p className="text-[11px] font-extrabold text-blue-400">{plan.apy}</p>
                                </div>
                            ))}
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                <span>Lock Amount</span>
                                <span>Min: 10,000 YTP</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-black border border-slate-800 rounded-2xl py-4 px-5 text-xl font-extrabold text-white focus:outline-none focus:border-blue-500"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button className="bg-slate-800 hover:bg-slate-700 text-[10px] px-2 py-1 rounded font-bold">MAX</button>
                                    <span className="text-sm font-bold text-slate-600 tracking-tighter">YTP</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-[9px] font-medium text-slate-500 px-1">
                                <span>Quota: 103,111,642.10 YTP</span>
                                <span>Max: 20,000 YTP</span>
                            </div>
                        </div>

                        {/* Quick Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/40 border border-slate-900 p-3 rounded-2xl flex items-center gap-3 shadow-sm">
                                <Clock size={16} className="text-blue-400" />
                                <div>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Duration</p>
                                    <p className="text-xs font-extrabold text-white uppercase">50 Days</p>
                                </div>
                            </div>
                            <div className="bg-black/40 border border-slate-900 p-3 rounded-2xl flex items-center gap-3 shadow-sm">
                                <Info size={16} className="text-orange-400" />
                                <div>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Limitation</p>
                                    <p className="text-xs font-extrabold text-white uppercase tracking-tighter">AI Protect</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Right: Summary --- */}
                    <div className="bg-[#0A0A0A] border border-slate-800 rounded-3xl p-6 space-y-6">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <Receipt size={18} className="text-blue-400" />
                            Summary
                        </h2>

                        <div className="space-y-2">
                            {[
                                { label: "Start Date", value: "2026-04-01 06:23" },
                                { label: "End Date", value: "2026-05-21 06:23" },
                                { label: "Refund Period", value: "50 day" },
                                { label: "Per Annum", value: "40%", color: "text-green-400" },
                                { label: "Est. Return", value: "0.00 YTP", color: "text-blue-400" },
                                { label: "Subscription Price", value: "2.00 USD", sub: "= 253.16 YTP" },
                                { label: "Transaction Fees", value: "0.00 YTP" },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-[11px] py-1 border-b border-white/5 last:border-0">
                                    <span className="text-slate-500 font-medium tracking-tight">{item.label}</span>
                                    <div className="text-right">
                                        <span className={`font-bold tracking-tight ${item.color || 'text-white'}`}>{item.value}</span>
                                        {item.sub && <span className="text-[9px] text-slate-500 ml-1 italic">{item.sub}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total Box */}
                        <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Amount</span>
                                <span className="text-xl font-extrabold text-white tracking-tight">253.16 YTP</span>
                            </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 rounded border-slate-800 bg-black text-blue-400 focus:ring-0" />
                                <span className="text-[9px] text-slate-400">Agree to <span className="text-blue-400 underline">Staking Service Agreement</span></span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={autoStake} onChange={(e) => setAutoStake(e.target.checked)} className="w-4 h-4 rounded border-slate-800 bg-black text-blue-400 focus:ring-0" />
                                <span className="text-[9px] text-slate-400">Agree to <span className="text-blue-400 underline">YariPay Auto Staking</span></span>
                            </label>
                        </div>

                        {/* Confirm Button */}
                        <button
                            disabled={!agreed}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${agreed ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg active:scale-95' : 'bg-slate-900 text-slate-600 cursor-not-allowed opacity-50'}`}
                        >
                            Confirm Stake <ArrowRight size={16} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StakingSummary;
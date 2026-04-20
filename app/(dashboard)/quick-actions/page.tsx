"use client";

import { motion } from "framer-motion";
import {
    ArrowLeft, CheckCircle2, ChevronRight, Clock, Sparkles,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import { ALL_ACTIONS, useCompletedActions } from "@/components/Dashboard/QuickActions";
import { SectionLoader } from "@/components/Include/Loader";

const QuickActionsPage = () => {
    const { completed, loading } = useCompletedActions();

    if (loading) {
        return (
            <div className="bg-[#000000] text-white">
                <Header />
                <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <SectionLoader />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-[#000000] text-white">
            <Header />

            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-5 pb-24 space-y-8">

                {/* ── Hero section ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                                <ArrowLeft size={16} />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Quick Actions</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Everything you need, one tap away</p>
                        </div>
                    </div>
                </motion.div>

                {/* ── Required Actions (completable) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.35 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="h-5 w-1 rounded-full bg-emerald-400" />
                        <h2 className="text-base font-black text-white tracking-wide">Setup & Verification</h2>
                        <span className="text-[11px] font-bold text-gray-600 bg-white/5 px-2 py-0.5 rounded-full ml-auto">
                            {completed.size}/{ALL_ACTIONS.filter((a) => a.completable).length} done
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {ALL_ACTIONS.filter((a) => a.completable).map((item, i) => {
                            const Icon = item.icon;
                            const isDone = completed.has(item.id);

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06, duration: 0.35 }}
                                >
                                    <Link href={item.href}>
                                        <motion.div
                                            whileHover={{ scale: 1.02, y: -3 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`relative rounded-2xl border p-5 flex items-center gap-4 cursor-pointer transition-all duration-200 overflow-hidden ${
                                                isDone
                                                    ? "border-emerald-500/25"
                                                    : `${item.border} ${item.activeBorder} ${item.glow}`
                                            }`}
                                            style={{ background: isDone
                                                ? "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(10,26,15,0.7) 100%)"
                                                : "rgba(10,26,15,0.7)"
                                            }}
                                        >
                                            {/* Subtle glow for completed */}
                                            {isDone && (
                                                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl" />
                                            )}

                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 relative ${
                                                isDone
                                                    ? "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                                                    : `${item.bg} border ${item.border}`
                                            }`}>
                                                {isDone ? (
                                                    <CheckCircle2 size={22} className="text-black" />
                                                ) : (
                                                    <Icon size={22} strokeWidth={1.8} className={item.color} />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 relative">
                                                <p className={`text-sm font-black ${isDone ? "text-emerald-400" : "text-white"}`}>
                                                    {item.label}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {isDone ? (
                                                        <span className="text-[12px] text-emerald-400/70 font-bold flex items-center gap-1">
                                                            <CheckCircle2 size={10} />
                                                            Completed
                                                        </span>
                                                    ) : (
                                                        <span className="text-[12px] text-amber-400/80 font-bold flex items-center gap-1">
                                                            <Clock size={10} />
                                                            Action required
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <ChevronRight size={16} className={`shrink-0 ${isDone ? "text-emerald-500/40" : "text-gray-700"}`} />
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ── Quick Tools (non-completable) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.35 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="h-5 w-1 rounded-full bg-emerald-400" />
                        <h2 className="text-base font-black text-white tracking-wide">Quick Tools</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {ALL_ACTIONS.filter((a) => !a.completable).map((item, i) => {
                            const Icon = item.icon;

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                                >
                                    <Link href={item.href}>
                                        <motion.div
                                            whileHover={{ scale: 1.04, y: -3 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border ${item.border} ${item.activeBorder} ${item.glow} cursor-pointer transition-all duration-200`}
                                            style={{ background: "rgba(10,26,15,0.7)" }}
                                        >
                                            <div className={`h-12 w-12 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center ${item.color} transition-all`}>
                                                <Icon size={22} strokeWidth={1.8} />
                                            </div>
                                            <span className="text-sm font-bold text-gray-400 text-center leading-tight">
                                                {item.label}
                                            </span>
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ── Security section ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.35 }}
                    className="rounded-2xl border border-white/6 p-5 flex items-center gap-4"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Sparkles size={18} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Need help?</p>
                        <p className="text-[13px] text-gray-600 mt-0.5">
                            Visit our <Link href="/support" className="text-emerald-400 font-bold hover:underline">Support Center</Link> or check the FAQ for guidance.
                        </p>
                    </div>
                </motion.div>

                <PageFooter />
            </div>

            <Footer />
        </div>
    );
};

export default QuickActionsPage;

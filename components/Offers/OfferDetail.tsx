"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ArrowRight, CheckCircle2, Circle,
    ChevronDown, ChevronUp, ListChecks, Trophy,
} from "lucide-react";
import Link from "next/link";
import { OFFERS, type Offer, type Task, type Subtask } from "./offersData";

// ─── Subtask row ──────────────────────────────────────────────────────────────

const SubtaskRow = ({ subtask, index }: { subtask: Subtask; index: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04, duration: 0.2 }}
        className={`flex items-start gap-3 py-3 px-4 rounded-xl border transition-all ${
            subtask.completed
                ? "border-emerald-500/15 bg-emerald-500/3"
                : "border-white/4 hover:border-white/8"
        }`}
        style={!subtask.completed ? { background: "rgba(5,13,7,0.5)" } : undefined}
    >
        <div className="mt-0.5 shrink-0">
            {subtask.completed ? (
                <CheckCircle2 size={14} className="text-emerald-400" />
            ) : (
                <Circle size={14} className="text-gray-700" />
            )}
        </div>
        <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-bold ${subtask.completed ? "text-emerald-400 line-through opacity-70" : "text-white"}`}>
                {subtask.title}
            </p>
            <p className="text-[9px] text-gray-600 mt-0.5">{subtask.description}</p>
        </div>
        <span className={`text-[8px] font-black uppercase tracking-widest shrink-0 mt-0.5 ${
            subtask.completed ? "text-emerald-400" : "text-gray-700"
        }`}>
            {subtask.completed ? "Done" : "Pending"}
        </span>
    </motion.div>
);

// ─── Task card ────────────────────────────────────────────────────────────────

const TaskCard = ({ task, index, offerGradient }: { task: Task; index: number; offerGradient: Offer["gradient"] }) => {
    const [expanded, setExpanded] = useState(false);
    const Icon                   = task.icon;
    const hasSubtasks            = task.subtasks && task.subtasks.length > 0;
    const completedSubs          = task.subtasks?.filter((s) => s.completed).length ?? 0;
    const totalSubs              = task.subtasks?.length ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            className={`rounded-2xl border overflow-hidden transition-all ${
                task.completed
                    ? "border-emerald-500/20 bg-emerald-500/3"
                    : "border-white/6"
            }`}
            style={!task.completed ? { background: "rgba(10,26,15,0.7)" } : undefined}
        >
            {/* Task header */}
            <button
                onClick={() => hasSubtasks && setExpanded((v) => !v)}
                className={`w-full flex items-start gap-4 p-5 text-left ${hasSubtasks ? "cursor-pointer" : "cursor-default"}`}
            >
                {/* Step number */}
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    task.completed
                        ? "bg-emerald-500 text-black"
                        : `bg-white/5 border border-white/8`
                }`}>
                    {task.completed ? (
                        <CheckCircle2 size={18} />
                    ) : (
                        <Icon size={18} className={offerGradient.text} />
                    )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                            Task {index + 1}
                        </span>
                        {task.completed && (
                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                Completed
                            </span>
                        )}
                    </div>
                    <h3 className={`text-sm font-black ${task.completed ? "text-emerald-400" : "text-white"}`}>
                        {task.title}
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{task.description}</p>

                    {/* Subtask progress */}
                    {hasSubtasks && (
                        <div className="flex items-center gap-2 mt-2.5">
                            <div className="flex items-center gap-1">
                                <ListChecks size={10} className="text-gray-600" />
                                <span className="text-[9px] text-gray-500 font-bold">
                                    {completedSubs}/{totalSubs} subtasks
                                </span>
                            </div>
                            <div className="flex-1 h-1 rounded-full bg-white/5 max-w-24">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all"
                                    style={{ width: `${totalSubs > 0 ? (completedSubs / totalSubs) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Expand chevron */}
                {hasSubtasks && (
                    <div className="shrink-0 mt-1">
                        {expanded ? (
                            <ChevronUp size={16} className="text-gray-500" />
                        ) : (
                            <ChevronDown size={16} className="text-gray-500" />
                        )}
                    </div>
                )}
            </button>

            {/* Subtasks accordion */}
            <AnimatePresence>
                {expanded && hasSubtasks && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 space-y-2 border-t border-white/4 pt-4 ml-14">
                            {task.subtasks!.map((sub, si) => (
                                <SubtaskRow key={sub.id} subtask={sub} index={si} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Main detail component ────────────────────────────────────────────────────

const OfferDetail = ({ slug }: { slug: string }) => {
    const offer = OFFERS.find((o) => o.slug === slug);

    if (!offer) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-16 text-center">
                <p className="text-gray-500 text-sm font-bold">Offer not found</p>
                <Link href="/offers" className="text-emerald-400 text-xs font-bold hover:underline mt-2 inline-block">
                    Back to Offers
                </Link>
            </div>
        );
    }

    const Icon           = offer.icon;
    const totalTasks     = offer.tasks.length;
    const completedTasks = offer.tasks.filter((t) => t.completed).length;
    const progress       = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const totalSubtasks  = offer.tasks.reduce((sum, t) => sum + (t.subtasks?.length ?? 0), 0);
    const completedSubs  = offer.tasks.reduce((sum, t) => sum + (t.subtasks?.filter((s) => s.completed).length ?? 0), 0);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── Back + title ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-4"
            >
                <Link href="/offers">
                    <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                        <ArrowLeft size={16} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">{offer.title}</h1>
                    <p className="text-[11px] text-gray-600 mt-0.5">{offer.tagline}</p>
                </div>
            </motion.div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT: Tasks (3 cols) ── */}
                <div className="lg:col-span-3 space-y-4">
                    {offer.tasks.map((task, i) => (
                        <TaskCard key={task.id} task={task} index={i} offerGradient={offer.gradient} />
                    ))}
                </div>

                {/* ── RIGHT: Offer info (2 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="lg:col-span-2 space-y-5"
                >
                    {/* Hero card */}
                    <div
                        className={`rounded-3xl border ${offer.gradient.border} p-6 relative overflow-hidden`}
                        style={{ background: `linear-gradient(150deg, ${offer.gradient.from} 0%, ${offer.gradient.to} 100%)` }}
                    >
                        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-[40px] pointer-events-none" style={{ background: offer.gradient.from }} />

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${offer.gradient.badge}/15 border ${offer.gradient.border}`}>
                                    <Icon size={22} className={offer.gradient.text} />
                                </div>
                                {offer.live ? (
                                    <span className="flex items-center gap-1 bg-red-500/15 text-red-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-red-500/25">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                                        {offer.badge}
                                    </span>
                                ) : (
                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full border border-white/10 text-gray-500 bg-white/4">
                                        {offer.badge}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h2 className="text-lg font-black text-white">{offer.title}</h2>
                                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{offer.description}</p>
                            </div>

                            {/* Reward box */}
                            <div
                                className="rounded-2xl border border-emerald-500/20 p-4"
                                style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                            >
                                <p className="text-[9px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">Reward</p>
                                <p className="text-xl font-black text-white">{offer.reward}</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress card */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Trophy size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Progress</h2>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-white/5 p-3 text-center" style={{ background: "rgba(5,13,7,0.6)" }}>
                                <p className="text-[8px] text-gray-600 uppercase tracking-wider font-bold mb-1">Tasks</p>
                                <p className="text-lg font-black text-white">{completedTasks}<span className="text-gray-600 text-xs">/{totalTasks}</span></p>
                            </div>
                            {totalSubtasks > 0 && (
                                <div className="rounded-xl border border-white/5 p-3 text-center" style={{ background: "rgba(5,13,7,0.6)" }}>
                                    <p className="text-[8px] text-gray-600 uppercase tracking-wider font-bold mb-1">Subtasks</p>
                                    <p className="text-lg font-black text-white">{completedSubs}<span className="text-gray-600 text-xs">/{totalSubtasks}</span></p>
                                </div>
                            )}
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] text-gray-500 font-bold">Overall Progress</span>
                                <span className="text-[9px] text-emerald-400 font-black">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${progress}%`,
                                        background: progress > 0
                                            ? "linear-gradient(90deg, #10b981, #34d399)"
                                            : "transparent",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Claim button */}
                        <button
                            disabled={progress < 100}
                            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                progress >= 100
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                            }`}
                        >
                            {progress >= 100 ? "Claim Reward" : "Complete All Tasks to Claim"}
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </button>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default OfferDetail;

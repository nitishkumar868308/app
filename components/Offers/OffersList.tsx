"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Flame, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { OFFERS, type OfferConfig } from "./offersData";

const OffersList = () => {
    const { token } = useAuth();
    const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        (async () => {
            try {
                const [taskRes, iphoneRes] = await Promise.allSettled([
                    api.get(ENDPOINTS.TASK_LIST),
                    api.get(ENDPOINTS.IPHONE_TASK_LIST),
                ]);

                const taskData = taskRes.status === "fulfilled"
                    ? (taskRes.value.data?.data ?? taskRes.value.data ?? [])
                    : [];
                const iphoneData = iphoneRes.status === "fulfilled"
                    ? (iphoneRes.value.data?.data ?? iphoneRes.value.data ?? [])
                    : [];

                const next: Record<string, boolean> = {};
                OFFERS.forEach((o) => {
                    if (o.api === "iphone") {
                        const list = Array.isArray(iphoneData) ? iphoneData : [];
                        next[o.slug] = list.length > 0 && list.every((t: any) =>
                            t.status === "COMPLETED" || t.status === "DONE"
                        );
                    } else {
                        const list = Array.isArray(taskData) ? taskData : [];
                        const matching = list.filter((t: any) => t.task_type === o.task_type);
                        if (matching.length === 0) { next[o.slug] = false; return; }
                        const hasReward = matching.some((t: any) => t.mega_reward);
                        const allDone = matching.every((t: any) =>
                            t.status === "COMPLETED" || t.status === "DONE"
                        );
                        next[o.slug] = hasReward || allDone;
                    }
                });
                if (!cancelled) setCompletedMap(next);
            } catch { /* silent */ }
        })();
        return () => { cancelled = true; };
    }, [token]);

    const sortedOffers = useMemo(() => {
        return [...OFFERS].sort((a, b) => {
            const aDone = completedMap[a.slug] ? 1 : 0;
            const bDone = completedMap[b.slug] ? 1 : 0;
            return aDone - bDone;
        });
    }, [completedMap]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── Page header with back button ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-4"
            >
                <Link href="/dashboard">
                    <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                        <ArrowLeft size={16} />
                    </button>
                </Link>
                <div className="flex items-center gap-2">
                    <Flame size={20} className="text-amber-400 shrink-0" />
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">All Offers</h1>
                        <p className="text-sm text-gray-600 mt-0.5">
                            Complete tasks to unlock rewards, boosts, and exclusive drops
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── Offers grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedOffers.map((offer, i) => (
                    <OfferCard
                        key={offer.slug}
                        offer={offer}
                        completed={!!completedMap[offer.slug]}
                        index={i}
                    />
                ))}
            </div>
        </div>
    );
};

const OfferCard = ({
    offer,
    completed,
    index,
}: {
    offer: OfferConfig;
    completed: boolean;
    index: number;
}) => {
    const Icon = offer.icon;

    const card = (
        <div
            className={`relative overflow-hidden rounded-3xl border p-5 transition-all duration-200 h-full flex flex-col ${
                completed
                    ? "border-white/10 opacity-60 grayscale cursor-default"
                    : `${offer.gradient.border} cursor-pointer hover:scale-[1.01]`
            }`}
            style={{
                background: completed
                    ? "linear-gradient(150deg, rgba(60,60,60,0.1) 0%, #0a1a0f 100%)"
                    : `linear-gradient(150deg, ${offer.gradient.from} 0%, ${offer.gradient.to} 100%)`,
            }}
        >
            {!completed && (
                <div
                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                    style={{ background: offer.gradient.from }}
                />
            )}

            {/* Top bar */}
            <div className="relative z-10 flex items-center justify-between mb-3">
                <span className={`text-[12px] font-black uppercase tracking-[0.2em] ${completed ? "text-gray-500" : offer.gradient.text}`}>
                    {offer.tagline}
                </span>
                {completed ? (
                    <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 text-[11px] font-black px-2 py-0.5 rounded-full border border-emerald-500/25">
                        <CheckCircle2 size={11} /> DONE
                    </span>
                ) : offer.live ? (
                    <span className="flex items-center gap-1 bg-red-500/15 text-red-400 text-[11px] font-black px-2 py-0.5 rounded-full border border-red-500/25">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                        {offer.badge}
                    </span>
                ) : (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full border border-white/10 text-gray-500 bg-white/4">
                        {offer.badge}
                    </span>
                )}
            </div>

            {/* Icon + title */}
            <div className="relative z-10 flex items-start gap-3 mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5 border ${completed ? "border-white/10" : offer.gradient.border}`}>
                    <Icon size={18} className={completed ? "text-gray-500" : offer.gradient.text} />
                </div>
                <div className="min-w-0">
                    <h3 className={`text-base font-black leading-tight ${completed ? "text-gray-400" : "text-white"}`}>{offer.title}</h3>
                    <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">{offer.description}</p>
                </div>
            </div>

            {/* Reward */}
            <div className="relative z-10 mb-4 mt-auto">
                <span className={`text-sm font-black ${completed ? "text-gray-500" : offer.gradient.text}`}>
                    {completed ? "Already completed" : `Reward: ${offer.reward}`}
                </span>
            </div>

            {/* CTA */}
            <div className="relative z-10 flex items-center justify-end">
                <span className={`flex items-center gap-1 text-[13px] font-bold ${completed ? "text-gray-500" : offer.gradient.text}`}>
                    {completed ? "Completed" : <>View Details <ArrowRight size={12} /></>}
                </span>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
        >
            {completed ? card : <Link href={`/offers/${offer.slug}`}>{card}</Link>}
        </motion.div>
    );
};

export default OffersList;

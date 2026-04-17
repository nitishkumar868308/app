"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, ArrowRight, Gift, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { OFFERS } from "@/components/Offers/offersData";

interface OfferState {
    slug: string;
    completed: boolean;
}

const HotOffers = () => {
    const { token } = useAuth();
    const [states, setStates] = useState<OfferState[]>(
        () => OFFERS.map((o) => ({ slug: o.slug, completed: false })),
    );

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

                const next: OfferState[] = OFFERS.map((o) => {
                    if (o.api === "iphone") {
                        const list = Array.isArray(iphoneData) ? iphoneData : [];
                        if (list.length === 0) return { slug: o.slug, completed: false };
                        const allDone = list.every((t: any) =>
                            t.status === "COMPLETED" || t.status === "DONE"
                        );
                        return { slug: o.slug, completed: allDone };
                    }
                    const list = Array.isArray(taskData) ? taskData : [];
                    const matching = list.filter((t: any) => t.task_type === o.task_type);
                    if (matching.length === 0) return { slug: o.slug, completed: false };
                    // Done if reward exists (any status) OR all tasks completed
                    const hasReward = matching.some((t: any) => t.mega_reward);
                    const allDone = matching.every((t: any) =>
                        t.status === "COMPLETED" || t.status === "DONE"
                    );
                    return { slug: o.slug, completed: hasReward || allDone };
                });

                if (!cancelled) setStates(next);
            } catch { /* silent */ }
        })();
        return () => { cancelled = true; };
    }, [token]);

    const { featured, secondary } = useMemo(() => {
        const stateBySlug = new Map(states.map((s) => [s.slug, s.completed]));
        const sorted = [...OFFERS].sort((a, b) => {
            const aDone = stateBySlug.get(a.slug) ? 1 : 0;
            const bDone = stateBySlug.get(b.slug) ? 1 : 0;
            return aDone - bDone;
        });
        return {
            featured: sorted[0],
            secondary: sorted.slice(1),
        };
    }, [states]);

    const isCompleted = (slug: string) => states.find((s) => s.slug === slug)?.completed ?? false;

    return (
        <section className="space-y-3">
            {/* Section label */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Flame size={13} className="text-orange-400" />
                    <p className="text-[12px] uppercase tracking-[0.22em] text-gray-500 font-bold">Hot Offers</p>
                </div>
                <Link href="/offers" className="text-[13px] text-emerald-400 font-bold hover:underline flex items-center gap-1">
                    View All <ArrowRight size={9} />
                </Link>
            </div>

            {/* Featured (top) card — first non-completed offer */}
            {featured && (
                <FeaturedCard offer={featured} completed={isCompleted(featured.slug)} />
            )}

            {/* Secondary grid */}
            <div className="grid grid-cols-2 gap-3 mt-10">
                {secondary.map((offer, i) => (
                    <SecondaryCard
                        key={offer.slug}
                        offer={offer}
                        completed={isCompleted(offer.slug)}
                        delay={0.15 + i * 0.05}
                    />
                ))}
            </div>
        </section>
    );
};

// ─── Featured (big) card ─────────────────────────────────────────────────────
const FeaturedCard = ({
    offer,
    completed,
}: {
    offer: (typeof OFFERS)[number];
    completed: boolean;
}) => {
    const content = (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
            className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
                completed
                    ? "border-white/10 opacity-60 grayscale cursor-default"
                    : `${offer.gradient.border} cursor-pointer hover:border-amber-500/40`
            }`}
            style={{
                background: completed
                    ? "linear-gradient(135deg, rgba(60,60,60,0.12) 0%, #0a1a0f 100%)"
                    : `linear-gradient(135deg, ${offer.gradient.from} 0%, ${offer.gradient.to} 100%)`,
            }}
        >
            {!completed && (
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-amber-400/10 rounded-full blur-[35px] pointer-events-none" />
            )}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-[13px] font-black uppercase tracking-[0.2em] ${completed ? "text-gray-500" : offer.gradient.text}`}>
                        {offer.tagline}
                    </span>
                    {completed ? (
                        <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 text-[13px] font-black px-2 py-0.5 rounded-full border border-emerald-500/25">
                            <CheckCircle2 size={11} /> DONE
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 bg-red-500/15 text-red-400 text-[13px] font-black px-2 py-0.5 rounded-full border border-red-500/25">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                            LIVE
                        </span>
                    )}
                </div>
                <h3 className={`text-base font-black mb-0.5 ${completed ? "text-gray-400" : "text-white"}`}>{offer.title}</h3>
                <p className="text-xs text-gray-400 mb-3">
                    {completed ? "Already claimed" : offer.reward}
                </p>
                {completed ? (
                    <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-500 text-xs font-black px-4 py-2 rounded-xl">
                        Completed
                    </span>
                ) : (
                    <span className={`inline-flex items-center gap-2 bg-amber-500 text-black text-xs font-black px-4 py-2 rounded-xl shadow-[0_4px_16px_rgba(245,158,11,0.3)]`}>
                        Claim Reward <ArrowRight size={12} />
                    </span>
                )}
            </div>
        </motion.div>
    );

    if (completed) return content;
    return <Link href={`/offers/${offer.slug}`}>{content}</Link>;
};

// ─── Secondary (small) card ──────────────────────────────────────────────────
const SecondaryCard = ({
    offer,
    completed,
    delay,
}: {
    offer: (typeof OFFERS)[number];
    completed: boolean;
    delay: number;
}) => {
    const Icon = offer.slug === "giveaway-iphone" ? Gift : Zap;
    const label = offer.slug === "giveaway-iphone" ? "Join Now" : "Activate";

    const content = (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`relative overflow-hidden rounded-2xl border p-3.5 transition-all ${
                completed
                    ? "border-white/10 opacity-60 grayscale cursor-default"
                    : `${offer.gradient.border} cursor-pointer hover:${offer.gradient.border.replace("/25", "/35")}`
            }`}
            style={{
                background: completed
                    ? "linear-gradient(135deg, rgba(60,60,60,0.12) 0%, #0a1a0f 100%)"
                    : `linear-gradient(135deg, ${offer.gradient.from} 0%, ${offer.gradient.to} 100%)`,
            }}
        >
            <span className={`text-[12px] font-black uppercase tracking-[0.18em] mb-1 block ${completed ? "text-gray-500" : offer.gradient.text}`}>
                {offer.tagline}
            </span>
            <h4 className={`text-sm font-bold leading-tight ${completed ? "text-gray-400" : "text-white"}`}>
                {offer.title}
            </h4>
            <p className={`text-[12px] mb-3 ${completed ? "text-gray-600" : "text-gray-500"}`}>
                {completed ? "Completed" : offer.reward}
            </p>
            {completed ? (
                <span className="w-full flex items-center justify-center gap-1.5 bg-white/5 border border-white/10 text-gray-500 text-[12px] font-bold py-1.5 rounded-lg">
                    <CheckCircle2 size={10} /> Done
                </span>
            ) : (
                <span className={`w-full flex items-center justify-center gap-1.5 text-[12px] font-bold py-1.5 rounded-lg ${offer.gradient.text}`}
                    style={{ background: offer.gradient.from, border: `1px solid ${offer.gradient.from}` }}
                >
                    <Icon size={10} /> {label}
                </span>
            )}
        </motion.div>
    );

    if (completed) return content;
    return <Link href={`/offers/${offer.slug}`}>{content}</Link>;
};

export default HotOffers;

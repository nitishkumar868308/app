import {
    Zap, Gift, Flame, Trophy, Rocket,
    type LucideIcon,
} from "lucide-react";

// ─── Config ──────────────────────────────────────────────────────────────────
// Static offer configs. Change IDs here if backend changes.
// task_type must match the API's task_type field exactly.
// claim_id is sent to POST /promotion/offers/claim-offer/

export interface OfferConfig {
    slug: string;
    title: string;
    tagline: string;
    description: string;
    badge: string;
    live: boolean;
    reward: string;
    icon: LucideIcon;
    task_type: string;      // matches API task_type filter
    claim_id: string;       // sent as { id } to claim API
    api: "task" | "iphone"; // which endpoint to fetch tasks from
    gradient: {
        from: string;
        to: string;
        border: string;
        text: string;
    };
}

export const OFFERS: OfferConfig[] = [
    {
        slug: "staking-pass",
        title: "Staking Pass",
        tagline: "Exclusive Drop",
        description: "Complete referral tasks to unlock your Staking Pass. Refer friends and help them complete KYC to claim the reward.",
        badge: "LIVE",
        live: true,
        reward: "₹10,000 Staking Pass",
        icon: Flame,
        task_type: "Mega Offer",
        claim_id: "5",
        api: "task",
        gradient: {
            from: "rgba(245,158,11,0.18)",
            to: "#0a1a0f",
            border: "border-amber-500/25",
            text: "text-amber-400",
        },
    },
    {
        slug: "staking-hike",
        title: "Staking Hike",
        tagline: "Boost Rewards",
        description: "Activate your staking hike to earn boosted APY on your staked assets. Complete all tasks to unlock.",
        badge: "HOT",
        live: true,
        reward: "APY Boost",
        icon: Zap,
        task_type: "staking-hike-activation",
        claim_id: "36",
        api: "task",
        gradient: {
            from: "rgba(159,18,57,0.25)",
            to: "#0a1a0f",
            border: "border-rose-500/25",
            text: "text-rose-400",
        },
    },
    {
        slug: "giveaway-iphone",
        title: "Win iPhone 16 Pro",
        tagline: "Giveaway",
        description: "Complete tasks and enter the lucky draw for a chance to win an iPhone 16 Pro.",
        badge: "NEW",
        live: true,
        reward: "iPhone 16 Pro",
        icon: Gift,
        task_type: "",
        claim_id: "3",
        api: "iphone",
        gradient: {
            from: "rgba(20,184,166,0.12)",
            to: "#0a1a0f",
            border: "border-teal-500/25",
            text: "text-teal-400",
        },
    },
];

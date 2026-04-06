import {
    Zap, Gift, Flame, Trophy, Users, Target,
    ShieldCheck, UserPlus, CheckCircle2, Star,
    Coins, TrendingUp, Award, Rocket,
    type LucideIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Subtask {
    id: string;
    title: string;
    description: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    icon: LucideIcon;
    subtasks?: Subtask[];
}

export interface Offer {
    id: string;
    slug: string;
    title: string;
    tagline: string;
    description: string;
    badge: string;
    live: boolean;
    reward: string;
    icon: LucideIcon;
    /** gradient colors for card */
    gradient: { from: string; to: string; border: string; text: string; badge: string };
    tasks: Task[];
}

// ─── Offers ───────────────────────────────────────────────────────────────────

export const OFFERS: Offer[] = [
    {
        id: "1",
        slug: "staking-pass",
        title: "Staking Pass",
        tagline: "Exclusive Drop",
        description: "Complete tasks to unlock your Staking Pass and earn 10,000 YTP. Refer friends and help them complete KYC to claim the reward.",
        badge: "LIVE",
        live: true,
        reward: "10,000 YTP",
        icon: Flame,
        gradient: {
            from: "rgba(245,158,11,0.18)",
            to: "#0a1a0f",
            border: "border-amber-500/25",
            text: "text-amber-400",
            badge: "bg-amber-500",
        },
        tasks: [
            {
                id: "sp-1",
                title: "Refer a Friend & Complete KYC",
                description: "Invite your first friend using your referral link. They must sign up and successfully complete full KYC verification.",
                completed: false,
                icon: UserPlus,
                subtasks: [
                    { id: "sp-1-1", title: "Share your referral link", description: "Copy and share your unique invite link with a friend", completed: false },
                    { id: "sp-1-2", title: "Friend signs up", description: "Your friend registers using your referral link", completed: false },
                    { id: "sp-1-3", title: "Friend completes KYC", description: "Your friend completes identity verification (PAN + Aadhaar + Selfie)", completed: false },
                ],
            },
            {
                id: "sp-2",
                title: "Refer a Second Friend & Complete KYC",
                description: "Invite a second friend. They must also sign up and complete full KYC to unlock the pass.",
                completed: false,
                icon: Users,
                subtasks: [
                    { id: "sp-2-1", title: "Share your referral link", description: "Send your invite link to another friend", completed: false },
                    { id: "sp-2-2", title: "Friend signs up", description: "Your second friend registers via the referral link", completed: false },
                    { id: "sp-2-3", title: "Friend completes KYC", description: "Second friend completes full identity verification", completed: false },
                ],
            },
        ],
    },
    {
        id: "2",
        slug: "staking-hike",
        title: "Staking Hike Activation",
        tagline: "Boost Rewards",
        description: "Activate your staking hike to earn up to 1000% APY boost. Complete all 4 tasks to unlock the maximum multiplier.",
        badge: "HOT",
        live: true,
        reward: "1000% APY Boost",
        icon: Zap,
        gradient: {
            from: "rgba(159,18,57,0.25)",
            to: "#0a1a0f",
            border: "border-rose-500/25",
            text: "text-rose-400",
            badge: "bg-rose-500",
        },
        tasks: [
            {
                id: "sh-1",
                title: "Stake Minimum 10,000 YTP",
                description: "Lock at least 10,000 YTP in any staking plan to qualify for the hike activation.",
                completed: false,
                icon: Coins,
            },
            {
                id: "sh-2",
                title: "Hold for 30+ Days",
                description: "Maintain your staked position for a minimum of 30 consecutive days without withdrawal.",
                completed: false,
                icon: ShieldCheck,
            },
            {
                id: "sh-3",
                title: "Refer 3 Active Stakers",
                description: "Invite 3 friends who each stake a minimum of 5,000 YTP within 14 days of signing up.",
                completed: false,
                icon: Users,
                subtasks: [
                    { id: "sh-3-1", title: "Refer Friend #1", description: "First friend stakes minimum 5,000 YTP", completed: false },
                    { id: "sh-3-2", title: "Refer Friend #2", description: "Second friend stakes minimum 5,000 YTP", completed: false },
                    { id: "sh-3-3", title: "Refer Friend #3", description: "Third friend stakes minimum 5,000 YTP", completed: false },
                ],
            },
            {
                id: "sh-4",
                title: "Complete Advanced KYC",
                description: "Verify your identity with enhanced KYC including video verification for hike eligibility.",
                completed: false,
                icon: CheckCircle2,
            },
        ],
    },
    {
        id: "3",
        slug: "giveaway-iphone",
        title: "Win iPhone 16 Pro",
        tagline: "Giveaway",
        description: "Enter the lucky draw for a chance to win an iPhone 16 Pro. Complete simple tasks to earn entries.",
        badge: "NEW",
        live: true,
        reward: "iPhone 16 Pro",
        icon: Gift,
        gradient: {
            from: "rgba(20,184,166,0.12)",
            to: "#0a1a0f",
            border: "border-teal-500/25",
            text: "text-teal-400",
            badge: "bg-teal-500",
        },
        tasks: [
            {
                id: "gi-1",
                title: "Complete Your Profile",
                description: "Fill in all profile details including name, email, phone, and address.",
                completed: false,
                icon: Star,
            },
            {
                id: "gi-2",
                title: "Make Your First Trade",
                description: "Buy or sell any asset worth at least ₹500 to earn your entry.",
                completed: false,
                icon: TrendingUp,
            },
            {
                id: "gi-3",
                title: "Share on Social Media",
                description: "Post about YatriPay on Twitter or Instagram and tag @YatriPay.",
                completed: false,
                icon: Award,
            },
        ],
    },
    {
        id: "4",
        slug: "referral-race",
        title: "Referral Race",
        tagline: "Competition",
        description: "Top 10 referrers each month win bonus YTP rewards. The more friends you bring, the higher you climb on the leaderboard.",
        badge: "MONTHLY",
        live: false,
        reward: "50,000 YTP Pool",
        icon: Trophy,
        gradient: {
            from: "rgba(168,85,247,0.15)",
            to: "#0a1a0f",
            border: "border-violet-500/25",
            text: "text-violet-400",
            badge: "bg-violet-500",
        },
        tasks: [
            {
                id: "rr-1",
                title: "Refer 5 Friends",
                description: "Invite at least 5 friends who register and complete KYC.",
                completed: false,
                icon: UserPlus,
                subtasks: [
                    { id: "rr-1-1", title: "Referral #1 signs up & KYC", description: "First referral completes registration and KYC", completed: false },
                    { id: "rr-1-2", title: "Referral #2 signs up & KYC", description: "Second referral completes registration and KYC", completed: false },
                    { id: "rr-1-3", title: "Referral #3 signs up & KYC", description: "Third referral completes registration and KYC", completed: false },
                    { id: "rr-1-4", title: "Referral #4 signs up & KYC", description: "Fourth referral completes registration and KYC", completed: false },
                    { id: "rr-1-5", title: "Referral #5 signs up & KYC", description: "Fifth referral completes registration and KYC", completed: false },
                ],
            },
            {
                id: "rr-2",
                title: "Reach Top 10 on Leaderboard",
                description: "Climb the monthly leaderboard by referring the most active users.",
                completed: false,
                icon: Target,
            },
        ],
    },
    {
        id: "5",
        slug: "early-bird-bonus",
        title: "Early Bird Bonus",
        tagline: "Limited Time",
        description: "First 1,000 users who stake in the TRAVELER plan get an additional 5% bonus on their first month's returns.",
        badge: "LIMITED",
        live: true,
        reward: "+5% Bonus Returns",
        icon: Rocket,
        gradient: {
            from: "rgba(14,165,233,0.15)",
            to: "#0a1a0f",
            border: "border-sky-500/25",
            text: "text-sky-400",
            badge: "bg-sky-500",
        },
        tasks: [
            {
                id: "eb-1",
                title: "Subscribe to TRAVELER Plan",
                description: "Choose and subscribe to the TRAVELER staking plan with a minimum of 20,000 YTP.",
                completed: false,
                icon: Coins,
            },
            {
                id: "eb-2",
                title: "Complete Staking Within 7 Days",
                description: "Activate your stake within 7 days of signing up to qualify for the early bird bonus.",
                completed: false,
                icon: ShieldCheck,
            },
        ],
    },
];

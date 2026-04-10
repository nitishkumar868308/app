"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";

// ─── Types (matching actual API response) ────────────────────────────────────

export interface StakingPlan {
    id: number;
    name: string;
    description: string;
    per_annum: number;
    per_annum_upto: number;
    min_stake: number;
    max_stake: number;
    validity: number;
    return_period: number;
    staking_hike: number;
    referral_reward: number;
    price: number;
    final_price: number;
    price_discount_per: number;
    subscribers: number;
    staked_assets: number;
    capacity: number;
    quota_left: number;
    staking_type: string;
    status: boolean;
    allow_leverage: boolean;
    angel_reward: number;
    tiny_reward: number;
    coin: number;
    created_at: string;
    updated_at: string;
    start_at: string | null;
    deactive_at: string | null;
}

interface StakingContextType {
    plans: StakingPlan[];
    loading: boolean;
    error: string | null;
    totalSubscribers: number;
    totalStakedAssets: number;
    refresh: () => Promise<void>;
}

const StakingContext = createContext<StakingContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const StakingProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();

    const [plans, setPlans]                       = useState<StakingPlan[]>([]);
    const [loading, setLoading]                   = useState(false);
    const [error, setError]                       = useState<string | null>(null);
    const [totalSubscribers, setTotalSubscribers] = useState(0);
    const [totalStakedAssets, setTotalStakedAssets] = useState(0);

    const fetchPlans = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const res = await api.get(ENDPOINTS.STAKING_CARD_DETAILS);
            const data = res.data?.data;

            if (Array.isArray(data)) {
                // Sort by per_annum so LEARNER (30) → EARNER (40) → TRAVELER (50)
                const sorted = [...data].sort((a, b) => a.per_annum - b.per_annum);
                setPlans(sorted);
                setTotalSubscribers(sorted.reduce((acc: number, p: any) => acc + (p.subscribers ?? 0), 0));
                setTotalStakedAssets(sorted.reduce((acc: number, p: any) => acc + (p.staked_assets ?? 0), 0));
            }
        } catch {
            setError("Failed to load staking plans");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    return (
        <StakingContext.Provider
            value={{
                plans,
                loading,
                error,
                totalSubscribers,
                totalStakedAssets,
                refresh: fetchPlans,
            }}
        >
            {children}
        </StakingContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useStaking = (): StakingContextType => {
    const ctx = useContext(StakingContext);
    if (!ctx) throw new Error("useStaking must be used within StakingProvider");
    return ctx;
};

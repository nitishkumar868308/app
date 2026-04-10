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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CoinInfo {
    id: number;
    name: string;
    ticker: string;
    image: string;
    fees: number;
    min_limit: number;
    deposit_status: boolean;
    withdraw_status: boolean;
}

export interface WalletData {
    id: number;
    coin: CoinInfo;
    address: string;
    qr_code: string;
    qr_code_image: string;
    balance: number;
    unconfirm_balance: number;
    lock_balance: number;
    buy_amount: number;
    sell_amount: number;
    staking_roi: number;
    welcome_bonus: number;
    is_locked: boolean;
}

export interface BalanceConversion {
    inr: string;
    inr_balance: number;
    bnb: string;
    bnb_balance: number;
    usdt: string;
    usdt_balance: number;
}

interface WalletContextType {
    wallet: WalletData | null;
    conversion: BalanceConversion | null;
    loading: boolean;
    error: string | null;

    /** Currently selected asset ticker */
    selectedAsset: string;
    /** Change selected asset — triggers fresh API call */
    setSelectedAsset: (ticker: string) => void;

    /** YTP balance (shortcut — always from YTP wallet) */
    ytpBalance: number;
    /** INR value of YTP balance */
    inrBalance: number;
    /** 1 YTP = X INR */
    ytpToInrRate: number;

    /** Current wallet address */
    address: string;
    /** Current wallet QR code image URL */
    qrCodeUrl: string;

    /** Re-fetch current wallet */
    refresh: () => Promise<void>;
    /** Fetch wallet for a specific ticker (without changing selectedAsset) */
    fetchWalletByTicker: (ticker: string) => Promise<WalletData | null>;
}

const WalletContext = createContext<WalletContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();

    const [selectedAsset, setSelectedAsset] = useState("YTP");
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [conversion, setConversion] = useState<BalanceConversion | null>(null);
    const [ytpWallet, setYtpWallet] = useState<WalletData | null>(null); // cached YTP for dashboard
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Parse wallet response
    const parseWallet = (data: any): WalletData => ({
        id: data.id,
        coin: data.coin,
        address: data.address || "",
        qr_code: data.qr_code || "",
        qr_code_image: data.qr_code_image || "",
        balance: data.balance ?? 0,
        unconfirm_balance: data.unconfirm_balance ?? 0,
        lock_balance: data.lock_balance ?? 0,
        buy_amount: data.buy_amount ?? 0,
        sell_amount: data.sell_amount ?? 0,
        staking_roi: data.staking_roi ?? 0,
        welcome_bonus: data.welcome_bonus ?? 0,
        is_locked: data.is_locked ?? false,
    });

    // Fetch wallet for a specific ticker
    const fetchWalletByTicker = useCallback(async (ticker: string): Promise<WalletData | null> => {
        if (!token) return null;
        try {
            const res = await api.get(ENDPOINTS.WALLET_DETAILS(ticker));
            const data = res.data?.data;
            if (data) return parseWallet(data);
        } catch {
            // silent
        }
        return null;
    }, [token]);

    // Fetch selected wallet + conversion rates
    const fetchData = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch selected asset wallet + conversion in parallel
            const requests: Promise<any>[] = [
                api.get(ENDPOINTS.WALLET_DETAILS(selectedAsset)),
                api.get(ENDPOINTS.BALANCE_CONVERSION),
            ];

            // If selected isn't YTP, also fetch YTP for dashboard balance
            if (selectedAsset !== "YTP" && !ytpWallet) {
                requests.push(api.get(ENDPOINTS.WALLET_DETAILS("YTP")));
            }

            const results = await Promise.all(requests);

            // Selected wallet
            const wData = results[0].data?.data;
            if (wData) {
                const parsed = parseWallet(wData);
                setWallet(parsed);
                if (selectedAsset === "YTP") setYtpWallet(parsed);
            } else {
                setWallet(null);
            }

            // Conversion
            const cData = results[1].data;
            if (cData) {
                setConversion({
                    inr: cData.inr || "0",
                    inr_balance: cData.inr_balance ?? 0,
                    bnb: cData.bnb || "0",
                    bnb_balance: cData.bnb_balance ?? 0,
                    usdt: cData.usdt || "0",
                    usdt_balance: cData.usdt_balance ?? 0,
                });
            }

            // YTP wallet (if fetched separately)
            if (results[2]?.data?.data) {
                setYtpWallet(parseWallet(results[2].data.data));
            }
        } catch {
            setError("Failed to load wallet data");
        } finally {
            setLoading(false);
        }
    }, [token, selectedAsset]);

    // Re-fetch when selected asset or token changes
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Derived values (always from YTP wallet for dashboard)
    const ytpBalance = ytpWallet?.balance ?? wallet?.balance ?? 0;
    const ytpToInrRate = conversion ? parseFloat(conversion.inr) || 0 : 0;
    // const inrBalance   = ytpBalance * ytpToInrRate;
    const inrBalance = conversion?.inr_balance ?? 0;
    const address = wallet?.address ?? "";
    const qrCodeUrl = wallet?.qr_code_image ?? "";

    console.log("conversion", conversion)

    return (
        <WalletContext.Provider
            value={{
                wallet,
                conversion,
                loading,
                error,
                selectedAsset,
                setSelectedAsset,
                ytpBalance,
                inrBalance,
                ytpToInrRate,
                address,
                qrCodeUrl,
                refresh: fetchData,
                fetchWalletByTicker,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useWallet = (): WalletContextType => {
    const ctx = useContext(WalletContext);
    if (!ctx) throw new Error("useWallet must be used within WalletProvider");
    return ctx;
};

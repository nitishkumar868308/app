"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ArrowRight, ArrowDownUp, IndianRupee,
    Coins, Wallet, Receipt, TrendingUp, Shield, Zap, Loader2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { getApiError } from "@/lib/helpers";
import { SectionLoader } from "@/components/Include/Loader";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CryptoAsset {
    id: number;
    name: string;
    ticker: string;
    symbol?: string;
    image?: string;
    price_usd?: number;
    [key: string]: any;
}

interface FiatCurrency {
    id: number;
    name: string;
    symbol: string;
    price_usd?: number;
    [key: string]: any;
}

const QUICK_INR = [500, 1000, 2500, 5000];
const TDS_PERCENT = 1;
const MAX_DIGITS  = 12;

// Strip digits only (no dots/minus) and check count
const countDigits = (val: string) => val.replace(/[^0-9]/g, "").length;

// ─── Main ────────────────────────────────────────────────────────────────────

const BuyAsset = () => {
    const { token } = useAuth();

    // Data from API
    const [assets, setAssets]               = useState<CryptoAsset[]>([]);
    const [currencies, setCurrencies]       = useState<FiatCurrency[]>([]);
    const [inrBalance, setInrBalance]       = useState(0);
    const [ytpToInrRate, setYtpToInrRate]   = useState(0);
    const [pageLoading, setPageLoading]     = useState(true);

    // Form state — separate values for each field
    const [selectedTicker, setSelectedTicker] = useState("YTP");
    const [inrInput, setInrInput]             = useState("");   // what user typed in INR field
    const [tokenInput, setTokenInput]         = useState("");   // what user typed in token field
    const [activeField, setActiveField]       = useState<"inr" | "token">("inr");
    const [buying, setBuying]                 = useState(false);

    // ── Fetch assets, currency, balance on mount ─────────────────────────────

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            setPageLoading(true);
            try {
                const [assetsRes, currencyRes, balanceRes] = await Promise.all([
                    api.get(ENDPOINTS.CRYPTO_ASSET_LIST),
                    api.get(ENDPOINTS.FIAT_CURRENCY_LIST),
                    api.get(ENDPOINTS.BALANCE_CONVERSION),
                ]);

                const assetData = assetsRes.data?.data ?? assetsRes.data;
                if (Array.isArray(assetData)) {
                    const sorted = [...assetData].sort((a, b) => {
                        if ((a.ticker || a.symbol) === "YTP") return -1;
                        if ((b.ticker || b.symbol) === "YTP") return 1;
                        return 0;
                    });
                    setAssets(sorted);
                }

                const currData = currencyRes.data?.data ?? currencyRes.data;
                if (Array.isArray(currData)) setCurrencies(currData);

                const balData = balanceRes.data;
                if (balData) {
                    setInrBalance(balData.inr_balance ?? 0);
                    setYtpToInrRate(parseFloat(balData.inr) || 0);
                }
            } catch {
                toast.error("Failed to load data");
            } finally {
                setPageLoading(false);
            }
        };

        fetchData();
    }, [token]);

    // ── Selected asset & rate ────────────────────────────────────────────────

    const selectedAsset = assets.find((a) => (a.ticker || a.symbol) === selectedTicker) || assets[0];
    const assetSymbol   = selectedAsset ? (selectedAsset.ticker || selectedAsset.symbol || "YTP") : "YTP";
    const assetName     = selectedAsset?.name || "YatriPay";
    const rate          = ytpToInrRate || 0;

    // ── Two-way sync: INR ↔ Token ────────────────────────────────────────────

    const handleInrChange = (val: string) => {
        // Only limit digits on what user types
        if (val && countDigits(val) > MAX_DIGITS) return;
        setActiveField("inr");
        setInrInput(val);

        const numInr = parseFloat(val) || 0;
        if (numInr > 0 && rate > 0) {
            // Match backend: coinAmount = INR / (rate * 1.01)
            const tokens = numInr / (rate * (1 + TDS_PERCENT / 100));
            setTokenInput(tokens.toFixed(8));
        } else {
            setTokenInput("");
        }
    };

    const handleTokenChange = (val: string) => {
        // Only limit digits on what user types
        if (val && countDigits(val) > MAX_DIGITS) return;
        setActiveField("token");
        setTokenInput(val);

        const numToken = parseFloat(val) || 0;
        if (numToken > 0 && rate > 0) {
            // Reverse: base = tokens * rate, total = base + tds
            const base = numToken * rate;
            const tds = base * (TDS_PERCENT / 100);
            const totalInr = base + tds;
            setInrInput(totalInr.toFixed(2));
        } else {
            setInrInput("");
        }
    };

    // Quick amount sets INR and computes token
    const setQuickAmount = (val: number) => {
        handleInrChange(val.toString());
    };

    // Reset on asset change
    const handleAssetChange = (ticker: string) => {
        setSelectedTicker(ticker);
        setInrInput("");
        setTokenInput("");
    };

    // ── Derived calculations ─────────────────────────────────────────────────

    const numInr = parseFloat(inrInput) || 0;

    const { tokenAmount, priceWithoutTds, tds, totalPayable } = useMemo(() => {
        if (numInr <= 0 || rate <= 0) {
            return { tokenAmount: 0, priceWithoutTds: 0, tds: 0, totalPayable: 0 };
        }
        // Match old code: coinAmount = INR / (rate * 1.01)
        const tokens   = numInr / (rate * (1 + TDS_PERCENT / 100));
        const base     = tokens * rate;        // price without TDS
        const tdsVal   = base * (TDS_PERCENT / 100);
        return {
            tokenAmount:     tokens,
            priceWithoutTds: base,
            tds:             tdsVal,
            totalPayable:    numInr,
        };
    }, [numInr, rate]);

    // ── Buy handler ──────────────────────────────────────────────────────────

    const handleBuy = useCallback(async () => {
        if (numInr <= 0 || tokenAmount <= 0) return;

        setBuying(true);
        try {
            const res = await api.post(ENDPOINTS.BUY_ASSETS, {
                ytp_amount: parseInt(tokenAmount.toString()),
                fiat_currency: "INR",
            });

            const data = res.data?.data ?? res.data;
            const boughtAmount = data?.Ytp_amount || tokenAmount;

            toast.success(`${Number(boughtAmount).toLocaleString()} ${assetSymbol} bought successfully!`);

            setInrInput("");
            setTokenInput("");
            try {
                const balRes = await api.get(ENDPOINTS.BALANCE_CONVERSION);
                if (balRes.data) {
                    setInrBalance(balRes.data.inr_balance ?? 0);
                    setYtpToInrRate(parseFloat(balRes.data.inr) || 0);
                }
            } catch { /* silent */ }
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setBuying(false);
        }
    }, [numInr, tokenAmount, assetSymbol]);

    // ── Loading ──────────────────────────────────────────────────────────────

    if (pageLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
                <SectionLoader />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── Page title ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                            <ArrowLeft size={16} />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Buy Asset</h1>
                        {/* <p className="text-sm text-gray-600 mt-0.5">Purchase crypto assets with INR</p> */}
                    </div>
                </div>

                <div
                    className="flex items-center gap-3 rounded-2xl border border-white/6 px-4 py-3"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Wallet size={15} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">INR Balance</p>
                        <p className="text-sm font-black text-white">₹{inrBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </motion.div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT: Asset selection + inputs (3 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.4 }}
                    className="lg:col-span-3 rounded-3xl border border-white/6 p-6 space-y-6"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    {/* Choose asset */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">Choose Asset</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {assets.slice(0, 8).map((a) => {
                                const ticker = a.ticker || a.symbol || "";
                                const active = ticker === selectedTicker;
                                return (
                                    <button
                                        key={a.id}
                                        onClick={() => handleAssetChange(ticker)}
                                        className={`p-3 rounded-2xl border text-center transition-all ${
                                            active
                                                ? "border-emerald-400/50 shadow-[0_0_16px_rgba(16,185,129,0.08)]"
                                                : "border-white/6 hover:border-emerald-500/25"
                                        }`}
                                        style={{
                                            background: active
                                                ? "linear-gradient(160deg,rgba(16,185,129,0.13) 0%,#0d1f12 100%)"
                                                : "rgba(5,13,7,0.6)",
                                        }}
                                    >
                                        <p className={`text-sm font-black ${active ? "text-white" : "text-gray-500"}`}>
                                            {ticker}
                                        </p>
                                        <p className="text-[12px] text-gray-600 mt-0.5 truncate">{a.name}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick amounts */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {QUICK_INR.map((val) => (
                            <motion.button
                                key={val}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setQuickAmount(val)}
                                className={`px-4 py-2 rounded-xl border text-sm font-black transition-all ${
                                    inrInput === val.toString()
                                        ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-400"
                                        : "border-white/6 text-gray-500 hover:border-emerald-500/25"
                                }`}
                                style={inrInput !== val.toString() ? { background: "rgba(5,13,7,0.6)" } : undefined}
                            >
                                ₹{val.toLocaleString()}
                            </motion.button>
                        ))}
                    </div>

                    {/* Amount inputs */}
                    <div className="space-y-4">

                        {/* INR input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold">
                                    Amount INR
                                </span>
                                <span className="text-[13px] text-gray-600">
                                    {assetSymbol} = <span className="text-emerald-400 font-bold">₹{rate.toFixed(2)} INR</span>
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <IndianRupee size={18} strokeWidth={2.5} />
                                </span>
                                <input
                                    type="number"
                                    value={inrInput}
                                    onChange={(e) => handleInrChange(e.target.value)}
                                    onFocus={() => setActiveField("inr")}
                                    placeholder="0.00"
                                    className="w-full rounded-2xl border border-white/8 py-4 pl-12 pr-5 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                            </div>
                        </div>

                        {/* Swap icon */}
                        <div className="flex justify-center">
                            <div className="h-8 w-8 rounded-full bg-white/4 border border-white/8 flex items-center justify-center">
                                <ArrowDownUp size={14} className="text-gray-600" />
                            </div>
                        </div>

                        {/* Token input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold">
                                    Amount {assetSymbol}
                                </span>
                                <span className="text-[13px] text-gray-600">
                                    {assetSymbol} = <span className="text-emerald-400 font-bold">₹{rate.toFixed(2)} INR</span>
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <Coins size={18} strokeWidth={2} />
                                </span>
                                <input
                                    type="number"
                                    value={tokenInput}
                                    onChange={(e) => handleTokenChange(e.target.value)}
                                    onFocus={() => setActiveField("token")}
                                    placeholder="0.00"
                                    className="w-full rounded-2xl border border-white/8 py-4 pl-12 pr-16 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-600">
                                    {assetSymbol}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown below inputs */}
                    {numInr > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-white/5 p-4 space-y-1"
                            style={{ background: "rgba(5,13,7,0.6)" }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-500">Price:</span>
                                <span className="text-sm font-bold text-white">
                                    {priceWithoutTds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-500">TDS ({TDS_PERCENT}%):</span>
                                <span className="text-sm font-bold text-amber-400">
                                    {tds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                <span className="text-sm text-white font-bold">Total Payable:</span>
                                <span className="text-sm font-black text-emerald-400">
                                    {totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR
                                </span>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* ── RIGHT: Summary (2 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="lg:col-span-2 rounded-3xl border border-white/6 p-6 flex flex-col gap-5"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="flex items-center gap-2.5">
                        <Receipt size={16} className="text-emerald-400" />
                        <h2 className="text-base font-black text-white tracking-wide">Order Summary</h2>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${selectedTicker}-${numInr}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-0"
                        >
                            {[
                                { label: "Asset",        value: `${assetName} (${assetSymbol})` },
                                { label: "Rate",         value: rate > 0 ? `1 ${assetSymbol} = ₹${rate.toFixed(2)}` : "—" },
                                { label: "Price",        value: numInr > 0 ? `₹${priceWithoutTds.toFixed(2)}` : "—" },
                                { label: "You Receive",  value: numInr > 0 ? `${tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${assetSymbol}` : "—", green: true },
                                { label: `TDS (${TDS_PERCENT}%)`, value: numInr > 0 ? `₹${tds.toFixed(2)}` : "—" },
                                { label: "Platform Fee", value: "Free", green: true },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                                    <span className="text-[13px] text-gray-500 font-medium">{row.label}</span>
                                    <span className={`text-sm font-bold ${row.green ? "text-emerald-400" : "text-white"}`}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Total payable */}
                    <div
                        className="rounded-2xl border border-emerald-500/20 p-4"
                        style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[12px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">
                                    Total Payable
                                </p>
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={totalPayable.toFixed(2)}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.18 }}
                                        className="text-2xl font-black text-white tabular-nums"
                                    >
                                        {numInr > 0 ? `₹${totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <TrendingUp size={16} className="text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    {/* Insufficient balance warning */}
                    {numInr > 0 && totalPayable > inrBalance && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                            <span className="text-[13px] text-red-400 font-bold">
                                Insufficient INR balance. You need ₹{(totalPayable - inrBalance).toFixed(2)} more.
                            </span>
                        </div>
                    )}

                    {/* Trust indicators */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: Shield, label: "Secure Transaction" },
                            { icon: Zap,    label: "Instant Delivery" },
                        ].map((t, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 rounded-xl border border-white/5 p-2.5"
                                style={{ background: "rgba(5,13,7,0.6)" }}
                            >
                                <t.icon size={13} className="text-emerald-500/60 shrink-0" />
                                <span className="text-[13px] text-gray-600 font-bold">{t.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-auto space-y-2">
                        <button
                            onClick={handleBuy}
                            disabled={numInr <= 0 || buying || totalPayable > inrBalance}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                numInr > 0 && !buying && totalPayable <= inrBalance
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                            }`}
                        >
                            {buying ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Buy {assetSymbol}
                                    <ArrowRight size={15} strokeWidth={2.5} />
                                </>
                            )}
                        </button>

                        {numInr <= 0 && (
                            <p className="text-center text-[13px] text-gray-700">
                                Enter an amount to continue
                            </p>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default BuyAsset;

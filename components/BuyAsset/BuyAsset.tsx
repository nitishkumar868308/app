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

type PayCurrency = "BNB" | "USDT" | "INR";

const TDS_PERCENT = 1;
const MAX_DIGITS  = 12;

// Order: other currencies on top (BNB, USDT), YTP-related INR on bottom
const CURRENCIES: { key: PayCurrency; label: string; symbol: string }[] = [
    { key: "BNB",  label: "Binance Coin", symbol: "BNB" },
    { key: "USDT", label: "Tether",       symbol: "USDT" },
    { key: "INR",  label: "Indian Rupee", symbol: "INR" },
];

const QUICK_AMOUNTS: Record<PayCurrency, number[]> = {
    INR:  [500, 1000, 2500, 5000],
    BNB:  [0.25, 0.50, 0.75, 1],
    USDT: [10, 25, 50, 100],
};

// Strip digits only (no dots/minus) and check count
const countDigits = (val: string) => val.replace(/[^0-9]/g, "").length;

// ─── Main ────────────────────────────────────────────────────────────────────

const BuyAsset = () => {
    const { token } = useAuth();

    // Data from API
    const [inrBalance, setInrBalance]   = useState(0);
    const [bnbBalance, setBnbBalance]   = useState(0);
    const [usdtBalance, setUsdtBalance] = useState(0);
    const [inrRate, setInrRate]         = useState(0);    // 1 YTP = X INR
    const [bnbRate, setBnbRate]         = useState(0);    // 1 YTP = X BNB
    const [usdtRate, setUsdtRate]       = useState(0);    // 1 YTP = X USDT
    const [pageLoading, setPageLoading] = useState(true);

    // Form state
    const [selectedCurrency, setSelectedCurrency] = useState<PayCurrency>("INR");
    const [payInput, setPayInput]                 = useState("");   // amount in selected currency
    const [ytpInput, setYtpInput]                 = useState("");   // amount in YTP
    const [, setActiveField]                      = useState<"pay" | "ytp">("pay");
    const [buying, setBuying]                     = useState(false);

    // ── Fetch balances/rates on mount ────────────────────────────────────────

    const fetchBalances = useCallback(async () => {
        try {
            const balRes = await api.get(ENDPOINTS.BALANCE_CONVERSION);
            const data = balRes.data;
            if (data) {
                setInrBalance(data.inr_balance ?? 0);
                setBnbBalance(data.bnb_balance ?? 0);
                setUsdtBalance(data.usdt_balance ?? 0);
                setInrRate(parseFloat(data.inr) || 0);
                setBnbRate(parseFloat(data.bnb) || 0);
                setUsdtRate(parseFloat(data.usdt) || 0);
            }
        } catch {
            toast.error("Failed to load balance");
        }
    }, []);

    useEffect(() => {
        if (!token) return;
        (async () => {
            setPageLoading(true);
            await fetchBalances();
            setPageLoading(false);
        })();
    }, [token, fetchBalances]);

    // ── Current tab helpers ──────────────────────────────────────────────────

    const currentBalance =
        selectedCurrency === "INR"  ? inrBalance  :
        selectedCurrency === "BNB"  ? bnbBalance  : usdtBalance;

    const currentRate =
        selectedCurrency === "INR"  ? inrRate  :
        selectedCurrency === "BNB"  ? bnbRate  : usdtRate;

    const tdsApplies = selectedCurrency === "INR";
    const tdsFactor  = tdsApplies ? (1 + TDS_PERCENT / 100) : 1;

    const currencyPrefix =
        selectedCurrency === "INR" ? "₹" :
        selectedCurrency === "BNB" ? "BNB " : "USDT ";

    const balanceDisplay = selectedCurrency === "INR"
        ? `₹${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `${currentBalance.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${selectedCurrency}`;

    // ── Two-way sync: Pay ↔ YTP ──────────────────────────────────────────────

    const handlePayChange = (val: string) => {
        if (val && countDigits(val) > MAX_DIGITS) return;
        setActiveField("pay");
        setPayInput(val);

        const numPay = parseFloat(val) || 0;
        if (numPay > 0 && currentRate > 0) {
            const tokens = numPay / (currentRate * tdsFactor);
            setYtpInput(tokens.toFixed(8));
        } else {
            setYtpInput("");
        }
    };

    const handleYtpChange = (val: string) => {
        if (val && countDigits(val) > MAX_DIGITS) return;
        setActiveField("ytp");
        setYtpInput(val);

        const numToken = parseFloat(val) || 0;
        if (numToken > 0 && currentRate > 0) {
            const base  = numToken * currentRate;
            const total = base * tdsFactor;
            setPayInput(total.toFixed(selectedCurrency === "INR" ? 2 : 8));
        } else {
            setPayInput("");
        }
    };

    const setQuickAmount = (val: number) => {
        handlePayChange(val.toString());
    };

    const handleCurrencyChange = (key: PayCurrency) => {
        setSelectedCurrency(key);
        setPayInput("");
        setYtpInput("");
    };

    // ── Derived calculations ─────────────────────────────────────────────────

    const numPay = parseFloat(payInput) || 0;

    const { tokenAmount, priceWithoutTds, tds, totalPayable } = useMemo(() => {
        if (numPay <= 0 || currentRate <= 0) {
            return { tokenAmount: 0, priceWithoutTds: 0, tds: 0, totalPayable: 0 };
        }
        const tokens = numPay / (currentRate * tdsFactor);
        const base   = tokens * currentRate;
        const tdsVal = tdsApplies ? base * (TDS_PERCENT / 100) : 0;
        return {
            tokenAmount:     tokens,
            priceWithoutTds: base,
            tds:             tdsVal,
            totalPayable:    numPay,
        };
    }, [numPay, currentRate, tdsFactor, tdsApplies]);

    // ── Buy handler ──────────────────────────────────────────────────────────

    const handleBuy = useCallback(async () => {
        if (numPay <= 0 || tokenAmount <= 0) return;

        setBuying(true);
        try {
            const res = await api.post(ENDPOINTS.BUY_ASSETS, {
                ytp_amount: parseInt(tokenAmount.toString()),
                fiat_currency: selectedCurrency,
            });

            const data = res.data?.data ?? res.data;
            const boughtAmount = data?.Ytp_amount || tokenAmount;

            toast.success(`${Number(boughtAmount).toLocaleString()} YTP bought successfully!`);

            setPayInput("");
            setYtpInput("");
            await fetchBalances();
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setBuying(false);
        }
    }, [numPay, tokenAmount, selectedCurrency, fetchBalances]);

    // ── Loading ──────────────────────────────────────────────────────────────

    if (pageLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
                <SectionLoader />
            </div>
        );
    }

    const formatRate = (r: number) =>
        selectedCurrency === "INR"
            ? `₹${r.toFixed(2)}`
            : `${r.toFixed(8)} ${selectedCurrency}`;

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
                        <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">{selectedCurrency} Balance</p>
                        <p className="text-sm font-black text-white">{balanceDisplay}</p>
                    </div>
                </div>
            </motion.div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT: Currency tabs + inputs (3 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.4 }}
                    className="lg:col-span-3 rounded-3xl border border-white/6 p-6 space-y-6"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    {/* Currency tabs */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">Pay With</h2>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                            {CURRENCIES.map((c) => {
                                const active = c.key === selectedCurrency;
                                return (
                                    <button
                                        key={c.key}
                                        onClick={() => handleCurrencyChange(c.key)}
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
                                            {c.symbol}
                                        </p>
                                        <p className="text-[12px] text-gray-600 mt-0.5 truncate">{c.label}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick amounts */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {QUICK_AMOUNTS[selectedCurrency].map((val) => (
                            <motion.button
                                key={val}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setQuickAmount(val)}
                                className={`px-4 py-2 rounded-xl border text-sm font-black transition-all ${
                                    payInput === val.toString()
                                        ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-400"
                                        : "border-white/6 text-gray-500 hover:border-emerald-500/25"
                                }`}
                                style={payInput !== val.toString() ? { background: "rgba(5,13,7,0.6)" } : undefined}
                            >
                                {currencyPrefix}{val.toLocaleString()}
                            </motion.button>
                        ))}
                    </div>

                    {/* Amount inputs */}
                    <div className="space-y-4">

                        {/* Top: Pay currency (BNB / USDT / INR) */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold">
                                    Amount {selectedCurrency}
                                </span>
                                <span className="text-[13px] text-gray-600">
                                    1 YTP = <span className="text-emerald-400 font-bold">{formatRate(currentRate)}</span>
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    {selectedCurrency === "INR" ? (
                                        <IndianRupee size={18} strokeWidth={2.5} />
                                    ) : (
                                        <Coins size={18} strokeWidth={2} />
                                    )}
                                </span>
                                <input
                                    type="number"
                                    value={payInput}
                                    onChange={(e) => handlePayChange(e.target.value)}
                                    onFocus={() => setActiveField("pay")}
                                    placeholder="0.00"
                                    className="w-full rounded-2xl border border-white/8 py-4 pl-12 pr-20 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-600">
                                    {selectedCurrency}
                                </span>
                            </div>
                        </div>

                        {/* Swap icon */}
                        <div className="flex justify-center">
                            <div className="h-8 w-8 rounded-full bg-white/4 border border-white/8 flex items-center justify-center">
                                <ArrowDownUp size={14} className="text-gray-600" />
                            </div>
                        </div>

                        {/* Bottom: YTP (always) */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold">
                                    Amount YTP
                                </span>
                                <span className="text-[13px] text-gray-600">
                                    1 YTP = <span className="text-emerald-400 font-bold">{formatRate(currentRate)}</span>
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <Coins size={18} strokeWidth={2} />
                                </span>
                                <input
                                    type="number"
                                    value={ytpInput}
                                    onChange={(e) => handleYtpChange(e.target.value)}
                                    onFocus={() => setActiveField("ytp")}
                                    placeholder="0.00"
                                    className="w-full rounded-2xl border border-white/8 py-4 pl-12 pr-16 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-600">
                                    YTP
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown below inputs */}
                    {numPay > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-white/5 p-4 space-y-1"
                            style={{ background: "rgba(5,13,7,0.6)" }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-500">Price:</span>
                                <span className="text-sm font-bold text-white">
                                    {priceWithoutTds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: selectedCurrency === "INR" ? 2 : 8 })} {selectedCurrency}
                                </span>
                            </div>
                            {tdsApplies && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] text-gray-500">TDS ({TDS_PERCENT}%):</span>
                                    <span className="text-sm font-bold text-amber-400">
                                        {tds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                <span className="text-sm text-white font-bold">Total Payable:</span>
                                <span className="text-sm font-black text-emerald-400">
                                    {totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: selectedCurrency === "INR" ? 2 : 8 })} {selectedCurrency}
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
                            key={`${selectedCurrency}-${numPay}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-0"
                        >
                            {[
                                { label: "Asset",        value: "YatriPay (YTP)" },
                                { label: "Pay With",     value: selectedCurrency },
                                { label: "Rate",         value: currentRate > 0 ? `1 YTP = ${formatRate(currentRate)}` : "—" },
                                { label: "Price",        value: numPay > 0 ? `${priceWithoutTds.toFixed(selectedCurrency === "INR" ? 2 : 8)} ${selectedCurrency}` : "—" },
                                { label: "You Receive",  value: numPay > 0 ? `${tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 8 })} YTP` : "—", green: true },
                                ...(tdsApplies
                                    ? [{ label: `TDS (${TDS_PERCENT}%)`, value: numPay > 0 ? `₹${tds.toFixed(2)}` : "—" }]
                                    : []),
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
                                        {numPay > 0
                                            ? `${currencyPrefix}${totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: selectedCurrency === "INR" ? 2 : 8 })}`
                                            : "—"}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <TrendingUp size={16} className="text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    {/* Insufficient balance warning */}
                    {numPay > 0 && totalPayable > currentBalance && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                            <span className="text-[13px] text-red-400 font-bold">
                                Insufficient {selectedCurrency} balance. You need {currencyPrefix}{(totalPayable - currentBalance).toFixed(selectedCurrency === "INR" ? 2 : 8)} more.
                            </span>
                        </div>
                    )}

                    {/* Trust indicators */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: Shield, label: "Secure Transaction" },
                            { icon: Zap,    label: "Instant Credit" },
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
                            disabled={numPay <= 0 || buying || totalPayable > currentBalance}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                numPay > 0 && !buying && totalPayable <= currentBalance
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
                                    Buy YTP
                                    <ArrowRight size={15} strokeWidth={2.5} />
                                </>
                            )}
                        </button>

                        {numPay <= 0 && (
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

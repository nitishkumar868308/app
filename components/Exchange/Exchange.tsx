"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight, TrendingDown, Banknote, Wallet,
    ChevronDown, Clock, Shield, Receipt, X,
    ArrowDownLeft, ArrowUpRight, IndianRupee, Coins, Loader2,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { getApiError } from "@/lib/helpers";
import { SectionLoader } from "@/components/Include/Loader";

// ─── Tab type ─────────────────────────────────────────────────────────────────

type Tab = "sell" | "withdraw";

// ─── Sell Tab ─────────────────────────────────────────────────────────────────

const SellTab = () => {
    const { token } = useAuth();
    const { ytpBalance, refresh: refreshWallet } = useWallet();

    const [assets, setAssets]               = useState<any[]>([]);
    const [currencyList, setCurrencyList]   = useState<any[]>([]);
    const [selectedAsset, setSelectedAsset] = useState("YTP");
    const [amount, setAmount]               = useState("");
    const [availableBalance, setAvailableBalance] = useState(0);
    const [exchangeRate, setExchangeRate]   = useState(0);
    const [loading, setLoading]             = useState(true);
    const [selling, setSelling]             = useState(false);
    const [showDrop, setShowDrop]           = useState(false);

    // Fetch assets + currencies on mount
    useEffect(() => {
        if (!token) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [assetsRes, currRes, balRes] = await Promise.all([
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

                const currData = currRes.data?.data ?? currRes.data;
                if (Array.isArray(currData)) setCurrencyList(currData);

                const balData = balRes.data;
                if (balData) setAvailableBalance(ytpBalance);
            } catch { /* silent */ }
            finally { setLoading(false); }
        };
        fetchData();
    }, [token]);

    // Calculate exchange rate when asset or currency changes
    useEffect(() => {
        if (!selectedAsset || !assets.length || !currencyList.length) {
            setExchangeRate(0);
            return;
        }

        const assetObj = assets.find((a: any) => (a.ticker || a.symbol) === selectedAsset);
        const inrObj = currencyList.find((c: any) => c.symbol === "INR");

        if (!assetObj || !inrObj) {
            setExchangeRate(0);
            return;
        }

        const usdToInr = parseFloat(inrObj.price_usd) || 0;
        const assetUsd = parseFloat(assetObj.price_usd) || 0;
        setExchangeRate(usdToInr * assetUsd);

        // Fetch balance for selected asset
        (async () => {
            try {
                const res = await api.get(ENDPOINTS.WALLET_DETAILS(selectedAsset));
                const data = res.data?.data;
                if (data) setAvailableBalance(data.balance ?? 0);
            } catch { /* silent */ }
        })();
    }, [selectedAsset, assets, currencyList]);

    const numAmt   = parseFloat(amount) || 0;
    const inrValue = numAmt * exchangeRate;
    const tds      = inrValue * 0.01;
    const netINR   = inrValue - tds;
    const canSell  = numAmt > 0 && numAmt <= availableBalance && !selling;

    const handleAssetSelect = (symbol: string) => {
        setSelectedAsset(symbol);
        setAmount("");
        setShowDrop(false);
    };

    const handleSell = async () => {
        if (!canSell) return;
        setSelling(true);
        try {
            await api.post(ENDPOINTS.SELL_ASSETS, {
                fiat_currency: "INR",
                ytp_amount: parseInt(amount),
                coin_symbol: selectedAsset,
            });
            toast.success("Sell successful!");
            setAmount("");

            // Refresh balance
            try {
                const res = await api.get(ENDPOINTS.WALLET_DETAILS(selectedAsset));
                if (res.data?.data) setAvailableBalance(res.data.data.balance ?? 0);
            } catch { /* silent */ }
            refreshWallet();
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setSelling(false);
        }
    };

    if (loading) return <SectionLoader />;

    return (
        <div className="space-y-5">

            {/* Available balance — prominent at top */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-emerald-500/15 p-5 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.02) 100%)" }}
            >
                <div>
                    <p className="text-[12px] text-emerald-400/60 uppercase tracking-widest font-bold mb-1">Available {selectedAsset}</p>
                    <p className="text-3xl font-black text-white tabular-nums">
                        {availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        <span className="text-base text-gray-500 ml-2">{selectedAsset}</span>
                    </p>
                    {exchangeRate > 0 && (
                        <p className="text-[13px] text-gray-600 mt-1">
                            1 {selectedAsset} = ₹{exchangeRate.toFixed(2)} INR
                        </p>
                    )}
                </div>
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Wallet size={24} className="text-emerald-400" />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* LEFT: Sell form */}
                <div
                    className="lg:col-span-3 rounded-3xl border border-white/6 p-6 space-y-6"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    {/* Choose asset */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">Sell Asset</h2>
                        </div>

                        {/* Asset pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {assets.slice(0, 6).map((a: any) => {
                                const sym = a.ticker || a.symbol || "";
                                return (
                                    <button
                                        key={a.id}
                                        onClick={() => handleAssetSelect(sym)}
                                        className={`px-4 py-2 rounded-xl border text-[13px] font-black transition-all ${
                                            sym === selectedAsset
                                                ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-400"
                                                : "border-white/6 text-gray-600 hover:border-emerald-500/25"
                                        }`}
                                    >
                                        {sym}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Amount input */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold">
                                {selectedAsset} Amount
                            </span>
                            <button
                                onClick={() => setAmount(Math.floor(availableBalance).toString())}
                                className="text-[13px] text-emerald-400 font-bold hover:underline"
                            >
                                MAX
                            </button>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                <Coins size={18} strokeWidth={2} />
                            </span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-2xl border border-white/8 py-4 pl-12 pr-5 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                style={{ background: "rgba(5,13,7,0.8)" }}
                            />
                        </div>
                        {numAmt > availableBalance && (
                            <p className="text-[13px] text-red-400 font-bold px-1">Insufficient balance</p>
                        )}
                    </div>

                    {/* You will get */}
                    <div className="space-y-1.5">
                        <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold px-1">
                            You Will Get (INR)
                        </span>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                <IndianRupee size={18} strokeWidth={2.5} />
                            </span>
                            <div
                                className="w-full rounded-2xl border border-white/6 py-4 pl-12 pr-5 text-xl font-black text-white tabular-nums"
                                style={{ background: "rgba(5,13,7,0.5)" }}
                            >
                                {numAmt > 0 ? `₹${netINR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "0.00"}
                            </div>
                        </div>
                    </div>

                    {/* Breakdown */}
                    {numAmt > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-white/5 p-4 space-y-1"
                            style={{ background: "rgba(5,13,7,0.6)" }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-500">Price:</span>
                                <span className="text-sm font-bold text-white">₹{inrValue.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-500">TDS (1%):</span>
                                <span className="text-sm font-bold text-amber-400">₹{tds.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                <span className="text-sm text-white font-bold">You Receive:</span>
                                <span className="text-sm font-black text-emerald-400">₹{netINR.toFixed(2)}</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Sell button */}
                    <button
                        onClick={handleSell}
                        disabled={!canSell}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                            canSell
                                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                        }`}
                    >
                        {selling ? (
                            <><Loader2 size={15} className="animate-spin" /> Processing...</>
                        ) : (
                            <>Sell {selectedAsset} <ArrowRight size={15} strokeWidth={2.5} /></>
                        )}
                    </button>
                </div>

                {/* RIGHT: Summary */}
                <div className="lg:col-span-2 space-y-5">
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Receipt size={16} className="text-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">Order Summary</h2>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${selectedAsset}-${numAmt}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                {[
                                    { label: "Selling",       value: numAmt > 0 ? `${numAmt} ${selectedAsset}` : "—" },
                                    { label: "Rate",          value: exchangeRate > 0 ? `1 ${selectedAsset} = ₹${exchangeRate.toFixed(2)}` : "—" },
                                    { label: "Price",         value: numAmt > 0 ? `₹${inrValue.toFixed(2)}` : "—" },
                                    { label: "TDS (1%)",      value: numAmt > 0 ? `₹${tds.toFixed(2)}` : "—" },
                                    { label: "Platform Fee",  value: "Free", green: true },
                                    { label: "You Receive",   value: numAmt > 0 ? `₹${netINR.toFixed(2)}` : "—", green: numAmt > 0 },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                                        <span className="text-[13px] text-gray-500 font-medium">{row.label}</span>
                                        <span className={`text-sm font-bold ${row.green ? "text-emerald-400" : "text-white"}`}>{row.value}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        <div
                            className="rounded-2xl border border-emerald-500/20 p-4"
                            style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                        >
                            <p className="text-[12px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">Net Amount</p>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={netINR.toFixed(2)}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.18 }}
                                    className="text-2xl font-black text-white tabular-nums"
                                >
                                    {numAmt > 0 ? `₹${netINR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: Shield, label: "Secure Trade" },
                                { icon: Clock,  label: "Instant Settlement" },
                            ].map((t, i) => (
                                <div key={i} className="flex items-center gap-2 rounded-xl border border-white/5 p-2.5" style={{ background: "rgba(5,13,7,0.6)" }}>
                                    <t.icon size={13} className="text-emerald-500/60 shrink-0" />
                                    <span className="text-[13px] text-gray-600 font-bold">{t.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <TransactionHistory type="sell" />
                </div>
            </div>
        </div>
    );
};

// ─── Withdrawal Tab ───────────────────────────────────────────────────────────

const WithdrawTab = () => {
    const { inrBalance, refresh: refreshWallet } = useWallet();
    const [amount, setAmount]           = useState("");
    const [withdrawing, setWithdrawing] = useState(false);
    const [availableFund, setAvailableFund] = useState(inrBalance);

    // Sync with wallet context
    useEffect(() => {
        setAvailableFund(inrBalance);
    }, [inrBalance]);

    const numAmt      = parseFloat(amount) || 0;
    const platformFee = numAmt * 0.005;
    const netAmount   = numAmt - platformFee;
    const canWithdraw = numAmt > 0 && numAmt <= availableFund && !withdrawing;

    const handleWithdraw = async () => {
        if (!canWithdraw) return;
        setWithdrawing(true);
        try {
            await api.post(ENDPOINTS.WITHDRAW_FIAT, {
                withdraw_request_amount: parseFloat(amount),
                fiat: "INR",
            });
            toast.success("Withdrawal request submitted successfully!");
            setAmount("");

            // Refresh balance
            try {
                const res = await api.get(ENDPOINTS.BALANCE_CONVERSION);
                if (res.data) setAvailableFund(res.data.inr_balance ?? 0);
            } catch { /* silent */ }
            refreshWallet();
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setWithdrawing(false);
        }
    };

    return (
        <div className="space-y-5">

            {/* Available balance — prominent at top */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-emerald-500/15 p-5 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.02) 100%)" }}
            >
                <div>
                    <p className="text-[12px] text-emerald-400/60 uppercase tracking-widest font-bold mb-1">Available INR Balance</p>
                    <p className="text-3xl font-black text-white tabular-nums">
                        ₹{availableFund.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Wallet size={24} className="text-emerald-400" />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* LEFT: Withdraw form */}
                <div
                    className="lg:col-span-3 rounded-3xl border border-white/6 p-6 space-y-6"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="flex items-center gap-2.5">
                        <div className="h-5 w-1 rounded-full bg-emerald-400" />
                        <h2 className="text-base font-black text-white tracking-wide">Withdraw to Bank</h2>
                    </div>

                    {/* Amount input */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold">
                                Amount to Withdraw
                            </span>
                            <button
                                onClick={() => setAmount(availableFund.toFixed(2))}
                                className="text-[13px] text-emerald-400 font-bold hover:underline"
                            >
                                MAX
                            </button>
                        </div>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600">
                                <IndianRupee size={20} strokeWidth={2.5} />
                            </span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-2xl border border-white/8 py-5 pl-14 pr-5 text-3xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                style={{ background: "rgba(5,13,7,0.8)" }}
                            />
                        </div>
                        {numAmt > availableFund && (
                            <p className="text-[13px] text-red-400 font-bold px-1">Insufficient balance</p>
                        )}
                    </div>

                    {/* You will get */}
                    <div className="space-y-1.5">
                        <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold px-1">
                            You Will Receive (INR)
                        </span>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600">
                                <IndianRupee size={18} strokeWidth={2.5} />
                            </span>
                            <div
                                className="w-full rounded-2xl border border-white/6 py-4 pl-14 pr-5 text-xl font-black text-white tabular-nums"
                                style={{ background: "rgba(5,13,7,0.5)" }}
                            >
                                {numAmt > 0 ? `₹${netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "0.00"}
                            </div>
                        </div>
                    </div>

                    {/* Breakdown */}
                    {numAmt > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-white/5 p-4 space-y-1"
                            style={{ background: "rgba(5,13,7,0.6)" }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-500">Withdraw Amount:</span>
                                <span className="text-sm font-bold text-white">₹{numAmt.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-500">Platform Fee (0.5%):</span>
                                <span className="text-sm font-bold text-amber-400">₹{platformFee.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                <span className="text-sm text-white font-bold">You Receive:</span>
                                <span className="text-sm font-black text-emerald-400">₹{netAmount.toFixed(2)}</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Withdraw button */}
                    <button
                        onClick={handleWithdraw}
                        disabled={!canWithdraw}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                            canWithdraw
                                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                        }`}
                    >
                        {withdrawing ? (
                            <><Loader2 size={15} className="animate-spin" /> Processing...</>
                        ) : (
                            <>Withdraw <ArrowRight size={15} strokeWidth={2.5} /></>
                        )}
                    </button>
                </div>

                {/* RIGHT: Summary */}
                <div className="lg:col-span-2 space-y-5">
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Receipt size={16} className="text-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">Withdrawal Summary</h2>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={numAmt}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                {[
                                    { label: "Withdraw Amount",      value: numAmt > 0 ? `₹${numAmt.toLocaleString()}` : "—" },
                                    { label: "Platform Fee (0.5%)",  value: numAmt > 0 ? `₹${platformFee.toFixed(2)}` : "—" },
                                    { label: "Processing Time",      value: "1-2 Business Days" },
                                    { label: "Credited To",          value: "Linked Bank Account" },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                                        <span className="text-[13px] text-gray-500 font-medium">{row.label}</span>
                                        <span className="text-sm font-bold text-white">{row.value}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        <div
                            className="rounded-2xl border border-emerald-500/20 p-4"
                            style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                        >
                            <p className="text-[12px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">You Will Receive</p>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={netAmount.toFixed(2)}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.18 }}
                                    className="text-2xl font-black text-white tabular-nums"
                                >
                                    {numAmt > 0 ? `₹${netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: Shield, label: "Secure Transfer" },
                                { icon: Clock,  label: "1-2 Day Processing" },
                            ].map((t, i) => (
                                <div key={i} className="flex items-center gap-2 rounded-xl border border-white/5 p-2.5" style={{ background: "rgba(5,13,7,0.6)" }}>
                                    <t.icon size={13} className="text-emerald-500/60 shrink-0" />
                                    <span className="text-[13px] text-gray-600 font-bold">{t.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <TransactionHistory type="withdraw" />
                </div>
            </div>
        </div>
    );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const parseDate = (dateStr: string) => {
    if (!dateStr) return { day: "—", month: "—" };
    const d = new Date(dateStr.includes("T") ? dateStr : dateStr.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1"));
    if (isNaN(d.getTime())) return { day: "—", month: "—" };
    return { day: String(d.getDate()).padStart(2, "0"), month: MONTHS[d.getMonth()] };
};

// ─── Sell row ────────────────────────────────────────────────────────────────

const SellRow = ({ txn }: { txn: any }) => {
    const { day, month } = parseDate(txn.created_at);
    const ticker = txn.coin?.ticker || "YTP";
    return (
        <a
            href={txn.explorer_link || "#"}
            target={txn.explorer_link ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
        >
            <div className="shrink-0 h-9 w-9 rounded-lg bg-emerald-500 flex flex-col items-center justify-center">
                <span className="text-[11px] font-black text-black leading-none">{day}</span>
                <span className="text-[7px] font-black text-black/60 uppercase">{month}</span>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-white truncate">{txn.trans_type}</p>
                <p className={`text-[11px] font-bold ${
                    txn.status === "COMPLETED" ? "text-emerald-400" : txn.status === "PENDING" ? "text-amber-400" : "text-red-400"
                }`}>{txn.status}</p>
            </div>
            <span className="text-[13px] font-black tabular-nums shrink-0 text-white">
                -{txn.amount} {ticker}
            </span>
        </a>
    );
};

// ─── Withdraw row ────────────────────────────────────────────────────────────

const WithdrawRow = ({ txn }: { txn: any }) => {
    const { day, month } = parseDate(txn.created_at || txn.date);
    const amount = txn.request_amount || txn.withdraw_request_amount || txn.amount || "0";
    const status = txn.status || "PENDING";
    return (
        <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
            <div className="shrink-0 h-9 w-9 rounded-lg bg-amber-500 flex flex-col items-center justify-center">
                <span className="text-[11px] font-black text-black leading-none">{day}</span>
                <span className="text-[7px] font-black text-black/60 uppercase">{month}</span>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-white truncate">Withdrawal</p>
                <p className={`text-[11px] font-bold ${
                    status === "COMPLETED" || status === "APPROVED" ? "text-emerald-400"
                    : status === "PENDING" ? "text-amber-400" : "text-red-400"
                }`}>{status}</p>
            </div>
            <span className="text-[13px] font-black tabular-nums shrink-0 text-white">
                ₹{Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
        </div>
    );
};

// ─── See All Modal ───────────────────────────────────────────────────────────

const SeeAllModal = ({
    open,
    onClose,
    type,
    allTxns,
    loading,
}: {
    open: boolean;
    onClose: () => void;
    type: "sell" | "withdraw";
    allTxns: any[];
    loading: boolean;
}) => {
    const isSell = type === "sell";

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 60 }}
                        transition={{ duration: 0.3, type: "spring", damping: 25 }}
                        className="w-full sm:max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-white/8 relative flex flex-col overflow-hidden"
                        style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/6 shrink-0">
                            <div className="flex items-center gap-2.5">
                                {isSell
                                    ? <TrendingDown size={16} className="text-emerald-400" />
                                    : <Banknote size={16} className="text-emerald-400" />
                                }
                                <h3 className="text-base font-black text-white">
                                    {isSell ? "All Sell Orders" : "All Withdrawals"}
                                </h3>
                                <span className="text-[11px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                    {allTxns.length}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-8 w-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {loading ? (
                                <div className="py-10 flex justify-center">
                                    <Loader2 size={24} className="text-emerald-400 animate-spin" />
                                </div>
                            ) : allTxns.length === 0 ? (
                                <div className="py-10 flex flex-col items-center gap-2">
                                    <div className="h-12 w-12 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center">
                                        {isSell
                                            ? <TrendingDown size={20} className="text-gray-700" />
                                            : <Banknote size={20} className="text-gray-700" />
                                        }
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">No {isSell ? "sell orders" : "withdrawals"} found</p>
                                </div>
                            ) : (
                                <div>
                                    {allTxns.map((txn: any, i: number) => (
                                        <motion.div
                                            key={txn.id ?? i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.02 }}
                                        >
                                            {isSell ? <SellRow txn={txn} /> : <WithdrawRow txn={txn} />}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─── Transaction history card (shared) ───────────────────────────────────────

const TransactionHistory = ({ type }: { type: "sell" | "withdraw" }) => {
    const { token } = useAuth();
    const [txns, setTxns]         = useState<any[]>([]);
    const [allTxns, setAllTxns]   = useState<any[]>([]);
    const [loading, setLoading]   = useState(true);
    const [showAll, setShowAll]   = useState(false);

    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            if (type === "sell") {
                const res = await api.post(ENDPOINTS.TRANSACTION_FILTER, {
                    trans_type_filter: ["Sell YTP"],
                    page: 1,
                });
                const data = res.data?.data ?? res.data;
                if (Array.isArray(data)) {
                    setAllTxns(data);
                    setTxns(data.slice(0, 4));
                }
            } else {
                const res = await api.get(ENDPOINTS.WITHDRAW_LIST);
                const data = res.data?.data ?? res.data;
                if (Array.isArray(data)) {
                    setAllTxns(data);
                    setTxns(data.slice(0, 4));
                }
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [token, type]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const isSell = type === "sell";

    return (
        <>
            <SeeAllModal
                open={showAll}
                onClose={() => setShowAll(false)}
                type={type}
                allTxns={allTxns}
                loading={loading}
            />

            <div
                className="rounded-3xl border border-white/6 p-6 space-y-4"
                style={{ background: "rgba(10,26,15,0.7)" }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Clock size={16} className="text-emerald-400" />
                        <h2 className="text-sm font-black text-white tracking-wide">
                            {isSell ? "Recent Sell Orders" : "Recent Withdrawals"}
                        </h2>
                    </div>
                    {allTxns.length > 4 && (
                        <button
                            onClick={() => setShowAll(true)}
                            className="text-[12px] text-emerald-400 font-bold hover:underline flex items-center gap-1"
                        >
                            See All <ArrowUpRight size={9} />
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="py-6 flex justify-center">
                        <Loader2 size={20} className="text-emerald-400 animate-spin" />
                    </div>
                ) : txns.length === 0 ? (
                    <div className="py-6 flex flex-col items-center gap-2">
                        <div className="h-10 w-10 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center">
                            {isSell
                                ? <TrendingDown size={16} className="text-gray-700" />
                                : <Banknote size={16} className="text-gray-700" />
                            }
                        </div>
                        <p className="text-[13px] text-gray-700">No {isSell ? "sell orders" : "withdrawals"} yet</p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {txns.map((txn: any, i: number) => (
                            <div key={txn.id ?? i}>
                                {isSell ? <SellRow txn={txn} /> : <WithdrawRow txn={txn} />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

// ─── Main component ──────────────────────────────────────────────────────────

const Exchange = () => {
    const [tab, setTab] = useState<Tab>("sell");

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── Page title ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                <h1 className="text-xl font-black text-white tracking-tight">Exchange</h1>
                <p className="text-[13px] text-gray-600 mt-0.5">Sell your assets or withdraw funds to your bank</p>
            </motion.div>

            {/* ── Tab switcher ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                className="flex items-center gap-2 p-1 rounded-2xl border border-white/6 w-fit"
                style={{ background: "rgba(10,26,15,0.7)" }}
            >
                {([
                    { key: "sell" as Tab,     label: "Sell",       icon: TrendingDown },
                    { key: "withdraw" as Tab, label: "Withdrawal", icon: Banknote },
                ]).map((t) => {
                    const active = t.key === tab;
                    const Icon   = t.icon;
                    return (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all ${
                                active
                                    ? "bg-emerald-500 text-black shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <Icon size={14} strokeWidth={2.5} />
                            {t.label}
                        </button>
                    );
                })}
            </motion.div>

            {/* ── Tab content ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                >
                    {tab === "sell" ? <SellTab /> : <WithdrawTab />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Exchange;

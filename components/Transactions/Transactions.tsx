"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ChevronLeft, ChevronRight,
    Filter, X,
    ArrowDownLeft, ArrowUpRight, Gift, Coins, Banknote,
    Clock, CheckCircle2, XCircle, AlertCircle, ExternalLink,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { getApiError } from "@/lib/helpers";
import { SectionLoader } from "@/components/Include/Loader";

const ITEMS_PER_PAGE = 9;

const FILTER_TYPES = [
    "Buy YTP",
    "Sell YTP",
    "Staking Reward",
    "Referral Reward",
    "Staking Hike",
    "Staking Referral Reward",
];

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

// ─── Status badge ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
    const s = status?.toUpperCase() || "";
    const config = s === "COMPLETED" || s === "APPROVED"
        ? { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", Icon: CheckCircle2 }
        : s === "PENDING"
        ? { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", Icon: Clock }
        : { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400", Icon: XCircle };

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
            <config.Icon size={8} />
            {status}
        </span>
    );
};

// ─── Parse transaction date ──────────────────────────────────────────────────

const parseDate = (dateStr: string) => {
    if (!dateStr) return { day: "—", month: "—" };
    // Handle "DD-MM-YYYY HH:MM" or ISO format
    let d: Date;
    if (dateStr.includes("-") && !dateStr.includes("T")) {
        const [datePart] = dateStr.split(" ");
        const parts = datePart.split("-");
        if (parts[0].length === 4) {
            d = new Date(dateStr);
        } else {
            d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
    } else {
        d = new Date(dateStr);
    }

    if (isNaN(d.getTime())) return { day: "—", month: "—" };
    return {
        day: String(d.getDate()).padStart(2, "0"),
        month: MONTHS[d.getMonth()],
    };
};

// ─── Determine icon based on trans_type ──────────────────────────────────────

const getIcon = (transType: string) => {
    const t = (transType || "").toLowerCase();
    if (t.includes("buy")) return ArrowDownLeft;
    if (t.includes("sell")) return ArrowUpRight;
    if (t.includes("reward") || t.includes("referral")) return Gift;
    if (t.includes("stak")) return Coins;
    if (t.includes("withdraw")) return Banknote;
    return Coins;
};

const isCredit = (transType: string) => {
    const t = (transType || "").toLowerCase();
    return t.includes("buy") || t.includes("reward") || t.includes("bonus") || t.includes("referral") || t.includes("receive");
};

// ─── Main ────────────────────────────────────────────────────────────────────

const Transactions = () => {
    const { token } = useAuth();

    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading]           = useState(true);
    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPages, setTotalPages]     = useState(1);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const [showFilters, setShowFilters]   = useState(false);

    const fetchTransactions = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            if (selectedFilters.length > 0) {
                const res = await api.post(ENDPOINTS.TRANSACTION_FILTER, {
                    trans_type_filter: selectedFilters,
                    page: currentPage,
                });
                const data = res.data?.data ?? res.data;
                if (Array.isArray(data)) {
                    setTransactions(data);
                    setTotalPages(1);
                } else {
                    setTransactions([]);
                    setTotalPages(1);
                }
            } else {
                const res = await api.get(`${ENDPOINTS.TRANSACTION_LIST}?page=${currentPage}`);
                const data = res.data;
                if (data?.results && Array.isArray(data.results)) {
                    setTransactions(data.results);
                    setTotalPages(Math.ceil((data.count || 0) / ITEMS_PER_PAGE));
                } else {
                    setTransactions([]);
                    setTotalPages(1);
                }
            }
        } catch (err: any) {
            toast.error(getApiError(err));
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [token, currentPage, selectedFilters]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const toggleFilter = (filterType: string) => {
        setCurrentPage(1);
        setSelectedFilters((prev) =>
            prev.includes(filterType)
                ? prev.filter((f) => f !== filterType)
                : [...prev, filterType]
        );
    };

    const clearFilters = () => {
        setSelectedFilters([]);
        setCurrentPage(1);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── Header ── */}
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
                        <h1 className="text-xl font-black text-white tracking-tight">Transaction History</h1>
                        <p className="text-sm text-gray-600 mt-0.5">
                            {selectedFilters.length > 0 ? `Filtered by: ${selectedFilters.join(", ")}` : "All transactions"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowFilters((v) => !v)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[12px] font-black uppercase tracking-widest transition-all ${
                        showFilters || selectedFilters.length > 0
                            ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
                            : "border-white/8 text-gray-400 hover:border-emerald-500/30"
                    }`}
                >
                    <Filter size={13} />
                    Filter
                    {selectedFilters.length > 0 && (
                        <span className="h-5 w-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                            {selectedFilters.length}
                        </span>
                    )}
                </button>
            </motion.div>

            {/* ── Filter panel ── */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div
                            className="rounded-2xl border border-white/6 p-5 space-y-3"
                            style={{ background: "rgba(10,26,15,0.7)" }}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-white">Filter by Type</h3>
                                {selectedFilters.length > 0 && (
                                    <button onClick={clearFilters} className="text-[13px] text-emerald-400 font-bold hover:underline flex items-center gap-1">
                                        <X size={10} /> Clear all
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {FILTER_TYPES.map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => toggleFilter(f)}
                                        className={`px-3 py-2 rounded-xl text-[12px] font-bold transition-all ${
                                            selectedFilters.includes(f)
                                                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                                : "border border-white/6 text-gray-500 hover:text-white hover:border-white/15"
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Transactions list ── */}
            {loading ? (
                <SectionLoader />
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.4 }}
                    className="rounded-3xl border border-white/6 overflow-hidden"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    {transactions.length === 0 ? (
                        <div className="py-16 flex flex-col items-center gap-3">
                            <div className="h-14 w-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center">
                                <AlertCircle size={24} className="text-gray-700" />
                            </div>
                            <p className="text-sm text-gray-600 font-bold">No transactions found</p>
                            {selectedFilters.length > 0 && (
                                <button onClick={clearFilters} className="text-[13px] text-emerald-400 font-bold hover:underline">
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div>
                            {transactions.map((txn: any, i: number) => {
                                const { day, month } = parseDate(txn.created_at);
                                const Icon = getIcon(txn.trans_type);
                                const credit = isCredit(txn.trans_type);
                                const ticker = txn.coin?.ticker || "YTP";

                                return (
                                    <motion.div
                                        key={txn.id ?? i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                    >
                                        <a
                                            href={txn.explorer_link || "#"}
                                            target={txn.explorer_link ? "_blank" : undefined}
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 border-b border-white/4 last:border-0 hover:bg-white/[0.02] transition-colors"
                                        >
                                            {/* Date badge */}
                                            <div className="shrink-0 h-11 w-11 rounded-xl bg-emerald-500 flex flex-col items-center justify-center">
                                                <span className="text-sm font-black text-black leading-none">{day}</span>
                                                <span className="text-[9px] font-black text-black/60 uppercase tracking-wider">{month}</span>
                                            </div>

                                            {/* Icon */}
                                            <div className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center hidden sm:flex ${
                                                credit ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                            }`}>
                                                <Icon size={14} />
                                            </div>

                                            {/* Details */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-bold text-white truncate">{txn.trans_type || "Transaction"}</p>
                                                    <StatusBadge status={txn.status} />
                                                </div>
                                                {txn.explorer_link && (
                                                    <p className="text-[11px] text-gray-700 flex items-center gap-1 mt-0.5">
                                                        <ExternalLink size={8} /> View on explorer
                                                    </p>
                                                )}
                                            </div>

                                            {/* Amount */}
                                            <div className="shrink-0 text-right">
                                                <p className={`text-sm font-black tabular-nums ${credit ? "text-emerald-400" : "text-white"}`}>
                                                    {credit ? "+" : "-"}{txn.amount} {ticker}
                                                </p>
                                            </div>
                                        </a>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 py-4 border-t border-white/4">
                            <button
                                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-all ${
                                    currentPage <= 1
                                        ? "border-white/4 text-gray-700 cursor-not-allowed"
                                        : "border-white/8 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30"
                                }`}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="flex items-center px-4 py-1.5 rounded-xl bg-white/4 border border-white/6">
                                <span className="text-[13px] text-gray-400 font-medium">
                                    Page <span className="text-white font-bold">{currentPage}</span>
                                    <span className="mx-1 text-gray-600">of</span>
                                    <span className="text-white font-bold">{totalPages}</span>
                                </span>
                            </div>

                            <button
                                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-all ${
                                    currentPage >= totalPages
                                        ? "border-white/4 text-gray-700 cursor-not-allowed"
                                        : "border-white/8 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30"
                                }`}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default Transactions;

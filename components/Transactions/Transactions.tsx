"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
    Filter, Search, X, Calendar,
    ArrowDownLeft, ArrowUpRight, Gift, Coins, Banknote,
    Clock, CheckCircle2, AlertCircle, XCircle,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type TxnType   = "all" | "credit" | "debit";
type TxnStatus = "COMPLETED" | "PENDING" | "FAILED";

interface Txn {
    id: string;
    date: string;
    day: number;
    month: string;
    label: string;
    description: string;
    amount: string;
    type: "credit" | "debit";
    status: TxnStatus;
    icon: "bonus" | "reward" | "stake" | "withdraw" | "buy" | "sell" | "fund";
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const TRANSACTIONS: Txn[] = [
    { id: "TXN001", date: "2026-02-22", day: 22, month: "FEB", label: "Signup Bonus",      description: "Welcome reward credited",        amount: "965.0065 YTP", type: "credit", status: "COMPLETED", icon: "bonus" },
    { id: "TXN002", date: "2026-07-14", day: 14, month: "JUL", label: "Tx Reward",          description: "Transaction mining reward",       amount: "1 YTP",        type: "credit", status: "PENDING",   icon: "reward" },
    { id: "TXN003", date: "2026-03-15", day: 15, month: "MAR", label: "Staking Deposit",    description: "EARNER plan — 50 days lock",      amount: "10,000 YTP",   type: "debit",  status: "COMPLETED", icon: "stake" },
    { id: "TXN004", date: "2026-03-18", day: 18, month: "MAR", label: "Fund Added",         description: "UPI payment — ₹2,000",            amount: "₹2,000",       type: "credit", status: "COMPLETED", icon: "fund" },
    { id: "TXN005", date: "2026-03-20", day: 20, month: "MAR", label: "YTP Purchase",       description: "Bought 500 YTP via INR",          amount: "500 YTP",      type: "credit", status: "COMPLETED", icon: "buy" },
    { id: "TXN006", date: "2026-03-25", day: 25, month: "MAR", label: "Withdrawal",         description: "Bank transfer — HDFC ****1234",   amount: "₹1,500",       type: "debit",  status: "COMPLETED", icon: "withdraw" },
    { id: "TXN007", date: "2026-04-01", day: 1,  month: "APR", label: "Staking Reward",     description: "EARNER plan daily yield",          amount: "12.50 YTP",    type: "credit", status: "COMPLETED", icon: "reward" },
    { id: "TXN008", date: "2026-04-02", day: 2,  month: "APR", label: "Sell Order",         description: "Sold 200 YTP at ₹0.75",           amount: "200 YTP",      type: "debit",  status: "COMPLETED", icon: "sell" },
    { id: "TXN009", date: "2026-04-03", day: 3,  month: "APR", label: "Referral Bonus",     description: "User joined via invite link",      amount: "10 YTP",       type: "credit", status: "PENDING",   icon: "bonus" },
    { id: "TXN010", date: "2026-04-04", day: 4,  month: "APR", label: "Withdrawal",         description: "Bank transfer — SBI ****5678",    amount: "₹500",         type: "debit",  status: "FAILED",    icon: "withdraw" },
];

const ITEMS_PER_PAGE = 5;

// ─── Icon map ─────────────────────────────────────────────────────────────────

const iconMap: Record<Txn["icon"], typeof Gift> = {
    bonus:    Gift,
    reward:   Coins,
    stake:    ArrowUpRight,
    withdraw: Banknote,
    buy:      ArrowDownLeft,
    sell:     ArrowUpRight,
    fund:     ArrowDownLeft,
};

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: TxnStatus }) => {
    const styles: Record<TxnStatus, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
        COMPLETED: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", icon: CheckCircle2 },
        PENDING:   { bg: "bg-amber-500/10 border-amber-500/20",     text: "text-amber-400",   icon: Clock },
        FAILED:    { bg: "bg-red-500/10 border-red-500/20",         text: "text-red-400",     icon: XCircle },
    };
    const s = styles[status];
    const Icon = s.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${s.bg} ${s.text}`}>
            <Icon size={9} />
            {status}
        </span>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const Transactions = () => {
    const [typeFilter, setTypeFilter]     = useState<TxnType>("all");
    const [statusFilter, setStatusFilter] = useState<TxnStatus | "all">("all");
    const [searchQuery, setSearchQuery]   = useState("");
    const [showFilters, setShowFilters]   = useState(false);
    const [page, setPage]                 = useState(1);

    const filtered = useMemo(() => {
        return TRANSACTIONS.filter((t) => {
            if (typeFilter !== "all" && t.type !== typeFilter) return false;
            if (statusFilter !== "all" && t.status !== statusFilter) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                if (!t.label.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [typeFilter, statusFilter, searchQuery]);

    const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const paged       = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const clearFilters = () => {
        setTypeFilter("all");
        setStatusFilter("all");
        setSearchQuery("");
        setPage(1);
    };

    const hasActiveFilters = typeFilter !== "all" || statusFilter !== "all" || searchQuery.trim() !== "";

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
                        <h1 className="text-xl font-black text-white tracking-tight">Transaction History</h1>
                        <p className="text-[11px] text-gray-600 mt-0.5">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""} found</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowFilters((v) => !v)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        showFilters || hasActiveFilters
                            ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
                            : "border-white/8 text-gray-400 hover:border-emerald-500/30"
                    }`}
                >
                    <Filter size={13} />
                    Filter
                    {hasActiveFilters && (
                        <span className="h-4 w-4 rounded-full bg-black/20 flex items-center justify-center text-[8px]">!</span>
                    )}
                </button>
            </motion.div>

            {/* ── Filters panel ── */}
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
                            className="rounded-3xl border border-white/6 p-5 space-y-4"
                            style={{ background: "rgba(10,26,15,0.7)" }}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-white">Filters</h3>
                                {hasActiveFilters && (
                                    <button onClick={clearFilters} className="text-[9px] text-emerald-400 font-bold hover:underline flex items-center gap-1">
                                        <X size={10} /> Clear all
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                        placeholder="Search by label, description, or ID..."
                                        className="w-full rounded-xl border border-white/8 py-2.5 pl-10 pr-4 text-[11px] font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                        style={{ background: "rgba(5,13,7,0.8)" }}
                                    />
                                </div>

                                {/* Type filter */}
                                <div className="flex items-center gap-1.5">
                                    {(["all", "credit", "debit"] as TxnType[]).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => { setTypeFilter(t); setPage(1); }}
                                            className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                typeFilter === t
                                                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                                    : "border border-white/6 text-gray-600 hover:text-gray-400"
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>

                                {/* Status filter */}
                                <div className="flex items-center gap-1.5">
                                    {(["all", "COMPLETED", "PENDING", "FAILED"] as (TxnStatus | "all")[]).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => { setStatusFilter(s); setPage(1); }}
                                            className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                statusFilter === s
                                                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                                    : "border border-white/6 text-gray-600 hover:text-gray-400"
                                            }`}
                                        >
                                            {s === "all" ? "All" : s.slice(0, 4)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Transactions list ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.4 }}
                className="rounded-3xl border border-white/6 overflow-hidden"
                style={{ background: "rgba(10,26,15,0.7)" }}
            >
                {paged.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-3">
                        <div className="h-14 w-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center">
                            <AlertCircle size={24} className="text-gray-700" />
                        </div>
                        <p className="text-sm text-gray-600 font-bold">No transactions found</p>
                        <p className="text-[10px] text-gray-700">Try adjusting your filters</p>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="mt-1 text-[10px] text-emerald-400 font-bold hover:underline">
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        {paged.map((txn, i) => {
                            const Icon    = iconMap[txn.icon];
                            const isCredit = txn.type === "credit";

                            return (
                                <motion.div
                                    key={txn.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04, duration: 0.25 }}
                                    className="flex items-center gap-4 px-5 sm:px-6 py-4 border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors"
                                >
                                    {/* Date badge */}
                                    <div className="shrink-0 h-12 w-12 rounded-xl bg-emerald-500 flex flex-col items-center justify-center">
                                        <span className="text-base font-black text-black leading-none">{txn.day}</span>
                                        <span className="text-[8px] font-black text-black/60 uppercase tracking-wider">{txn.month}</span>
                                    </div>

                                    {/* Icon */}
                                    <div className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center hidden sm:flex ${
                                        isCredit ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                    }`}>
                                        <Icon size={15} />
                                    </div>

                                    {/* Details */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-white truncate">{txn.label}</p>
                                            <StatusBadge status={txn.status} />
                                        </div>
                                        <p className="text-[10px] text-gray-600 truncate mt-0.5">{txn.description}</p>
                                        <p className="text-[9px] text-gray-700 mt-0.5 sm:hidden">{txn.id}</p>
                                    </div>

                                    {/* Amount */}
                                    <div className="shrink-0 text-right">
                                        <p className={`text-sm font-black tabular-nums ${
                                            isCredit ? "text-emerald-400" : "text-white"
                                        }`}>
                                            {isCredit ? "+" : "-"}{txn.amount}
                                        </p>
                                        <p className="text-[9px] text-gray-700 hidden sm:block">{txn.id}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {filtered.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-center gap-3 py-4 border-t border-white/4">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                            className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-all ${
                                currentPage <= 1
                                    ? "border-white/4 text-gray-700 cursor-not-allowed"
                                    : "border-white/8 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30"
                            }`}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-[11px] font-black transition-all ${
                                        p === currentPage
                                            ? "bg-emerald-500 text-black shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                                            : "text-gray-500 hover:text-white hover:bg-white/4"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
        </div>
    );
};

export default Transactions;

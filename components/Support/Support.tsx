"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, X, Send, Paperclip, ChevronDown,
    MessageSquare, Clock, CheckCircle2, AlertCircle, XCircle,
    LifeBuoy, Search, ChevronLeft, ChevronRight,
    Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type TicketPriority = "Low" | "Medium" | "High";

interface Ticket {
    id: string;
    type: string;
    subject: string;
    message: string;
    status: TicketStatus;
    priority: TicketPriority;
    date: string;
    lastReply: string;
}

const TICKET_TYPES = [
    "Account Issue",
    "Transaction Problem",
    "KYC Verification",
    "Staking Issue",
    "Withdrawal Problem",
    "Technical Bug",
    "Feature Request",
    "Other",
];

// ─── Sample data ──────────────────────────────────────────────────────────────

const SAMPLE_TICKETS: Ticket[] = [
    {
        id: "TKT-001",
        type: "Transaction Problem",
        subject: "Fund not credited after UPI payment",
        message: "I made a UPI payment of ₹2000 but the amount is not reflected in my wallet.",
        status: "IN_PROGRESS",
        priority: "High",
        date: "2026-04-02",
        lastReply: "2026-04-03",
    },
    {
        id: "TKT-002",
        type: "KYC Verification",
        subject: "Aadhaar OTP not received",
        message: "I have been trying to verify my Aadhaar but the OTP is not being delivered.",
        status: "OPEN",
        priority: "Medium",
        date: "2026-04-04",
        lastReply: "—",
    },
    {
        id: "TKT-003",
        type: "Staking Issue",
        subject: "Staking reward not showing",
        message: "My EARNER plan staking reward for the last 3 days is missing.",
        status: "RESOLVED",
        priority: "Medium",
        date: "2026-03-28",
        lastReply: "2026-03-30",
    },
    {
        id: "TKT-004",
        type: "Account Issue",
        subject: "Unable to change email address",
        message: "I need to update my email but there is no option in settings.",
        status: "CLOSED",
        priority: "Low",
        date: "2026-03-15",
        lastReply: "2026-03-16",
    },
];

const ITEMS_PER_PAGE = 5;

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<TicketStatus, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
    OPEN:        { bg: "bg-sky-500/10 border-sky-500/20",      text: "text-sky-400",     icon: AlertCircle },
    IN_PROGRESS: { bg: "bg-amber-500/10 border-amber-500/20",  text: "text-amber-400",   icon: Clock },
    RESOLVED:    { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", icon: CheckCircle2 },
    CLOSED:      { bg: "bg-gray-500/10 border-gray-500/20",    text: "text-gray-400",    icon: XCircle },
};

const priorityConfig: Record<TicketPriority, string> = {
    Low:    "text-gray-400",
    Medium: "text-amber-400",
    High:   "text-red-400",
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: TicketStatus }) => {
    const cfg  = statusConfig[status];
    const Icon = cfg.icon;
    const label = status.replace("_", " ");
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
            <Icon size={9} />
            {label}
        </span>
    );
};

// ─── Create Ticket Modal ──────────────────────────────────────────────────────

const CreateTicketModal = ({
    open,
    onClose,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (ticket: Ticket) => void;
}) => {
    const [type, setType]           = useState("");
    const [subject, setSubject]     = useState("");
    const [message, setMessage]     = useState("");
    const [priority, setPriority]   = useState<TicketPriority>("Medium");
    const [file, setFile]           = useState<File | null>(null);
    const [showTypeDrop, setShowTypeDrop] = useState(false);
    const fileRef                   = useRef<HTMLInputElement>(null);

    const canSubmit = type && subject.trim() && message.trim();

    const handleSubmit = () => {
        if (!canSubmit) return;
        const newTicket: Ticket = {
            id: `TKT-${String(Math.floor(Math.random() * 900) + 100)}`,
            type,
            subject: subject.trim(),
            message: message.trim(),
            status: "OPEN",
            priority,
            date: new Date().toISOString().slice(0, 10),
            lastReply: "—",
        };
        onSubmit(newTicket);
        setType("");
        setSubject("");
        setMessage("");
        setPriority("Medium");
        setFile(null);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) setFile(f);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-lg rounded-3xl border border-white/8 p-6 space-y-5 relative max-h-[90vh] overflow-y-auto"
                        style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>

                        {/* Header */}
                        <div className="text-center space-y-1">
                            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                <MessageSquare size={20} className="text-emerald-400" />
                            </div>
                            <h3 className="text-base font-black text-white">Create Ticket</h3>
                            <p className="text-[13px] text-gray-500">Describe your issue and we&apos;ll get back to you</p>
                        </div>

                        {/* Ticket Type */}
                        <div className="space-y-1.5">
                            <label className="text-[12px] text-gray-500 uppercase tracking-wider font-bold px-1">
                                Ticket Type <span className="text-emerald-500 text-[12px]">*</span>
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setShowTypeDrop((v) => !v)}
                                    className="w-full flex items-center justify-between rounded-2xl border border-white/8 px-4 py-3.5 text-sm font-semibold hover:border-emerald-500/30 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                >
                                    <span className={type ? "text-white" : "text-gray-700"}>{type || "Select ticket type"}</span>
                                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${showTypeDrop ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {showTypeDrop && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border border-white/8 overflow-hidden max-h-48 overflow-y-auto"
                                            style={{ background: "#0a1a0f" }}
                                        >
                                            {TICKET_TYPES.map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => { setType(t); setShowTypeDrop(false); }}
                                                    className={`w-full text-left px-4 py-2.5 text-[13px] font-bold transition-all ${
                                                        type === t
                                                            ? "bg-emerald-500/10 text-emerald-400"
                                                            : "text-gray-400 hover:bg-white/4 hover:text-white"
                                                    }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="space-y-1.5">
                            <label className="text-[12px] text-gray-500 uppercase tracking-wider font-bold px-1">Priority</label>
                            <div className="flex gap-2">
                                {(["Low", "Medium", "High"] as TicketPriority[]).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-2.5 rounded-xl border text-[12px] font-black uppercase tracking-widest transition-all ${
                                            priority === p
                                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                                : "border-white/6 text-gray-600 hover:text-gray-400"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-1.5">
                            <label className="text-[12px] text-gray-500 uppercase tracking-wider font-bold px-1">
                                Subject <span className="text-emerald-500 text-[12px]">*</span>
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Brief description of the issue"
                                className="w-full rounded-2xl border border-white/8 py-3.5 px-4 text-sm font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                style={{ background: "rgba(5,13,7,0.8)" }}
                            />
                        </div>

                        {/* Message */}
                        <div className="space-y-1.5">
                            <label className="text-[12px] text-gray-500 uppercase tracking-wider font-bold px-1">
                                Message <span className="text-emerald-500 text-[12px]">*</span>
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Explain your issue in detail..."
                                rows={4}
                                className="w-full rounded-2xl border border-white/8 py-3.5 px-4 text-sm font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                                style={{ background: "rgba(5,13,7,0.8)" }}
                            />
                        </div>

                        {/* Attachment */}
                        <div className="space-y-1.5">
                            <label className="text-[12px] text-gray-500 uppercase tracking-wider font-bold px-1">
                                Attachment <span className="text-[13px] text-gray-700 normal-case italic font-normal">(optional)</span>
                            </label>
                            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />

                            {!file ? (
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full rounded-2xl border border-dashed border-white/10 hover:border-emerald-500/30 py-5 flex items-center justify-center gap-2 transition-all group"
                                    style={{ background: "rgba(5,13,7,0.5)" }}
                                >
                                    <Paperclip size={14} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
                                    <span className="text-[13px] text-gray-500 font-bold group-hover:text-gray-400">
                                        Click to attach a file
                                    </span>
                                </button>
                            ) : (
                                <div
                                    className="rounded-2xl border border-emerald-500/20 p-3 flex items-center gap-3"
                                    style={{ background: "rgba(16,185,129,0.05)" }}
                                >
                                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/8 shrink-0 flex items-center justify-center">
                                        <ImageIcon size={16} className="text-gray-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-bold text-white truncate">{file.name}</p>
                                        <p className="text-[13px] text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button
                                        onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                                        className="h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all shrink-0"
                                    >
                                        <X size={13} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className={`w-full py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                canSubmit
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                            }`}
                        >
                            Submit Ticket
                            <Send size={14} strokeWidth={2.5} />
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const Support = () => {
    const [tickets, setTickets]       = useState<Ticket[]>(SAMPLE_TICKETS);
    const [showModal, setShowModal]   = useState(false);
    const [search, setSearch]         = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
    const [page, setPage]             = useState(1);

    const filtered = tickets.filter((t) => {
        if (statusFilter !== "all" && t.status !== statusFilter) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            if (!t.subject.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q) && !t.type.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const paged       = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const addTicket = (ticket: Ticket) => {
        setTickets((prev) => [ticket, ...prev]);
        setShowModal(false);
        setPage(1);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* Modal */}
            <CreateTicketModal open={showModal} onClose={() => setShowModal(false)} onSubmit={addTicket} />

            {/* ── Hero header ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="text-center space-y-2"
            >
                <div className="flex items-center justify-center gap-2 mb-1">
                    <Image src="/logo.png" alt="YatriPay" width={120} height={32} className="h-7 w-auto object-contain" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Support Center</h1>
                <p className="text-[13px] text-gray-600 max-w-sm mx-auto">
                    Need help? Create a ticket and our team will assist you
                </p>
            </motion.div>

            {/* ── Controls bar ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3"
            >
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search tickets..."
                        className="w-full rounded-xl border border-white/8 py-2.5 pl-10 pr-4 text-[13px] font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    />
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                    {(["all", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as (TicketStatus | "all")[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`shrink-0 px-3 py-2 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all ${
                                statusFilter === s
                                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                    : "border border-white/6 text-gray-600 hover:text-gray-400"
                            }`}
                        >
                            {s === "all" ? "All" : s === "IN_PROGRESS" ? "Active" : s.slice(0, 1) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* New ticket button */}
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[12px] uppercase tracking-widest shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all shrink-0"
                >
                    <Plus size={14} strokeWidth={3} />
                    New Ticket
                </button>
            </motion.div>

            {/* ── Tickets table ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="rounded-3xl border border-white/6 overflow-hidden"
                style={{ background: "rgba(10,26,15,0.7)" }}
            >
                {/* Desktop table header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/6 text-[13px] text-gray-600 uppercase tracking-widest font-black">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-3">Subject</div>
                    <div className="col-span-1">Priority</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1">Created</div>
                    <div className="col-span-2 text-right">Last Reply</div>
                </div>

                {paged.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-3">
                        <div className="h-14 w-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center">
                            <LifeBuoy size={24} className="text-gray-700" />
                        </div>
                        <p className="text-sm text-gray-600 font-bold">No Tickets Available</p>
                        <p className="text-[12px] text-gray-700">Click &quot;New Ticket&quot; to create one.</p>
                    </div>
                ) : (
                    <div>
                        {paged.map((ticket, i) => {
                            const cfg = statusConfig[ticket.status];
                            return (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04, duration: 0.25 }}
                                    className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors"
                                >
                                    {/* Desktop row */}
                                    <div className="hidden md:grid grid-cols-12 gap-4 items-center px-6 py-4">
                                        <div className="col-span-1">
                                            <span className="text-[12px] font-mono font-bold text-gray-500">{ticket.id}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-[13px] font-bold text-gray-400">{ticket.type}</span>
                                        </div>
                                        <div className="col-span-3">
                                            <p className="text-[13px] font-bold text-white truncate">{ticket.subject}</p>
                                        </div>
                                        <div className="col-span-1">
                                            <span className={`text-[12px] font-black ${priorityConfig[ticket.priority]}`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            <StatusBadge status={ticket.status} />
                                        </div>
                                        <div className="col-span-1">
                                            <span className="text-[12px] text-gray-600 tabular-nums">{ticket.date}</span>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <span className="text-[12px] text-gray-600 tabular-nums">{ticket.lastReply}</span>
                                        </div>
                                    </div>

                                    {/* Mobile card */}
                                    <div className="md:hidden px-5 py-4 space-y-2.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[13px] font-mono font-bold text-gray-600">{ticket.id}</span>
                                                    <StatusBadge status={ticket.status} />
                                                </div>
                                                <p className="text-xs font-bold text-white truncate">{ticket.subject}</p>
                                                <p className="text-[12px] text-gray-600 mt-0.5">{ticket.type}</p>
                                            </div>
                                            <span className={`text-[13px] font-black shrink-0 ${priorityConfig[ticket.priority]}`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[13px] text-gray-700">
                                            <span>Created: {ticket.date}</span>
                                            <span>Reply: {ticket.lastReply}</span>
                                        </div>
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
                                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-[13px] font-black transition-all ${
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

export default Support;

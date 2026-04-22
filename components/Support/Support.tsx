"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, X, Send, Paperclip, ChevronDown,
    MessageSquare, Clock, CheckCircle2, AlertCircle, XCircle,
    LifeBuoy, Search, ChevronLeft, ChevronRight, ArrowLeft,
    Image as ImageIcon, RefreshCw, Eye, Headphones, User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { getApiError } from "@/lib/helpers";
import { SectionLoader, Spinner, ButtonLoader } from "@/components/Include/Loader";

// ─── Types ────────────────────────────────────────────────────────────────────

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

interface TicketCategory {
    id: number;
    value: string;
    label: string;
}

interface Ticket {
    id: string;
    rawId: string | number;
    categoryId: number | null;
    type: string;
    subject: string;
    message: string;
    status: TicketStatus;
    date: string;
    lastReply: string;
}

interface TicketComment {
    id: string | number;
    author: string;
    message: string;
    date: string;
    isStaff: boolean;
}

// ─── Ticket categories (must match backend IDs) ───────────────────────────────

const TICKET_CATEGORIES: TicketCategory[] = [
    { id: 1,  value: "general",    label: "General Query" },
    { id: 2,  value: "ytp",        label: "YTP Buy/Sell" },
    { id: 3,  value: "deposit",    label: "Deposit" },
    { id: 4,  value: "withdrawal", label: "Withdrawal" },
    { id: 5,  value: "kyc",        label: "KYC Verification" },
    { id: 6,  value: "twofa",      label: "Two Factor Authentication" },
    { id: 7,  value: "staking",    label: "Staking" },
    { id: 9,  value: "offers",     label: "Offers" },
    { id: 10, value: "referral",   label: "Referral" },
];

const categoryLabelFromId = (id: unknown): string => {
    const n = Number(id);
    if (!Number.isFinite(n)) return String(id ?? "—");
    return TICKET_CATEGORIES.find((c) => c.id === n)?.label ?? "—";
};

const ITEMS_PER_PAGE = 5;

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<TicketStatus, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
    OPEN:        { bg: "bg-sky-500/10 border-sky-500/20",      text: "text-sky-400",     icon: AlertCircle },
    IN_PROGRESS: { bg: "bg-amber-500/10 border-amber-500/20",  text: "text-amber-400",   icon: Clock },
    RESOLVED:    { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", icon: CheckCircle2 },
    CLOSED:      { bg: "bg-gray-500/10 border-gray-500/20",    text: "text-gray-400",    icon: XCircle },
};

// ─── API normalizers ──────────────────────────────────────────────────────────

const normalizeStatus = (s: unknown): TicketStatus => {
    // Backend may send boolean (false = open, true = closed) or string
    if (s === false || s === "false") return "OPEN";
    if (s === true  || s === "true")  return "RESOLVED";

    const v = String(s ?? "").toUpperCase().replace(/[\s-]/g, "_");
    if (v === "OPEN" || v === "IN_PROGRESS" || v === "RESOLVED" || v === "CLOSED") return v;
    if (v === "PENDING" || v === "NEW") return "OPEN";
    if (v === "ACTIVE" || v === "PROCESSING") return "IN_PROGRESS";
    if (v === "DONE" || v === "COMPLETED") return "RESOLVED";
    return "OPEN";
};

const formatDate = (d: unknown): string => {
    if (!d) return "—";
    const dt = new Date(String(d));
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toISOString().slice(0, 10);
};

const mapApiTicket = (raw: any): Ticket => {
    const rawId = raw?.id ?? raw?.ticket_id ?? raw?.pk ?? "";

    // ticket_category may be a number (id), string (label), or object
    const categoryRaw = raw?.ticket_category ?? raw?.category ?? raw?.ticket_type ?? raw?.type;
    let categoryId: number | null = null;
    let typeLabel = "—";

    if (typeof categoryRaw === "number") {
        categoryId = categoryRaw;
        typeLabel  = categoryLabelFromId(categoryRaw);
    } else if (typeof categoryRaw === "string") {
        const match = TICKET_CATEGORIES.find(
            (c) => c.value === categoryRaw.toLowerCase() || c.label.toLowerCase() === categoryRaw.toLowerCase()
        );
        categoryId = match?.id ?? null;
        typeLabel  = match?.label ?? categoryRaw;
    } else if (categoryRaw && typeof categoryRaw === "object") {
        categoryId = Number(categoryRaw.id ?? categoryRaw.pk) || null;
        typeLabel  = categoryRaw.label ?? categoryRaw.name ?? categoryLabelFromId(categoryId);
    }

    return {
        id: typeof rawId === "number" ? `TKT-${String(rawId).padStart(3, "0")}` : String(rawId || "TKT-—"),
        rawId,
        categoryId,
        type: typeLabel,
        subject: raw?.subject ?? raw?.title ?? "—",
        message: raw?.message ?? raw?.description ?? "",
        status: normalizeStatus(raw?.status),
        date: formatDate(raw?.created_at ?? raw?.created ?? raw?.date),
        lastReply: formatDate(raw?.updated_at ?? raw?.last_reply ?? raw?.last_comment_at) || "—",
    };
};

const mapApiComment = (raw: any): TicketComment => {
    const roleHint = String(
        raw?.role ?? raw?.user_type ?? raw?.commented_by ?? raw?.sender_type ?? ""
    ).toLowerCase();

    const isStaff = Boolean(
        raw?.is_staff ??
        raw?.staff ??
        raw?.is_admin ??
        raw?.admin ??
        raw?.from_admin ??
        raw?.user?.is_staff ??
        raw?.user?.is_admin ??
        (roleHint && (roleHint.includes("admin") || roleHint.includes("staff") || roleHint.includes("support")))
    );

    return {
        id: raw?.id ?? raw?.pk ?? Math.random().toString(36).slice(2),
        author:
            raw?.author_name ??
            raw?.user?.name ??
            raw?.user?.full_name ??
            raw?.user?.email ??
            raw?.author ??
            raw?.created_by ??
            (isStaff ? "Support Team" : "Support Team"),
        message: raw?.message ?? raw?.comment ?? raw?.text ?? "",
        date: formatDate(raw?.created_at ?? raw?.created ?? raw?.date),
        isStaff,
    };
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
    onCreated,
}: {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}) => {
    const [category, setCategory]   = useState<TicketCategory | null>(null);
    const [subject, setSubject]     = useState("");
    const [message, setMessage]     = useState("");
    const [file, setFile]           = useState<File | null>(null);
    const [showTypeDrop, setShowTypeDrop] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileRef                   = useRef<HTMLInputElement>(null);

    const canSubmit = !!(category && subject.trim() && message.trim()) && !submitting;

    const resetForm = () => {
        setCategory(null);
        setSubject("");
        setMessage("");
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleSubmit = async () => {
        if (!canSubmit || !category) return;
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("ticket_category", String(category.id));
            fd.append("subject", subject.trim());
            fd.append("message", message.trim());
            fd.append("status", "false");
            if (file) fd.append("attachment", file);

            await api.post(ENDPOINTS.TICKET_CREATE, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Ticket created successfully");
            resetForm();
            onCreated();
            onClose();
        } catch (err) {
            toast.error(getApiError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) setFile(f);
    };

    const handleClose = () => {
        if (submitting) return;
        onClose();
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
                    onClick={handleClose}
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
                            onClick={handleClose}
                            disabled={submitting}
                            className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors disabled:opacity-50"
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

                        {/* Ticket Category */}
                        <div className="space-y-1.5">
                            <label className="text-[12px] text-gray-500 uppercase tracking-wider font-bold px-1">
                                Ticket Type <span className="text-emerald-500 text-[12px]">*</span>
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setShowTypeDrop((v) => !v)}
                                    disabled={submitting}
                                    className="w-full flex items-center justify-between rounded-2xl border border-white/8 px-4 py-3.5 text-sm font-semibold hover:border-emerald-500/30 transition-all disabled:opacity-50"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                >
                                    <span className={category ? "text-white" : "text-gray-700"}>
                                        {category?.label ?? "Select ticket type"}
                                    </span>
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
                                            {TICKET_CATEGORIES.map((c) => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => { setCategory(c); setShowTypeDrop(false); }}
                                                    className={`w-full text-left px-4 py-2.5 text-[13px] font-bold transition-all ${
                                                        category?.id === c.id
                                                            ? "bg-emerald-500/10 text-emerald-400"
                                                            : "text-gray-400 hover:bg-white/4 hover:text-white"
                                                    }`}
                                                >
                                                    {c.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                                disabled={submitting}
                                placeholder="Brief description of the issue"
                                className="w-full rounded-2xl border border-white/8 py-3.5 px-4 text-sm font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50"
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
                                disabled={submitting}
                                placeholder="Explain your issue in detail..."
                                rows={4}
                                className="w-full rounded-2xl border border-white/8 py-3.5 px-4 text-sm font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all resize-none disabled:opacity-50"
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
                                    disabled={submitting}
                                    className="w-full rounded-2xl border border-dashed border-white/10 hover:border-emerald-500/30 py-5 flex items-center justify-center gap-2 transition-all group disabled:opacity-50"
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
                                        disabled={submitting}
                                        className="h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all shrink-0 disabled:opacity-50"
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
                            {submitting ? (
                                <ButtonLoader text="Submitting..." />
                            ) : (
                                <>
                                    Submit Ticket
                                    <Send size={14} strokeWidth={2.5} />
                                </>
                            )}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─── Ticket Detail / Comments Modal ───────────────────────────────────────────

const TicketDetailModal = ({
    ticket,
    onClose,
}: {
    ticket: Ticket | null;
    onClose: () => void;
}) => {
    const [comments, setComments] = useState<TicketComment[]>([]);
    const [loading, setLoading]   = useState(false);

    useEffect(() => {
        if (!ticket) return;
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setComments([]);
            try {
                const res = await api.get(ENDPOINTS.TICKET_COMMENTS, {
                    params: { ticket_id: ticket.rawId },
                });
                if (cancelled) return;
                const raw = res.data?.data ?? res.data?.results ?? res.data ?? [];
                if (Array.isArray(raw)) {
                    setComments(raw.map(mapApiComment));
                }
            } catch (err) {
                if (!cancelled) toast.error(getApiError(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [ticket]);

    return (
        <AnimatePresence>
            {ticket && (
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
                        className="w-full max-w-xl rounded-3xl border border-white/8 p-6 space-y-5 relative max-h-[90vh] overflow-y-auto"
                        style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>

                        {/* Header */}
                        <div className="space-y-2 pr-8">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[12px] font-mono font-bold text-gray-500">{ticket.id}</span>
                                <StatusBadge status={ticket.status} />
                            </div>
                            <h3 className="text-base font-black text-white">{ticket.subject}</h3>
                            <p className="text-[12px] text-gray-600">{ticket.type} · Created {ticket.date}</p>
                        </div>

                        {/* Original message */}
                        {ticket.message && (
                            <div
                                className="rounded-2xl border border-white/6 p-4"
                                style={{ background: "rgba(5,13,7,0.6)" }}
                            >
                                <p className="text-[13px] text-gray-300 whitespace-pre-wrap">{ticket.message}</p>
                            </div>
                        )}

                        {/* Comments */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[12px] text-gray-500 uppercase tracking-wider font-bold">
                                    Conversation
                                </label>
                                {!loading && comments.length > 0 && (
                                    <span className="text-[12px] text-gray-700">
                                        {comments.length} {comments.length === 1 ? "reply" : "replies"}
                                    </span>
                                )}
                            </div>

                            {loading ? (
                                <div className="py-8 flex items-center justify-center gap-2 text-gray-500">
                                    <Spinner size={16} />
                                    <span className="text-[13px] font-bold">Loading conversation...</span>
                                </div>
                            ) : comments.length === 0 ? (
                                <div
                                    className="py-8 px-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/8"
                                    style={{ background: "rgba(5,13,7,0.4)" }}
                                >
                                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <Headphones size={16} className="text-emerald-400" />
                                    </div>
                                    <p className="text-[13px] text-gray-400 font-bold">Waiting for support reply</p>
                                    <p className="text-[12px] text-gray-600 text-center max-w-xs">
                                        Our support team&apos;s response will appear here once they reply to your ticket.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {comments.map((c) => (
                                        <div
                                            key={c.id}
                                            className={`flex items-start gap-2.5 ${c.isStaff ? "" : "flex-row-reverse"}`}
                                        >
                                            {/* Avatar */}
                                            <div
                                                className={`h-8 w-8 rounded-xl border shrink-0 flex items-center justify-center ${
                                                    c.isStaff
                                                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                                                        : "bg-sky-500/10 border-sky-500/25 text-sky-400"
                                                }`}
                                            >
                                                {c.isStaff ? <Headphones size={13} /> : <UserIcon size={13} />}
                                            </div>

                                            {/* Bubble */}
                                            <div
                                                className={`max-w-[78%] rounded-2xl border p-3 ${
                                                    c.isStaff
                                                        ? "border-emerald-500/20 rounded-tl-sm"
                                                        : "border-sky-500/20 rounded-tr-sm"
                                                }`}
                                                style={{
                                                    background: c.isStaff
                                                        ? "rgba(16,185,129,0.06)"
                                                        : "rgba(56,189,248,0.05)",
                                                }}
                                            >
                                                <div className="flex items-center justify-between gap-3 mb-1">
                                                    <span className={`text-[12px] font-black uppercase tracking-wider ${
                                                        c.isStaff ? "text-emerald-400" : "text-sky-400"
                                                    }`}>
                                                        {c.isStaff ? "Support Team" : c.author}
                                                    </span>
                                                    <span className="text-[12px] text-gray-700 tabular-nums shrink-0">{c.date}</span>
                                                </div>
                                                <p className="text-[13px] text-gray-200 whitespace-pre-wrap wrap-break-word">{c.message}</p>
                                            </div>
                                        </div>
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

// ─── Main ─────────────────────────────────────────────────────────────────────

const Support = () => {
    const [tickets, setTickets]       = useState<Ticket[]>([]);
    const [loading, setLoading]       = useState(true);
    const [showModal, setShowModal]   = useState(false);
    const [search, setSearch]         = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
    const [page, setPage]             = useState(1);
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

    const fetchTickets = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await api.get(ENDPOINTS.TICKET_LIST);
            const raw = res.data?.data ?? res.data?.results ?? res.data ?? [];
            if (Array.isArray(raw)) {
                setTickets(raw.map(mapApiTicket));
            } else {
                setTickets([]);
            }
        } catch (err) {
            toast.error(getApiError(err));
            setTickets([]);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

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

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* Modals */}
            <CreateTicketModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onCreated={() => fetchTickets(true)}
            />
            <TicketDetailModal ticket={activeTicket} onClose={() => setActiveTicket(null)} />

            {/* ── Page header with back button ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-4"
            >
                <Link href="/dashboard">
                    <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                        <ArrowLeft size={16} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Support Center</h1>
                    <p className="text-sm text-gray-600 mt-0.5">Need help? Create a ticket and our team will assist you</p>
                </div>
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

                {/* Refresh */}
                <button
                    onClick={() => fetchTickets()}
                    disabled={loading}
                    className="h-10 w-10 rounded-xl border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shrink-0 disabled:opacity-50"
                    title="Refresh"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>

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
                {/* Hint */}
                <div className="px-6 py-2.5 border-b border-white/4 flex items-center gap-2 text-[12px] text-gray-600">
                    <Eye size={12} className="text-emerald-400/80" />
                    <span className="font-bold">Tip:</span>
                    <span>Click any ticket to view the conversation with support.</span>
                </div>

                {/* Desktop table header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/6 text-[13px] text-gray-600 uppercase tracking-widest font-black">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-3">Type</div>
                    <div className="col-span-3">Subject</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1">Created</div>
                    <div className="col-span-1 text-right">View</div>
                </div>

                {loading ? (
                    <div className="p-6">
                        <SectionLoader />
                    </div>
                ) : paged.length === 0 ? (
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
                            return (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04, duration: 0.25 }}
                                    onClick={() => setActiveTicket(ticket)}
                                    className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors cursor-pointer"
                                >
                                    {/* Desktop row */}
                                    <div className="hidden md:grid grid-cols-12 gap-4 items-center px-6 py-4 group">
                                        <div className="col-span-1">
                                            <span className="text-[12px] font-mono font-bold text-gray-500">{ticket.id}</span>
                                        </div>
                                        <div className="col-span-3">
                                            <span className="text-[13px] font-bold text-gray-400">{ticket.type}</span>
                                        </div>
                                        <div className="col-span-3">
                                            <p className="text-[13px] font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{ticket.subject}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <StatusBadge status={ticket.status} />
                                        </div>
                                        <div className="col-span-1">
                                            <span className="text-[12px] text-gray-600 tabular-nums">{ticket.date}</span>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-white/4 text-[12px] font-black text-gray-500 uppercase tracking-wider group-hover:border-emerald-500/30 group-hover:text-emerald-400 group-hover:bg-emerald-500/5 transition-all">
                                                <Eye size={12} />
                                                View
                                            </div>
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
                                            <div className="h-7 w-7 rounded-lg border border-emerald-500/25 bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                                <ChevronRight size={14} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[13px] text-gray-700">
                                            <span>Created: {ticket.date}</span>
                                            <span>Reply: {ticket.lastReply}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 pt-0.5 text-[12px] font-black text-emerald-400/80 uppercase tracking-wider">
                                            <Eye size={11} />
                                            Tap to view conversation
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {!loading && filtered.length > ITEMS_PER_PAGE && (
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

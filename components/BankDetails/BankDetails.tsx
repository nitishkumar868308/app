"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Landmark, Hash, GitBranch, Smartphone, Globe,
    ArrowLeft, ArrowRight, Shield, CheckCircle2, AlertCircle,
    Pencil, Loader2, CreditCard,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { SectionLoader } from "@/components/Include/Loader";
import { getApiError } from "@/lib/helpers";

// ─── Field config ────────────────────────────────────────────────────────────

interface FieldDef {
    name: string;
    apiKey: string;
    label: string;
    placeholder: string;
    icon: typeof User;
    required: boolean;
    hint?: string;
    type?: string;
}

const FIELDS: FieldDef[] = [
    {
        name: "holderName",
        apiKey: "account_holder_name",
        label: "Account Holder Name",
        placeholder: "Enter full name as per bank records",
        icon: User,
        required: true,
    },
    {
        name: "bankName",
        apiKey: "bank_name",
        label: "Bank Name",
        placeholder: "e.g. State Bank of India",
        icon: Landmark,
        required: true,
    },
    {
        name: "accountNumber",
        apiKey: "account_number",
        label: "Account Number",
        placeholder: "Enter your bank account number",
        icon: Hash,
        required: true,
        type: "password",
    },
    {
        name: "ifsc",
        apiKey: "ifsc_code",
        label: "IFSC / Branch Code",
        placeholder: "e.g. SBIN0001234",
        icon: GitBranch,
        required: true,
        hint: "Branch Code for Australian users",
    },
    {
        name: "upi",
        apiKey: "upi_id",
        label: "UPI ID",
        placeholder: "e.g. name@upi",
        icon: Smartphone,
        required: false,
        hint: "Optional — for faster refunds",
    },
    {
        name: "accountName",
        apiKey: "account_name",
        label: "Account Name",
        placeholder: "BSB or account name",
        icon: Globe,
        required: false,
        hint: "For Australian users",
    },
];

// ─── Saved bank card ─────────────────────────────────────────────────────────

interface SavedBank {
    id: number;
    account_holder_name: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    upi_id?: string;
    account_name?: string;
    [key: string]: any;
}

const SavedBankCard = ({
    bank,
    onEdit,
}: {
    bank: SavedBank;
    onEdit: () => void;
}) => {
    const masked = bank.account_number
        ? "••••" + bank.account_number.slice(-4)
        : "—";

    const rows = [
        { label: "Account Holder", value: bank.account_holder_name },
        { label: "Bank Name",      value: bank.bank_name },
        { label: "Account No.",    value: masked },
        { label: "IFSC Code",      value: bank.ifsc_code },
        ...(bank.upi_id ? [{ label: "UPI ID", value: bank.upi_id }] : []),
        ...(bank.account_name ? [{ label: "Account Name", value: bank.account_name }] : []),
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl border border-white/6 p-6 space-y-5"
            style={{ background: "rgba(10,26,15,0.7)" }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CreditCard size={18} className="text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-white">{bank.bank_name}</h2>
                        <p className="text-[13px] text-gray-600">{bank.account_holder_name}</p>
                    </div>
                </div>
                {/* <button
                    onClick={onEdit}
                    className="h-10 w-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                >
                    <Pencil size={15} />
                </button> */}
            </div>

            <div className="space-y-0">
                {rows.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <span className="text-[13px] text-gray-500 font-medium">{r.label}</span>
                        <span className="text-sm font-bold text-white">{r.value || "—"}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span className="text-[13px] font-bold text-emerald-400">Bank account verified and linked</span>
            </div>
        </motion.div>
    );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const BankDetails = () => {
    const { token } = useAuth();

    const [savedBanks, setSavedBanks]   = useState<SavedBank[]>([]);
    const [loading, setLoading]         = useState(true);
    const [submitting, setSubmitting]   = useState(false);
    const [isEditing, setIsEditing]     = useState(false);
    const [form, setForm]               = useState<Record<string, string>>({});
    const [showAccount, setShowAccount] = useState(false);

    // Fetch saved bank details
    const fetchBanks = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await api.get(ENDPOINTS.BANK_DETAILS_LIST);
            const data = res.data?.data ?? res.data;
            if (Array.isArray(data)) {
                setSavedBanks(data);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchBanks();
    }, [fetchBanks]);

    const update = (name: string, value: string) =>
        setForm((prev) => ({ ...prev, [name]: value }));

    const requiredFilled = FIELDS.filter((f) => f.required).every(
        (f) => (form[f.name] ?? "").trim().length > 0
    );

    // Populate form for editing
    const startEdit = (bank?: SavedBank) => {
        if (bank) {
            const populated: Record<string, string> = {};
            FIELDS.forEach((f) => {
                populated[f.name] = (bank as any)[f.apiKey] ?? "";
            });
            setForm(populated);
        } else {
            setForm({});
        }
        setIsEditing(true);
    };

    // Submit form (create — also works as update via POST overwrite)
    const handleSubmit = async () => {
        if (!requiredFilled) return;
        setSubmitting(true);

        try {
            const payload: Record<string, string> = {};
            FIELDS.forEach((f) => {
                const val = (form[f.name] ?? "").trim();
                if (val) payload[f.apiKey] = val;
            });

            await api.post(ENDPOINTS.BANK_DETAILS_CREATE, payload);
            toast.success("Bank details saved successfully");
            setIsEditing(false);
            setForm({});
            fetchBanks();
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setSubmitting(false);
        }
    };

    // Show the form if no saved bank or user clicked edit
    const showForm = isEditing || savedBanks.length === 0;

    if (loading) {
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
                className="flex items-center gap-4"
            >
                <Link href="/dashboard">
                    <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                        <ArrowLeft size={16} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Bank Details</h1>
                    <p className="text-sm text-gray-600 mt-0.5">
                        Link your bank account for deposits and withdrawals
                    </p>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {!showForm ? (
                    /* ── Saved bank details view ── */
                    <motion.div
                        key="saved"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
                    >
                        {savedBanks.map((bank, i) => (
                            <SavedBankCard
                                key={bank.id ?? i}
                                bank={bank}
                                onEdit={() => startEdit(bank)}
                            />
                        ))}
                    </motion.div>
                ) : (
                    /* ── Form view ── */
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-5 gap-5"
                    >
                        {/* ── LEFT: Form (3 cols) ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05, duration: 0.4 }}
                            className="lg:col-span-3 rounded-3xl border border-white/6 p-6 space-y-5"
                            style={{ background: "rgba(10,26,15,0.7)" }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-5 w-1 rounded-full bg-emerald-400" />
                                    <h2 className="text-base font-black text-white tracking-wide">
                                        {savedBanks.length > 0 ? "Edit Account" : "Account Information"}
                                    </h2>
                                </div>
                                {savedBanks.length > 0 && (
                                    <button
                                        onClick={() => { setIsEditing(false); setForm({}); }}
                                        className="text-[13px] font-bold text-gray-500 hover:text-emerald-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {FIELDS.map((field, i) => {
                                    const Icon  = field.icon;
                                    const value = form[field.name] ?? "";
                                    const isAccount = field.name === "accountNumber";

                                    return (
                                        <motion.div
                                            key={field.name}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.06 * i, duration: 0.3 }}
                                            className="space-y-1.5"
                                        >
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                                    {field.label}
                                                    {field.required && (
                                                        <span className="text-emerald-500">*</span>
                                                    )}
                                                </label>
                                                {field.hint && (
                                                    <span className="text-[12px] text-gray-700 italic hidden sm:inline">
                                                        {field.hint}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="relative group">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors">
                                                    <Icon size={16} strokeWidth={2} />
                                                </span>
                                                <input
                                                    type={isAccount && !showAccount ? "password" : "text"}
                                                    value={value}
                                                    onChange={(e) => update(field.name, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className="w-full rounded-2xl border border-white/8 py-3.5 lg:py-4 pl-11 pr-5 text-sm lg:text-base font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                                />

                                                {isAccount && value.length > 0 && (
                                                    <button
                                                        onClick={() => setShowAccount((v) => !v)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-600 hover:text-emerald-400 uppercase tracking-wider transition-colors"
                                                    >
                                                        {showAccount ? "Hide" : "Show"}
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* ── RIGHT: Preview & Submit (2 cols) ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            className="lg:col-span-2 space-y-5"
                        >
                            {/* Preview card */}
                            <div
                                className="rounded-3xl border border-white/6 p-6 space-y-5"
                                style={{ background: "rgba(10,26,15,0.7)" }}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Landmark size={16} className="text-emerald-400" />
                                    <h2 className="text-base font-black text-white tracking-wide">Preview</h2>
                                </div>

                                <div className="space-y-0">
                                    {FIELDS.filter((f) => (form[f.name] ?? "").trim().length > 0).length === 0 ? (
                                        <div className="py-8 text-center">
                                            <div className="h-12 w-12 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mx-auto mb-3">
                                                <Landmark size={20} className="text-gray-700" />
                                            </div>
                                            <p className="text-sm text-gray-700">
                                                Fill in the form to see a preview
                                            </p>
                                        </div>
                                    ) : (
                                        FIELDS.map((f) => {
                                            const val = form[f.name] ?? "";
                                            if (!val.trim()) return null;

                                            const display =
                                                f.name === "accountNumber"
                                                    ? "••••" + val.slice(-4)
                                                    : val;

                                            return (
                                                <div
                                                    key={f.name}
                                                    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                                                >
                                                    <span className="text-[13px] text-gray-500 font-medium">
                                                        {f.label}
                                                    </span>
                                                    <span className="text-sm font-bold text-white truncate max-w-40 text-right">
                                                        {display}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div
                                    className={`flex items-center gap-2 rounded-xl border p-3 ${
                                        requiredFilled
                                            ? "border-emerald-500/20 bg-emerald-500/5"
                                            : "border-white/5 bg-white/2"
                                    }`}
                                >
                                    {requiredFilled ? (
                                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                    ) : (
                                        <AlertCircle size={14} className="text-gray-600 shrink-0" />
                                    )}
                                    <span className={`text-[13px] font-bold ${requiredFilled ? "text-emerald-400" : "text-gray-600"}`}>
                                        {requiredFilled
                                            ? "All required fields completed"
                                            : "Please fill all required fields (*)"}
                                    </span>
                                </div>
                            </div>

                            {/* Security & Submit card */}
                            <div
                                className="rounded-3xl border border-white/6 p-6 space-y-5"
                                style={{ background: "rgba(10,26,15,0.7)" }}
                            >
                                <div className="space-y-2.5">
                                    {[
                                        {
                                            icon: Shield,
                                            title: "Bank-Grade Encryption",
                                            desc: "Your data is encrypted with AES-256 at rest and in transit",
                                        },
                                        {
                                            icon: CheckCircle2,
                                            title: "Verified Process",
                                            desc: "Bank details are verified through secure RBI-approved channels",
                                        },
                                    ].map((t, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3 rounded-xl border border-white/5 p-3"
                                            style={{ background: "rgba(5,13,7,0.6)" }}
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                                <t.icon size={14} className="text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{t.title}</p>
                                                <p className="text-[13px] text-gray-600 leading-relaxed mt-0.5">{t.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!requiredFilled || submitting}
                                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                        requiredFilled && !submitting
                                            ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                            : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                    }`}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            {savedBanks.length > 0 ? "Update Details" : "Submit Details"}
                                            <ArrowRight size={15} strokeWidth={2.5} />
                                        </>
                                    )}
                                </button>

                                {!requiredFilled && (
                                    <p className="text-center text-[13px] text-gray-700">
                                        Complete all required fields to submit
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BankDetails;

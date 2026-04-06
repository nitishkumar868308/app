"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    User, Landmark, Hash, GitBranch, Smartphone, Globe,
    ArrowLeft, ArrowRight, Shield, CheckCircle2, AlertCircle,
} from "lucide-react";
import Link from "next/link";

// ─── Field config ─────────────────────────────────────────────────────────────

interface FieldDef {
    name: string;
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
        label: "Account Holder Name",
        placeholder: "Enter full name as per bank records",
        icon: User,
        required: true,
    },
    {
        name: "bankName",
        label: "Bank Name",
        placeholder: "e.g. State Bank of India",
        icon: Landmark,
        required: true,
    },
    {
        name: "accountNumber",
        label: "Account Number",
        placeholder: "Enter your bank account number",
        icon: Hash,
        required: true,
        type: "password",
    },
    {
        name: "ifsc",
        label: "IFSC / Branch Code",
        placeholder: "e.g. SBIN0001234",
        icon: GitBranch,
        required: true,
        hint: "Branch Code for Australian users",
    },
    {
        name: "upi",
        label: "UPI ID",
        placeholder: "e.g. name@upi",
        icon: Smartphone,
        required: false,
        hint: "Optional — for faster refunds",
    },
    {
        name: "accountName",
        label: "Account Name",
        placeholder: "BSB or account name",
        icon: Globe,
        required: false,
        hint: "For Australian users",
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

const BankDetails = () => {
    const [form, setForm] = useState<Record<string, string>>({});
    const [showAccount, setShowAccount] = useState(false);

    const update = (name: string, value: string) =>
        setForm((prev) => ({ ...prev, [name]: value }));

    const requiredFilled = FIELDS.filter((f) => f.required).every(
        (f) => (form[f.name] ?? "").trim().length > 0
    );

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
                    <p className="text-[11px] text-gray-600 mt-0.5">
                        Link your bank account for deposits and withdrawals
                    </p>
                </div>
            </motion.div>

            {/* ── Main layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT: Form (3 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.4 }}
                    className="lg:col-span-3 rounded-3xl border border-white/6 p-6 space-y-5"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    {/* Section title */}
                    <div className="flex items-center gap-2.5">
                        <div className="h-5 w-1 rounded-full bg-emerald-400" />
                        <h2 className="text-sm font-black text-white tracking-wide">Account Information</h2>
                    </div>

                    {/* Fields */}
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
                                    {/* Label row */}
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                            {field.label}
                                            {field.required && (
                                                <span className="text-emerald-500 text-[8px]">*</span>
                                            )}
                                        </label>
                                        {field.hint && (
                                            <span className="text-[9px] text-gray-700 italic hidden sm:inline">
                                                {field.hint}
                                            </span>
                                        )}
                                    </div>

                                    {/* Input */}
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors">
                                            <Icon size={16} strokeWidth={2} />
                                        </span>
                                        <input
                                            type={isAccount && !showAccount ? "password" : "text"}
                                            value={value}
                                            onChange={(e) => update(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full rounded-2xl border border-white/8 py-3.5 pl-11 pr-5 text-sm font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                            style={{ background: "rgba(5,13,7,0.8)" }}
                                        />

                                        {/* Account number toggle */}
                                        {isAccount && value.length > 0 && (
                                            <button
                                                onClick={() => setShowAccount((v) => !v)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-600 hover:text-emerald-400 uppercase tracking-wider transition-colors"
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

                {/* ── RIGHT: Summary & Submit (2 cols) ── */}
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
                            <h2 className="text-sm font-black text-white tracking-wide">Preview</h2>
                        </div>

                        {/* Preview rows */}
                        <div className="space-y-0">
                            {FIELDS.filter((f) => (form[f.name] ?? "").trim().length > 0).length === 0 ? (
                                <div className="py-8 text-center">
                                    <div className="h-12 w-12 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mx-auto mb-3">
                                        <Landmark size={20} className="text-gray-700" />
                                    </div>
                                    <p className="text-[11px] text-gray-700">
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
                                            className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
                                        >
                                            <span className="text-[11px] text-gray-500 font-medium">
                                                {f.label}
                                            </span>
                                            <span className="text-xs font-bold text-white truncate max-w-40 text-right">
                                                {display}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Status indicator */}
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
                            <span className={`text-[10px] font-bold ${requiredFilled ? "text-emerald-400" : "text-gray-600"}`}>
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
                        {/* Trust badges */}
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
                                        <p className="text-[11px] font-bold text-white">{t.title}</p>
                                        <p className="text-[9px] text-gray-600 leading-relaxed mt-0.5">{t.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit button */}
                        <button
                            disabled={!requiredFilled}
                            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                requiredFilled
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                            }`}
                        >
                            Submit Details
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </button>

                        {!requiredFilled && (
                            <p className="text-center text-[9px] text-gray-700">
                                Complete all required fields to submit
                            </p>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default BankDetails;

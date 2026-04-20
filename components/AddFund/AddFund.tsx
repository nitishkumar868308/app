"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet, IndianRupee, ArrowRight, ArrowLeft, HelpCircle,
    Shield, Clock, Zap, ChevronRight, QrCode,
    Upload, Hash, Image as ImageIcon, X, Loader2,
    CheckCircle2, Copy,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import toast from "react-hot-toast";
import api, { API_BASE_URL } from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { getApiError } from "@/lib/helpers";

// ─── Constants ───────────────────────────────────────────────────────────────

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];
const MIN_AMOUNT    = 500;
const MAX_AMOUNT    = 500000;

// ─── Main component ─────────────────────────────────────────────────────────

const AddFund = () => {
    const { inrBalance } = useWallet();

    // Step: "amount" → enter amount & get QR, "proof" → enter txn ID & submit
    const [step, setStep]                   = useState<"amount" | "proof">("amount");

    // Amount step
    const [amount, setAmount]               = useState("");
    const [requestLoading, setRequestLoading] = useState(false);

    // QR data from API
    const [upiId, setUpiId]                 = useState<string | null>(null);
    const [qrCodeUrl, setQrCodeUrl]         = useState<string | null>(null);

    // Proof step
    const [txnId, setTxnId]                 = useState("");
    const [screenshot, setScreenshot]       = useState<File | null>(null);
    const [previewUrl, setPreviewUrl]       = useState<string | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [copied, setCopied]               = useState(false);
    const fileRef                           = useRef<HTMLInputElement>(null);

    const numAmount = parseFloat(amount) || 0;

    // ── Validation ───────────────────────────────────────────────────────────

    const amountValid = numAmount >= MIN_AMOUNT && numAmount <= MAX_AMOUNT;
    const amountError = numAmount > 0 && numAmount < MIN_AMOUNT
        ? `Minimum amount is ₹${MIN_AMOUNT.toLocaleString()}`
        : numAmount > MAX_AMOUNT
            ? `Maximum amount is ₹${MAX_AMOUNT.toLocaleString()}`
            : null;

    // ── Step 1: Request QR ───────────────────────────────────────────────────

    const handleRequestQR = useCallback(async () => {
        if (!amountValid) return;

        setRequestLoading(true);
        try {
            const res = await api.post(ENDPOINTS.DEPOSIT_FIAT_REQUEST, {
                amount: numAmount,
                fiat: "INR",
            });

            const data = res.data;

            if (data?.upi_id) {
                setUpiId(data.upi_id);

                // QR code URL — could be relative or full
                if (data.qr_code) {
                    const qr = data.qr_code.startsWith("http")
                        ? data.qr_code
                        : `${API_BASE_URL.replace("/api/v1", "")}${data.qr_code}`;
                    setQrCodeUrl(qr);
                }

                setStep("proof");
                toast.success("QR code generated! Scan & pay to continue.");
            } else {
                toast.error("Could not generate payment QR. Try again.");
            }
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setRequestLoading(false);
        }
    }, [amountValid, numAmount]);

    // ── Step 2: Submit proof ─────────────────────────────────────────────────

    const handleSubmitProof = useCallback(async () => {
        if (!txnId.trim()) {
            toast.error("Please enter the transaction ID");
            return;
        }

        setSubmitLoading(true);
        try {
            const formData = new FormData();
            formData.append("fiat", "INR");
            formData.append("amount", numAmount.toString());
            formData.append("transaction_id", txnId.trim());
            if (screenshot) {
                formData.append("screen_shot", screenshot);
            }

            await api.post(ENDPOINTS.DEPOSIT_FIAT_CREATE, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Payment submitted successfully! It will be credited shortly.");

            // Reset
            setStep("amount");
            setAmount("");
            setTxnId("");
            clearFile();
            setUpiId(null);
            setQrCodeUrl(null);
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setSubmitLoading(false);
        }
    }, [txnId, numAmount, screenshot]);

    // ── File handling ────────────────────────────────────────────────────────

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be under 5MB");
                return;
            }
            setScreenshot(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearFile = () => {
        setScreenshot(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const copyUpi = async () => {
        if (!upiId) return;
        await navigator.clipboard.writeText(upiId);
        setCopied(true);
        toast.success("UPI ID copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const canSubmit = txnId.trim().length > 0;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── Page header ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-4">
                    {step === "proof" && (
                        <button
                            onClick={() => setStep("amount")}
                            className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                        >
                            <ArrowLeft size={16} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Add Funds</h1>
                        <p className="text-sm text-gray-600 mt-0.5">
                            {step === "amount"
                                ? "Top up your wallet to start staking or trading"
                                : "Complete payment and submit proof"}
                        </p>
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
                        <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">Available Balance</p>
                        <p className="text-sm font-black text-white">₹{inrBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </motion.div>

            {/* ── Main grid ── */}
            <AnimatePresence mode="wait">
                {step === "amount" ? (
                    /* ═══════════════ STEP 1: Enter Amount ═══════════════ */
                    <motion.div
                        key="amount-step"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.25 }}
                        className="grid grid-cols-1 lg:grid-cols-5 gap-5"
                    >
                        {/* LEFT: Amount entry */}
                        <div
                            className="lg:col-span-3 rounded-3xl border border-white/6 p-6 space-y-6"
                            style={{ background: "rgba(10,26,15,0.7)" }}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="h-5 w-1 rounded-full bg-emerald-400" />
                                <h2 className="text-base font-black text-white tracking-wide">Enter Amount</h2>
                            </div>

                            <div className="space-y-2">
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
                                {amountError && (
                                    <p className="text-[13px] text-red-400 font-bold px-1">{amountError}</p>
                                )}
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[12px] text-gray-700">
                                        Min: <span className="text-gray-500">₹{MIN_AMOUNT.toLocaleString()}</span>
                                    </span>
                                    <span className="text-[12px] text-gray-700">
                                        Max: <span className="text-gray-500">₹{MAX_AMOUNT.toLocaleString()}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                {QUICK_AMOUNTS.map((val) => (
                                    <motion.button
                                        key={val}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setAmount(val.toString())}
                                        className={`py-3 rounded-xl border text-sm font-black transition-all ${
                                            amount === val.toString()
                                                ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-400"
                                                : "border-white/6 text-gray-500 hover:border-emerald-500/25 hover:text-gray-300"
                                        }`}
                                        style={amount !== val.toString() ? { background: "rgba(5,13,7,0.6)" } : undefined}
                                    >
                                        +₹{val.toLocaleString()}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Summary + Proceed */}
                        <div
                            className="lg:col-span-2 rounded-3xl border border-white/6 p-6 flex flex-col gap-5"
                            style={{ background: "rgba(10,26,15,0.7)" }}
                        >
                            <div className="flex items-center gap-2.5">
                                <Zap size={16} className="text-emerald-400" />
                                <h2 className="text-base font-black text-white tracking-wide">Summary</h2>
                            </div>

                            <div className="space-y-0">
                                {[
                                    { label: "Amount",         value: numAmount > 0 ? `₹${numAmount.toLocaleString()}` : "—" },
                                    { label: "Currency",       value: "INR" },
                                    { label: "Processing Fee", value: "Free", green: true },
                                    { label: "Method",         value: "UPI" },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                                        <span className="text-[13px] text-gray-500 font-medium">{row.label}</span>
                                        <span className={`text-sm font-bold ${row.green ? "text-emerald-400" : "text-white"}`}>
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div
                                className="rounded-2xl border border-emerald-500/20 p-4"
                                style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                            >
                                <p className="text-[12px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">
                                    Total Amount
                                </p>
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={numAmount}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.18 }}
                                        className="text-2xl font-black text-white tabular-nums"
                                    >
                                        {numAmount > 0 ? `₹${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                                    </motion.p>
                                </AnimatePresence>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: Shield, label: "Secure Payment" },
                                    { icon: Clock,  label: "Credit within 24 hours" },
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

                            <div className="mt-auto space-y-3">
                                <button
                                    onClick={handleRequestQR}
                                    disabled={!amountValid || requestLoading}
                                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                        amountValid && !requestLoading
                                            ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                            : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                    }`}
                                >
                                    {requestLoading ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            Generating QR...
                                        </>
                                    ) : (
                                        <>
                                            Proceed to Pay
                                            <ArrowRight size={15} strokeWidth={2.5} />
                                        </>
                                    )}
                                </button>

                                {!amountValid && numAmount > 0 && (
                                    <p className="text-center text-[13px] text-gray-700">
                                        Amount must be between ₹{MIN_AMOUNT.toLocaleString()} and ₹{MAX_AMOUNT.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* ═══════════════ STEP 2: QR + Payment Proof ═══════════════ */
                    <motion.div
                        key="proof-step"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="grid grid-cols-1 lg:grid-cols-5 gap-5"
                    >
                        {/* LEFT: QR + Proof form */}
                        <div
                            className="lg:col-span-3 rounded-3xl border border-white/6 p-6 space-y-6"
                            style={{ background: "rgba(10,26,15,0.7)" }}
                        >
                            {/* QR Section */}
                            <div className="flex items-center gap-2.5">
                                <div className="h-5 w-1 rounded-full bg-emerald-400" />
                                <h2 className="text-base font-black text-white tracking-wide">Scan & Pay</h2>
                            </div>

                            <div
                                className="rounded-2xl border border-white/6 p-5 flex flex-col items-center gap-4"
                                style={{ background: "rgba(5,13,7,0.6)" }}
                            >
                                {/* QR Code from API */}
                                <div className="rounded-2xl bg-white p-3">
                                    <div className="w-44 h-44 sm:w-52 sm:h-52 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                                        {qrCodeUrl ? (
                                            <img
                                                src="/scanner.jpeg" /* Placeholder while loading real QR */
                                                alt="Payment QR Code"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-sm text-center p-4">
                                                <QrCode size={32} className="mx-auto mb-2 text-gray-300" />
                                                QR not available
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Amount badge */}
                                <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 px-4 py-1.5"
                                    style={{ background: "rgba(16,185,129,0.08)" }}
                                >
                                    <QrCode size={13} className="text-emerald-400" />
                                    <span className="text-sm font-black text-white tabular-nums">
                                        Pay ₹{numAmount.toLocaleString()}
                                    </span>
                                </div>

                                {/* UPI ID */}
                                {upiId && (
                                    <div className="flex items-center gap-3 rounded-xl border border-white/8 px-4 py-3 w-full max-w-sm"
                                        style={{ background: "rgba(5,13,7,0.8)" }}
                                    >
                                        <span className="text-sm font-bold text-gray-400 truncate flex-1">
                                            {upiId}
                                        </span>
                                        <button
                                            onClick={copyUpi}
                                            className={`shrink-0 h-8 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-black uppercase tracking-wider transition-all ${
                                                copied
                                                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                                    : "bg-white/5 border border-white/8 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30"
                                            }`}
                                        >
                                            {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                            {copied ? "Copied" : "Copy"}
                                        </button>
                                    </div>
                                )}

                                <p className="text-[13px] text-gray-600 text-center max-w-72">
                                    Scan this QR code with any UPI app (Google Pay, PhonePe, Paytm) to complete the payment
                                </p>
                            </div>

                            {/* Payment Proof section */}
                            <div className="flex items-center gap-2.5 pt-2">
                                <div className="h-5 w-1 rounded-full bg-emerald-400" />
                                <h2 className="text-base font-black text-white tracking-wide">Payment Proof</h2>
                            </div>

                            {/* Transaction ID */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                        Transaction ID <span className="text-emerald-500">*</span>
                                    </label>
                                    <span className="text-[12px] text-gray-700 italic">From your UPI app</span>
                                </div>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors">
                                        <Hash size={16} strokeWidth={2} />
                                    </span>
                                    <input
                                        type="text"
                                        value={txnId}
                                        onChange={(e) => setTxnId(e.target.value)}
                                        placeholder="e.g. 430612345678"
                                        className="w-full rounded-2xl border border-white/8 py-3.5 lg:py-4 pl-11 pr-5 text-sm lg:text-base font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                        style={{ background: "rgba(5,13,7,0.8)" }}
                                    />
                                </div>
                            </div>

                            {/* Screenshot upload */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold px-1 flex items-center gap-1.5">
                                    Payment Screenshot
                                    <span className="text-[12px] text-gray-700 normal-case italic font-normal">(optional)</span>
                                </label>

                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFile}
                                    className="hidden"
                                />

                                {!screenshot ? (
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        className="w-full rounded-2xl border border-dashed border-white/10 hover:border-emerald-500/30 py-8 flex flex-col items-center gap-2 transition-all group"
                                        style={{ background: "rgba(5,13,7,0.5)" }}
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center group-hover:border-emerald-500/30 transition-all">
                                            <Upload size={18} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-500 font-bold">Click to upload screenshot</p>
                                            <p className="text-[13px] text-gray-700 mt-0.5">PNG, JPG up to 5MB</p>
                                        </div>
                                    </button>
                                ) : (
                                    <div
                                        className="rounded-2xl border border-emerald-500/20 p-3 flex items-center gap-3"
                                        style={{ background: "rgba(16,185,129,0.05)" }}
                                    >
                                        <div className="h-14 w-14 rounded-xl bg-white/5 border border-white/8 shrink-0 overflow-hidden flex items-center justify-center">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Screenshot" className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon size={18} className="text-gray-600" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-white truncate">{screenshot.name}</p>
                                            <p className="text-[13px] text-gray-600">{(screenshot.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button
                                            onClick={clearFile}
                                            className="h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all shrink-0"
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Summary + Submit */}
                        <div
                            className="lg:col-span-2 rounded-3xl border border-white/6 p-6 flex flex-col gap-5"
                            style={{ background: "rgba(10,26,15,0.7)" }}
                        >
                            <div className="flex items-center gap-2.5">
                                <Zap size={16} className="text-emerald-400" />
                                <h2 className="text-base font-black text-white tracking-wide">Payment Summary</h2>
                            </div>

                            <div className="space-y-0">
                                {[
                                    { label: "Amount",         value: `₹${numAmount.toLocaleString()}` },
                                    { label: "Processing Fee", value: "Free", green: true },
                                    { label: "Transaction ID", value: txnId.trim() || "—" },
                                    { label: "Screenshot",     value: screenshot ? "Attached" : "Not uploaded", green: !!screenshot },
                                    { label: "UPI ID",         value: upiId || "—" },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                                        <span className="text-[13px] text-gray-500 font-medium">{row.label}</span>
                                        <span className={`text-sm font-bold truncate max-w-32 text-right ${row.green ? "text-emerald-400" : "text-white"}`}>
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div
                                className="rounded-2xl border border-emerald-500/20 p-4"
                                style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                            >
                                <p className="text-[12px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">
                                    Total Amount
                                </p>
                                <p className="text-2xl font-black text-white tabular-nums">
                                    ₹{numAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: Shield, label: "Secure Payment" },
                                    { icon: Clock,  label: "Credit within 24 hours" },
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

                            <div className="mt-auto space-y-3">
                                <button
                                    onClick={handleSubmitProof}
                                    disabled={!canSubmit || submitLoading}
                                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                        canSubmit && !submitLoading
                                            ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                            : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                    }`}
                                >
                                    {submitLoading ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Payment
                                            <ArrowRight size={15} strokeWidth={2.5} />
                                        </>
                                    )}
                                </button>

                                {!canSubmit && (
                                    <p className="text-center text-[13px] text-gray-700">
                                        Please enter the transaction ID to submit
                                    </p>
                                )}

                                <button className="flex items-center justify-center gap-1.5 w-full text-gray-600 hover:text-gray-400 text-[13px] font-medium transition-colors group">
                                    <HelpCircle size={12} />
                                    <span>Have questions? Read FAQ</span>
                                    <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddFund;

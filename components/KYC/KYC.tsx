"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ShieldCheck, CreditCard, Fingerprint,
    Camera, CheckCircle2, AlertCircle, ArrowRight,
    X, Upload, Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "pan" | "aadhaar" | "selfie" | "done";
type VerifyStatus = "idle" | "loading" | "verified";

// ─── OTP Modal ────────────────────────────────────────────────────────────────

const OTPModal = ({
    open,
    onClose,
    onVerify,
    title,
    subtitle,
}: {
    open: boolean;
    onClose: () => void;
    onVerify: (otp: string) => void;
    title: string;
    subtitle: string;
}) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [verifying, setVerifying] = useState(false);
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        if (value && index < 5) refs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            refs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const next = [...otp];
        text.split("").forEach((ch, i) => { next[i] = ch; });
        setOtp(next);
        refs.current[Math.min(text.length, 5)]?.focus();
    };

    const filled = otp.every((d) => d !== "");

    const submit = useCallback(async () => {
        if (!filled) return;
        setVerifying(true);
        await new Promise((r) => setTimeout(r, 1500));
        setVerifying(false);
        onVerify(otp.join(""));
        setOtp(["", "", "", "", "", ""]);
    }, [filled, otp, onVerify]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-sm rounded-3xl border border-white/8 p-6 space-y-5 relative"
                        style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>

                        <div className="text-center space-y-1">
                            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                <ShieldCheck size={20} className="text-emerald-400" />
                            </div>
                            <h3 className="text-base font-black text-white">{title}</h3>
                            <p className="text-[11px] text-gray-500">{subtitle}</p>
                        </div>

                        {/* OTP boxes */}
                        <div className="flex items-center justify-center gap-2.5" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { refs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className={`w-10 h-12 rounded-xl border text-center text-lg font-black text-white focus:outline-none transition-all ${
                                        digit
                                            ? "border-emerald-500/50 bg-emerald-500/5"
                                            : "border-white/10 bg-white/4 focus:border-emerald-500/50"
                                    }`}
                                />
                            ))}
                        </div>

                        <p className="text-[9px] text-gray-600 text-center">
                            Didn&apos;t receive OTP?{" "}
                            <button className="text-emerald-400 font-bold hover:underline">Resend</button>
                        </p>

                        <button
                            onClick={submit}
                            disabled={!filled || verifying}
                            className={`w-full py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                filled && !verifying
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                            }`}
                        >
                            {verifying ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Verify OTP
                                    <ArrowRight size={14} strokeWidth={2.5} />
                                </>
                            )}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS: { key: Step; label: string; icon: typeof CreditCard }[] = [
    { key: "pan",    label: "PAN Card",  icon: CreditCard },
    { key: "aadhaar", label: "Aadhaar",  icon: Fingerprint },
    { key: "selfie", label: "Selfie",    icon: Camera },
];

const StepIndicator = ({ current }: { current: Step }) => {
    const idx = current === "done" ? 3 : STEPS.findIndex((s) => s.key === current);
    return (
        <div className="flex items-center justify-center gap-1 sm:gap-2">
            {STEPS.map((s, i) => {
                const done    = i < idx;
                const active  = i === idx;
                const Icon    = s.icon;
                return (
                    <div key={s.key} className="flex items-center gap-1 sm:gap-2">
                        {i > 0 && (
                            <div className={`h-px w-6 sm:w-10 transition-all ${done ? "bg-emerald-500" : "bg-white/8"}`} />
                        )}
                        <div className="flex items-center gap-1.5">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
                                done
                                    ? "bg-emerald-500 text-black"
                                    : active
                                        ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                                        : "bg-white/4 border border-white/8 text-gray-600"
                            }`}>
                                {done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                            </div>
                            <span className={`text-[10px] font-bold hidden sm:inline ${
                                done ? "text-emerald-400" : active ? "text-white" : "text-gray-600"
                            }`}>
                                {s.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const KYC = () => {
    const [step, setStep]               = useState<Step>("pan");
    const [pan, setPan]                  = useState("");
    const [panStatus, setPanStatus]      = useState<VerifyStatus>("idle");
    const [aadhaar, setAadhaar]          = useState("");
    const [aadhaarStatus, setAadhaarStatus] = useState<VerifyStatus>("idle");
    const [otpModal, setOtpModal]        = useState<"pan" | "aadhaar" | null>(null);
    const [selfie, setSelfie]            = useState<File | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    const [agreed, setAgreed]            = useState(false);
    const selfieRef                      = useRef<HTMLInputElement>(null);

    // PAN validation — format: ABCDE1234F
    const panValid = /^[A-Z]{5}\d{4}[A-Z]$/.test(pan.toUpperCase());
    const aadhaarValid = /^\d{12}$/.test(aadhaar.replace(/\s/g, ""));

    const handleGetOtp = (type: "pan" | "aadhaar") => {
        setOtpModal(type);
    };

    const handleOtpVerify = (type: "pan" | "aadhaar") => {
        setOtpModal(null);
        if (type === "pan") {
            setPanStatus("verified");
            setStep("aadhaar");
        } else {
            setAadhaarStatus("verified");
            setStep("selfie");
        }
    };

    const handleSelfieFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelfie(file);
            setSelfiePreview(URL.createObjectURL(file));
        }
    };

    const clearSelfie = () => {
        setSelfie(null);
        if (selfiePreview) URL.revokeObjectURL(selfiePreview);
        setSelfiePreview(null);
        if (selfieRef.current) selfieRef.current.value = "";
    };

    const canSubmit = panStatus === "verified" && aadhaarStatus === "verified" && selfie && agreed;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── OTP Modals ── */}
            <OTPModal
                open={otpModal === "pan"}
                onClose={() => setOtpModal(null)}
                onVerify={() => handleOtpVerify("pan")}
                title="Verify PAN Card"
                subtitle="Enter the 6-digit OTP sent to your registered mobile"
            />
            <OTPModal
                open={otpModal === "aadhaar"}
                onClose={() => setOtpModal(null)}
                onVerify={() => handleOtpVerify("aadhaar")}
                title="Verify Aadhaar"
                subtitle="Enter the 6-digit OTP sent to your Aadhaar-linked mobile"
            />

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
                    <h1 className="text-xl font-black text-white tracking-tight">Identity Verification</h1>
                    <p className="text-[11px] text-gray-600 mt-0.5">Complete KYC to unlock all features</p>
                </div>
            </motion.div>

            {/* ── Step indicator ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
            >
                <StepIndicator current={step} />
            </motion.div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT: KYC Form (3 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="lg:col-span-3 space-y-5"
                >
                    {/* ── STEP 1: PAN Card ── */}
                    <div
                        className={`rounded-3xl border p-6 space-y-4 transition-all ${
                            panStatus === "verified"
                                ? "border-emerald-500/20 bg-emerald-500/3"
                                : "border-white/6"
                        }`}
                        style={panStatus !== "verified" ? { background: "rgba(10,26,15,0.7)" } : undefined}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                                    panStatus === "verified"
                                        ? "bg-emerald-500 text-black"
                                        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                }`}>
                                    {panStatus === "verified" ? <CheckCircle2 size={15} /> : <CreditCard size={15} />}
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-white">PAN Card</h2>
                                    <p className="text-[9px] text-gray-600">Permanent Account Number</p>
                                </div>
                            </div>
                            {panStatus === "verified" && (
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                    Verified
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={pan}
                                onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))}
                                placeholder="e.g. ABCDE1234F"
                                maxLength={10}
                                disabled={panStatus === "verified"}
                                className={`flex-1 rounded-2xl border py-3.5 px-4 text-sm font-semibold text-white placeholder-gray-700 focus:outline-none transition-all ${
                                    panStatus === "verified"
                                        ? "border-emerald-500/20 bg-emerald-500/5 opacity-70"
                                        : "border-white/8 focus:border-emerald-500/50"
                                }`}
                                style={panStatus !== "verified" ? { background: "rgba(5,13,7,0.8)" } : undefined}
                            />
                            <button
                                onClick={() => handleGetOtp("pan")}
                                disabled={!panValid || panStatus === "verified"}
                                className={`px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 ${
                                    panValid && panStatus !== "verified"
                                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                                        : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                }`}
                            >
                                {panStatus === "verified" ? "Done" : "Get OTP"}
                            </button>
                        </div>
                    </div>

                    {/* ── STEP 2: Aadhaar ── */}
                    <div
                        className={`rounded-3xl border p-6 space-y-4 transition-all ${
                            aadhaarStatus === "verified"
                                ? "border-emerald-500/20 bg-emerald-500/3"
                                : step === "pan"
                                    ? "border-white/4 opacity-50"
                                    : "border-white/6"
                        }`}
                        style={aadhaarStatus !== "verified" ? { background: "rgba(10,26,15,0.7)" } : undefined}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                                    aadhaarStatus === "verified"
                                        ? "bg-emerald-500 text-black"
                                        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                }`}>
                                    {aadhaarStatus === "verified" ? <CheckCircle2 size={15} /> : <Fingerprint size={15} />}
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-white">Government ID</h2>
                                    <p className="text-[9px] text-gray-600">Aadhaar Number</p>
                                </div>
                            </div>
                            {aadhaarStatus === "verified" && (
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                    Verified
                                </span>
                            )}
                        </div>

                        {step === "pan" && panStatus !== "verified" && (
                            <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                                <AlertCircle size={13} className="text-amber-400 shrink-0" />
                                <span className="text-[10px] text-amber-400 font-bold">Please verify PAN first to continue</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={aadhaar}
                                onChange={(e) => setAadhaar(e.target.value.replace(/[^\d\s]/g, "").slice(0, 14))}
                                placeholder="e.g. 1234 5678 9012"
                                disabled={step === "pan" || aadhaarStatus === "verified"}
                                className={`flex-1 rounded-2xl border py-3.5 px-4 text-sm font-semibold text-white placeholder-gray-700 focus:outline-none transition-all ${
                                    aadhaarStatus === "verified"
                                        ? "border-emerald-500/20 bg-emerald-500/5 opacity-70"
                                        : "border-white/8 focus:border-emerald-500/50"
                                }`}
                                style={aadhaarStatus !== "verified" ? { background: "rgba(5,13,7,0.8)" } : undefined}
                            />
                            <button
                                onClick={() => handleGetOtp("aadhaar")}
                                disabled={!aadhaarValid || step === "pan" || aadhaarStatus === "verified"}
                                className={`px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 ${
                                    aadhaarValid && step !== "pan" && aadhaarStatus !== "verified"
                                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                                        : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                }`}
                            >
                                {aadhaarStatus === "verified" ? "Done" : "Get OTP"}
                            </button>
                        </div>
                    </div>

                    {/* ── STEP 3: Selfie with ID ── */}
                    <div
                        className={`rounded-3xl border p-6 space-y-4 transition-all ${
                            step === "selfie" || step === "done"
                                ? selfie ? "border-emerald-500/20 bg-emerald-500/3" : "border-white/6"
                                : "border-white/4 opacity-50"
                        }`}
                        style={!(selfie && (step === "selfie" || step === "done")) ? { background: "rgba(10,26,15,0.7)" } : undefined}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                                selfie
                                    ? "bg-emerald-500 text-black"
                                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            }`}>
                                {selfie ? <CheckCircle2 size={15} /> : <Camera size={15} />}
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-white">Selfie with ID Card</h2>
                                <p className="text-[9px] text-gray-600">Upload a selfie holding your government ID</p>
                            </div>
                        </div>

                        {(step !== "selfie" && step !== "done") && (
                            <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                                <AlertCircle size={13} className="text-amber-400 shrink-0" />
                                <span className="text-[10px] text-amber-400 font-bold">Complete PAN and Aadhaar verification first</span>
                            </div>
                        )}

                        {(step === "selfie" || step === "done") && (
                            <>
                                <input
                                    ref={selfieRef}
                                    type="file"
                                    accept="image/*"
                                    capture="user"
                                    onChange={handleSelfieFile}
                                    className="hidden"
                                />

                                {!selfie ? (
                                    <button
                                        onClick={() => selfieRef.current?.click()}
                                        className="w-full rounded-2xl border border-dashed border-white/10 hover:border-emerald-500/30 py-10 flex flex-col items-center gap-3 transition-all group"
                                        style={{ background: "rgba(5,13,7,0.5)" }}
                                    >
                                        <div className="h-14 w-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center group-hover:border-emerald-500/30 transition-all">
                                            <Camera size={24} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-400 font-bold">Take Photo or Upload</p>
                                            <p className="text-[9px] text-gray-700 mt-0.5">PNG, JPG up to 5MB</p>
                                        </div>
                                    </button>
                                ) : (
                                    <div
                                        className="rounded-2xl border border-emerald-500/20 p-3 flex items-center gap-3"
                                        style={{ background: "rgba(16,185,129,0.05)" }}
                                    >
                                        <div className="h-16 w-16 rounded-xl bg-white/5 border border-white/8 shrink-0 overflow-hidden">
                                            {selfiePreview && (
                                                <img src={selfiePreview} alt="Selfie" className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-bold text-white truncate">{selfie.name}</p>
                                            <p className="text-[9px] text-gray-600">{(selfie.size / 1024).toFixed(1)} KB</p>
                                            <p className="text-[9px] text-emerald-400 font-bold mt-0.5">Uploaded successfully</p>
                                        </div>
                                        <button
                                            onClick={clearSelfie}
                                            className="h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all shrink-0"
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Consent & Submit ── */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="rounded-xl border border-white/5 p-4 space-y-2.5" style={{ background: "rgba(5,13,7,0.6)" }}>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                                The details displayed above were fetched after verification of your{" "}
                                <span className="text-white font-bold">Aadhaar number</span> and are required for{" "}
                                <span className="text-white font-bold">FIU-IND compliance</span> and regulatory obligations.
                            </p>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                                By clicking <span className="text-white font-bold">Submit</span>, you consent to sharing this
                                information with <span className="text-emerald-400 font-bold">YatriPay</span> for compliance purposes.
                            </p>
                        </div>

                        <button
                            onClick={() => setAgreed((v) => !v)}
                            className="flex items-start gap-2.5 text-left group w-full"
                        >
                            <span className={`mt-0.5 shrink-0 h-4 w-4 rounded flex items-center justify-center border transition-all duration-200 ${
                                agreed
                                    ? "bg-emerald-500 border-emerald-500"
                                    : "border-white/20 bg-white/4 group-hover:border-emerald-500/50"
                            }`}>
                                {agreed && <CheckCircle2 size={11} className="text-black" />}
                            </span>
                            <span className="text-[11px] text-gray-400 leading-relaxed">
                                I confirm that I have read and agree to the above terms.
                            </span>
                        </button>

                        <button
                            disabled={!canSubmit}
                            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                canSubmit
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                            }`}
                        >
                            Submit KYC
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </button>
                    </div>
                </motion.div>

                {/* ── RIGHT: Selfie guide (2 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="lg:col-span-2 space-y-5"
                >
                    {/* Selfie Guide Card */}
                    <div
                        className="rounded-3xl border border-white/6 p-5 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Camera size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Selfie Guide</h2>
                        </div>

                        {/* Reference image */}
                        <div className="relative w-full rounded-2xl overflow-hidden border border-white/6">
                            <Image
                                src="/sellifie.jpeg"
                                alt="How to take a proper selfie with document"
                                width={600}
                                height={700}
                                className="w-full h-auto object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Quick tips */}
                    <div
                        className="rounded-3xl border border-white/6 p-5 space-y-3"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <ShieldCheck size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Verification Tips</h2>
                        </div>

                        <div className="space-y-2">
                            {[
                                { ok: true,  text: "Use good lighting and a plain background" },
                                { ok: true,  text: "Hold the document near your face, clearly visible" },
                                { ok: true,  text: "Ensure all text on the document is readable" },
                                { ok: false, text: "Don't wear sunglasses or hats" },
                                { ok: false, text: "Don't crop or edit the photo" },
                                { ok: false, text: "Don't use blurry or low-resolution images" },
                            ].map((tip, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <span className={`mt-0.5 shrink-0 ${tip.ok ? "text-emerald-400" : "text-red-400"}`}>
                                        {tip.ok
                                            ? <CheckCircle2 size={12} />
                                            : <X size={12} />
                                        }
                                    </span>
                                    <span className="text-[10px] text-gray-400 leading-relaxed">{tip.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security note */}
                    {/* <div
                        className="rounded-2xl border border-white/5 p-4 flex items-start gap-3"
                        style={{ background: "rgba(5,13,7,0.6)" }}
                    >
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
                            <ShieldCheck size={14} className="text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-white">Your data is secure</p>
                            <p className="text-[9px] text-gray-600 leading-relaxed mt-0.5">
                                All documents are encrypted with AES-256 and processed in compliance with RBI and FIU-IND regulations.
                            </p>
                        </div>
                    </div> */}
                </motion.div>

            </div>
        </div>
    );
};

export default KYC;

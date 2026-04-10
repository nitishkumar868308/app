"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ShieldCheck, CreditCard, Fingerprint,
    Camera, CheckCircle2, AlertCircle, ArrowRight,
    X, Loader2, User, MapPin, Calendar, Globe, Hash,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { getApiError } from "@/lib/helpers";
import { SectionLoader } from "@/components/Include/Loader";
import { getUserData } from "@/lib/auth";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = "pan" | "aadhaar" | "selfie" | "done";
type VerifyStatus = "idle" | "loading" | "verified";
type KycOverallStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";

interface KycDetails {
    full_name: string | null;
    email: string | null;
    pan_number: string | null;
    aadhaar_number: string | null;
    dob: string | null;
    gender: string | null;
    district: string | null;
    state: string | null;
    country: string | null;
}

// ─── OTP Modal ───────────────────────────────────────────────────────────────

const OTPModal = ({
    open,
    onClose,
    onVerify,
    title,
    subtitle,
    loading: externalLoading,
}: {
    open: boolean;
    onClose: () => void;
    onVerify: (otp: string) => void;
    title: string;
    subtitle: string;
    loading?: boolean;
}) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
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

    const submit = () => {
        if (!filled || externalLoading) return;
        onVerify(otp.join(""));
    };

    // Reset OTP when modal opens
    useEffect(() => {
        if (open) setOtp(["", "", "", "", "", ""]);
    }, [open]);

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
                            <p className="text-[13px] text-gray-500">{subtitle}</p>
                        </div>

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
                                    className={`w-10 h-12 rounded-xl border text-center text-lg font-black text-white focus:outline-none transition-all ${digit
                                            ? "border-emerald-500/50 bg-emerald-500/5"
                                            : "border-white/10 bg-white/4 focus:border-emerald-500/50"
                                        }`}
                                />
                            ))}
                        </div>

                        <p className="text-[13px] text-gray-600 text-center">
                            Didn&apos;t receive OTP?{" "}
                            <button className="text-emerald-400 font-bold hover:underline">Resend</button>
                        </p>

                        <button
                            onClick={submit}
                            disabled={!filled || externalLoading}
                            className={`w-full py-3.5 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${filled && !externalLoading
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                }`}
                        >
                            {externalLoading ? (
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

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEPS: { key: Step; label: string; icon: typeof CreditCard }[] = [
    { key: "pan", label: "PAN Card", icon: CreditCard },
    { key: "aadhaar", label: "Aadhaar", icon: Fingerprint },
    { key: "selfie", label: "Selfie", icon: Camera },
];

const StepIndicator = ({ current, panDone, aadhaarDone, selfieDone }: {
    current: Step;
    panDone: boolean;
    aadhaarDone: boolean;
    selfieDone: boolean;
}) => {
    const doneMap = [panDone, aadhaarDone, selfieDone];
    const idx = current === "done" ? 3 : STEPS.findIndex((s) => s.key === current);

    return (
        <div className="flex items-center justify-center gap-1 sm:gap-2">
            {STEPS.map((s, i) => {
                const done = doneMap[i];
                const active = i === idx;
                const Icon = s.icon;
                return (
                    <div key={s.key} className="flex items-center gap-1 sm:gap-2">
                        {i > 0 && (
                            <div className={`h-px w-6 sm:w-10 transition-all ${done ? "bg-emerald-500" : "bg-white/8"}`} />
                        )}
                        <div className="flex items-center gap-1.5">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${done
                                    ? "bg-emerald-500 text-black"
                                    : active
                                        ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                                        : "bg-white/4 border border-white/8 text-gray-600"
                                }`}>
                                {done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                            </div>
                            <span className={`text-[13px] font-bold hidden sm:inline ${done ? "text-emerald-400" : active ? "text-white" : "text-gray-600"
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

// ─── Approved details view ───────────────────────────────────────────────────

const KycApprovedView = ({ details }: { details: KycDetails }) => {
    const maskedAadhaar = details.aadhaar_number
        ? "•••• •••• " + details.aadhaar_number.slice(-4)
        : "—";

    const rows: { label: string; value: string; icon: typeof User }[] = [
        { label: "Full Name", value: details.full_name || "—", icon: User },
        { label: "Email", value: details.email || "—", icon: ShieldCheck },
        { label: "PAN Card", value: details.pan_number || "—", icon: CreditCard },
        { label: "Aadhaar Card", value: maskedAadhaar, icon: Fingerprint },
        { label: "Date of Birth", value: details.dob || "—", icon: Calendar },
        { label: "Gender", value: details.gender || "—", icon: User },
        { label: "District", value: details.district || "—", icon: MapPin },
        { label: "State", value: details.state || "—", icon: MapPin },
        { label: "Country", value: details.country || "—", icon: Globe },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            {/* Approved badge */}
            <div
                className="rounded-3xl border border-emerald-500/20 p-6 flex flex-col sm:flex-row items-center gap-5"
                style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(10,26,15,0.7) 100%)" }}
            >
                <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 size={32} className="text-black" />
                </div>
                <div className="text-center sm:text-left">
                    <h2 className="text-xl font-black text-white">KYC Verified</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Your identity has been verified successfully. You have full access to all platform features.
                    </p>
                </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left column */}
                <div
                    className="rounded-3xl border border-white/6 p-6 space-y-1"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="h-5 w-1 rounded-full bg-emerald-400" />
                        <h3 className="text-base font-black text-white tracking-wide">Personal Details</h3>
                    </div>
                    {rows.slice(0, 5).map((r, i) => (
                        <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                            <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                                <r.icon size={15} className="text-emerald-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">{r.label}</p>
                                <p className="text-sm font-bold text-white truncate">{r.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right column */}
                <div
                    className="rounded-3xl border border-white/6 p-6 space-y-1"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="h-5 w-1 rounded-full bg-emerald-400" />
                        <h3 className="text-base font-black text-white tracking-wide">Location & Identity</h3>
                    </div>
                    {rows.slice(5).map((r, i) => (
                        <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                            <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                                <r.icon size={15} className="text-emerald-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">{r.label}</p>
                                <p className="text-sm font-bold text-white truncate">{r.value}</p>
                            </div>
                        </div>
                    ))}

                    {/* Verified stamp */}
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
                        <span className="text-[13px] font-bold text-emerald-400">
                            Identity verified &middot; Full access enabled
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ─── Pending banner ──────────────────────────────────────────────────────────

const KycPendingBanner = () => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 text-center space-y-3"
    >
        <div className="h-16 w-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto">
            <Loader2 size={28} className="text-amber-400 animate-spin" />
        </div>
        <h2 className="text-xl font-black text-white">KYC Under Review</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
            Your documents have been submitted and are being reviewed. This usually takes 24-48 hours.
        </p>
    </motion.div>
);

// ─── Main ────────────────────────────────────────────────────────────────────

const KYC = () => {
    const { token } = useAuth();

    // Overall state
    const [pageLoading, setPageLoading] = useState(true);
    const [kycStatus, setKycStatus] = useState<KycOverallStatus>("NOT_SUBMITTED");
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [kycDetails, setKycDetails] = useState<KycDetails | null>(null);

    // Step tracking
    const [step, setStep] = useState<Step>("pan");
    const [pan, setPan] = useState("");
    const [panStatus, setPanStatus] = useState<VerifyStatus>("idle");
    const [panLoading, setPanLoading] = useState(false);

    const [aadhaar, setAadhaar] = useState("");
    const [aadhaarStatus, setAadhaarStatus] = useState<VerifyStatus>("idle");
    const [aadhaarOtpLoading, setAadhaarOtpLoading] = useState(false);
    const [aadhaarVerifyLoading, setAadhaarVerifyLoading] = useState(false);
    const [aadhaarRefId, setAadhaarRefId] = useState<string | null>(null);

    const [otpModal, setOtpModal] = useState<"aadhaar" | null>(null);

    const [selfie, setSelfie] = useState<File | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const selfieRef = useRef<HTMLInputElement>(null);

    // ── Fetch KYC status (reusable) ─────────────────────────────────────────

    const fetchKycData = useCallback(async (showLoader = true) => {
        if (showLoader) setPageLoading(true);
        try {
            const currentUser = getUserData();

            const [statusRes, listRes] = await Promise.allSettled([
                api.get(ENDPOINTS.KYC_STATUS),
                api.get(ENDPOINTS.KYC_LIST),
            ]);

            const statusData = statusRes.status === "fulfilled" ? statusRes.value.data?.data : null;
            if (!statusData) return;

            // Normalize status
            const rawStatus = (statusData.kyc_status || statusData.status || "NOT_SUBMITTED").toUpperCase();
            const status: KycOverallStatus =
                rawStatus === "APPROVED" || rawStatus === "COMPLETED" || rawStatus === "VERIFIED" ? "APPROVED"
                : rawStatus === "REJECTED" || rawStatus === "FAILED" ? "REJECTED"
                : rawStatus === "PENDING" || rawStatus === "SUBMITTED" || rawStatus === "UNDER_REVIEW" ? "PENDING"
                : "NOT_SUBMITTED";

            // Get full details from list
            let details: any = {};
            if (listRes.status === "fulfilled") {
                const listRaw = listRes.value.data?.data ?? listRes.value.data;
                if (Array.isArray(listRaw)) {
                    const uid = statusData.user_id || currentUser?.id;
                    details = listRaw.find((k: any) =>
                        k.user === uid || k.user_id === uid
                    ) || listRaw[listRaw.length - 1] || {};
                } else if (listRaw && typeof listRaw === "object") {
                    details = listRaw;
                }
            }

            const data = { ...details, ...statusData };

            setKycDetails({
                full_name:      details.full_name || statusData.full_name || null,
                email:          details.email || statusData.email || currentUser?.email || null,
                pan_number:     details.pan_number || null,
                aadhaar_number: details.aadhaar_number || null,
                dob:            details.dob || null,
                gender:         details.gender || null,
                district:       details.district || null,
                state:          details.state || null,
                country:        details.country || null,
            });

            if (status === "APPROVED") {
                setKycStatus(status);
                setStep("done");
            } else if (status === "REJECTED") {
                setKycStatus(status);
                setRejectionReason(
                    data.selfie_reject_reason || data.rejection_reason ||
                    "Selfie rejected. Please re-upload."
                );
                if (data.pan_verified || data.identity_verified) {
                    setPanStatus("verified");
                    if (data.pan_number) setPan(data.pan_number);
                }
                if (data.aadhaar_verified || data.identity_verified) {
                    setAadhaarStatus("verified");
                    if (data.aadhaar_number) setAadhaar(data.aadhaar_number);
                }
                setStep("selfie");
            } else if (status === "PENDING" && (data.selfie || data.liveness_verified || data.selfie_rejected)) {
                setKycStatus(status);
                setStep("done");
            } else {
                setKycStatus("NOT_SUBMITTED");
                if (data.pan_verified) {
                    setPanStatus("verified");
                    if (data.pan_number) setPan(data.pan_number);
                }
                if (data.aadhaar_verified) {
                    setAadhaarStatus("verified");
                    if (data.aadhaar_number) setAadhaar(data.aadhaar_number);
                }
                if (data.pan_verified && data.aadhaar_verified) setStep("selfie");
                else if (data.pan_verified) setStep("aadhaar");
                else setStep("pan");
            }
        } catch {
            // No KYC data yet — start fresh
        } finally {
            setPageLoading(false);
        }
    }, []);

    // Fetch on mount
    useEffect(() => {
        if (token) fetchKycData();
    }, [token, fetchKycData]);

    // ── PAN verification (direct API, no OTP) ───────────────────────────────

    const handleVerifyPan = async () => {
        if (!pan || panStatus === "verified") return;

        setPanLoading(true);
        try {
            await api.post(ENDPOINTS.KYC_VERIFY_PAN, { pan_number: pan.toUpperCase() });
            setPanStatus("verified");
            setStep("aadhaar");
            toast.success("PAN verified successfully");
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setPanLoading(false);
        }
    };

    // ── Aadhaar: Get OTP ─────────────────────────────────────────────────────

    const handleAadhaarGetOtp = async () => {
        if (!aadhaar || aadhaarStatus === "verified") return;

        setAadhaarOtpLoading(true);
        try {
            const cleanAadhaar = aadhaar.replace(/\s/g, "");
            const res = await api.post(ENDPOINTS.KYC_AADHAAR_GET_OTP, { aadhaar_number: cleanAadhaar });
            const data = res.data?.data ?? res.data;
            const requestId = data?.request_id || data?.ref_id || null;
            setAadhaarRefId(requestId);
            setOtpModal("aadhaar");
            toast.success("OTP sent to Aadhaar-linked mobile");
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setAadhaarOtpLoading(false);
        }
    };

    // ── Aadhaar: Verify OTP ──────────────────────────────────────────────────

    const handleAadhaarVerifyOtp = async (otp: string) => {
        setAadhaarVerifyLoading(true);
        try {
            const payload: Record<string, string> = { otp };
            if (aadhaarRefId) payload.request_id = aadhaarRefId;

            await api.post(ENDPOINTS.KYC_AADHAAR_VERIFY_OTP, payload);
            setOtpModal(null);
            setAadhaarStatus("verified");
            setStep("selfie");
            toast.success("Aadhaar verified successfully");
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setAadhaarVerifyLoading(false);
        }
    };

    // ── Selfie handling ──────────────────────────────────────────────────────

    const handleSelfieFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be under 5MB");
                return;
            }
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

    // ── Submit KYC ───────────────────────────────────────────────────────────

    const handleSubmitKyc = async () => {
        if (!selfie || !agreed) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("selfie", selfie);
            formData.append("pan_number", pan.toUpperCase());
            formData.append("aadhaar_number", aadhaar.replace(/\s/g, ""));

            await api.post(ENDPOINTS.KYC_SUBMIT, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("KYC submitted! Fetching details...");

            // Small delay to let backend process, then re-fetch everything
            await new Promise((r) => setTimeout(r, 1500));
            await fetchKycData(false);
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Validations ──────────────────────────────────────────────────────────

    const panValid = /^[A-Z]{5}\d{4}[A-Z]$/.test(pan.toUpperCase());
    const aadhaarValid = /^\d{12}$/.test(aadhaar.replace(/\s/g, ""));
    const canSubmit = panStatus === "verified" && aadhaarStatus === "verified" && selfie && agreed;

    // ── Loading state ────────────────────────────────────────────────────────

    if (pageLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
                <SectionLoader />
            </div>
        );
    }

    // ── If Approved — show details ──────────────────────────────────────────

    if (kycStatus === "APPROVED") {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
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
                        <p className="text-sm text-gray-600 mt-0.5">Your KYC has been verified</p>
                    </div>
                </motion.div>
                <KycApprovedView details={kycDetails || {
                    full_name: null, email: null, pan_number: null, aadhaar_number: null,
                    dob: null, gender: null, district: null, state: null, country: null,
                }} />
            </div>
        );
    }

    // ── If Pending — show review banner ──────────────────────────────────────

    if (kycStatus === "PENDING") {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
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
                        <p className="text-sm text-gray-600 mt-0.5">KYC Status</p>
                    </div>
                </motion.div>
                <KycPendingBanner />
            </div>
        );
    }

    // ── Main KYC form ────────────────────────────────────────────────────────

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* OTP Modal */}
            <OTPModal
                open={otpModal === "aadhaar"}
                onClose={() => setOtpModal(null)}
                onVerify={handleAadhaarVerifyOtp}
                title="Verify Aadhaar"
                subtitle="Enter the 6-digit OTP sent to your Aadhaar-linked mobile"
                loading={aadhaarVerifyLoading}
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
                    <p className="text-sm text-gray-600 mt-0.5">Complete KYC to unlock all features</p>
                </div>
            </motion.div>

            {/* ── Rejection banner ── */}
            {kycStatus === "REJECTED" && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3"
                >
                    <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-red-400">KYC Rejected</p>
                        <p className="text-[13px] text-gray-400 mt-0.5">
                            {rejectionReason || "Your selfie was rejected. Please re-upload a clear selfie holding your government ID."}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* ── Step indicator ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
            >
                <StepIndicator
                    current={step}
                    panDone={panStatus === "verified"}
                    aadhaarDone={aadhaarStatus === "verified"}
                    selfieDone={!!selfie}
                />
            </motion.div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT: KYC Steps (3 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="lg:col-span-3 space-y-5"
                >
                    {/* ── STEP 1: PAN Card ── */}
                    <div
                        className={`rounded-3xl border p-6 space-y-4 transition-all ${panStatus === "verified"
                                ? "border-emerald-500/20 bg-emerald-500/3"
                                : "border-white/6"
                            }`}
                        style={panStatus !== "verified" ? { background: "rgba(10,26,15,0.7)" } : undefined}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${panStatus === "verified"
                                        ? "bg-emerald-500 text-black"
                                        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                    }`}>
                                    {panStatus === "verified" ? <CheckCircle2 size={15} /> : <CreditCard size={15} />}
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-white">PAN Card</h2>
                                    <p className="text-[13px] text-gray-600">Permanent Account Number</p>
                                </div>
                            </div>
                            {panStatus === "verified" && (
                                <span className="text-[12px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full">
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
                                className={`flex-1 rounded-2xl border py-3.5 px-4 text-sm font-semibold text-white placeholder-gray-700 focus:outline-none transition-all ${panStatus === "verified"
                                        ? "border-emerald-500/20 bg-emerald-500/5 opacity-70"
                                        : "border-white/8 focus:border-emerald-500/50"
                                    }`}
                                style={panStatus !== "verified" ? { background: "rgba(5,13,7,0.8)" } : undefined}
                            />
                            <button
                                onClick={handleVerifyPan}
                                disabled={!panValid || panStatus === "verified" || panLoading}
                                className={`px-5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shrink-0 flex items-center gap-2 ${panValid && panStatus !== "verified" && !panLoading
                                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                                        : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                    }`}
                            >
                                {panLoading ? (
                                    <><Loader2 size={13} className="animate-spin" /> Verifying</>
                                ) : panStatus === "verified" ? "Done" : "Verify"}
                            </button>
                        </div>
                    </div>

                    {/* ── STEP 2: Aadhaar ── */}
                    <div
                        className={`rounded-3xl border p-6 space-y-4 transition-all ${aadhaarStatus === "verified"
                                ? "border-emerald-500/20 bg-emerald-500/3"
                                : panStatus !== "verified"
                                    ? "border-white/4 opacity-50"
                                    : "border-white/6"
                            }`}
                        style={aadhaarStatus !== "verified" ? { background: "rgba(10,26,15,0.7)" } : undefined}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${aadhaarStatus === "verified"
                                        ? "bg-emerald-500 text-black"
                                        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                    }`}>
                                    {aadhaarStatus === "verified" ? <CheckCircle2 size={15} /> : <Fingerprint size={15} />}
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-white">Government ID</h2>
                                    <p className="text-[13px] text-gray-600">Aadhaar Number</p>
                                </div>
                            </div>
                            {aadhaarStatus === "verified" && (
                                <span className="text-[12px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                    Verified
                                </span>
                            )}
                        </div>

                        {panStatus !== "verified" && (
                            <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                                <AlertCircle size={13} className="text-amber-400 shrink-0" />
                                <span className="text-[13px] text-amber-400 font-bold">Please verify PAN first to continue</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={aadhaar}
                                onChange={(e) => setAadhaar(e.target.value.replace(/[^\d\s]/g, "").slice(0, 14))}
                                placeholder="e.g. 1234 5678 9012"
                                disabled={panStatus !== "verified" || aadhaarStatus === "verified"}
                                className={`flex-1 rounded-2xl border py-3.5 px-4 text-sm font-semibold text-white placeholder-gray-700 focus:outline-none transition-all ${aadhaarStatus === "verified"
                                        ? "border-emerald-500/20 bg-emerald-500/5 opacity-70"
                                        : "border-white/8 focus:border-emerald-500/50"
                                    }`}
                                style={aadhaarStatus !== "verified" ? { background: "rgba(5,13,7,0.8)" } : undefined}
                            />
                            <button
                                onClick={handleAadhaarGetOtp}
                                disabled={!aadhaarValid || panStatus !== "verified" || aadhaarStatus === "verified" || aadhaarOtpLoading}
                                className={`px-5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shrink-0 flex items-center gap-2 ${aadhaarValid && panStatus === "verified" && aadhaarStatus !== "verified" && !aadhaarOtpLoading
                                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                                        : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                    }`}
                            >
                                {aadhaarOtpLoading ? (
                                    <><Loader2 size={13} className="animate-spin" /> Sending</>
                                ) : aadhaarStatus === "verified" ? "Done" : "Get OTP"}
                            </button>
                        </div>
                    </div>

                    {/* ── STEP 3: Selfie ── */}
                    <div
                        className={`rounded-3xl border p-6 space-y-4 transition-all ${step === "selfie" || step === "done"
                                ? selfie ? "border-emerald-500/20 bg-emerald-500/3" : "border-white/6"
                                : "border-white/4 opacity-50"
                            }`}
                        style={!(selfie && (step === "selfie" || step === "done")) ? { background: "rgba(10,26,15,0.7)" } : undefined}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${selfie
                                    ? "bg-emerald-500 text-black"
                                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                }`}>
                                {selfie ? <CheckCircle2 size={15} /> : <Camera size={15} />}
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-white">Selfie with ID Card</h2>
                                <p className="text-[13px] text-gray-600">Upload a selfie holding your government ID</p>
                            </div>
                        </div>

                        {(step !== "selfie" && step !== "done") && (
                            <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                                <AlertCircle size={13} className="text-amber-400 shrink-0" />
                                <span className="text-[13px] text-amber-400 font-bold">Complete PAN and Aadhaar verification first</span>
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
                                            <p className="text-sm text-gray-400 font-bold">Take Photo or Upload</p>
                                            <p className="text-[13px] text-gray-700 mt-0.5">PNG, JPG up to 5MB</p>
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
                                            <p className="text-sm font-bold text-white truncate">{selfie.name}</p>
                                            <p className="text-[13px] text-gray-600">{(selfie.size / 1024).toFixed(1)} KB</p>
                                            <p className="text-[13px] text-emerald-400 font-bold mt-0.5">Ready to submit</p>
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
                            <p className="text-[13px] text-gray-400 leading-relaxed">
                                The details displayed above were fetched after verification of your{" "}
                                <span className="text-white font-bold">Aadhaar number</span> and are required for{" "}
                                <span className="text-white font-bold">FIU-IND compliance</span> and regulatory obligations.
                            </p>
                            <p className="text-[13px] text-gray-400 leading-relaxed">
                                By clicking <span className="text-white font-bold">Submit</span>, you consent to sharing this
                                information with <span className="text-emerald-400 font-bold">YatriPay</span> for compliance purposes.
                            </p>
                        </div>

                        <button
                            onClick={() => setAgreed((v) => !v)}
                            className="flex items-start gap-2.5 text-left group w-full"
                        >
                            <span className={`mt-0.5 shrink-0 h-4 w-4 rounded flex items-center justify-center border transition-all duration-200 ${agreed
                                    ? "bg-emerald-500 border-emerald-500"
                                    : "border-white/20 bg-white/4 group-hover:border-emerald-500/50"
                                }`}>
                                {agreed && <CheckCircle2 size={11} className="text-black" />}
                            </span>
                            <span className="text-[13px] text-gray-400 leading-relaxed">
                                I confirm that I have read and agree to the above terms.
                            </span>
                        </button>

                        <button
                            onClick={handleSubmitKyc}
                            disabled={!canSubmit || submitting}
                            className={`w-full py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${canSubmit && !submitting
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                    : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                }`}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit KYC
                                    <ArrowRight size={15} strokeWidth={2.5} />
                                </>
                            )}
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
                    <div
                        className="rounded-3xl border border-white/6 p-5 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Camera size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">Selfie Guide</h2>
                        </div>

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
                                { ok: true, text: "Use good lighting and a plain background" },
                                { ok: true, text: "Hold the document near your face, clearly visible" },
                                { ok: true, text: "Ensure all text on the document is readable" },
                                { ok: false, text: "Don't wear sunglasses or hats" },
                                { ok: false, text: "Don't crop or edit the photo" },
                                { ok: false, text: "Don't use blurry or low-resolution images" },
                            ].map((tip, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <span className={`mt-0.5 shrink-0 ${tip.ok ? "text-emerald-400" : "text-red-400"}`}>
                                        {tip.ok ? <CheckCircle2 size={12} /> : <X size={12} />}
                                    </span>
                                    <span className="text-[13px] text-gray-400 leading-relaxed">{tip.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default KYC;

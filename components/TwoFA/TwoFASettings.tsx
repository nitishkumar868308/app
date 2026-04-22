"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
    ShieldCheck, Lock, Zap, ArrowLeft, CheckCircle2, AlertTriangle,
    Smartphone, Key, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { SectionLoader, ButtonLoader } from "@/components/Include/Loader";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { getApiError } from "@/lib/helpers";

const TwoFASettings = () => {
    const { user, loading, refreshUser, logout } = useAuth();

    const [otp, setOtp]             = useState("");
    const [verifying, setVerifying] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const otpRefs                   = useRef<(HTMLInputElement | null)[]>([]);

    const enabled = user?.google2fa_enable === true;
    const qrCode  = user?.google2fa_qr_code || null;

    const handleRefreshQr = async () => {
        setRefreshing(true);
        try { await refreshUser(); } finally { setRefreshing(false); }
    };

    // ── OTP input handlers ────────────────────────────────────────────────────

    const handleOtpInput = (index: number, digit: string) => {
        if (!/^\d*$/.test(digit)) return;
        const arr = otp.split("");
        arr[index] = digit.slice(-1);
        while (arr.length < 6) arr.push("");
        const next = arr.join("").slice(0, 6);
        setOtp(next);
        if (digit && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const arr = otp.split("");
            if (arr[index]) {
                arr[index] = "";
                setOtp(arr.join(""));
            } else if (index > 0) {
                arr[index - 1] = "";
                setOtp(arr.join(""));
                otpRefs.current[index - 1]?.focus();
            }
        }
        if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        setOtp(text);
        otpRefs.current[Math.min(text.length, 5)]?.focus();
    };

    // ── Enable 2FA handler ────────────────────────────────────────────────────

    const handleEnable = useCallback(async () => {
        if (otp.length !== 6) return toast.error("Enter the 6-digit code from your authenticator.");

        setVerifying(true);
        try {
            const res = await api.post(ENDPOINTS.VERIFY_FA, { otp });

            if (res.data?.success) {
                toast.success(res.data.message || "2FA enabled successfully!");
                // Logout + force re-login (2FA is now required on login)
                setTimeout(() => {
                    toast.success("Please login again to continue.");
                    logout();
                }, 800);
            } else {
                toast.error(res.data?.message || "Invalid code. Try again.");
            }
        } catch (err) {
            toast.error(getApiError(err));
        } finally {
            setVerifying(false);
        }
    }, [otp, logout]);

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-8">
                <SectionLoader />
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* ── Page header with back button ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-4"
            >
                <Link href="/quick-actions">
                    <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                        <ArrowLeft size={16} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Two-Factor Authentication</h1>
                    <p className="text-sm text-gray-600 mt-0.5">Extra security layer for your account</p>
                </div>
            </motion.div>

            {/* ── Status hero ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.35 }}
                className={`rounded-3xl border p-6 md:p-8 relative overflow-hidden ${
                    enabled ? "border-emerald-500/25" : "border-amber-500/25"
                }`}
                style={{
                    background: enabled
                        ? "linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(10,26,15,0.9) 100%)"
                        : "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(10,26,15,0.9) 100%)",
                }}
            >
                <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[80px] pointer-events-none ${
                    enabled ? "bg-emerald-500/10" : "bg-amber-500/10"
                }`} />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                        enabled
                            ? "bg-emerald-500 shadow-emerald-500/30"
                            : "bg-amber-500 shadow-amber-500/30"
                    }`}>
                        {enabled ? (
                            <ShieldCheck size={32} className="text-black" />
                        ) : (
                            <AlertTriangle size={30} className="text-black" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h2 className="text-lg md:text-xl font-black text-white">
                                {enabled ? "2FA is Active" : "2FA is Disabled"}
                            </h2>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-black uppercase tracking-widest ${
                                enabled
                                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                    : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                            }`}>
                                {enabled ? <><CheckCircle2 size={9} /> Enabled</> : "Disabled"}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400">
                            {enabled
                                ? "Your account is protected with an additional verification step on every login."
                                : "Scan the QR code below with Google Authenticator and enter the 6-digit code to enable 2FA."
                            }
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ══════════════════════════════════════════════════════════════
                ENABLED — Info-only view
               ══════════════════════════════════════════════════════════════ */}
            {enabled && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-3xl border border-emerald-500/15 p-6 space-y-3"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <h3 className="text-base font-black text-white">You&apos;re All Set</h3>
                    </div>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                        Every time you log in, open your authenticator app (Google Authenticator, Authy, etc.)
                        and enter the 6-digit code shown for YatriPay.
                    </p>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                        If you lose access to your authenticator app, contact support to reset 2FA.
                    </p>
                </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                DISABLED — Scan + Verify flow
               ══════════════════════════════════════════════════════════════ */}
            {!enabled && (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.35 }}
                        className="grid grid-cols-1 md:grid-cols-5 gap-5"
                    >
                        {/* ── QR Code card ── */}
                        <div
                            className="md:col-span-2 rounded-3xl border border-white/6 p-6 flex flex-col items-center justify-center gap-4"
                            style={{ background: "rgba(10,26,15,0.7)" }}
                        >
                            <span className="text-[11px] uppercase tracking-widest text-emerald-400/60 font-black">
                                Step 1 · Scan QR
                            </span>

                            {qrCode ? (
                                <div className="rounded-2xl bg-white p-3 shadow-xl shadow-black/40">
                                    <img
                                        src={qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`}
                                        alt="2FA QR Code"
                                        className="h-48 w-48 object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="h-52 w-52 rounded-2xl bg-white/5 border border-white/8 flex flex-col items-center justify-center text-center px-4 gap-2">
                                    <AlertTriangle size={22} className="text-amber-400" />
                                    <p className="text-[12px] text-gray-500 font-bold">QR unavailable</p>
                                    <button
                                        onClick={handleRefreshQr}
                                        disabled={refreshing}
                                        className="text-[12px] text-emerald-400 font-black hover:underline disabled:opacity-50"
                                    >
                                        {refreshing ? "Refreshing…" : "Retry"}
                                    </button>
                                </div>
                            )}

                            <p className="text-[12px] text-gray-500 text-center max-w-xs leading-relaxed">
                                Open <span className="font-black text-white">Google Authenticator</span> or any TOTP app and tap <span className="font-black text-white">+ Scan QR</span>.
                            </p>
                        </div>

                        {/* ── Verify card ── */}
                        <div
                            className="md:col-span-3 rounded-3xl border border-white/6 p-6 space-y-5"
                            style={{ background: "rgba(10,26,15,0.7)" }}
                        >
                            <div className="space-y-1.5">
                                <span className="text-[11px] uppercase tracking-widest text-emerald-400/60 font-black">
                                    Step 2 · Verify Code
                                </span>
                                <h3 className="text-lg font-black text-white">Enter the 6-digit code</h3>
                                <p className="text-[13px] text-gray-500">
                                    Grab the current code from your authenticator app and enter it below.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[12px] uppercase tracking-[0.15em] font-bold text-gray-500 ml-0.5">
                                    Authentication Code
                                </label>
                                <div className="flex gap-2" onPaste={handleOtpPaste}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={otp[i] || ""}
                                            onChange={(e) => handleOtpInput(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            onFocus={(e) => e.target.select()}
                                            className={`w-0 grow h-12 sm:h-14 min-w-0 rounded-xl border text-center text-lg sm:text-xl font-black outline-none transition-all ${
                                                otp[i]
                                                    ? "border-emerald-500/50 bg-emerald-500/8 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                                                    : "border-white/10 bg-white/4 text-white focus:border-emerald-500/50 focus:bg-emerald-500/4"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                onClick={handleEnable}
                                whileHover={otp.length === 6 && !verifying ? { scale: 1.01 } : undefined}
                                whileTap={otp.length === 6 && !verifying ? { scale: 0.98 } : undefined}
                                disabled={verifying || otp.length !== 6}
                                className={`w-full py-3.5 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all ${
                                    verifying || otp.length !== 6
                                        ? "bg-emerald-500/30 text-emerald-400/50 cursor-not-allowed"
                                        : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)]"
                                }`}
                            >
                                {verifying ? (
                                    <ButtonLoader text="Verifying..." />
                                ) : (
                                    <>Enable 2FA <ArrowRight size={15} strokeWidth={2.5} /></>
                                )}
                            </motion.button>

                            <p className="text-[12px] text-gray-600 leading-relaxed">
                                After enabling, you&apos;ll be logged out. Log back in with your password, then enter a fresh code from your authenticator to finish.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}

            {/* ── Info cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {
                        icon: Smartphone,
                        title: "Authenticator App",
                        body: "Use Google Authenticator, Authy, or any TOTP-compatible app to generate 6-digit codes.",
                        color: "text-emerald-400",
                        bg: "bg-emerald-500/10 border-emerald-500/20",
                    },
                    {
                        icon: Key,
                        title: "One-Time Codes",
                        body: "Each code is valid for 30 seconds. Enter the current code shown in your app.",
                        color: "text-sky-400",
                        bg: "bg-sky-500/10 border-sky-500/20",
                    },
                    {
                        icon: Zap,
                        title: "Instant Protection",
                        body: "Every login requires a fresh code — stolen passwords alone cannot access your account.",
                        color: "text-violet-400",
                        bg: "bg-violet-500/10 border-violet-500/20",
                    },
                ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                            className="rounded-2xl border border-white/6 p-5 space-y-3"
                            style={{ background: "rgba(10,26,15,0.7)" }}
                        >
                            <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${card.bg}`}>
                                <Icon size={18} className={card.color} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white mb-1">{card.title}</h3>
                                <p className="text-[13px] text-gray-500 leading-relaxed">{card.body}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Security notice ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4 flex items-start gap-3"
            >
                <Lock size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                    <p className="text-[13px] font-black text-emerald-400">Never Share Your 2FA Codes</p>
                    <p className="text-[12px] text-emerald-400/70 mt-0.5">
                        YatriPay will never ask for your authenticator codes over call, email, or chat. Treat them like your password.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default TwoFASettings;

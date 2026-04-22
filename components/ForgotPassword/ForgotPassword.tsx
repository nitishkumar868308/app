"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff,
    KeyRound, CheckCircle2, Shield, Zap, Globe, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { getApiError } from "@/lib/helpers";
import { OverlayLoader, ButtonLoader } from "@/components/Include/Loader";

// ─── Steps ────────────────────────────────────────────────────────────────────

type Step = "identifier" | "otp" | "reset";

// ─── Resend timer hook ────────────────────────────────────────────────────────

const useResendTimer = (seconds = 30) => {
    const [remaining, setRemaining] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const start = useCallback(() => {
        setRemaining(seconds);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [seconds]);

    useEffect(() => {
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    return { remaining, canResend: remaining === 0, start };
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const ForgotPassword = () => {
    const router = useRouter();

    const [step, setStep]                     = useState<Step>("identifier");
    const [identifier, setIdentifier]         = useState("");
    const [otp, setOtp]                       = useState("");
    const [password, setPassword]             = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass]             = useState(false);
    const [showConfirm, setShowConfirm]       = useState(false);
    const [resetToken, setResetToken]         = useState("");
    const [loading, setLoading]               = useState(false);

    const otpTimer = useResendTimer(30);

    // Build payload from identifier (email vs phone)
    const buildIdentifierPayload = useCallback(() => {
        const v = identifier.trim();
        return v.includes("@") ? { email: v } : { phone_no: v };
    }, [identifier]);

    // ── Step 1: Send OTP ──────────────────────────────────────────────────────

    const handleSendOtp = useCallback(async () => {
        const v = identifier.trim();
        if (!v) return toast.error("Email or phone number is required.");

        const isEmail = v.includes("@");
        if (!isEmail && !/^[6-9]\d{9}$/.test(v)) {
            return toast.error("Enter a valid email or 10-digit mobile number.");
        }

        setLoading(true);
        try {
            const res = await api.post(ENDPOINTS.FORGOT_ACCOUNT, buildIdentifierPayload());
            toast.success(res.data?.message || "OTP sent.");
            otpTimer.start();
            setStep("otp");
        } catch (err) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    }, [identifier, buildIdentifierPayload, otpTimer]);

    // ── Step 2: Verify OTP ────────────────────────────────────────────────────

    const handleVerifyOtp = useCallback(async () => {
        if (otp.length !== 6) return toast.error("Enter the 6-digit code.");

        setLoading(true);
        try {
            const res = await api.post(ENDPOINTS.VERIFY_FORGOT_OTP, {
                ...buildIdentifierPayload(),
                otp,
            });

            const token = res.data?.data?.reset_token;
            if (!token) {
                toast.error("Invalid OTP. Please try again.");
                return;
            }

            setResetToken(token);
            toast.success(res.data?.message || "OTP verified!");
            setOtp("");
            setStep("reset");
        } catch (err) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    }, [otp, buildIdentifierPayload]);

    // ── Step 3: Reset Password ────────────────────────────────────────────────

    const handleResetPassword = useCallback(async () => {
        if (!password) return toast.error("Password is required.");
        if (password.length < 6) return toast.error("Password must be at least 6 characters.");
        if (password !== confirmPassword) return toast.error("Passwords do not match.");

        setLoading(true);
        try {
            const res = await api.post(ENDPOINTS.FORGOT_PASSWORD, {
                ...buildIdentifierPayload(),
                reset_token: resetToken,
                password1: password,
                password2: confirmPassword,
            });

            toast.success(res.data?.message || "Password reset successfully!");
            router.push("/login");
        } catch (err) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    }, [password, confirmPassword, resetToken, buildIdentifierPayload, router]);

    // ── Resend OTP ────────────────────────────────────────────────────────────

    const handleResendOtp = useCallback(async () => {
        if (!otpTimer.canResend) return;
        try {
            const res = await api.post(ENDPOINTS.FORGOT_RESEND_OTP, buildIdentifierPayload());
            toast.success(res.data?.message || "OTP resent.");
            otpTimer.start();
        } catch (err) {
            toast.error(getApiError(err));
        }
    }, [buildIdentifierPayload, otpTimer]);

    // ── Step index for left panel ─────────────────────────────────────────────

    const stepIndex = step === "identifier" ? 0 : step === "otp" ? 1 : 2;

    const stepItems = [
        { label: "Enter Account", sub: "Email / Phone", icon: Mail, done: stepIndex > 0 },
        { label: "Verify OTP",    sub: "6-digit code",  icon: KeyRound, done: stepIndex > 1 },
        { label: "Reset Password", sub: "New password", icon: Lock, done: false },
    ];

    const loaderText =
        step === "identifier" ? "Sending OTP..."
        : step === "otp" ? "Verifying OTP..."
        : "Resetting Password...";

    return (
        <div className="min-h-screen bg-[#000000] text-white w-full flex items-center justify-center relative overflow-hidden p-3 sm:p-5">

            <OverlayLoader show={loading} text={loaderText} />

            {/* ── Background ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-15%] left-[-10%] w-162.5 h-162.5 bg-emerald-500/8 rounded-full blur-[160px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-175 h-175 bg-green-600/6 rounded-full blur-[180px]" />
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
                {[
                    { char: "$", top: "8%",  left: "4%",  delay: 0,   size: "text-8xl md:text-9xl" },
                    { char: "₹", top: "42%", left: "88%", delay: 2.5, size: "text-7xl md:text-8xl" },
                    { char: "€", top: "70%", left: "6%",  delay: 4,   size: "text-8xl md:text-9xl" },
                    { char: "£", top: "83%", left: "78%", delay: 1,   size: "text-6xl md:text-7xl" },
                    { char: "₿", top: "18%", left: "72%", delay: 3,   size: "text-7xl md:text-8xl" },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: [0, -38, 0], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 7 + i * 0.4, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
                        className={`absolute font-black select-none text-emerald-400/25 drop-shadow-[0_0_28px_rgba(16,185,129,0.2)] ${item.size}`}
                        style={{ top: item.top, left: item.left }}
                    >
                        {item.char}
                    </motion.div>
                ))}
            </div>

            {/* ── Main Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 rounded-3xl border border-white/6 overflow-hidden shadow-2xl shadow-black/40"
                style={{ background: "rgba(10,26,15,0.85)", backdropFilter: "blur(24px)" }}
            >
                <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-emerald-400/60 to-transparent z-20" />

                {/* ══════════════════════════════════════════════════════════════
                    LEFT PANEL — Branding + Progress
                   ══════════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-2 p-6 md:p-8 relative border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between overflow-hidden"
                    style={{ background: "linear-gradient(160deg, rgba(16,185,129,0.08) 0%, rgba(10,26,15,0.95) 60%)" }}
                >
                    <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-400/8 rounded-full blur-[60px] pointer-events-none" />

                    <div className="relative z-10">
                        <Image src="/logo.png" alt="YatriPay" width={130} height={36} className="h-8 w-auto object-contain mb-8" priority />

                        {/* Animated lock visual — desktop */}
                        <div className="hidden lg:flex items-center justify-center py-4 mb-6">
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0, 0.15] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 -m-6 rounded-full border border-emerald-500/20"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0, 0.2] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                                    className="absolute inset-0 -m-3 rounded-full border border-emerald-500/15"
                                />
                                <motion.div
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="h-24 w-24 rounded-3xl bg-linear-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/25 flex items-center justify-center shadow-xl shadow-emerald-500/10"
                                >
                                    <KeyRound size={38} className="text-emerald-400" strokeWidth={1.5} />
                                </motion.div>
                            </div>
                        </div>

                        <h2 className="hidden lg:block text-2xl font-black leading-tight mb-2 text-white">
                            Recover{" "}
                            <span className="bg-linear-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                                Access.
                            </span>
                        </h2>
                        <p className="hidden lg:block text-gray-500 text-xs leading-relaxed mb-8">
                            Reset your password in just 3 simple steps and get back to your portfolio.
                        </p>

                        {/* Step progress — desktop */}
                        <div className="hidden lg:block space-y-2.5 mb-6">
                            <p className="text-[13px] text-gray-600 uppercase tracking-widest font-black mb-3">Reset Progress</p>
                            {stepItems.map((s, i) => {
                                const Icon = s.icon;
                                const active = i === stepIndex;
                                return (
                                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                                        active ? "bg-emerald-500/8 border border-emerald-500/15" : ""
                                    }`}>
                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                            s.done
                                                ? "bg-emerald-500 text-black"
                                                : active
                                                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                                    : "bg-white/4 border border-white/6 text-gray-700"
                                        }`}>
                                            {s.done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                                        </div>
                                        <div>
                                            <p className={`text-[13px] font-bold ${s.done ? "text-emerald-400" : active ? "text-white" : "text-gray-600"}`}>
                                                {s.label}
                                            </p>
                                            <p className="text-[13px] text-gray-700">{s.sub}</p>
                                        </div>
                                        {s.done && (
                                            <CheckCircle2 size={12} className="text-emerald-400 ml-auto shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Trust badges — desktop */}
                    <div className="hidden lg:grid grid-cols-2 gap-2 relative z-10">
                        {[
                            { icon: Shield,     label: "AES-256 Encrypted" },
                            { icon: Zap,        label: "Instant Reset" },
                            { icon: Globe,      label: "Secure OTP" },
                            { icon: TrendingUp, label: "24/7 Support" },
                        ].map((b, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/3 border border-white/4">
                                <b.icon size={11} className="text-emerald-500/60 shrink-0" />
                                <span className="text-[13px] text-gray-500 font-bold">{b.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Mobile compact */}
                    <div className="lg:hidden flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                            <KeyRound size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white">Forgot Password</h3>
                            <p className="text-[12px] text-gray-600">Step {stepIndex + 1} of 3 — {stepItems[stepIndex].label}</p>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    RIGHT PANEL — Form
                   ══════════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-3 p-6 md:p-8 lg:p-10">

                    <AnimatePresence mode="wait">
                        {/* ── STEP 1: Identifier ── */}
                        {step === "identifier" && (
                            <StepWrap key="identifier">
                                <StepHead
                                    title="Find Your Account"
                                    sub="Enter the email or phone number linked to your account."
                                    step="Step 1 of 3"
                                />
                                <Field
                                    label="Email or Phone Number"
                                    icon={<Mail size={16} />}
                                    type="text"
                                    placeholder="aman@example.com or 9876543210"
                                    value={identifier}
                                    onChange={setIdentifier}
                                />
                                <ActionBtn label="Send OTP" loading={loading} onClick={handleSendOtp} />
                            </StepWrap>
                        )}

                        {/* ── STEP 2: OTP ── */}
                        {step === "otp" && (
                            <StepWrap key="otp">
                                <StepHead
                                    title="Verify OTP"
                                    sub={`Enter the 6-digit code sent to ${identifier}`}
                                    step="Step 2 of 3"
                                />
                                <OtpBoxes value={otp} onChange={setOtp} length={6} />
                                <ActionBtn label="Verify" loading={loading} onClick={handleVerifyOtp} />
                                <div className="flex items-center justify-between mt-4">
                                    <button
                                        onClick={() => { setStep("identifier"); setOtp(""); }}
                                        className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors"
                                    >
                                        ← Change account
                                    </button>
                                    <button
                                        onClick={handleResendOtp}
                                        disabled={!otpTimer.canResend}
                                        className={`text-[13px] font-bold transition-colors ${
                                            otpTimer.canResend
                                                ? "text-emerald-400 hover:underline"
                                                : "text-gray-600 cursor-not-allowed"
                                        }`}
                                    >
                                        {otpTimer.canResend
                                            ? "Resend OTP"
                                            : `Resend in ${otpTimer.remaining}s`
                                        }
                                    </button>
                                </div>
                            </StepWrap>
                        )}

                        {/* ── STEP 3: Reset Password ── */}
                        {step === "reset" && (
                            <StepWrap key="reset">
                                <StepHead
                                    title="Set New Password"
                                    sub="Choose a strong password you haven't used before."
                                    step="Step 3 of 3"
                                />

                                <VerifiedBadge label={`OTP verified for ${identifier}`} />

                                <div className="space-y-4">
                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] uppercase tracking-[0.15em] font-bold text-gray-500 ml-0.5">
                                            New Password
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-400 transition-colors">
                                                <Lock size={16} />
                                            </span>
                                            <input
                                                type={showPass ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Min 6 characters"
                                                className="w-full pl-10 pr-11 py-3 bg-white/4 border border-white/8 rounded-xl focus:border-emerald-500/50 focus:bg-emerald-500/3 outline-none transition-all text-white text-sm placeholder:text-gray-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass(!showPass)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-emerald-400 transition-colors"
                                            >
                                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] uppercase tracking-[0.15em] font-bold text-gray-500 ml-0.5">
                                            Confirm Password
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-400 transition-colors">
                                                <Lock size={16} />
                                            </span>
                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Re-enter password"
                                                className={`w-full pl-10 pr-11 py-3 bg-white/4 border rounded-xl focus:bg-emerald-500/3 outline-none transition-all text-white text-sm placeholder:text-gray-700 ${
                                                    confirmPassword && confirmPassword !== password
                                                        ? "border-red-500/40 focus:border-red-500/60"
                                                        : confirmPassword && confirmPassword === password
                                                            ? "border-emerald-500/40 focus:border-emerald-500/60"
                                                            : "border-white/8 focus:border-emerald-500/50"
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-emerald-400 transition-colors"
                                            >
                                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                        {confirmPassword.length > 0 && (
                                            <p className={`text-[12px] font-bold ml-1 ${
                                                confirmPassword === password ? "text-emerald-400" : "text-red-400"
                                            }`}>
                                                {confirmPassword === password ? "✓ Passwords match" : "✗ Passwords do not match"}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <ActionBtn label="Reset Password" loading={loading} onClick={handleResetPassword} />
                            </StepWrap>
                        )}
                    </AnimatePresence>

                    {/* Back to login */}
                    <p className="text-center text-gray-600 mt-7 text-xs">
                        Remembered your password?{" "}
                        <Link href="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                            Sign In
                        </Link>
                    </p>

                    {/* Security notice */}
                    <div className="mt-5 flex items-start gap-2.5 p-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5">
                        <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                            <p className="text-[13px] font-black text-emerald-400 leading-tight">
                                Secure Password Recovery
                            </p>
                            <p className="text-[12px] text-emerald-400/70 font-semibold mt-0.5">
                                Never share your OTP with anyone
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

const StepWrap = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.25 }}
    >
        {children}
    </motion.div>
);

const StepHead = ({ title, sub, step }: { title: string; sub: string; step: string }) => (
    <div className="mb-6">
        <span className="text-[13px] text-emerald-400/60 uppercase tracking-widest font-black">{step}</span>
        <h3 className="text-xl sm:text-2xl font-black text-white mt-1">{title}</h3>
        <p className="text-gray-500 text-xs mt-1">{sub}</p>
    </div>
);

const Field = ({ label, icon, type = "text", placeholder, value, onChange }: {
    label: string; icon: React.ReactNode; type?: string; placeholder: string;
    value: string; onChange: (v: string) => void;
}) => (
    <div className="space-y-1.5 group">
        <label className="text-[12px] uppercase tracking-[0.15em] font-bold text-gray-500 group-focus-within:text-emerald-400 transition-colors ml-0.5">
            {label}
        </label>
        <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-400 transition-colors">
                {icon}
            </span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-3 bg-white/4 border border-white/8 rounded-xl focus:border-emerald-500/50 focus:bg-emerald-500/3 outline-none transition-all text-white text-sm placeholder:text-gray-700"
            />
        </div>
    </div>
);

const OtpBoxes = ({ value, onChange, length }: { value: string; onChange: (v: string) => void; length: number }) => {
    const refs: (HTMLInputElement | null)[] = [];

    const handleInput = (index: number, digit: string) => {
        if (!/^\d*$/.test(digit)) return;
        const arr = value.split("");
        arr[index] = digit.slice(-1);
        while (arr.length < length) arr.push("");
        const next = arr.join("").slice(0, length);
        onChange(next);
        if (digit && index < length - 1) {
            refs[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const arr = value.split("");
            if (arr[index]) {
                arr[index] = "";
                onChange(arr.join(""));
            } else if (index > 0) {
                arr[index - 1] = "";
                onChange(arr.join(""));
                refs[index - 1]?.focus();
            }
        }
        if (e.key === "ArrowLeft" && index > 0) refs[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < length - 1) refs[index + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        onChange(text);
        refs[Math.min(text.length, length - 1)]?.focus();
    };

    return (
        <div className="space-y-1.5 mb-2">
            <label className="text-[12px] uppercase tracking-[0.15em] font-bold text-gray-500 ml-0.5">
                Verification Code
            </label>
            <div className="flex gap-2" onPaste={handlePaste}>
                {Array.from({ length }).map((_, i) => (
                    <input
                        key={i}
                        ref={(el) => { refs[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={value[i] || ""}
                        onChange={(e) => handleInput(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onFocus={(e) => e.target.select()}
                        autoFocus={i === 0}
                        className={`w-0 grow h-12 sm:h-14 min-w-0 rounded-xl border text-center text-lg sm:text-xl font-black outline-none transition-all ${
                            value[i]
                                ? "border-emerald-500/50 bg-emerald-500/8 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                                : "border-white/10 bg-white/4 text-white focus:border-emerald-500/50 focus:bg-emerald-500/4"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

const ActionBtn = ({ label, loading, onClick }: { label: string; loading: boolean; onClick: () => void }) => (
    <div className="mt-5">
        <motion.button
            whileHover={!loading ? { scale: 1.01 } : undefined}
            whileTap={!loading ? { scale: 0.98 } : undefined}
            onClick={onClick}
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                loading
                    ? "bg-emerald-500/30 text-emerald-400/50 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)]"
            }`}
        >
            {loading ? (
                <ButtonLoader text="Please wait..." />
            ) : (
                <>
                    {label}
                    <ArrowRight size={15} strokeWidth={2.5} />
                </>
            )}
        </motion.button>
    </div>
);

const VerifiedBadge = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 mb-5">
        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
        <span className="text-[13px] text-emerald-400 font-bold">{label}</span>
    </div>
);

export default ForgotPassword;

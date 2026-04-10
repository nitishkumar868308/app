"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, User, ArrowRight, ShieldCheck, Lock,
    Smartphone, UserPlus, CheckCircle2, Eye, EyeOff,
    Shield, Zap, Globe, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { getApiError } from "@/lib/helpers";
import { OverlayLoader, ButtonLoader } from "@/components/Include/Loader";
import { useAuth } from "@/context/AuthContext";
import { setAuthToken } from "@/lib/auth";

// ─── Steps ────────────────────────────────────────────────────────────────────

type Step = "phone" | "phone_otp" | "email" | "email_otp" | "profile";

// ─── Main ─────────────────────────────────────────────────────────────────────

// ─── Session persistence helpers ──────────────────────────────────────────────

const SESSION_KEY = "ytp_reg_progress";

interface RegProgress {
    phone: string;
    email: string;
    step: Step;
    phoneVerified: boolean;
    emailVerified: boolean;
}

const saveProgress = (data: RegProgress) => {
    if (typeof window !== "undefined") {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    }
};

const loadProgress = (): RegProgress | null => {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? (JSON.parse(raw) as RegProgress) : null;
    } catch { return null; }
};

const clearProgress = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem(SESSION_KEY);
};

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

const Register = () => {
    const { login, saveVerifyToken, clearVerifyToken } = useAuth();

    // Restore progress from sessionStorage
    const saved = useRef(loadProgress());

    const [phone, setPhone]               = useState(saved.current?.phone || "");
    const [email, setEmail]               = useState(saved.current?.email || "");
    const [name, setName]                 = useState("");
    const [referral, setReferral]         = useState("");
    const [password, setPassword]         = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass]         = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);

    const [step, setStep]                 = useState<Step>(saved.current?.step || "phone");
    const [otp, setOtp]                   = useState("");
    const [loading, setLoading]           = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(saved.current?.phoneVerified || false);
    const [emailVerified, setEmailVerified] = useState(saved.current?.emailVerified || false);

    // Resend timers
    const phoneTimer = useResendTimer(30);
    const emailTimer = useResendTimer(30);

    // Persist progress on key state changes
    useEffect(() => {
        saveProgress({ phone, email, step, phoneVerified, emailVerified });
    }, [phone, email, step, phoneVerified, emailVerified]);

    // ── API handlers ──────────────────────────────────────────────────────────

    const handleSendPhoneOtp = useCallback(async () => {
        if (!phone.trim()) return toast.error("Phone number is required.");
        if (!/^[6-9]\d{9}$/.test(phone.trim())) return toast.error("Enter a valid 10-digit mobile number.");

        setLoading(true);
        try {
            const res = await api.post(ENDPOINTS.SEND_MOBILE_OTP, { phone_no: phone.trim() });
            const data = res.data;

            if (data?.data?.token) {
                setAuthToken(data.data.token);
                toast.success(data.message || "Profile pending. Continuing...");
                setPhoneVerified(true);
                setEmailVerified(true);
                setStep("profile");
                return;
            }
            if (data?.data?.verify_token) {
                saveVerifyToken(data.data.verify_token);
                toast.success(data.message || "Phone already verified.");
                setPhoneVerified(true);
                setStep("email");
                return;
            }
            toast.success(data?.message || "OTP sent to your WhatsApp.");
            phoneTimer.start();
            setStep("phone_otp");
        } catch (err) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    }, [phone]);

    const handleVerifyPhoneOtp = useCallback(async () => {
        if (otp.length < 4) return toast.error("Enter a valid OTP.");
        setLoading(true);
        try {
            const res = await api.post(ENDPOINTS.VERIFY_PHONE_OTP, {
                phone_no: phone.trim(),
                whatsapp_otp: otp,
            });
            if (res.data?.data?.verify_token) {
                saveVerifyToken(res.data.data.verify_token);
            }
            toast.success(res.data?.message || "Phone verified!");
            setPhoneVerified(true);
            setOtp("");
            setStep("email");
        } catch (err) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    }, [phone, otp]);

    const handleSendEmailOtp = useCallback(async () => {
        if (!email.trim()) return toast.error("Email is required.");
        setLoading(true);
        try {
            const res = await api.post(ENDPOINTS.SEND_EMAIL_OTP, { email: email.trim() });
            if (res.data?.data?.token) {
                setAuthToken(res.data.data.token);
                toast.success(res.data.message || "Email already verified.");
                setEmailVerified(true);
                setStep("profile");
                return;
            }
            toast.success(res.data?.message || "OTP sent to your email.");
            emailTimer.start();
            setStep("email_otp");
        } catch (err) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    }, [email]);

    const handleVerifyEmailOtp = useCallback(async () => {
        if (otp.length !== 6) return toast.error("Enter a valid 6-digit OTP.");
        setLoading(true);
        try {
            const res = await api.post(ENDPOINTS.VERIFY_EMAIL_OTP, {
                email: email.trim(),
                email_otp: otp,
            });
            if (res.data?.data?.token) {
                setAuthToken(res.data.data.token);
            }
            toast.success(res.data?.message || "Email verified!");
            setEmailVerified(true);
            setOtp("");
            setStep("profile");
        } catch (err) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    }, [email, otp]);

    const handleCompleteProfile = useCallback(async () => {
        if (!name.trim() || name.trim().length < 2) return toast.error("Name must be at least 2 characters.");
        if (!password) return toast.error("Password is required.");
        if (password.length < 6) return toast.error("Password must be at least 6 characters.");
        if (password !== confirmPassword) return toast.error("Passwords do not match.");

        setLoading(true);
        try {
            await api.post(ENDPOINTS.REGISTER_FIRST, {
                first_name: name.trim(),
                last_name: "",
                referral_id: referral.trim() || "",
            });

            // Second register: set password — returns token + user
            const res = await api.post(ENDPOINTS.REGISTER_SECOND, {
                password: password,
                password2: confirmPassword,
            });

            const resData = res.data?.data;
            const token = resData?.token || resData?.user?.token;
            const userData = resData?.user || resData;

            if (token && userData) {
                login(token, {
                    id:               userData.id,
                    first_name:       userData.first_name || "",
                    last_name:        userData.last_name || "",
                    email:            userData.email || "",
                    phone_no:         userData.phone_no || "",
                    avatar:           userData.avatar || null,
                    pin_status:       userData.pin_status ?? false,
                    role:             userData.role ?? 0,
                    referral_id:      userData.referral_id || null,
                    referred_by_name: userData.referred_by_name || null,
                    is_investor:      userData.is_investor ?? false,
                    google2fa_enable: userData.google2fa_enable ?? false,
                });
            }

            clearVerifyToken();
            clearProgress();
            toast.success("Account created successfully!");
            window.location.href = "/dashboard";
        } catch (err) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    }, [name, referral, password, confirmPassword, login, clearVerifyToken]);

    const handleResendPhoneOtp = useCallback(async () => {
        if (!phoneTimer.canResend) return;
        try {
            const res = await api.post(ENDPOINTS.RESEND_MOBILE_OTP, { phone_no: phone.trim() });
            toast.success(res.data?.message || "OTP resent.");
            phoneTimer.start();
        } catch (err) {
            toast.error(getApiError(err));
        }
    }, [phone, phoneTimer]);

    const handleResendEmailOtp = useCallback(async () => {
        if (!emailTimer.canResend) return;
        try {
            const res = await api.post(ENDPOINTS.RESEND_EMAIL_OTP, { email: email.trim() });
            toast.success(res.data?.message || "OTP resent.");
            emailTimer.start();
        } catch (err) {
            toast.error(getApiError(err));
        }
    }, [email, emailTimer]);

    // ── Step index for left panel ─────────────────────────────────────────────

    const stepIndex = step === "phone" || step === "phone_otp" ? 0
        : step === "email" || step === "email_otp" ? 1 : 2;

    const stepItems = [
        { label: "Phone Verification", sub: "WhatsApp OTP", done: phoneVerified, icon: Smartphone },
        { label: "Email Verification",  sub: "Email OTP",    done: emailVerified, icon: Mail },
        { label: "Complete Profile",     sub: "Name & Password", done: false,     icon: User },
    ];

    return (
        <div className="min-h-screen bg-[#030a05] text-white w-full flex items-center justify-center relative overflow-hidden p-3 sm:p-5">

            {/* Centered Overlay Loader */}
            <OverlayLoader
                show={loading}
                text={
                    step === "phone" ? "Sending OTP..." :
                    step === "phone_otp" ? "Verifying Phone..." :
                    step === "email" ? "Sending Email OTP..." :
                    step === "email_otp" ? "Verifying Email..." :
                    "Creating Account..."
                }
            />

            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-15%] left-[-10%] w-150 h-150 bg-emerald-500/8 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-175 h-175 bg-green-600/6 rounded-full blur-[160px]" />
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Floating currency symbols */}
                {[
                    { char: "$", top: "8%",  left: "4%",  delay: 0,   size: "text-7xl md:text-9xl" },
                    { char: "₹", top: "38%", left: "88%", delay: 2.5, size: "text-6xl md:text-8xl" },
                    { char: "€", top: "72%", left: "7%",  delay: 4,   size: "text-7xl md:text-9xl" },
                    { char: "£", top: "82%", left: "78%", delay: 1,   size: "text-5xl md:text-7xl" },
                    { char: "₿", top: "18%", left: "72%", delay: 3,   size: "text-6xl md:text-8xl" },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: [0, -40, 0], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 7, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
                        className={`absolute font-black select-none text-emerald-400/25 drop-shadow-[0_0_30px_rgba(16,185,129,0.2)] ${item.size}`}
                        style={{ top: item.top, left: item.left }}
                    >
                        {item.char}
                    </motion.div>
                ))}
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 rounded-3xl border border-white/6 overflow-hidden shadow-2xl shadow-black/40"
                style={{ background: "rgba(10,26,15,0.85)", backdropFilter: "blur(24px)" }}
            >
                {/* Top accent */}
                <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-emerald-400/60 to-transparent z-20" />

                {/* ══════════════════════════════════════════════════════════════
                    LEFT PANEL — Branding + Animated Visual
                   ══════════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-2 p-6 md:p-8 relative border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between overflow-hidden"
                    style={{ background: "linear-gradient(160deg, rgba(16,185,129,0.08) 0%, rgba(10,26,15,0.95) 60%)" }}
                >
                    {/* Decorative orbs */}
                    <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-400/8 rounded-full blur-[60px] pointer-events-none" />

                    {/* Logo */}
                    <div className="relative z-10">
                        <Image src="/logo.png" alt="YatriPay" width={130} height={36} className="h-8 w-auto object-contain mb-8" priority />

                        {/* Animated visual — floating security shield */}
                        <div className="hidden lg:flex items-center justify-center py-6 mb-6">
                            <div className="relative">
                                {/* Outer ring pulse */}
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

                                {/* Main shield */}
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="h-24 w-24 rounded-3xl bg-linear-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/25 flex items-center justify-center shadow-xl shadow-emerald-500/10"
                                >
                                    <ShieldCheck size={40} className="text-emerald-400" strokeWidth={1.5} />
                                </motion.div>

                                {/* Orbiting dots */}
                                {[0, 1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 -m-10"
                                        style={{ transformOrigin: "center center" }}
                                    >
                                        <div
                                            className="h-2 w-2 rounded-full bg-emerald-400/40"
                                            style={{ position: "absolute", top: i % 2 === 0 ? 0 : "auto", bottom: i % 2 !== 0 ? 0 : "auto", left: i < 2 ? 0 : "auto", right: i >= 2 ? 0 : "auto" }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Step progress — desktop */}
                        <div className="hidden lg:block space-y-2.5 mb-8">
                            <p className="text-[13px] text-gray-600 uppercase tracking-widest font-black mb-3">Registration Progress</p>
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
                            { icon: Shield,     label: "AES-256" },
                            { icon: Zap,        label: "Instant" },
                            { icon: Globe,      label: "2M+ Users" },
                            { icon: TrendingUp, label: "₹500Cr+" },
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
                            <ShieldCheck size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white">Create Account</h3>
                            <p className="text-[12px] text-gray-600">Step {stepIndex + 1} of 3 — {stepItems[stepIndex].label}</p>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    RIGHT PANEL — Form
                   ══════════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-3 p-6 md:p-8 lg:p-10">

                    <AnimatePresence mode="wait">
                        {/* ── STEP: Phone ── */}
                        {step === "phone" && (
                            <StepWrap key="phone">
                                <StepHead
                                    title="Enter Phone Number"
                                    sub="We'll send an OTP to your WhatsApp for verification."
                                    step="Step 1 of 3"
                                />
                                <Field
                                    label="Mobile Number"
                                    icon={<Smartphone size={16} />}
                                    type="tel"
                                    placeholder="9876543210"
                                    value={phone}
                                    onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
                                    prefix="+91"
                                />
                                <ActionBtn label="Send OTP" loading={loading} onClick={handleSendPhoneOtp} />
                            </StepWrap>
                        )}

                        {/* ── STEP: Phone OTP ── */}
                        {step === "phone_otp" && (
                            <StepWrap key="phone_otp">
                                <StepHead
                                    title="Verify Phone"
                                    sub={`Enter the code sent to +91 ${phone}`}
                                    step="Step 1 of 3"
                                />
                                <OtpBoxes value={otp} onChange={setOtp} length={6} />
                                <ActionBtn label="Verify" loading={loading} onClick={handleVerifyPhoneOtp} />
                                <div className="flex items-center justify-between mt-4">
                                    <button onClick={() => { setStep("phone"); setOtp(""); }} className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors">
                                        ← Change number
                                    </button>
                                    <button
                                        onClick={handleResendPhoneOtp}
                                        disabled={!phoneTimer.canResend}
                                        className={`text-[13px] font-bold transition-colors ${
                                            phoneTimer.canResend
                                                ? "text-emerald-400 hover:underline"
                                                : "text-gray-600 cursor-not-allowed"
                                        }`}
                                    >
                                        {phoneTimer.canResend
                                            ? "Resend OTP"
                                            : `Resend in ${phoneTimer.remaining}s`
                                        }
                                    </button>
                                </div>
                            </StepWrap>
                        )}

                        {/* ── STEP: Email ── */}
                        {step === "email" && (
                            <StepWrap key="email">
                                <StepHead
                                    title="Enter Email"
                                    sub="We'll send a 6-digit verification code."
                                    step="Step 2 of 3"
                                />
                                <VerifiedBadge label={`Phone verified: +91 ${phone}`} />
                                <Field
                                    label="Email Address"
                                    icon={<Mail size={16} />}
                                    type="email"
                                    placeholder="aman@example.com"
                                    value={email}
                                    onChange={setEmail}
                                />
                                <ActionBtn label="Send OTP" loading={loading} onClick={handleSendEmailOtp} />
                            </StepWrap>
                        )}

                        {/* ── STEP: Email OTP ── */}
                        {step === "email_otp" && (
                            <StepWrap key="email_otp">
                                <StepHead
                                    title="Verify Email"
                                    sub={`Enter the 6-digit code sent to ${email}`}
                                    step="Step 2 of 3"
                                />
                                <OtpBoxes value={otp} onChange={setOtp} length={6} />
                                <ActionBtn label="Verify" loading={loading} onClick={handleVerifyEmailOtp} />
                                <div className="flex items-center justify-between mt-4">
                                    <button onClick={() => { setStep("email"); setOtp(""); }} className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors">
                                        ← Change email
                                    </button>
                                    <button
                                        onClick={handleResendEmailOtp}
                                        disabled={!emailTimer.canResend}
                                        className={`text-[13px] font-bold transition-colors ${
                                            emailTimer.canResend
                                                ? "text-emerald-400 hover:underline"
                                                : "text-gray-600 cursor-not-allowed"
                                        }`}
                                    >
                                        {emailTimer.canResend
                                            ? "Resend OTP"
                                            : `Resend in ${emailTimer.remaining}s`
                                        }
                                    </button>
                                </div>
                            </StepWrap>
                        )}

                        {/* ── STEP: Profile ── */}
                        {step === "profile" && (
                            <StepWrap key="profile">
                                <StepHead
                                    title="Complete Profile"
                                    sub="Almost done! Set up your name and password."
                                    step="Step 3 of 3"
                                />

                                <div className="flex flex-wrap gap-2 mb-5">
                                    {phoneVerified && <VerifiedPill label="Phone" />}
                                    {emailVerified && <VerifiedPill label="Email" />}
                                </div>

                                <div className="space-y-4">
                                    <Field
                                        label="Full Name"
                                        icon={<User size={16} />}
                                        placeholder="Aman Sharma"
                                        value={name}
                                        onChange={setName}
                                    />
                                    <Field
                                        label="Referral Code (Optional)"
                                        icon={<UserPlus size={16} />}
                                        placeholder="Enter code if you have one"
                                        value={referral}
                                        onChange={setReferral}
                                    />

                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] uppercase tracking-[0.15em] font-bold text-gray-500 ml-0.5">
                                            Password
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
                                        {/* Live match indicator */}
                                        {confirmPassword.length > 0 && (
                                            <p className={`text-[12px] font-bold ml-1 ${
                                                confirmPassword === password ? "text-emerald-400" : "text-red-400"
                                            }`}>
                                                {confirmPassword === password ? "✓ Passwords match" : "✗ Passwords do not match"}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <ActionBtn label="Create Account" loading={loading} onClick={handleCompleteProfile} />
                            </StepWrap>
                        )}
                    </AnimatePresence>

                    {/* Sign in link */}
                    <p className="text-center text-gray-600 mt-7 text-xs">
                        Already have an account?{" "}
                        <Link href="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                            Sign In
                        </Link>
                    </p>
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

const Field = ({ label, icon, type = "text", placeholder, value, onChange, prefix }: {
    label: string; icon: React.ReactNode; type?: string; placeholder: string;
    value: string; onChange: (v: string) => void; prefix?: string;
}) => (
    <div className="space-y-1.5 group">
        <label className="text-[12px] uppercase tracking-[0.15em] font-bold text-gray-500 group-focus-within:text-emerald-400 transition-colors ml-0.5">
            {label}
        </label>
        <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-400 transition-colors">
                {icon}
            </span>
            {prefix && (
                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 pointer-events-none">
                    {prefix}
                </span>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full ${prefix ? "pl-20" : "pl-10"} pr-4 py-3 bg-white/4 border border-white/8 rounded-xl focus:border-emerald-500/50 focus:bg-emerald-500/3 outline-none transition-all text-white text-sm placeholder:text-gray-700`}
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
        // Fill any gaps with empty string
        while (arr.length < length) arr.push("");
        const next = arr.join("").slice(0, length);
        onChange(next);
        // Auto-focus next box
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

const VerifiedPill = ({ label }: { label: string }) => (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/8 text-[13px] font-black text-emerald-400 uppercase tracking-widest">
        <CheckCircle2 size={9} /> {label}
    </span>
);

export default Register;

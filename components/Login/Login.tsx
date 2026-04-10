"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff,
    TrendingUp, Zap, Globe, X, Shield,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { getApiError } from "@/lib/helpers";
import { useAuth } from "@/context/AuthContext";
import { OverlayLoader, ButtonLoader } from "@/components/Include/Loader";

const Login = () => {
    const { login } = useAuth();

    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading]   = useState(false);

    // 2FA state
    const [show2FA, setShow2FA]   = useState(false);
    const [twoFAOtp, setTwoFAOtp] = useState("");
    const twoFARefs               = useRef<(HTMLInputElement | null)[]>([]);

    // ── Login handler ─────────────────────────────────────────────────────────

    const handleLogin = useCallback(async () => {
        if (!email.trim()) return toast.error("Email is required.");
        if (!password) return toast.error("Password is required.");

        setLoading(true);
        try {
            const res = await api.post(ENDPOINTS.LOGIN, {
                email: email.trim(),
                password,
            });

            const data = res.data?.data;

            // 2FA required
            if (data?.is_2fa_enabled) {
                setShow2FA(true);
                toast.success("2FA required. Enter your authenticator code.");
                return;
            }

            // Normal login — save token + user
            const token    = data?.token;
            const userData = data?.user;

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
                toast.success("Welcome back!");
                window.location.href = "/dashboard";
            }
        } catch (err) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    }, [email, password, login]);

    // ── 2FA verify handler ────────────────────────────────────────────────────

    const handle2FAVerify = useCallback(async () => {
        if (twoFAOtp.length !== 6) return toast.error("Enter a valid 6-digit code.");

        setLoading(true);
        try {
            const res = await api.post(ENDPOINTS.VERIFY_2FA, {
                email: email.trim(),
                otp: twoFAOtp,
            });

            const data  = res.data?.data;
            const token = data?.token;
            const userData = data?.user;

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
                toast.success("Welcome back!");
                window.location.href = "/dashboard";
            }
        } catch (err) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    }, [email, twoFAOtp, login]);

    // ── 2FA OTP input handlers ────────────────────────────────────────────────

    const handle2FAInput = (index: number, digit: string) => {
        if (!/^\d*$/.test(digit)) return;
        const arr = twoFAOtp.split("");
        arr[index] = digit.slice(-1);
        while (arr.length < 6) arr.push("");
        const next = arr.join("").slice(0, 6);
        setTwoFAOtp(next);
        if (digit && index < 5) twoFARefs.current[index + 1]?.focus();
    };

    const handle2FAKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const arr = twoFAOtp.split("");
            if (arr[index]) {
                arr[index] = "";
                setTwoFAOtp(arr.join(""));
            } else if (index > 0) {
                arr[index - 1] = "";
                setTwoFAOtp(arr.join(""));
                twoFARefs.current[index - 1]?.focus();
            }
        }
    };

    const handle2FAPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        setTwoFAOtp(text);
        twoFARefs.current[Math.min(text.length, 5)]?.focus();
    };

    // ── Background data ───────────────────────────────────────────────────────

    const currencyIcons = [
        { char: "$",  top: "8%",  left: "4%",  delay: 0,   size: "text-8xl md:text-9xl" },
        { char: "₹",  top: "42%", left: "88%", delay: 2.5, size: "text-7xl md:text-8xl" },
        { char: "€",  top: "70%", left: "6%",  delay: 4,   size: "text-8xl md:text-9xl" },
        { char: "£",  top: "83%", left: "78%", delay: 1,   size: "text-6xl md:text-7xl" },
        { char: "₿",  top: "18%", left: "72%", delay: 3,   size: "text-7xl md:text-8xl" },
    ];

    const features = [
        { icon: TrendingUp, text: "Real-time portfolio tracking" },
        { icon: Zap,        text: "Instant fund transfers" },
        { icon: Globe,      text: "Global investment access" },
    ];

    return (
        <div className="min-h-screen bg-[#030a05] text-white w-full flex items-center justify-center relative overflow-hidden p-3 sm:p-5">

            {/* Centered Overlay Loader */}
            <OverlayLoader show={loading} text={show2FA ? "Verifying 2FA..." : "Signing in..."} />

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
                {currencyIcons.map((item, i) => (
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
                {/* Top accent */}
                <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-emerald-400/60 to-transparent z-20" />

                {/* ══════════════════════════════════════════════════════════════
                    LEFT PANEL — Branding
                   ══════════════════════════════════════════════════════════════ */}
                <div className="hidden lg:flex lg:col-span-2 flex-col justify-between p-8 border-r border-white/5 relative overflow-hidden"
                    style={{ background: "linear-gradient(160deg, rgba(16,185,129,0.08) 0%, rgba(10,26,15,0.95) 60%)" }}
                >
                    <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-400/8 rounded-full blur-[60px] pointer-events-none" />

                    <div className="relative z-10">
                        <Image src="/logo.png" alt="YatriPay" width={130} height={36} className="h-8 w-auto object-contain mb-10" priority />

                        <h2 className="text-3xl font-black leading-tight mb-3 text-white">
                            Welcome{" "}
                            <span className="bg-linear-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                                Back.
                            </span>
                        </h2>
                        <p className="text-gray-500 text-xs leading-relaxed mb-8">
                            Secure access to your portfolio and investments. Your wealth journey continues here.
                        </p>

                        {/* Animated shield visual */}
                        <div className="flex items-center justify-center py-4 mb-6">
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0, 0.15] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 -m-6 rounded-full border border-emerald-500/20"
                                />
                                <motion.div
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="h-20 w-20 rounded-2xl bg-linear-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/25 flex items-center justify-center shadow-xl shadow-emerald-500/10"
                                >
                                    <ShieldCheck size={32} className="text-emerald-400" strokeWidth={1.5} />
                                </motion.div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2.5">
                            {features.map((f, i) => {
                                const Icon = f.icon;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        className="flex items-center gap-3 text-xs text-gray-500"
                                    >
                                        <span className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                                            <Icon size={13} />
                                        </span>
                                        {f.text}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="grid grid-cols-2 gap-2 relative z-10 mt-6">
                        {[
                            { icon: Shield, label: "AES-256" },
                            { icon: Zap,    label: "99.9% Uptime" },
                        ].map((b, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/3 border border-white/4">
                                <b.icon size={11} className="text-emerald-500/60 shrink-0" />
                                <span className="text-[13px] text-gray-500 font-bold">{b.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    RIGHT PANEL — Form
                   ══════════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">

                    {/* Mobile header */}
                    <div className="flex items-center gap-3 mb-6 lg:hidden">
                        <Image src="/logo.png" alt="YatriPay" width={110} height={30} className="h-7 w-auto object-contain" />
                    </div>

                    <div className="mb-7">
                        <h3 className="text-2xl font-black text-white">Sign In</h3>
                        <p className="text-gray-500 text-xs mt-1">Enter your credentials to access your account.</p>
                    </div>

                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>

                        {/* Email */}
                        <div className="space-y-1.5 group">
                            <label className="text-[12px] uppercase tracking-[0.15em] font-bold text-gray-500 group-focus-within:text-emerald-400 transition-colors ml-0.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-400 transition-colors">
                                    <Mail size={16} />
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="aman@example.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white/4 border border-white/8 rounded-xl focus:border-emerald-500/50 focus:bg-emerald-500/3 outline-none transition-all text-white text-sm placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5 group">
                            <div className="flex items-center justify-between ml-0.5">
                                <label className="text-[12px] uppercase tracking-[0.15em] font-bold text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                                    Password
                                </label>
                                <Link href="/forgot-password" className="text-[12px] text-emerald-400/70 hover:text-emerald-400 transition-colors font-bold">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-400 transition-colors">
                                    <Lock size={16} />
                                </span>
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••"
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

                        {/* Remember me */}
                        <button
                            type="button"
                            onClick={() => setRemember(!remember)}
                            className="flex items-center gap-2.5 group/check"
                        >
                            <span className={`h-4.5 w-4.5 rounded flex items-center justify-center border transition-all ${
                                remember
                                    ? "bg-emerald-500 border-emerald-500"
                                    : "border-white/15 bg-white/4 group-hover/check:border-emerald-500/50"
                            }`}>
                                {remember && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </span>
                            <span className="text-xs text-gray-500">Keep me signed in for 7 days</span>
                        </button>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            whileHover={!loading ? { scale: 1.01 } : undefined}
                            whileTap={!loading ? { scale: 0.98 } : undefined}
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
                                <>Sign In <ArrowRight size={15} strokeWidth={2.5} /></>
                            )}
                        </motion.button>
                    </form>

                    {/* Sign up link */}
                    <p className="text-center text-gray-600 mt-7 text-xs">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </motion.div>

            {/* ══════════════════════════════════════════════════════════════
                2FA Modal
               ══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {show2FA && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                        onClick={() => setShow2FA(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            transition={{ duration: 0.25 }}
                            className="w-full max-w-sm rounded-3xl border border-white/8 p-6 space-y-5 relative"
                            style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShow2FA(false)}
                                className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>

                            <div className="text-center">
                                <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                    <ShieldCheck size={20} className="text-emerald-400" />
                                </div>
                                <h3 className="text-base font-black text-white">Two-Factor Authentication</h3>
                                <p className="text-[13px] text-gray-500 mt-1">Enter the 6-digit code from your authenticator app</p>
                            </div>

                            {/* 2FA OTP boxes */}
                            <div className="flex gap-2" onPaste={handle2FAPaste}>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { twoFARefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={twoFAOtp[i] || ""}
                                        onChange={(e) => handle2FAInput(i, e.target.value)}
                                        onKeyDown={(e) => handle2FAKeyDown(i, e)}
                                        onFocus={(e) => e.target.select()}
                                        autoFocus={i === 0}
                                        className={`w-0 grow h-12 min-w-0 rounded-xl border text-center text-lg font-black outline-none transition-all ${
                                            twoFAOtp[i]
                                                ? "border-emerald-500/50 bg-emerald-500/8 text-emerald-400"
                                                : "border-white/10 bg-white/4 text-white focus:border-emerald-500/50"
                                        }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handle2FAVerify}
                                disabled={loading || twoFAOtp.length !== 6}
                                className={`w-full py-3.5 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                    !loading && twoFAOtp.length === 6
                                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                                        : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                                }`}
                            >
                                {loading ? <ButtonLoader text="Verifying..." /> : <>Verify <ArrowRight size={14} strokeWidth={2.5} /></>}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Login;

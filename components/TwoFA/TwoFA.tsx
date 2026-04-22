"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    ShieldCheck, ArrowRight, ArrowLeft, Shield, Zap, Globe, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { getApiError } from "@/lib/helpers";
import { useAuth } from "@/context/AuthContext";
import { OverlayLoader, ButtonLoader } from "@/components/Include/Loader";

const SESSION_KEY = "ytp_2fa_email";

export const save2FAEmail = (email: string) => {
    if (typeof window !== "undefined") {
        sessionStorage.setItem(SESSION_KEY, email);
    }
};

const load2FAEmail = (): string => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(SESSION_KEY) || "";
};

const clear2FAEmail = () => {
    if (typeof window !== "undefined") {
        sessionStorage.removeItem(SESSION_KEY);
    }
};

const TwoFA = () => {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail]     = useState("");
    const [otp, setOtp]         = useState("");
    const [loading, setLoading] = useState(false);
    const otpRefs               = useRef<(HTMLInputElement | null)[]>([]);

    // Restore email from session — if missing, send user back to login
    useEffect(() => {
        const saved = load2FAEmail();
        if (!saved) {
            toast.error("Please login first.");
            router.push("/login");
            return;
        }
        setEmail(saved);
    }, [router]);

    // ── OTP handlers ──────────────────────────────────────────────────────────

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

    // ── Verify handler ────────────────────────────────────────────────────────

    const handleVerify = useCallback(async () => {
        if (otp.length !== 6) return toast.error("Enter the full 6-digit code.");
        if (!email) return toast.error("Session expired. Please login again.");

        setLoading(true);
        try {
            const res = await api.post(ENDPOINTS.VERIFY_2FA, { email, otp });
            const data  = res.data?.data;
            const token = data?.token;
            const user  = data?.user;

            if (!token || !user) {
                toast.error("Invalid response. Try again.");
                return;
            }

            login(token, {
                id:                user.id,
                first_name:        user.first_name || "",
                last_name:         user.last_name || "",
                email:             user.email || "",
                phone_no:          user.phone_no || "",
                avatar:            user.avatar || null,
                pin_status:        user.pin_status ?? false,
                role:              user.role ?? 0,
                referral_id:       user.referral_id || null,
                referred_by_name:  user.referred_by_name || null,
                is_investor:       user.is_investor ?? false,
                google2fa_enable:  user.google2fa_enable ?? false,
                google2fa_qr_code: user.google2fa_qr_code || null,
            });

            clear2FAEmail();
            toast.success("Welcome back!");
            window.location.href = "/dashboard";
        } catch (err) {
            toast.error(getApiError(err));
        } finally {
            setLoading(false);
        }
    }, [email, otp, login]);

    const handleBackToLogin = () => {
        clear2FAEmail();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white w-full flex items-center justify-center relative overflow-hidden p-3 sm:p-5">

            <OverlayLoader show={loading} text="Verifying 2FA..." />

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
                    LEFT PANEL — Branding + Animated Visual
                   ══════════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-2 p-6 md:p-8 relative border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between overflow-hidden"
                    style={{ background: "linear-gradient(160deg, rgba(16,185,129,0.08) 0%, rgba(10,26,15,0.95) 60%)" }}
                >
                    <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-400/8 rounded-full blur-[60px] pointer-events-none" />

                    <div className="relative z-10">
                        <Image src="/logo.png" alt="YatriPay" width={130} height={36} className="h-8 w-auto object-contain mb-8" priority />

                        {/* Animated shield visual */}
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
                                            style={{
                                                position: "absolute",
                                                top:    i % 2 === 0 ? 0 : "auto",
                                                bottom: i % 2 !== 0 ? 0 : "auto",
                                                left:   i < 2 ? 0 : "auto",
                                                right:  i >= 2 ? 0 : "auto",
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <h2 className="hidden lg:block text-2xl font-black leading-tight mb-2 text-white">
                            Two-Factor{" "}
                            <span className="bg-linear-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                                Auth.
                            </span>
                        </h2>
                        <p className="hidden lg:block text-gray-500 text-xs leading-relaxed mb-8">
                            Extra layer of security. Enter the 6-digit code from your authenticator app to continue.
                        </p>
                    </div>

                    {/* Trust badges — desktop */}
                    <div className="hidden lg:grid grid-cols-2 gap-2 relative z-10">
                        {[
                            { icon: Shield,     label: "End-to-End Secure" },
                            { icon: Zap,        label: "TOTP Protected" },
                            { icon: Globe,      label: "Instant Verify" },
                            { icon: TrendingUp, label: "Trusted by 10k+" },
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
                            <h3 className="text-sm font-black text-white">Two-Factor Auth</h3>
                            <p className="text-[12px] text-gray-600">Enter the code from your authenticator app</p>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    RIGHT PANEL — Form
                   ══════════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-3 p-6 md:p-8 lg:p-10 flex flex-col justify-center">

                    <div className="mb-7">
                        <span className="text-[13px] text-emerald-400/60 uppercase tracking-widest font-black">Security Check</span>
                        <h3 className="text-2xl font-black text-white mt-1">Verify Your Identity</h3>
                        <p className="text-gray-500 text-xs mt-1">
                            Code sent for{" "}
                            <span className="text-emerald-400 font-bold">{email || "—"}</span>
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleVerify(); }}
                        className="space-y-5"
                    >
                        {/* OTP boxes */}
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
                                        autoFocus={i === 0}
                                        className={`w-0 grow h-12 sm:h-14 min-w-0 rounded-xl border text-center text-lg sm:text-xl font-black outline-none transition-all ${
                                            otp[i]
                                                ? "border-emerald-500/50 bg-emerald-500/8 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                                                : "border-white/10 bg-white/4 text-white focus:border-emerald-500/50 focus:bg-emerald-500/4"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Verify button */}
                        <motion.button
                            type="submit"
                            whileHover={!loading ? { scale: 1.01 } : undefined}
                            whileTap={!loading ? { scale: 0.98 } : undefined}
                            disabled={loading || otp.length !== 6}
                            className={`w-full py-3.5 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                                loading || otp.length !== 6
                                    ? "bg-emerald-500/30 text-emerald-400/50 cursor-not-allowed"
                                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)]"
                            }`}
                        >
                            {loading ? (
                                <ButtonLoader text="Verifying..." />
                            ) : (
                                <>Verify & Sign In <ArrowRight size={15} strokeWidth={2.5} /></>
                            )}
                        </motion.button>
                    </form>

                    {/* Back to login */}
                    <button
                        onClick={handleBackToLogin}
                        className="mt-5 text-[13px] text-gray-600 hover:text-emerald-400 font-bold inline-flex items-center gap-1.5 self-start transition-colors"
                    >
                        <ArrowLeft size={12} /> Back to login
                    </button>

                    {/* Helper note */}
                    <p className="text-center text-gray-600 mt-7 text-xs">
                        Can&apos;t access your authenticator?{" "}
                        <Link href="/support" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                            Contact Support
                        </Link>
                    </p>

                    {/* Security notice */}
                    <div className="mt-5 flex items-start gap-2.5 p-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5">
                        <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                            <p className="text-[13px] font-black text-emerald-400 leading-tight">
                                Never Share Your Code
                            </p>
                            <p className="text-[12px] text-emerald-400/70 font-semibold mt-0.5">
                                YatriPay will never ask for your 2FA code over call, email, or chat.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TwoFA;

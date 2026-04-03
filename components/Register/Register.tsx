"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Lock, User, ArrowRight, ShieldCheck,
    Smartphone, UserPlus, CheckCircle2, X, Info, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";

const Register = () => {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        referral: "",
        password: "",
        confirmPassword: "",
    });

    const [activeModal, setActiveModal] = useState<"phone" | "email" | null>(null);
    const [otp, setOtp] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const currencyIcons = [
        { char: "$", top: "8%",  left: "4%",  delay: 0, size: "text-7xl md:text-9xl" },
        { char: "₹", top: "38%", left: "88%", delay: 2.5, size: "text-6xl md:text-8xl" },
        { char: "€", top: "72%", left: "7%",  delay: 4, size: "text-7xl md:text-9xl" },
        { char: "£", top: "82%", left: "78%", delay: 1, size: "text-5xl md:text-7xl" },
        { char: "₿", top: "18%", left: "72%", delay: 3, size: "text-6xl md:text-8xl" },
    ];

    return (
        <div className="min-h-screen bg-[#030c07] text-white w-full flex items-center justify-center relative overflow-hidden font-sans p-3 sm:p-6">

            {/* Ambient background glows */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-green-600/8 rounded-full blur-[160px]" />
                <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-[120px]" />

                {/* Subtle grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Floating currency symbols */}
                {currencyIcons.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: [0, -40, 0], opacity: [0.25, 0.6, 0.25] }}
                        transition={{ duration: 7, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
                        className={`absolute font-black select-none text-emerald-400/30 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] ${item.size}`}
                        style={{ top: item.top, left: item.left }}
                    >
                        {item.char}
                    </motion.div>
                ))}
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[1120px] grid grid-cols-1 lg:grid-cols-12 bg-[#0a1810]/80 backdrop-blur-2xl rounded-[2rem] border border-emerald-500/15 shadow-[0_0_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(16,185,129,0.05)] overflow-hidden"
            >
                {/* Top gradient line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent z-50 opacity-80" />

                {/* ── Left Branding Panel ── */}
                <div className="lg:col-span-4 p-7 md:p-10 relative bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent border-b lg:border-b-0 lg:border-r border-emerald-500/10 flex flex-col justify-between">

                    {/* Top: Logo + Headline */}
                    <div>
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className="h-11 w-11 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/20">
                                <ShieldCheck className="text-white" size={22} strokeWidth={2.5} />
                            </div>
                            <span className="text-[22px] font-extrabold tracking-tight text-white">
                                Yatri<span className="text-emerald-400">Pay.</span>
                            </span>
                        </div>

                        {/* Headline — hidden on mobile, visible lg+ */}
                        <div className="hidden lg:block">
                            <h2 className="text-[2.6rem] font-black leading-[1.08] mb-5 text-white">
                                The Next <br />
                                <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                                    Evolution
                                </span>{" "}
                                <br />
                                of Wealth.
                            </h2>
                            <p className="text-gray-400 text-[14px] leading-relaxed mb-10">
                                Secure, fast, and automated. Join the elite circle of modern investors.
                            </p>

                            {/* Stats row */}
                            <div className="grid grid-cols-2 gap-3 mb-10">
                                {[
                                    { value: "2M+", label: "Members" },
                                    { value: "₹500Cr+", label: "Managed" },
                                    { value: "99.9%", label: "Uptime" },
                                    { value: "AES-256", label: "Encryption" },
                                ].map((s) => (
                                    <div key={s.label} className="bg-white/[0.04] border border-emerald-500/10 rounded-xl p-3 text-center">
                                        <div className="text-emerald-400 font-bold text-base">{s.value}</div>
                                        <div className="text-gray-500 text-[10px] uppercase tracking-wider mt-0.5">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile tagline */}
                    <div className="lg:hidden">
                        <h3 className="text-sm font-bold text-emerald-400 mb-1">Step into the future</h3>
                        <p className="text-gray-500 text-xs">The next evolution of wealth.</p>
                    </div>

                    {/* Bottom: Encryption Badge */}
                    {/* <div className="hidden lg:flex items-center gap-3 p-4 bg-emerald-500/[0.07] rounded-2xl border border-emerald-500/15 shadow-inner">
                        <div className="h-8 w-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                            <Info className="text-emerald-400" size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] text-emerald-400 uppercase tracking-[0.18em] font-bold">
                                AES-256 Encryption Active
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Bank-grade security on every request</p>
                        </div>
                     
                        <div className="ml-auto flex-shrink-0 relative">
                            <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-70 animate-ping" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </div>
                    </div> */}
                </div>

                {/* ── Right Form Panel ── */}
                <div className="lg:col-span-8 p-6 md:p-10 lg:p-12">

                    {/* Header */}
                    <div className="mb-8">
                        <h3 className="text-3xl font-black tracking-tight text-white">Create Account</h3>
                        <p className="text-gray-500 text-sm mt-1">Fill in your details to get started instantly.</p>
                    </div>

                    <form className="space-y-0" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                            {/* Full Name */}
                            <InputField
                                label="Full Name"
                                name="name"
                                icon={<User size={17} />}
                                placeholder="Aman Sharma"
                                onChange={handleChange}
                            />

                            {/* Referral Code */}
                            <InputField
                                label="Referral Code"
                                name="referral"
                                icon={<UserPlus size={17} />}
                                placeholder="Optional"
                                onChange={handleChange}
                            />

                            {/* Phone */}
                            <OtpField
                                label="Phone Number"
                                icon={<Smartphone size={17} />}
                                type="tel"
                                name="phone"
                                placeholder="+91 00000 00000"
                                onChange={handleChange}
                                onOtp={() => setActiveModal("phone")}
                            />

                            {/* Email */}
                            <OtpField
                                label="Email Address"
                                icon={<Mail size={17} />}
                                type="email"
                                name="email"
                                placeholder="aman@example.com"
                                onChange={handleChange}
                                onOtp={() => setActiveModal("email")}
                            />

                            {/* Password */}
                            <PasswordField
                                label="Password"
                                name="password"
                                placeholder="••••••••••"
                                show={showPass}
                                onToggle={() => setShowPass(!showPass)}
                                onChange={handleChange}
                            />

                            {/* Confirm Password */}
                            <PasswordField
                                label="Confirm Password"
                                name="confirmPassword"
                                placeholder="••••••••••"
                                show={showConfirm}
                                onToggle={() => setShowConfirm(!showConfirm)}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="mt-7">
                            <motion.button
                                whileHover={{ scale: 1.015 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full relative overflow-hidden py-4 rounded-2xl font-bold text-base tracking-widest uppercase text-white
                                           bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500
                                           shadow-[0_8px_32px_rgba(16,185,129,0.35)]
                                           hover:shadow-[0_12px_48px_rgba(16,185,129,0.55)]
                                           transition-shadow duration-300"
                            >
                                {/* Shimmer sweep */}
                                <span className="absolute inset-0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                                <span className="relative flex items-center justify-center gap-3">
                                    Create Account
                                    <span className="relative flex items-center justify-center">
                                        <span className="absolute inline-flex h-6 w-6 rounded-full bg-white/30 animate-ping opacity-60" />
                                        <ArrowRight size={20} className="relative z-10" />
                                    </span>
                                </span>
                            </motion.button>
                        </div>
                    </form>

                    {/* Sign in link */}
                    <p className="text-center text-gray-500 mt-7 text-sm">
                        Already a member?{" "}
                        <Link href="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                            Sign In
                        </Link>
                    </p>

                    {/* Mobile encryption badge */}
                    {/* <div className="lg:hidden mt-6 flex items-center gap-3 p-3.5 bg-emerald-500/[0.07] rounded-2xl border border-emerald-500/15">
                        <div className="h-7 w-7 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                            <Info className="text-emerald-400" size={14} />
                        </div>
                        <p className="text-[10px] text-emerald-400 uppercase tracking-[0.15em] font-bold">
                            AES-256 Encryption Active
                        </p>
                        <div className="ml-auto relative flex-shrink-0">
                            <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-70 animate-ping" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                    </div> */}
                </div>
            </motion.div>

            {/* ── OTP Modal ── */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/70">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="relative bg-gradient-to-br from-[#0a1810] to-[#030c07] border border-emerald-500/20 p-8 rounded-[2rem] w-full max-w-sm text-center shadow-[0_0_60px_rgba(16,185,129,0.15)]"
                        >
                            {/* Top accent line */}
                            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

                            <button
                                onClick={() => setActiveModal(null)}
                                className="absolute right-5 top-5 h-8 w-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            >
                                <X size={16} />
                            </button>

                            <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-emerald-500/20 to-green-500/10 text-emerald-400 rounded-full mb-5 ring-1 ring-emerald-500/20">
                                <CheckCircle2 size={30} />
                            </div>

                            <h4 className="text-xl font-bold mb-2 text-white capitalize">
                                Verify {activeModal}
                            </h4>
                            <p className="text-gray-500 text-sm mb-6">
                                Enter the 6-digit code sent to your {activeModal}.
                            </p>

                            <input
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full text-center text-3xl font-mono tracking-[0.5em] py-4 bg-white/[0.04] border border-emerald-500/20 rounded-2xl focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)] outline-none transition-all mb-6 text-white placeholder:text-gray-600"
                                placeholder="000000"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => console.log("Resend OTP")}
                                    className="w-1/2 py-3.5 rounded-xl font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-emerald-500/30 transition-all bg-white/[0.03] text-sm"
                                >
                                    Resend
                                </button>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-1/2 py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-400 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/25 text-sm"
                                >
                                    Verify
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ── Shared input styles ── */
const inputBase =
    "w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:border-emerald-500 focus:bg-emerald-500/[0.04] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] outline-none transition-all placeholder:text-gray-600 text-white text-sm";

/* ── Plain input field ── */
const InputField = ({ label, icon, onChange, placeholder, name, type = "text" }: {
    label: string; icon: React.ReactNode; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string; name: string; type?: string;
}) => (
    <div className="space-y-2 group">
        <label className="text-[10px] uppercase tracking-[0.18em] font-bold ml-0.5 text-emerald-400/70 group-focus-within:text-emerald-400 transition-colors">
            {label}
        </label>
        <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                {icon}
            </span>
            <input name={name} type={type} onChange={onChange} placeholder={placeholder} className={inputBase} />
        </div>
    </div>
);

/* ── Input + OTP button ── */
const OtpField = ({ label, icon, type, name, placeholder, onChange, onOtp }: {
    label: string; icon: React.ReactNode; type: string; name: string;
    placeholder: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onOtp: () => void;
}) => (
    <div className="space-y-2 group">
        <label className="text-[10px] uppercase tracking-[0.18em] font-bold ml-0.5 text-emerald-400/70 group-focus-within:text-emerald-400 transition-colors">
            {label}
        </label>
        <div className="flex gap-2">
            <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                    {icon}
                </span>
                <input name={name} type={type} onChange={onChange} placeholder={placeholder} className={inputBase} />
            </div>
            <button
                type="button"
                onClick={onOtp}
                className="px-4 flex-shrink-0 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 font-bold rounded-xl text-xs tracking-wider transition-all"
            >
                Get OTP
            </button>
        </div>
    </div>
);

/* ── Password field with toggle ── */
const PasswordField = ({ label, name, placeholder, show, onToggle, onChange }: {
    label: string; name: string; placeholder: string;
    show: boolean; onToggle: () => void; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <div className="space-y-2 group">
        <label className="text-[10px] uppercase tracking-[0.18em] font-bold ml-0.5 text-emerald-400/70 group-focus-within:text-emerald-400 transition-colors">
            {label}
        </label>
        <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                <Lock size={17} />
            </span>
            <input
                name={name}
                type={show ? "text" : "password"}
                onChange={onChange}
                placeholder={placeholder}
                className={`${inputBase} pr-11`}
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-400 transition-colors"
            >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    </div>
);

export default Register;

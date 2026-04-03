"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Info, TrendingUp, Zap, Globe } from "lucide-react";
import Link from "next/link";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPass, setShowPass] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const currencyIcons = [
        { char: "$",  top: "8%",  left: "4%",  delay: 0,   size: "text-8xl md:text-[9rem]" },
        { char: "₹",  top: "42%", left: "88%", delay: 2.5, size: "text-7xl md:text-8xl" },
        { char: "€",  top: "70%", left: "6%",  delay: 4,   size: "text-8xl md:text-[9rem]" },
        { char: "£",  top: "83%", left: "78%", delay: 1,   size: "text-6xl md:text-7xl" },
        { char: "₿",  top: "18%", left: "72%", delay: 3,   size: "text-7xl md:text-8xl" },
    ];

    const features = [
        { icon: <TrendingUp size={15} />, text: "Real-time portfolio tracking" },
        { icon: <Zap size={15} />,        text: "Instant fund transfers" },
        { icon: <Globe size={15} />,      text: "Global investment access" },
    ];

    const inputCls = "w-full pl-11 pr-4 py-3.5 bg-white/4 border border-white/8 rounded-xl focus:border-emerald-500 focus:bg-emerald-500/4 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] outline-none transition-all placeholder:text-gray-600 text-white text-sm";

    return (
        <div className="min-h-screen bg-[#030c07] text-white w-full flex items-center justify-center relative overflow-hidden font-sans p-3 sm:p-6">

            {/* ── Ambient Background ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-15%] left-[-10%] w-162.5 h-162.5 bg-emerald-500/10 rounded-full blur-[160px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-175 h-175 bg-green-600/8 rounded-full blur-[180px]" />
                <div className="absolute top-[45%] left-[45%] w-87.5 h-87.5 bg-teal-500/6 rounded-full blur-[120px]" />

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.022]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(16,185,129,0.6) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(16,185,129,0.6) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Floating currency icons */}
                {currencyIcons.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: [0, -38, 0], opacity: [0.22, 0.55, 0.22] }}
                        transition={{ duration: 7 + i * 0.4, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
                        className={`absolute font-black select-none text-emerald-400/30 drop-shadow-[0_0_28px_rgba(16,185,129,0.25)] ${item.size}`}
                        style={{ top: item.top, left: item.left }}
                    >
                        {item.char}
                    </motion.div>
                ))}
            </div>

            {/* ── Main Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-230 grid grid-cols-1 lg:grid-cols-12 bg-[#0a1810]/80 backdrop-blur-2xl rounded-4xl border border-emerald-500/15 shadow-[0_0_90px_rgba(0,0,0,0.65),0_0_0_1px_rgba(16,185,129,0.04)] overflow-hidden"
            >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-emerald-400 to-transparent z-50 opacity-80" />

                {/* ── Left Branding Panel ── */}
                <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 bg-linear-to-br from-emerald-500/10 via-green-500/5 to-transparent border-r border-emerald-500/10 relative">

                    {/* Decorative inner glow */}
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-emerald-500/5 to-transparent pointer-events-none" />

                    <div>
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-12">
                            <div className="h-11 w-11 bg-linear-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/20">
                                <ShieldCheck className="text-white" size={22} strokeWidth={2.5} />
                            </div>
                            <span className="text-[22px] font-extrabold tracking-tight text-white">
                                Yatri<span className="text-emerald-400">Pay.</span>
                            </span>
                        </div>

                        {/* Headline */}
                        <h2 className="text-[2.8rem] font-black leading-[1.05] mb-5 text-white">
                            Welcome <br />
                            <span className="bg-linear-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                                Back.
                            </span>
                        </h2>

                        <p className="text-gray-400 text-[14px] leading-relaxed mb-10">
                            Secure access to your portfolio and investments. Your wealth journey continues here.
                        </p>

                        {/* Feature list */}
                        <div className="space-y-3">
                            {features.map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                                    className="flex items-center gap-3 text-sm text-gray-400"
                                >
                                    <span className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-400 shrink-0">
                                        {f.icon}
                                    </span>
                                    {f.text}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop encryption badge */}
                    {/* <div className="flex items-center gap-3 p-4 bg-emerald-500/7 rounded-2xl border border-emerald-500/15">
                        <div className="h-8 w-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                            <Info className="text-emerald-400" size={15} />
                        </div>
                        <div>
                            <p className="text-[10px] text-emerald-400 uppercase tracking-[0.18em] font-bold">
                                AES-256 Encryption Active
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Bank-grade security on every request</p>
                        </div>
                        <div className="ml-auto relative shrink-0">
                            <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-70 animate-ping" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </div>
                    </div> */}
                </div>

                {/* ── Right Form Panel ── */}
                <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-center">

                    {/* Mobile logo */}
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="h-10 w-10 bg-linear-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <ShieldCheck className="text-white" size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight">
                            Yatri<span className="text-emerald-400">Pay.</span>
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h3 className="text-3xl font-black tracking-tight text-white">Sign In</h3>
                        <p className="text-gray-500 text-sm mt-1.5">Enter your credentials to access your account.</p>
                    </div>

                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

                        {/* Email */}
                        <div className="space-y-2 group">
                            <label className="text-[10px] uppercase tracking-[0.18em] font-bold ml-0.5 text-emerald-400/70 group-focus-within:text-emerald-400 transition-colors">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                                    <Mail size={17} />
                                </span>
                                <input
                                    name="email"
                                    type="email"
                                    onChange={handleChange}
                                    placeholder="aman@example.com"
                                    className={inputCls}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2 group">
                            <div className="flex items-center justify-between ml-0.5">
                                <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-emerald-400/70 group-focus-within:text-emerald-400 transition-colors">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-[11px] text-emerald-400/70 hover:text-emerald-400 transition-colors font-medium"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                                    <Lock size={17} />
                                </span>
                                <input
                                    name="password"
                                    type={showPass ? "text" : "password"}
                                    onChange={handleChange}
                                    placeholder="••••••••••"
                                    className="w-full pl-11 pr-11 py-3.5 bg-white/4 border border-white/8 rounded-xl focus:border-emerald-500 focus:bg-emerald-500/4 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] outline-none transition-all placeholder:text-gray-600 text-white text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-400 transition-colors"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <input id="remember" type="checkbox" className="peer sr-only" />
                                <label
                                    htmlFor="remember"
                                    className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-white/4 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/20 transition-all"
                                >
                                    <svg className="hidden peer-checked:block" width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </label>
                            </div>
                            <label htmlFor="remember" className="text-xs text-gray-500 cursor-pointer select-none">
                                Keep me signed in for 30 days
                            </label>
                        </div>

                        {/* Submit */}
                        <div className="pt-1">
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.015 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full relative overflow-hidden py-4 rounded-2xl font-bold text-base tracking-widest uppercase text-white
                                           bg-linear-to-r from-emerald-500 via-green-500 to-teal-500
                                           shadow-[0_8px_32px_rgba(16,185,129,0.35)]
                                           hover:shadow-[0_12px_48px_rgba(16,185,129,0.55)]
                                           transition-shadow duration-300"
                            >
                                {/* Shimmer */}
                                <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/15 to-transparent" />
                                <span className="relative flex items-center justify-center gap-3">
                                    Sign In
                                    <span className="relative flex items-center justify-center">
                                        <span className="absolute inline-flex h-5 w-5 rounded-full bg-white/30 animate-ping opacity-60" />
                                        <ArrowRight size={20} className="relative z-10" />
                                    </span>
                                </span>
                            </motion.button>
                        </div>
                    </form>

                    {/* Sign up link */}
                    <p className="text-center text-gray-500 mt-7 text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                            Sign Up
                        </Link>
                    </p>

                    {/* Mobile encryption badge */}
                    {/* <div className="lg:hidden mt-6 flex items-center gap-3 p-3.5 bg-emerald-500/7 rounded-2xl border border-emerald-500/15">
                        <div className="h-7 w-7 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                            <Info className="text-emerald-400" size={14} />
                        </div>
                        <p className="text-[10px] text-emerald-400 uppercase tracking-[0.15em] font-bold">
                            AES-256 Encryption Active
                        </p>
                        <div className="ml-auto relative shrink-0">
                            <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-70 animate-ping" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                    </div> */}
                </div>
            </motion.div>
        </div>
    );
};

export default Login;

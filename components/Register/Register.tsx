"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Lock, User, ArrowRight, ShieldCheck,
    Smartphone, UserPlus, CheckCircle2, X, Info
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const currencyIcons = [
        { char: "$", top: "10%", left: "5%", delay: 0, color: "text-blue-400/20" },
        { char: "₹", top: "40%", left: "85%", delay: 2, color: "text-emerald-400/20" },
        { char: "€", top: "70%", left: "10%", delay: 4, color: "text-violet-400/20" },
        { char: "£", top: "85%", left: "75%", delay: 1, color: "text-blue-400/20" },
        { char: "₿", top: "20%", left: "70%", delay: 3, color: "text-emerald-400/20" },
    ];

    return (
        <div className="min-h-screen bg-[#020408] text-white w-full flex items-center justify-center relative overflow-hidden font-sans p-2 sm:p-4">

            {/* --- Dynamic Background --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-[150px]" />

                {/* Floating Icons with Varied Colors */}
                {currencyIcons.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: [0, -50, 0], opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 6, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
                        className={`
                            absolute 
                            text-6xl md:text-8xl 
                            font-extrabold 
                            select-none 
                            ${item.color}
                            drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]
                        `}
                        style={{ top: item.top, left: item.left }}
                    >
                        {item.char}
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 bg-white/[0.05] backdrop-blur-2xl rounded-[2rem] border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                {/* 🔥 Fintech Signature Gradient Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-emerald-500 to-violet-500 z-50" />

                {/* --- Left Branding Section --- */}
                <div className="lg:col-span-4 p-6 md:p-10 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent border-b lg:border-b-0 lg:border-r border-white/10">
                    <div className="flex flex-row lg:flex-col items-center lg:items-start justify-between h-full">
                        <div>
                            <div className="flex items-center gap-3 mb-4 lg:mb-10">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <ShieldCheck className="text-white" size={24} />
                                </div>
                                <span className="text-xl font-bold tracking-tight">YatriPay.</span>
                            </div>
                            <div className="hidden lg:block">
                                <h2 className="text-4xl font-black leading-[1.1] mb-6">
                                    The Next <br />
                                    <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Evolution</span> <br />
                                    of Wealth.
                                </h2>
                                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                    Secure, fast, and automated. Join the elite circle of modern investors.
                                </p>
                            </div>
                        </div>

                        <div className="lg:hidden">
                            <h3 className="text-sm font-bold text-blue-400">Step into the future</h3>
                        </div>

                        <div className="hidden lg:flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <Info className="text-blue-400" size={20} />
                            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">AES-256 Encryption Active</p>
                        </div>
                    </div>
                </div>

                {/* --- Right Form Section --- */}
                <div className="lg:col-span-8 p-6 md:p-12">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold">Create Account</h3>
                        {/* <p className="text-gray-400 text-sm">Join the club and start building your portfolio.</p> */}
                    </div>

                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <InputField label="Full Name" name="name" icon={<User size={18} />} placeholder="Aman Sharma" color="blue" onChange={handleChange} />
                            <InputField label="Referral Code" name="referral" icon={<UserPlus size={18} />} placeholder="Optional" color="blue" onChange={handleChange} />

                            {/* Phone Input */}
                            <div className="space-y-2 group">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400/80 ml-1">Phone Number</label>
                                <div className="relative flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors"><Smartphone size={18} /></div>
                                        <input type="tel" name="phone" onChange={handleChange} placeholder="+91 00000 00000" className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-gray-600" />
                                    </div>
                                    <button onClick={() => setActiveModal("phone")} className="px-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold rounded-xl text-xs transition-colors">Get OTP</button>
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="space-y-2 group">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400/80 ml-1">Email Address</label>
                                <div className="relative flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors"><Mail size={18} /></div>
                                        <input type="email" name="email" onChange={handleChange} placeholder="aman@example.com" className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-gray-600" />
                                    </div>
                                    <button onClick={() => setActiveModal("email")} className="px-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold rounded-xl text-xs transition-colors">Get OTP</button>
                                </div>
                            </div>

                            <InputField label="Password" name="password" type="password" icon={<Lock size={18} />} placeholder="••••••••" color="blue" onChange={handleChange} />
                            <InputField label="Confirm Password" name="confirmPassword" type="password" icon={<Lock size={18} />} placeholder="••••••••" color="blue" onChange={handleChange} />
                        </div>

                        <button className="
                                        w-full 
                                        bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500
                                        text-white 
                                        py-4 
                                        rounded-xl 
                                        font-bold 
                                        text-lg 
                                        flex items-center justify-center gap-3 
                                        mt-8 
                                        relative
                                        overflow-hidden
                                        transition-all duration-300
                                        shadow-[0_10px_30px_rgba(59,130,246,0.35)]
                                        hover:shadow-[0_0_60px_rgba(59,130,246,0.7)]
                                        hover:scale-[1.04]
                                        active:scale-[0.97]
                                        ">

                            {/* Glow overlay */}
                            <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition duration-500 blur-xl" />

                            <span className="relative flex items-center gap-3">
                                CREATE ACCOUNT

                                {/* Arrow with ping effect */}
                                <span className="relative flex items-center justify-center">

                                    {/* Ping ring */}
                                    <span className="absolute inline-flex h-6 w-6 rounded-full bg-cyan-400 opacity-75 animate-ping"></span>

                                    {/* Arrow */}
                                    <span className="relative z-10 text-white">
                                        <ArrowRight size={22} />
                                    </span>

                                </span>
                            </span>
                        </button>
                    </form>

                    <p className="text-center text-gray-500 mt-8 text-sm">
                        Already a member? <Link href="/login" className="text-blue-400 font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </motion.div>

            {/* --- OTP Modal --- */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-gradient-to-br from-[#0d1117] to-[#020408] border border-white/10 p-8 rounded-[2rem] w-full max-w-sm text-center shadow-2xl"
                        >
                            <button onClick={() => setActiveModal(null)} className="absolute right-6 top-6 text-gray-500 hover:text-white"><X size={24} /></button>
                            <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-blue-500/20 to-emerald-500/10 text-blue-400 rounded-full mb-6"><CheckCircle2 size={32} /></div>
                            <h4 className="text-xl font-bold mb-2 text-white">Verify {activeModal}</h4>
                            <p className="text-gray-500 text-sm mb-6">Enter the 6-digit code sent to your {activeModal}.</p>
                            <input
                                maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)}
                                className="w-full text-center text-3xl font-mono tracking-widest py-4 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition-all mb-6 text-white"
                                placeholder="000000"
                            />
                            <div className="flex gap-3">

                                {/* Resend Button */}
                                <button
                                    onClick={() => console.log("Resend OTP")}
                                    className="w-1/2 py-3 rounded-xl font-semibold border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all bg-white/5"
                                >
                                    Resend
                                </button>

                                {/* Verify Button */}
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-1/2 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
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

// Enhanced Helper Component
const InputField = ({ label, icon, color = "blue", ...props }: any) => {
    const focusColors: any = {
        blue: "focus:border-blue-500 group-focus-within:text-blue-400 text-blue-400/80",
        emerald: "focus:border-emerald-500 group-focus-within:text-emerald-400 text-emerald-400/80",
        violet: "focus:border-violet-500 group-focus-within:text-violet-400 text-violet-400/80"
    };

    return (
        <div className="space-y-2 group">
            <label className={`text-[10px] uppercase tracking-[0.2em] font-bold ml-1 transition-colors ${focusColors[color].split(' ')[2]}`}>
                {label}
            </label>
            <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors ${focusColors[color].split(' ')[1]}`}>
                    {icon}
                </div>
                <input
                    {...props}
                    className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl outline-none transition-all placeholder:text-gray-600 text-white ${focusColors[color].split(' ')[0]}`}
                />
            </div>
        </div>
    );
};

export default Register;
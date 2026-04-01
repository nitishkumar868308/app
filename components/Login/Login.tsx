"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

const Login = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

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

            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-[150px]" />

                {currencyIcons.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: [0, -50, 0], opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 6, repeat: Infinity, delay: item.delay }}
                        className={`absolute text-6xl md:text-8xl font-extrabold select-none ${item.color}`}
                        style={{ top: item.top, left: item.left }}
                    >
                        {item.char}
                    </motion.div>
                ))}
            </div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-[900px] grid grid-cols-1 lg:grid-cols-12 bg-white/[0.05] backdrop-blur-2xl rounded-[2rem] border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >

                {/* Top Gradient Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-emerald-500 to-violet-500 z-50" />

                {/* Left Branding */}
                <div className="lg:col-span-5 p-8 bg-gradient-to-br from-blue-500/10 border-r border-white/10 hidden lg:block">
                    <div className="flex flex-col justify-between h-full">

                        <div>
                            <div className="flex items-center gap-3 mb-10">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <ShieldCheck size={24} />
                                </div>
                                <span className="text-xl font-bold">YatriPay.</span>
                            </div>

                            <h2 className="text-4xl font-black leading-[1.1] mb-6">
                                Welcome <br />
                                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                                    Back
                                </span>
                            </h2>

                            <p className="text-gray-400 text-sm">
                                Secure access to your portfolio and investments.
                            </p>
                        </div>

                        <div className="text-xs text-gray-500">
                            AES-256 Encryption Enabled
                        </div>
                    </div>
                </div>

                {/* Right Form */}
                <div className="lg:col-span-7 p-6 md:p-10">
                    <h3 className="text-2xl font-bold mb-6">Login</h3>

                    <form className="space-y-5">
                        <InputField
                            label="Email Address"
                            name="email"
                            icon={<Mail size={18} />}
                            placeholder="aman@example.com"
                            onChange={handleChange}
                        />

                        <InputField
                            label="Password"
                            name="password"
                            type="password"
                            icon={<Lock size={18} />}
                            placeholder="••••••••"
                            onChange={handleChange}
                        />

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 mt-4 shadow-[0_10px_30px_rgba(59,130,246,0.35)] hover:shadow-[0_0_60px_rgba(59,130,246,0.7)] transition-all"
                        >
                            LOGIN
                            <ArrowRight size={20} />
                        </motion.button>
                    </form>

                    <p className="text-center text-gray-500 mt-6 text-sm">
                        Don’t have an account?{" "}
                        <Link href="/register" className="text-blue-400 font-bold hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

// Reusable Input
const InputField = ({ label, icon, ...props }: any) => {
    return (
        <div className="space-y-2 group">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400/80 ml-1">
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400">
                    {icon}
                </div>
                <input
                    {...props}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-blue-500 placeholder:text-gray-600 transition-all"
                />
            </div>
        </div>
    );
};

export default Login;
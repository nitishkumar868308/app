"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AddFund = () => {
    const [amount, setAmount] = useState('');
    const quickAmounts = [500, 1000, 2000];

    const handleQuickSelect = (val: number) => {
        setAmount(val.toString());
    };

    return (
        <div className="relative flex items-center justify-center p-4 bg-[#000]">
            {/* Available Balance Top Right */}
            <div className="absolute top-4 right-4 text-white font-semibold">
                Available Balance: ₹0
            </div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-[2rem] shadow-2xl"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                        Add Funds
                    </h2>
                    <p className="text-zinc-500 text-sm mt-2">Quickly top up your account balance</p>
                </div>

                <div className="space-y-8">
                    {/* Input Section */}
                    <div className="relative group">
                        <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-3 block ml-1">
                            Amount INR
                        </label>
                        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 group-focus-within:border-blue-500/50 transition-all">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-light text-zinc-600">₹</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className="w-full bg-zinc-950/50 py-5 pl-12 pr-6 text-2xl font-medium text-white focus:outline-none placeholder:text-zinc-800"
                            />
                        </div>
                    </div>

                    {/* Quick Select Buttons */}
                    <div className="grid grid-cols-3 gap-4">
                        {quickAmounts.map((val) => (
                            <motion.button
                                key={val}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuickSelect(val)}
                                className="bg-zinc-800/30 border border-zinc-700/50 hover:border-blue-500/50 hover:bg-blue-500/10 py-4 rounded-2xl font-bold text-zinc-300 hover:text-blue-400 transition-all"
                            >
                                +{val}
                            </motion.button>
                        ))}
                    </div>

                    {/* Action Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-green-600 to-indigo-400 text-white font-black text-lg shadow-[0_10px_40px_-10px_rgba(37,99,235,0.4)] hover:shadow-blue-500/40 transition-all"
                    >
                        Add Fund
                    </motion.button>

                    {/* FAQ Link */}
                    <div className="pt-2">
                        <button className="flex items-center justify-center gap-2 w-full text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors group">
                            <span>Have questions? Read FAQ</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AddFund;
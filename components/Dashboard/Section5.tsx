import React from 'react'
import { motion } from "framer-motion";
import {
    Share2,
    Sparkles,
    ArrowRight,
} from "lucide-react";

const Section5 = () => {
    return (
        <>
            <section className="relative group overflow-hidden rounded-xl md:rounded-[2.5rem] p-6 md:p-12 shadow-lg md:shadow-2xl">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 blur-xl md:blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                <div className="relative bg-[#111] rounded-lg md:rounded-[2.4rem] p-6 md:p-12 overflow-hidden">
                    <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12 relative z-10">

                        {/* Text Section */}
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-pink-400 text-xs font-bold uppercase tracking-widest">
                                <Sparkles size={14} className="animate-pulse" />
                                Refer & Earn
                            </div>

                            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
                                Bring your friends, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                    Earn 10 YTP Instantly
                                </span>
                            </h2>

                            <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto md:mx-0 font-medium">
                                Share the future of staking with your circle. You both win when they complete KYC! 🚀
                            </p>
                        </div>

                        {/* CTA Section */}
                        <div className="w-full md:w-auto flex flex-col items-center gap-6">
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                className="w-full lg:w-72 bg-white/[0.03] border border-white/10 p-6 md:p-8 rounded-[2rem] flex flex-col items-center gap-4 md:gap-6 backdrop-blur-xl transition-transform duration-300"
                            >
                                {/* Icon */}
                                <div className="relative w-20 h-20 md:w-24 md:h-24 mb-2 md:mb-0">
                                    <div className="absolute inset-0 bg-pink-500 blur-2xl opacity-20 animate-pulse rounded-3xl" />
                                    <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl relative z-10 rotate-6 group-hover:rotate-0 transition-transform duration-500">
                                        <Share2 className="text-white w-8 h-8 md:w-10 md:h-10" />
                                    </div>
                                </div>

                                {/* Text */}
                                <div className="text-center">
                                    <p className="text-white font-bold text-lg leading-none">Ready to Invite?</p>
                                    <p className="text-gray-500 text-[12px] mt-1 md:mt-2 uppercase tracking-tighter italic font-semibold">
                                        Copy your unique link or share
                                    </p>
                                </div>

                                {/* Button */}
                                <button className="group/btn relative w-full lg:w-64 bg-white text-black h-14 md:h-16 rounded-2xl font-black text-sm tracking-widest overflow-hidden transition-all hover:bg-pink-500 hover:text-white mt-2">
                                    <div className="absolute inset-0 flex items-center justify-center gap-2 md:gap-3 transition-transform group-hover/btn:translate-x-1">
                                        INVITE NOW
                                        <ArrowRight size={16} className="md:w-4 md:h-4" />
                                    </div>
                                </button>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    )
}

export default Section5
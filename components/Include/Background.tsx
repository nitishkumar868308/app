"use client";

import { motion } from "framer-motion";

const Background = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">

            {/* Blurred green gradient blobs — matches reference */}
            <div className="absolute top-36 -left-36 md:-left-48 w-52 lg:w-56 xl:w-96 h-72 bg-green-700 rounded-full opacity-45 blur-[80px]" />
            <div className="absolute top-60 -right-36 md:-right-48 w-52 lg:w-56 xl:w-96 h-72 bg-green-700 rounded-full opacity-45 blur-[80px]" />

            {/* Floating crypto coins — desktop only */}

            {/* Top-Left: Bitcoin */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="hidden md:flex absolute top-52 left-20 lg:left-40 w-12 h-12 lg:w-16 lg:h-16 rounded-full items-center justify-center border border-orange-400/30"
                style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(247,147,26,0.4), rgba(247,147,26,0.08))",
                    boxShadow: "0 8px 28px rgba(247,147,26,0.25)",
                }}
            >
                <span className="text-orange-300 text-2xl lg:text-3xl font-black drop-shadow-[0_2px_8px_rgba(247,147,26,0.5)]">₿</span>
            </motion.div>

            {/* Top-Right: YatriPay */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="hidden md:flex absolute top-52 right-16 lg:right-32 w-12 h-12 lg:w-16 lg:h-16 rounded-full items-center justify-center border border-emerald-400/30"
                style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(16,185,129,0.45), rgba(16,185,129,0.08))",
                    boxShadow: "0 8px 28px rgba(16,185,129,0.3)",
                }}
            >
                <span className="text-emerald-300 text-xl lg:text-2xl font-black drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]">Y</span>
            </motion.div>

            {/* Bottom-Left: Tether */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="hidden md:flex absolute bottom-32 left-20 lg:left-44 w-11 h-11 lg:w-12 lg:h-12 rounded-full items-center justify-center border border-teal-400/30"
                style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(38,161,123,0.4), rgba(38,161,123,0.08))",
                    boxShadow: "0 8px 28px rgba(38,161,123,0.25)",
                }}
            >
                <span className="text-teal-300 text-lg lg:text-xl font-black drop-shadow-[0_2px_8px_rgba(38,161,123,0.5)]">₮</span>
            </motion.div>

            {/* Bottom-Right: Binance */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                className="hidden md:flex absolute bottom-40 right-20 lg:right-48 w-11 h-11 lg:w-12 lg:h-12 rounded-full items-center justify-center border border-amber-400/30"
                style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(240,185,11,0.4), rgba(240,185,11,0.08))",
                    boxShadow: "0 8px 28px rgba(240,185,11,0.25)",
                }}
            >
                <span className="text-amber-300 text-lg lg:text-xl font-black drop-shadow-[0_2px_8px_rgba(240,185,11,0.5)]">◆</span>
            </motion.div>
        </div>
    );
};

export default Background;

"use client";

import { motion, AnimatePresence } from "framer-motion";
// ─── Full-screen centered overlay loader ──────────────────────────────────────

export const OverlayLoader = ({ show, text = "Processing..." }: { show: boolean; text?: string }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-999 flex flex-col items-center justify-center"
                style={{ background: "rgba(3,10,5,0.85)", backdropFilter: "blur(12px)" }}
            >
                {/* Pulsing ring */}
                <div className="relative flex items-center justify-center mb-6">
                    <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute h-20 w-20 rounded-full border border-emerald-500/30"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        className="absolute h-16 w-16 rounded-full border border-emerald-500/20"
                    />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-12 w-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400"
                    />
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm font-bold text-white mb-1"
                >
                    {text}
                </motion.p>
                <p className="text-[12px] text-gray-600">Please wait, do not close this page</p>
            </motion.div>
        )}
    </AnimatePresence>
);

// ─── Page loader (route transitions) ──────────────────────────────────────────

export const PageLoader = () => (
    <div className="fixed inset-0 z-[999] bg-[#030a05] flex flex-col items-center justify-center gap-5">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="h-10 w-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-400"
        />
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[12px] text-gray-600 uppercase tracking-widest font-black"
        >
            Loading...
        </motion.p>
    </div>
);

// ─── Inline spinner ──────────────────────────────────────────────────────────

export const Spinner = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
    <motion.svg
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
    >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
            strokeDasharray="50" strokeDashoffset="20" opacity="0.3" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
            strokeDasharray="50" strokeDashoffset="40" />
    </motion.svg>
);

// ─── Section skeleton loader ─────────────────────────────────────────────────

export const SectionLoader = () => (
    <div className="w-full space-y-4 animate-pulse">
        <div className="h-4 w-32 rounded-lg bg-white/5" />
        <div className="h-32 rounded-2xl bg-white/4 border border-white/4" />
        <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-xl bg-white/4" />
            <div className="h-20 rounded-xl bg-white/4" />
        </div>
    </div>
);

// ─── Button loader text ──────────────────────────────────────────────────────

export const ButtonLoader = ({ text = "Please wait..." }: { text?: string }) => (
    <span className="flex items-center justify-center gap-2">
        <Spinner size={14} />
        {text}
    </span>
);

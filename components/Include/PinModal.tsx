"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lock, Delete, ArrowRight, ShieldCheck,
    CheckCircle2, X, Loader2, Fingerprint,
} from "lucide-react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type PinMode = "create" | "confirm" | "verify" | "change";

interface PinModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (pin: string) => void;
    mode: PinMode;
    /** Optional title override */
    title?: string;
    /** Optional subtitle override */
    subtitle?: string;
}

const MODE_CONFIG: Record<PinMode, { title: string; subtitle: string; icon: typeof Lock }> = {
    create:  { title: "Create PIN",        subtitle: "Set a 4-digit Transaction PIN to secure your account", icon: Lock },
    confirm: { title: "Confirm PIN",       subtitle: "Re-enter your PIN to confirm",                        icon: ShieldCheck },
    verify:  { title: "Enter PIN",         subtitle: "Enter your 4-digit PIN to authorize this transaction", icon: Fingerprint },
    change:  { title: "Change PIN",        subtitle: "Enter your current PIN to continue",                  icon: Lock },
};

// ─── Numpad key ───────────────────────────────────────────────────────────────

const NumKey = ({
    value,
    onPress,
    variant = "default",
}: {
    value: string;
    onPress: () => void;
    variant?: "default" | "empty" | "delete";
}) => {
    if (variant === "empty") return <div className="h-14" />;

    return (
        <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onPress}
            className={`h-14 rounded-2xl flex items-center justify-center transition-all ${
                variant === "delete"
                    ? "text-gray-500 hover:text-red-400 hover:bg-red-500/5"
                    : "text-white hover:bg-emerald-500/8 active:bg-emerald-500/15 border border-white/4 hover:border-emerald-500/20"
            }`}
            style={variant !== "delete" ? { background: "rgba(5,13,7,0.6)" } : undefined}
        >
            {variant === "delete" ? (
                <Delete size={20} strokeWidth={2} />
            ) : (
                <span className="text-lg font-black">{value}</span>
            )}
        </motion.button>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const PinModal = ({ open, onClose, onSuccess, mode, title, subtitle }: PinModalProps) => {
    const [pin, setPin]                   = useState<string[]>([]);
    const [step, setStep]                 = useState<"input" | "confirm">(mode === "create" ? "input" : "input");
    const [firstPin, setFirstPin]         = useState<string[]>([]);
    const [error, setError]               = useState("");
    const [loading, setLoading]           = useState(false);
    const [success, setSuccess]           = useState(false);

    const config = MODE_CONFIG[mode];
    const Icon   = config.icon;

    // Reset on open/close
    useEffect(() => {
        if (open) {
            setPin([]);
            setStep(mode === "create" ? "input" : "input");
            setFirstPin([]);
            setError("");
            setLoading(false);
            setSuccess(false);
        }
    }, [open, mode]);

    const currentTitle = step === "confirm"
        ? "Confirm PIN"
        : (title ?? config.title);

    const currentSubtitle = step === "confirm"
        ? "Re-enter your 4-digit PIN to confirm"
        : (subtitle ?? config.subtitle);

    const handlePress = useCallback((digit: string) => {
        setError("");
        setPin((prev) => {
            if (prev.length >= 4) return prev;
            const next = [...prev, digit];

            // Auto-submit on 4th digit
            if (next.length === 4) {
                setTimeout(() => {
                    if (mode === "create" && step === "input") {
                        // Move to confirm step
                        setFirstPin(next);
                        setStep("confirm");
                        setPin([]);
                    } else if (mode === "create" && step === "confirm") {
                        // Check match
                        if (next.join("") === firstPin.join("")) {
                            handleSuccess(next.join(""));
                        } else {
                            setError("PINs don't match. Try again.");
                            setPin([]);
                        }
                    } else {
                        // verify or change mode
                        handleSuccess(next.join(""));
                    }
                }, 200);
            }

            return next;
        });
    }, [mode, step, firstPin]);

    const handleDelete = useCallback(() => {
        setError("");
        setPin((prev) => prev.slice(0, -1));
    }, []);

    const handleSuccess = async (pinValue: string) => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 800));
        setLoading(false);
        setSuccess(true);
        await new Promise((r) => setTimeout(r, 600));
        onSuccess(pinValue);
    };

    // Keyboard support
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key >= "0" && e.key <= "9") handlePress(e.key);
            if (e.key === "Backspace") handleDelete();
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, handlePress, handleDelete, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-xs rounded-3xl border border-white/8 p-6 relative overflow-hidden"
                        style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors z-10"
                        >
                            <X size={14} />
                        </button>

                        {/* Success overlay */}
                        <AnimatePresence>
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 z-20 flex flex-col items-center justify-center"
                                    style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center mb-3 shadow-xl shadow-emerald-500/30"
                                    >
                                        <CheckCircle2 size={32} className="text-black" />
                                    </motion.div>
                                    <p className="text-sm font-black text-white">
                                        {mode === "create" ? "PIN Created!" : "PIN Verified!"}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Loading overlay */}
                        <AnimatePresence>
                            {loading && !success && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-20 flex items-center justify-center"
                                    style={{ background: "rgba(5,13,7,0.9)" }}
                                >
                                    <Loader2 size={28} className="text-emerald-400 animate-spin" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <Image src="/logo.png" alt="YatriPay" width={100} height={28} className="h-6 w-auto object-contain mx-auto mb-4" />
                            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                <Icon size={20} className="text-emerald-400" />
                            </div>
                            <h3 className="text-base font-black text-white">{currentTitle}</h3>
                            <p className="text-[11px] text-gray-500 mt-1">{currentSubtitle}</p>
                        </div>

                        {/* PIN dots */}
                        <div className="flex items-center justify-center gap-4 mb-2">
                            {[0, 1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={
                                        pin[i]
                                            ? { scale: [1, 1.2, 1], background: "#10b981" }
                                            : { scale: 1, background: "rgba(255,255,255,0.08)" }
                                    }
                                    transition={{ duration: 0.15 }}
                                    className={`h-3.5 w-3.5 rounded-full border transition-all ${
                                        pin[i]
                                            ? "border-emerald-500 shadow-lg shadow-emerald-500/30"
                                            : "border-white/15"
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Error message */}
                        <div className="h-6 flex items-center justify-center mb-1">
                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-[10px] text-red-400 font-bold"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                            {mode === "create" && step === "input" && !error && (
                                <p className="text-[9px] text-gray-700">Step 1 of 2</p>
                            )}
                            {mode === "create" && step === "confirm" && !error && (
                                <p className="text-[9px] text-gray-700">Step 2 of 2</p>
                            )}
                        </div>

                        {/* Numpad */}
                        <div className="grid grid-cols-3 gap-2">
                            {["1","2","3","4","5","6","7","8","9"].map((d) => (
                                <NumKey key={d} value={d} onPress={() => handlePress(d)} />
                            ))}
                            <NumKey value="" onPress={() => {}} variant="empty" />
                            <NumKey value="0" onPress={() => handlePress("0")} />
                            <NumKey value="" onPress={handleDelete} variant="delete" />
                        </div>

                        {/* Security note */}
                        <div className="flex items-center justify-center gap-1.5 mt-4">
                            <ShieldCheck size={10} className="text-emerald-500/40" />
                            <p className="text-[8px] text-gray-700 uppercase tracking-widest font-bold">
                                Encrypted &amp; Secure
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PinModal;

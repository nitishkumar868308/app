"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lock, Delete, ShieldCheck,
    CheckCircle2, X, Loader2, Fingerprint, KeyRound,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { getApiError } from "@/lib/helpers";

// ─── Types ───────────────────────────────────────────────────────────────────

type PinMode = "create" | "confirm" | "verify" | "change";
type InternalStep =
    | "input"          // create step 1: enter new pin
    | "confirm"        // create step 2: re-enter to confirm
    | "verify"         // verify mode: enter pin
    | "forgot-otp"     // forgot: OTP sent, enter 6-digit OTP
    | "new-pin"        // forgot: enter new pin after OTP verified
    | "new-confirm";   // forgot: confirm new pin

interface PinModalProps {
    open: boolean;
    onClose: () => void;
    /** Called on success. For verify mode, can return false to indicate wrong PIN */
    onSuccess: (pin: string) => void | boolean | Promise<void | boolean>;
    mode: PinMode;
    title?: string;
    subtitle?: string;
}

const MODE_CONFIG: Record<PinMode, { title: string; subtitle: string; icon: typeof Lock }> = {
    create:  { title: "Create PIN",  subtitle: "Set a 4-digit Transaction PIN to secure your account", icon: Lock },
    confirm: { title: "Confirm PIN", subtitle: "Re-enter your PIN to confirm",                        icon: ShieldCheck },
    verify:  { title: "Enter PIN",   subtitle: "Enter your 4-digit PIN to authorize this transaction", icon: Fingerprint },
    change:  { title: "Change PIN",  subtitle: "Verify your identity to change PIN",                  icon: KeyRound },
};

// ─── Numpad key ──────────────────────────────────────────────────────────────

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

// ─── OTP Input (6 digits) ────────────────────────────────────────────────────

const OtpInput = ({
    onSubmit,
    loading,
}: {
    onSubmit: (otp: string) => void;
    loading: boolean;
}) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        if (value && index < 5) refs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            refs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const next = [...otp];
        text.split("").forEach((ch, i) => { next[i] = ch; });
        setOtp(next);
        refs.current[Math.min(text.length, 5)]?.focus();
    };

    const filled = otp.every((d) => d !== "");

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        ref={(el) => { refs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className={`w-9 h-11 rounded-xl border text-center text-base font-black text-white focus:outline-none transition-all ${
                            digit
                                ? "border-emerald-500/50 bg-emerald-500/5"
                                : "border-white/10 bg-white/4 focus:border-emerald-500/50"
                        }`}
                    />
                ))}
            </div>
            <button
                onClick={() => filled && !loading && onSubmit(otp.join(""))}
                disabled={!filled || loading}
                className={`w-full py-3 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    filled && !loading
                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)]"
                        : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                }`}
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                {loading ? "Verifying..." : "Verify OTP"}
            </button>
        </div>
    );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const PinModal = ({ open, onClose, onSuccess, mode, title, subtitle }: PinModalProps) => {
    const [pin, setPin]             = useState<string[]>([]);
    const [step, setStep]           = useState<InternalStep>("input");
    const [firstPin, setFirstPin]   = useState<string[]>([]);
    const [error, setError]         = useState("");
    const [loading, setLoading]     = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [success, setSuccess]     = useState(false);

    const config = MODE_CONFIG[mode];
    const Icon   = config.icon;

    // Reset on open
    useEffect(() => {
        if (open) {
            setPin([]);
            setFirstPin([]);
            setError("");
            setLoading(false);
            setOtpLoading(false);
            setSuccess(false);

            if (mode === "create") {
                setStep("input");
            } else if (mode === "verify" || mode === "confirm") {
                setStep("verify");
            } else if (mode === "change") {
                // Change mode: send OTP immediately and show OTP input
                setStep("forgot-otp");
                (async () => {
                    setOtpLoading(true);
                    try {
                        await api.post(ENDPOINTS.PIN_CHANGE_SEND_OTP);
                        toast.success("OTP sent to your registered mobile/email");
                    } catch (err: any) {
                        toast.error(getApiError(err));
                        onClose();
                    } finally {
                        setOtpLoading(false);
                    }
                })();
            }
        }
    }, [open, mode]);

    // ── Step titles ──────────────────────────────────────────────────────────

    const getTitle = () => {
        switch (step) {
            case "input":       return title ?? config.title;
            case "confirm":     return "Confirm PIN";
            case "verify":      return title ?? config.title;
            case "forgot-otp":  return "Verify OTP";
            case "new-pin":     return "New PIN";
            case "new-confirm": return "Confirm New PIN";
        }
    };

    const getSubtitle = () => {
        switch (step) {
            case "input":       return subtitle ?? config.subtitle;
            case "confirm":     return "Re-enter your 4-digit PIN to confirm";
            case "verify":      return subtitle ?? config.subtitle;
            case "forgot-otp":  return "Enter the 6-digit OTP sent to your registered mobile/email";
            case "new-pin":     return "Set your new 4-digit PIN";
            case "new-confirm": return "Re-enter to confirm your new PIN";
        }
    };

    const getStepLabel = () => {
        if (mode === "create") {
            if (step === "input") return "Step 1 of 2";
            if (step === "confirm") return "Step 2 of 2";
        }
        if (step === "new-pin") return "Step 1 of 2";
        if (step === "new-confirm") return "Step 2 of 2";
        return null;
    };

    // ── Forgot PIN flow ──────────────────────────────────────────────────────

    const handleForgotPin = async () => {
        setOtpLoading(true);
        setError("");
        try {
            await api.post(ENDPOINTS.PIN_CHANGE_SEND_OTP);
            toast.success("OTP sent to your registered mobile/email");
            setStep("forgot-otp");
            setPin([]);
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyForgotOtp = async (otp: string) => {
        setOtpLoading(true);
        setError("");
        try {
            await api.post(ENDPOINTS.PIN_CHANGE_VERIFY_OTP, { otp });
            toast.success("OTP verified! Set your new PIN");
            setStep("new-pin");
            setPin([]);
            setFirstPin([]);
        } catch (err: any) {
            toast.error(getApiError(err));
        } finally {
            setOtpLoading(false);
        }
    };

    // ── PIN submit (create or reset) ─────────────────────────────────────────

    const submitPin = async (pinValue: string) => {
        setLoading(true);
        setError("");
        try {
            await api.post(ENDPOINTS.PIN_RESET, { pin: pinValue });
            setSuccess(true);
            toast.success(mode === "create" ? "PIN created successfully!" : "PIN changed successfully!");
            await new Promise((r) => setTimeout(r, 800));
            onSuccess(pinValue);
        } catch (err: any) {
            setError(getApiError(err));
            setPin([]);
        } finally {
            setLoading(false);
        }
    };

    // ── Handle PIN complete (async for verify mode) ────────────────────────

    const onPinComplete = useCallback(async (pinStr: string, digits: string[]) => {
        switch (step) {
            case "input":
                setFirstPin(digits);
                setStep("confirm");
                setPin([]);
                break;

            case "confirm":
                if (pinStr === firstPin.join("")) {
                    submitPin(pinStr);
                } else {
                    setError("PINs don't match. Try again.");
                    setPin([]);
                }
                break;

            case "verify":
                setLoading(true);
                try {
                    const result = await onSuccess(pinStr);
                    if (result === false) {
                        setLoading(false);
                        setError("Incorrect PIN. Please try again or change your PIN.");
                        setPin([]);
                    } else {
                        setLoading(false);
                        setSuccess(true);
                        await new Promise((r) => setTimeout(r, 800));
                    }
                } catch {
                    setLoading(false);
                    setError("Incorrect PIN. Please try again or change your PIN.");
                    setPin([]);
                }
                break;

            case "new-pin":
                setFirstPin(digits);
                setStep("new-confirm");
                setPin([]);
                break;

            case "new-confirm":
                if (pinStr === firstPin.join("")) {
                    submitPin(pinStr);
                } else {
                    setError("PINs don't match. Try again.");
                    setPin([]);
                }
                break;
        }
    }, [step, firstPin, onSuccess]);

    // ── Numpad press handler ─────────────────────────────────────────────────

    const handlePress = useCallback((digit: string) => {
        setError("");
        setPin((prev) => {
            if (prev.length >= 4) return prev;
            const next = [...prev, digit];

            if (next.length === 4) {
                setTimeout(() => {
                    onPinComplete(next.join(""), next);
                }, 200);
            }

            return next;
        });
    }, [onPinComplete]);

    const handleDelete = useCallback(() => {
        setError("");
        setPin((prev) => prev.slice(0, -1));
    }, []);

    // Keyboard support
    useEffect(() => {
        if (!open || step === "forgot-otp") return;
        const handler = (e: KeyboardEvent) => {
            if (e.key >= "0" && e.key <= "9") handlePress(e.key);
            if (e.key === "Backspace") handleDelete();
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, step, handlePress, handleDelete, onClose]);

    // Show numpad for these steps
    const showNumpad = step !== "forgot-otp";

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
                                        {mode === "create" ? "PIN Created!" : step === "new-confirm" ? "PIN Changed!" : "PIN Verified!"}
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
                            <h3 className="text-base font-black text-white">{getTitle()}</h3>
                            <p className="text-[13px] text-gray-500 mt-1">{getSubtitle()}</p>
                        </div>

                        {/* OTP input for forgot flow */}
                        {step === "forgot-otp" && (
                            <OtpInput onSubmit={handleVerifyForgotOtp} loading={otpLoading} />
                        )}

                        {/* PIN dots + numpad */}
                        {showNumpad && (
                            <>
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

                                {/* Error / step label */}
                                <div className="h-6 flex items-center justify-center mb-1">
                                    <AnimatePresence>
                                        {error && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-[12px] text-red-400 font-bold"
                                            >
                                                {error}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                    {!error && getStepLabel() && (
                                        <p className="text-[13px] text-gray-700">{getStepLabel()}</p>
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

                                {/* Forgot PIN link — in verify mode */}
                                {step === "verify" && mode !== "create" && (
                                    <button
                                        onClick={handleForgotPin}
                                        disabled={otpLoading}
                                        className="w-full mt-3 py-2.5 rounded-xl text-[13px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        {otpLoading ? (
                                            <><Loader2 size={12} className="animate-spin" /> Sending OTP...</>
                                        ) : (
                                            "Forgot PIN?"
                                        )}
                                    </button>
                                )}
                            </>
                        )}

                        {/* Security note */}
                        <div className="flex items-center justify-center gap-1.5 mt-4">
                            <ShieldCheck size={10} className="text-emerald-500/40" />
                            <p className="text-[12px] text-gray-700 uppercase tracking-widest font-bold">
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

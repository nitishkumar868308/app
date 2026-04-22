"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight, ArrowLeft, ArrowDownUp, Wallet, Send,
    IndianRupee, Coins, Shield, Clock,
    Receipt, AlertCircle, CheckCircle2,
    Loader2, QrCode, Camera, ImageIcon, X,
} from "lucide-react";
import Link from "next/link";
import PinModal from "@/components/Include/PinModal";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { getApiError } from "@/lib/helpers";

// ─── Types ───────────────────────────────────────────────────────────────────

type AssetKey = "YTP" | "BNB" | "USDT";

const ASSETS: { key: AssetKey; label: string; network: string; bep20: boolean }[] = [
    { key: "YTP",  label: "YatriPay",     network: "YVM Chain", bep20: false },
    { key: "BNB",  label: "Binance Coin", network: "BEP-20",    bep20: true  },
    { key: "USDT", label: "Tether",       network: "BEP-20",    bep20: true  },
];

// ─── QR Scan Modal ───────────────────────────────────────────────────────────

const ScanQRModal = ({
    open,
    onClose,
    onResult,
}: {
    open: boolean;
    onClose: () => void;
    onResult: (text: string) => void;
}) => {
    const [mode, setMode] = useState<"idle" | "camera" | "upload">("idle");
    const [error, setError] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const fileRef  = useRef<HTMLInputElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);

    const stopCamera = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setScanning(false);
    }, []);

    useEffect(() => {
        if (!open) {
            stopCamera();
            setMode("idle");
            setError(null);
        }
    }, [open, stopCamera]);

    const getDetector = (): any | null => {
        if (typeof window === "undefined") return null;
        const w = window as any;
        if (!w.BarcodeDetector) return null;
        try {
            return new w.BarcodeDetector({ formats: ["qr_code"] });
        } catch {
            return null;
        }
    };

    const startCamera = async () => {
        setError(null);
        setMode("camera");
        const detector = getDetector();
        if (!detector) {
            setError("QR scanning is not supported in this browser. Please upload an image instead.");
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setScanning(true);
            const scan = async () => {
                if (!videoRef.current || !streamRef.current) return;
                try {
                    const codes = await detector.detect(videoRef.current);
                    if (codes && codes.length > 0) {
                        const text = codes[0].rawValue || codes[0].value || "";
                        if (text) {
                            stopCamera();
                            onResult(text);
                            return;
                        }
                    }
                } catch { /* continue scanning */ }
                rafRef.current = requestAnimationFrame(scan);
            };
            rafRef.current = requestAnimationFrame(scan);
        } catch (e: any) {
            setError(e?.message || "Unable to access camera. Check browser permissions.");
            setScanning(false);
        }
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(null);
        setMode("upload");
        const detector = getDetector();
        if (!detector) {
            setError("QR decoding is not supported in this browser.");
            return;
        }
        try {
            const bitmap = await createImageBitmap(file);
            const codes = await detector.detect(bitmap);
            if (codes && codes.length > 0) {
                const text = codes[0].rawValue || codes[0].value || "";
                if (text) {
                    onResult(text);
                    return;
                }
            }
            setError("No QR code detected in this image.");
        } catch (err: any) {
            setError(err?.message || "Failed to read QR code from image.");
        } finally {
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-md rounded-3xl border border-white/8 p-6 space-y-5 relative"
                        style={{ background: "linear-gradient(170deg,#0d1f12 0%,#050d07 100%)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>

                        <div className="text-center space-y-1">
                            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                <QrCode size={20} className="text-emerald-400" />
                            </div>
                            <h3 className="text-base font-black text-white">Scan QR Code</h3>
                            <p className="text-[13px] text-gray-500">Scan with camera or upload a QR image</p>
                        </div>

                        {mode === "camera" && (
                            <div className="rounded-2xl border border-white/8 overflow-hidden bg-black aspect-square relative">
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                    playsInline
                                    muted
                                />
                                {scanning && (
                                    <div className="absolute inset-4 border-2 border-emerald-400/60 rounded-2xl pointer-events-none" />
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="flex items-start gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                                <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                                <span className="text-[13px] text-red-400 font-bold">{error}</span>
                            </div>
                        )}

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFile}
                            className="hidden"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={startCamera}
                                className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/8 text-white font-black text-[13px] uppercase tracking-widest hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.98] transition-all"
                                style={{ background: "rgba(5,13,7,0.6)" }}
                            >
                                <Camera size={14} strokeWidth={2.5} />
                                Camera
                            </button>
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/8 text-white font-black text-[13px] uppercase tracking-widest hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.98] transition-all"
                                style={{ background: "rgba(5,13,7,0.6)" }}
                            >
                                <ImageIcon size={14} strokeWidth={2.5} />
                                Upload
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const Transfer = () => {
    const { token } = useAuth();
    const { ytpBalance, refresh: refreshWallet, fetchWalletByTicker } = useWallet();

    const [selectedAsset, setSelectedAsset] = useState<AssetKey>("YTP");
    const [address, setAddress]           = useState("");
    const [ytpInput, setYtpInput]         = useState("");
    const [inrInput, setInrInput]         = useState("");
    const [assetPriceINR, setAssetPriceINR] = useState(0);
    const [assetBalance, setAssetBalance] = useState(0);
    const [showPin, setShowPin]           = useState(false);
    const [showScan, setShowScan]         = useState(false);
    const [sending, setSending]           = useState(false);

    const currentAssetMeta = ASSETS.find((a) => a.key === selectedAsset)!;
    const balance = selectedAsset === "YTP" ? ytpBalance : assetBalance;

    // Fetch coin value in INR whenever asset changes
    useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                const res = await api.get(ENDPOINTS.COIN_VALUE(selectedAsset));
                const data = res.data?.data ?? res.data;
                if (data?.INR) {
                    setAssetPriceINR(parseFloat(data.INR));
                }
            } catch { /* silent */ }
        })();
    }, [token, selectedAsset]);

    // Fetch wallet balance for non-YTP assets
    useEffect(() => {
        if (!token) return;
        if (selectedAsset === "YTP") {
            setAssetBalance(0);
            return;
        }
        (async () => {
            const w = await fetchWalletByTicker(selectedAsset);
            if (w) setAssetBalance(w.balance || 0);
        })();
    }, [token, selectedAsset, fetchWalletByTicker]);

    // Two-way sync
    const handleYtpChange = (val: string) => {
        setYtpInput(val);
        const num = parseFloat(val) || 0;
        if (num > 0 && assetPriceINR > 0) {
            setInrInput((num * assetPriceINR).toFixed(2));
        } else {
            setInrInput("");
        }
    };

    const handleInrChange = (val: string) => {
        setInrInput(val);
        const num = parseFloat(val) || 0;
        if (num > 0 && assetPriceINR > 0) {
            setYtpInput((num / assetPriceINR).toFixed(8));
        } else {
            setYtpInput("");
        }
    };

    const handleAssetChange = (key: AssetKey) => {
        setSelectedAsset(key);
        setYtpInput("");
        setInrInput("");
    };

    // Extract address from scanned QR payload (handles plain, BIP21, ethereum:, etc.)
    const parseQrPayload = (raw: string): string => {
        const trimmed = raw.trim();
        // ethereum:0x... / bnb:0x... / tether:0x...
        const colonIdx = trimmed.indexOf(":");
        if (colonIdx >= 0 && colonIdx <= 12) {
            let rest = trimmed.slice(colonIdx + 1);
            const qIdx = rest.indexOf("?");
            if (qIdx > 0) rest = rest.slice(0, qIdx);
            return rest;
        }
        return trimmed;
    };

    const handleScanResult = (raw: string) => {
        const addr = parseQrPayload(raw);
        setAddress(addr);
        setShowScan(false);
        toast.success("Address scanned!");
    };

    const numYtp        = parseFloat(ytpInput) || 0;
    const numInr        = parseFloat(inrInput) || 0;
    const canTransfer   = address.trim().length > 10 && numYtp > 0 && numYtp <= balance;
    const insufficient  = numYtp > 0 && numYtp > balance;

    const handleTransfer = () => {
        if (!canTransfer) return;
        setShowPin(true);
    };

    const handlePinSuccess = useCallback(async (pin: string) => {
        setShowPin(false);
        setSending(true);
        try {
            const res = await api.post(ENDPOINTS.SEND_AMOUNT, {
                transaction_pin: pin,
                amount: ytpInput,
                ticker: selectedAsset,
                address: address.trim(),
            });

            const data = res.data;
            if (data?.success === false) {
                toast.error(data.message || "Transaction failed!");
                return false;
            }

            toast.success(data?.message || "Transaction successful!");
            setAddress("");
            setYtpInput("");
            setInrInput("");
            refreshWallet();
            if (selectedAsset !== "YTP") {
                const w = await fetchWalletByTicker(selectedAsset);
                if (w) setAssetBalance(w.balance || 0);
            }
        } catch (err: any) {
            toast.error(getApiError(err));
            return false;
        } finally {
            setSending(false);
        }
    }, [ytpInput, selectedAsset, address, refreshWallet, fetchWalletByTicker]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

            {/* PIN Modal */}
            <PinModal
                open={showPin}
                onClose={() => setShowPin(false)}
                onSuccess={handlePinSuccess}
                mode="verify"
                title="Authorize Transfer"
                subtitle={`Sending ${numYtp.toFixed(2)} ${selectedAsset}`}
            />

            {/* Scan QR Modal */}
            <ScanQRModal
                open={showScan}
                onClose={() => setShowScan(false)}
                onResult={handleScanResult}
            />

            {/* ── Page header ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shrink-0">
                            <ArrowLeft size={16} />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Transfer Fund</h1>
                        <p className="text-sm text-gray-600 mt-0.5">
                            Send {selectedAsset}
                            {currentAssetMeta.bep20 ? ` on ${currentAssetMeta.network}` : ""}
                            {" "}to any wallet address
                        </p>
                    </div>
                </div>

                <div
                    className="flex items-center gap-3 rounded-2xl border border-white/6 px-4 py-3"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Wallet size={15} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">Available Balance</p>
                        <p className="text-sm font-black text-white tabular-nums">
                            {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} {selectedAsset}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Sending overlay */}
            <AnimatePresence>
                {sending && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                    >
                        <div className="text-center space-y-3">
                            <Loader2 size={36} className="text-emerald-400 animate-spin mx-auto" />
                            <p className="text-sm font-black text-white">Processing Transfer...</p>
                            <p className="text-[13px] text-gray-500">Please wait while we confirm your transaction</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── LEFT: Transfer form (3 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.4 }}
                    className="lg:col-span-3 rounded-3xl border border-white/6 p-6 space-y-6"
                    style={{ background: "rgba(10,26,15,0.7)" }}
                >
                    {/* Asset selector */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">Select Asset</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                            {ASSETS.map((a) => {
                                const active = a.key === selectedAsset;
                                return (
                                    <button
                                        key={a.key}
                                        onClick={() => handleAssetChange(a.key)}
                                        className={`p-3 rounded-2xl border text-center transition-all ${
                                            active
                                                ? "border-emerald-400/50 shadow-[0_0_16px_rgba(16,185,129,0.08)]"
                                                : "border-white/6 hover:border-emerald-500/25"
                                        }`}
                                        style={{
                                            background: active
                                                ? "linear-gradient(160deg,rgba(16,185,129,0.13) 0%,#0d1f12 100%)"
                                                : "rgba(5,13,7,0.6)",
                                        }}
                                    >
                                        <p className={`text-sm font-black ${active ? "text-white" : "text-gray-500"}`}>
                                            {a.key}
                                        </p>
                                        <p className="text-[12px] text-gray-600 mt-0.5 truncate">
                                            {a.bep20 ? `${a.label} - BEP-20` : a.label}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Receiving address */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">Recipient</h2>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold">
                                    Receiving Address
                                </span>
                                <button
                                    onClick={() => setShowScan(true)}
                                    className="flex items-center gap-1 text-[13px] text-emerald-400 font-bold hover:underline"
                                >
                                    <QrCode size={11} /> Scan QR
                                </button>
                            </div>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors">
                                    <Send size={16} strokeWidth={2} />
                                </span>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder={currentAssetMeta.bep20 ? "0x… (BEP-20 address)" : "0x… or wallet address"}
                                    className="w-full rounded-2xl border border-white/8 py-3.5 lg:py-4 pl-11 pr-14 text-sm lg:text-base font-mono font-semibold text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                                <button
                                    onClick={() => setShowScan(true)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                    aria-label="Scan QR"
                                >
                                    <QrCode size={14} />
                                </button>
                            </div>
                            {currentAssetMeta.bep20 && (
                                <p className="text-[12px] text-amber-400/80 font-bold px-1">
                                    Only send to a {currentAssetMeta.network} address.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Amount inputs */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-5 w-1 rounded-full bg-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">Amount</h2>
                        </div>

                        {/* Asset input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold">
                                    {selectedAsset} Amount
                                </span>
                                <button
                                    onClick={() => {
                                        const maxVal = selectedAsset === "YTP"
                                            ? Math.floor(balance).toString()
                                            : balance.toString();
                                        handleYtpChange(maxVal);
                                    }}
                                    className="text-[13px] text-emerald-400 font-bold hover:underline"
                                >
                                    MAX
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <Coins size={18} strokeWidth={2} />
                                </span>
                                <input
                                    type="number"
                                    value={ytpInput}
                                    onChange={(e) => handleYtpChange(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full rounded-2xl border border-white/8 py-4 pl-12 pr-16 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-500">
                                    {selectedAsset}
                                </span>
                            </div>
                        </div>

                        {/* Swap icon */}
                        <div className="flex justify-center">
                            <div className="h-8 w-8 rounded-full bg-white/4 border border-white/8 flex items-center justify-center">
                                <ArrowDownUp size={14} className="text-gray-600" />
                            </div>
                        </div>

                        {/* INR input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[13px] lg:text-sm text-gray-500 uppercase tracking-wider font-bold">
                                    INR Amount
                                </span>
                                <span className="text-[13px] text-gray-600">
                                    1 {selectedAsset} = <span className="text-emerald-400 font-bold">₹{assetPriceINR.toFixed(2)}</span>
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                                    <IndianRupee size={18} strokeWidth={2.5} />
                                </span>
                                <input
                                    type="number"
                                    value={inrInput}
                                    onChange={(e) => handleInrChange(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full rounded-2xl border border-white/8 py-4 pl-12 pr-16 text-xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    style={{ background: "rgba(5,13,7,0.8)" }}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-600">
                                    INR
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Insufficient warning */}
                    <AnimatePresence>
                        {insufficient && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                                    <AlertCircle size={13} className="text-red-400 shrink-0" />
                                    <span className="text-[13px] text-red-400 font-bold">
                                        Insufficient balance. You need {(numYtp - balance).toFixed(4)} more {selectedAsset}.
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Transfer button */}
                    <button
                        onClick={handleTransfer}
                        disabled={!canTransfer || sending}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 ${
                            canTransfer && !sending
                                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                                : "bg-white/4 border border-white/8 text-gray-600 cursor-not-allowed"
                        }`}
                    >
                        Transfer
                        <ArrowRight size={15} strokeWidth={2.5} />
                    </button>
                </motion.div>

                {/* ── RIGHT: Summary (2 cols) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="lg:col-span-2 space-y-5"
                >
                    {/* Transfer summary */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-4"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Receipt size={16} className="text-emerald-400" />
                            <h2 className="text-base font-black text-white tracking-wide">Transfer Summary</h2>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${numYtp}-${address}-${selectedAsset}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                {[
                                    { label: "Asset",       value: `${currentAssetMeta.label} (${selectedAsset})` },
                                    { label: "Sending",     value: numYtp > 0 ? `${numYtp} ${selectedAsset}` : "—" },
                                    { label: "Value (INR)", value: numInr > 0 ? `₹${numInr.toFixed(2)}` : "—" },
                                    { label: "Recipient",   value: address.trim() ? `${address.slice(0, 10)}...${address.slice(-6)}` : "—" },
                                    { label: "Network",     value: currentAssetMeta.network },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                                        <span className="text-[13px] text-gray-500 font-medium">{row.label}</span>
                                        <span className="text-sm font-bold text-white truncate max-w-32 text-right">{row.value}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        <div
                            className="rounded-2xl border border-emerald-500/20 p-4"
                            style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(16,185,129,0.03) 100%)" }}
                        >
                            <p className="text-[12px] text-emerald-400/60 uppercase tracking-widest font-black mb-1">Total Deducted</p>
                            <p className="text-2xl font-black text-white tabular-nums">
                                {numYtp > 0 ? `${numYtp} ${selectedAsset}` : "—"}
                            </p>
                        </div>
                    </div>

                    {/* After transfer */}
                    <div
                        className="rounded-3xl border border-white/6 p-6 space-y-3"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Wallet size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-black text-white tracking-wide">After Transfer</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-white/5 p-3 text-center" style={{ background: "rgba(5,13,7,0.6)" }}>
                                <p className="text-[11px] text-gray-600 uppercase tracking-wider font-bold">Current</p>
                                <p className="text-sm font-black text-white tabular-nums">{balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                                <p className="text-[11px] text-gray-600 font-bold">{selectedAsset}</p>
                            </div>
                            <div className="rounded-xl border border-white/5 p-3 text-center" style={{ background: "rgba(5,13,7,0.6)" }}>
                                <p className="text-[11px] text-gray-600 uppercase tracking-wider font-bold">Remaining</p>
                                <p className={`text-sm font-black tabular-nums ${numYtp > 0 && !insufficient ? "text-emerald-400" : "text-white"}`}>
                                    {numYtp > 0 ? Math.max(0, balance - numYtp).toFixed(4) : balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                </p>
                                <p className="text-[11px] text-gray-600 font-bold">{selectedAsset}</p>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div
                        className="rounded-3xl border border-white/6 p-5 space-y-2.5"
                        style={{ background: "rgba(10,26,15,0.7)" }}
                    >
                        {[
                            { icon: Shield,       title: "PIN Protected",       desc: "Every transfer requires your 4-digit PIN" },
                            { icon: Clock,        title: "Instant Transfer",    desc: "On-chain transfers complete within seconds" },
                            { icon: CheckCircle2, title: "Verify Address",      desc: "Double-check the receiving address before sending" },
                        ].map((t, i) => (
                            <div key={i} className="flex items-start gap-3 p-2">
                                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                    <t.icon size={12} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{t.title}</p>
                                    <p className="text-[13px] text-gray-600 leading-relaxed">{t.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Transfer;

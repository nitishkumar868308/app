"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ArrowLeftRight,
    Coins,
    Wallet,
    Settings,
    Send,
    MessageSquare,
    Receipt 
} from "lucide-react";

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Exchange",  icon: ArrowLeftRight,  href: "/exchange"  },
    { label: "Staking",   icon: Coins,           href: "/staking"   },
    { label: "Wallet",    icon: Wallet,           href: "/wallet"    },
    { label: "Transaction",  icon: Receipt ,         href: "/transactions"  },
];

/* ─── Fixed bottom nav pill ─────────────────────────────────────────────────── */
const Footer = () => {
    const pathname = usePathname();

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
            {/* Fade that blends page content into the pill */}
            <div
                className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
                style={{ background: "linear-gradient(to top, #030a05 40%, transparent 100%)" }}
            />

            {/* Nav pill */}
            <div className="relative z-10 flex justify-center px-4 pb-4 pointer-events-auto">
                <nav className="flex items-center gap-1 bg-[#0d1f12]/95 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl px-2 py-1.5 shadow-[0_-4px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(16,185,129,0.05)]">
                    {navItems.map(({ label, icon: Icon, href }) => {
                        const active = pathname === href || pathname?.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                                    active ? "text-emerald-400" : "text-gray-500 hover:text-gray-300"
                                }`}
                            >
                                {active && (
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                )}
                                {active && (
                                    <span className="absolute inset-0 rounded-xl bg-emerald-500/10" />
                                )}
                                <span className="relative z-10">
                                    <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                                </span>
                                <span className={`relative z-10 text-[9px] font-bold uppercase tracking-wide leading-none ${active ? "text-emerald-400" : "text-gray-600"}`}>
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </footer>
    );
};

/* ─── Page-level informational footer (scrolls with content) ────────────────── */
export const PageFooter = () => (
    <div className="w-full border-t border-emerald-500/8 mt-4 pt-8 pb-2">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

            {/* Main row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">

                {/* Branding */}
                <div className="space-y-2.5">
                    <Image
                        src="/logo.png"
                        alt="YatriPay"
                        width={140}
                        height={36}
                        className="h-8 w-auto object-contain"
                    />
                    <p className="text-gray-600 text-xs max-w-55 leading-relaxed">
                        The next generation of decentralized staking and wealth management.
                    </p>
                </div>

                {/* Community icons */}
                <div className="flex flex-col items-start sm:items-end gap-2.5">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.18em]">
                        Community
                    </p>
                    <div className="flex items-center gap-2">
                        <a
                            href="#"
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/4 border border-white/8 text-gray-500 hover:text-[#24A1DE] hover:bg-[#24A1DE]/10 hover:border-[#24A1DE]/20 transition-all"
                            aria-label="Telegram"
                        >
                            <Send size={15} />
                        </a>
                        <a
                            href="#"
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/4 border border-white/8 text-gray-500 hover:text-[#5865F2] hover:bg-[#5865F2]/10 hover:border-[#5865F2]/20 transition-all"
                            aria-label="Discord"
                        >
                            <MessageSquare size={15} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-white/4">
                <p className="text-[10px] text-gray-700 font-medium">
                    &copy; 2026 YatriPay Decentralized Protocol. All Rights Reserved.
                </p>
                <div className="flex items-center gap-4">
                    {["Privacy", "Terms", "Docs"].map((l) => (
                        <a key={l} href="#" className="text-[10px] text-gray-700 hover:text-gray-400 transition-colors font-medium">
                            {l}
                        </a>
                    ))}
                    {/* <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-wider">
                            All systems operational
                        </span>
                    </div> */}
                </div>
            </div>

        </div>
    </div>
);

export default Footer;

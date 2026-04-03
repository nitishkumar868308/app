"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, TrendingUp, TrendingDown } from "lucide-react";

const tickers = [
    { symbol: "ZL",  price: "₹2.4L",   change: "-1.2%",  up: false },
    { symbol: "ETH", price: "₹2.4L",   change: "+0.8%",  up: true  },
    { symbol: "YTP", price: "70.78",    change: "+4.2%",  up: true  },
    { symbol: "BTC", price: "₹58.2L",  change: "-1.2%",  up: false },
    { symbol: "ETH", price: "₹2.4L",   change: "+0.8%",  up: true  },
    { symbol: "YTP", price: "79.78",    change: "+4.2%",  up: true  },
    { symbol: "BTC", price: "₹58.2L",  change: "-1.2%",  up: false },
    { symbol: "ETH", price: "₹2.4L",   change: "+0.8%",  up: true  },
];

const Header = () => {
    const user = { name: "Nitish Kumar", initials: "NK" };

    return (
        <header className="w-full sticky top-0 z-50 bg-[#030a05]">
            {/* ── Ticker Bar ── */}
            <div className="w-full bg-[#050d06] border-b border-emerald-500/10 overflow-hidden py-2">
                <div className="flex animate-marquee whitespace-nowrap gap-0">
                    {[...tickers, ...tickers].map((t, i) => (
                        <span key={i} className="inline-flex items-center gap-2 px-5 text-[11px] font-medium border-r border-white/5 last:border-0">
                            <span className="text-gray-300 font-bold">{t.symbol}</span>
                            <span className="text-gray-400">{t.price}</span>
                            <span className={`flex items-center gap-0.5 font-bold ${t.up ? "text-emerald-400" : "text-red-400"}`}>
                                {t.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {t.change}
                            </span>
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Main Header ── */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-[#030a05]/95 backdrop-blur-xl border-b border-emerald-500/8">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center group">
                    <Image
                        src="/logo.png"
                        alt="YatriPay"
                        width={160}
                        height={40}
                        className="h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
                        priority
                    />
                </Link>

                {/* Right: Welcome + Bell + Avatar */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Welcome,</span>
                        <span className="text-sm font-bold text-white leading-tight">{user.name}</span>
                    </div>

                    {/* Notification bell */}
                    <button className="relative h-9 w-9 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                        <Bell size={16} />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400 border border-[#030a05]" />
                    </button>

                    {/* Avatar */}
                    <div className="h-9 w-9 rounded-xl bg-linear-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/20 cursor-pointer">
                        {user.initials}
                    </div>
                </div>
            </div>

        </header>
    );
};

export default Header;

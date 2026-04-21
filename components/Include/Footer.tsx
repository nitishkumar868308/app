"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Coins,
    Wallet,
    Receipt,
} from "lucide-react";

// ─── Social icons (inline SVGs — lucide pinned version lacks these) ─────────
const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" /></svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2.16c3.2 0 3.584.012 4.85.07 1.17.054 1.805.25 2.227.415.56.217.96.477 1.38.896.42.42.679.819.896 1.38.164.422.36 1.058.413 2.228.058 1.265.07 1.645.07 4.85 0 3.204-.012 3.584-.07 4.85-.054 1.17-.25 1.805-.413 2.227-.217.56-.477.96-.896 1.38-.42.42-.819.679-1.38.896-.422.164-1.058.36-2.228.413-1.265.058-1.645.07-4.85.07s-3.585-.012-4.85-.07c-1.17-.054-1.805-.25-2.227-.413-.56-.217-.96-.477-1.38-.896-.42-.42-.679-.819-.896-1.38-.164-.422-.36-1.058-.413-2.228-.058-1.265-.07-1.645-.07-4.85s.012-3.585.07-4.85c.053-1.17.25-1.805.413-2.227.217-.56.477-.96.896-1.38.42-.42.819-.679 1.38-.896.422-.164 1.058-.36 2.228-.413 1.265-.058 1.645-.07 4.85-.07zM12 0C8.74 0 8.333.014 7.053.072 5.775.13 4.905.331 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.331 4.905.131 5.775.072 7.053.014 8.333 0 8.74 0 12s.014 3.667.072 4.947c.058 1.278.259 2.148.558 2.913.306.789.718 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.3 1.636.5 2.913.558C8.333 23.986 8.74 24 12 24c3.26 0 3.668-.014 4.948-.072 1.277-.058 2.147-.26 2.913-.558.789-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.337 1.384-2.126.3-.766.5-1.636.558-2.913.06-1.28.072-1.687.072-4.948 0-3.26-.012-3.667-.072-4.947-.058-1.278-.259-2.148-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.766-.3-1.636-.5-2.913-.558C15.668.014 15.26 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
);
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
);
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
);
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);

interface CommunityLink {
    label: string;
    href: string;
    color: string;
    Icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
}

const COMMUNITY_LINKS: CommunityLink[] = [
    { label: "Telegram",  href: "https://t.me/yatripay",                     color: "#24A1DE", Icon: TelegramIcon  },
    { label: "X",         href: "https://twitter.com/YatriPay",              color: "#ffffff", Icon: XIcon         },
    { label: "Instagram", href: "https://www.instagram.com/yatripay/",       color: "#E4405F", Icon: InstagramIcon },
    { label: "YouTube",   href: "https://www.youtube.com/@yatripay",         color: "#FF0000", Icon: YoutubeIcon   },
    { label: "Facebook",  href: "http://faceboo.com/theyatripay",            color: "#1877F2", Icon: FacebookIcon  },
    { label: "LinkedIn",  href: "https://www.linkedin.com/company/yatripay", color: "#0A66C2", Icon: LinkedinIcon  },
];

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    // { label: "Sell",  icon: TrendingDown,  href: "/exchange"  },
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
                style={{ background: "linear-gradient(to top, #000000 40%, transparent 100%)" }}
            />

            {/* Nav pill */}
            <div className="relative z-10 flex justify-center px-2 sm:px-4 pb-4 pointer-events-auto">
                <nav className="flex items-center gap-0 sm:gap-1 bg-[#0d1f12]/95 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl px-1 sm:px-2 py-1.5 shadow-[0_-4px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(16,185,129,0.05)] max-w-[100vw] overflow-x-auto">
                    {navItems.map(({ label, icon: Icon, href }) => {
                        const active = pathname === href || pathname?.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative flex flex-col items-center gap-1 px-2.5 sm:px-4 py-2 rounded-xl transition-all duration-200 shrink-0 ${
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
                                <span className={`relative z-10 text-[10px] sm:text-[13px] font-bold uppercase tracking-wide leading-none ${active ? "text-emerald-400" : "text-gray-600"}`}>
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
                        Daily Earing Rewards
                    </p>
                </div>

                {/* Community icons */}
                <div className="flex flex-col items-start sm:items-end gap-2.5">
                    <p className="text-[13px] text-gray-600 font-black uppercase tracking-[0.18em]">
                        Community
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                        {COMMUNITY_LINKS.map(({ label, href, color, Icon }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/4 border border-white/8 text-gray-500 transition-all"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = color;
                                    e.currentTarget.style.background = color + "15";
                                    e.currentTarget.style.borderColor = color + "33";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "";
                                    e.currentTarget.style.background = "";
                                    e.currentTarget.style.borderColor = "";
                                }}
                            >
                                <Icon width={15} height={15} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-white/4">
                <p className="text-[12px] text-gray-700 font-medium">
                    &copy; 2026 YatriPay Decentralized Protocol. All Rights Reserved.
                </p>
                <div className="flex items-center gap-4">
                    {[
                        { label: "T&C Privacy Policy", href: "https://yatripay.com/terms_conditions.pdf" },
                        { label: "User Manual",        href: "https://yatripay.com/user_manual.pdf" },
                    ].map((l) => (
                        <a
                            key={l.label}
                            href={l.href}
                            target={l.href.startsWith("http") ? "_blank" : undefined}
                            rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="text-[12px] text-gray-700 hover:text-gray-400 transition-colors font-medium"
                        >
                            {l.label}
                        </a>
                    ))}
                    {/* <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[12px] text-emerald-500/60 font-bold uppercase tracking-wider">
                            All systems operational
                        </span>
                    </div> */}
                </div>
            </div>

        </div>
    </div>
);

export default Footer;

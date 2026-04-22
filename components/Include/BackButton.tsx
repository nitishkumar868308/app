"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    href?: string;
    label?: string;
    className?: string;
}

const BackButton = ({ href, label, className = "" }: BackButtonProps) => {
    const router = useRouter();

    const handleClick = () => {
        if (href) {
            router.push(href);
        } else if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <button
            onClick={handleClick}
            aria-label="Go back"
            className={`inline-flex items-center gap-2 h-9 px-3 rounded-xl bg-white/5 border border-white/8 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all ${className}`}
        >
            <ArrowLeft size={15} />
            {label && <span className="text-[12px] font-bold">{label}</span>}
        </button>
    );
};

export default BackButton;

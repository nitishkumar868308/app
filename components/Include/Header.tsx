import React from 'react'
import Link from "next/link";

const Header = () => {
    const user = { name: "Nitish Kumar", image: "/avatar.png" };
    return (
        <>
            {/* 1. Header & Profile - Bilkul Clean */}
            <header className="flex justify-between items-center">
                {/* Left Side - Logos */}
                <div className="flex items-center gap-3">
                    <Link href="/dashboard">
                        <img src="/logo.png" alt="Logo1" className="w-40 h-10" />
                    </Link>
                    {/* <img src="/logo2.png" alt="Logo2" className="w-8 h-8" /> */}
                    {/* <span className="text-white font-bold text-lg hidden md:inline">YatriPay</span> */}
                </div>

                {/* Right Side - User Info */}
                <div className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-full px-4 py-2 shadow-xl">
                    {user.image ? (
                        <img src={user.image} alt="Profile" className="w-8 h-8 rounded-full border border-blue-500" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold text-white">
                            {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </div>
                    )}
                    <span className="text-sm font-medium">{user.name}</span>
                </div>
            </header>
        </>
    )
}

export default Header
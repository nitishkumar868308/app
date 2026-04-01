import React from 'react'
import {
    Send,
    MessageSquare,
} from "lucide-react";

const Footer = () => {
    return (
        <>
            {/* Footer - Low opacity to reduce noise */}
            <footer className="w-full mt-auto pt-16 pb-8  bg-[#050505]">
                <div className="max-w-7xl mx-auto px-6">
                    <img src="/logo.png" alt="Logo1" className="w-40 h-10" />
                    {/* Main Footer Content */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">

                        {/* Left: Branding */}
                        <div className="flex flex-col items-center md:items-start space-y-2">
                            {/* <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-lg shadow-purple-500/20" />
                                <span className="text-white font-black tracking-tighter text-xl">
                                    YATRIPAY<span className="text-purple-500">.</span>
                                </span>
                            </div> */}
                            <p className="text-gray-500 text-xs font-medium max-w-[200px] text-center md:text-left">
                                The next generation of decentralized staking protocols.
                            </p>
                        </div>

                        {/* Right: Social Media Section */}
                        <div className="flex flex-col items-center md:items-end space-y-4 text-center md:text-right">
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Follow Our Community</p>

                            <div className="flex items-center gap-4">
                                {/* Twitter/X */}
                                {/* <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                                    <Twitter size={18} />
                                </a> */}

                                {/* Telegram */}
                                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-[#24A1DE] hover:bg-[#24A1DE]/10 hover:border-[#24A1DE]/20 hover:-translate-y-1 transition-all duration-300">
                                    <Send size={18} />
                                </a>

                                {/* Discord */}
                                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-[#5865F2] hover:bg-[#5865F2]/10 hover:border-[#5865F2]/20 hover:-translate-y-1 transition-all duration-300">
                                    <MessageSquare size={18} />
                                </a>

                                {/* GitHub */}
                                {/* <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                                    <Github size={18} />
                                </a> */}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-600 text-[10px] font-medium tracking-wide">
                            &copy; 2026 YatriPay Decentralized Protocol. All Rights Reserved.
                        </p>

                        <div className="flex items-center gap-6 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                            <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
                            <a href="#" className="hover:text-purple-400 transition-colors">Docs</a>
                        </div>
                    </div>

                </div>
            </footer>
        </>
    )
}

export default Footer
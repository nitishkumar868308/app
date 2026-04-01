"use client";
import React from "react";
import { motion } from "framer-motion";

const FlatingIcons = () => {
    const currencyIcons = [
        { char: "$", top: "5%", left: "5%", delay: 0, color: "text-blue-400/40" },
        { char: "₹", top: "35%", left: "80%", delay: 1, color: "text-emerald-400/40" },
        { char: "€", top: "60%", left: "10%", delay: 2, color: "text-violet-400/40" },
        { char: "£", top: "80%", left: "70%", delay: 3, color: "text-blue-400/40" },
        { char: "₿", top: "15%", left: "65%", delay: 4, color: "text-emerald-400/40" },
    ];

    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Background Blurs */}
            <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-emerald-600/20 rounded-full blur-[150px]" />

            {/* Floating Icons */}
            {currencyIcons.map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ y: 0, opacity: 0 }}
                    animate={{
                        y: [0, -40, 0], // smaller range for smoother mobile visibility
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.2, 1], // subtle scaling to pop
                        rotate: [0, 15, -15, 0], // slight rotation for liveliness
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        delay: item.delay,
                        ease: "easeInOut",
                    }}
                    className={`
            absolute 
            text-4xl sm:text-5xl md:text-7xl lg:text-8xl
            font-extrabold 
            select-none 
            ${item.color}
            drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]
          `}
                    style={{ top: item.top, left: item.left }}
                >
                    {item.char}
                </motion.div>
            ))}
        </div>
    );
};

export default FlatingIcons;
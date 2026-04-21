"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Plane, ShieldAlert } from "lucide-react";
import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";

const FlightPage = () => {
    return (
        <div className="bg-[#000000] text-white">
            <Header />
            <div className="pb-24">
                <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft size={14} /> Back to dashboard
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="relative overflow-hidden rounded-3xl border border-sky-500/15 p-6 md:p-10 text-center"
                        style={{ background: "linear-gradient(135deg, #0d1f12 0%, #0a1a0f 50%, #071209 100%)" }}
                    >
                        <div className="absolute -top-16 -right-16 w-60 h-60 bg-sky-500/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-sky-500/10 rounded-full blur-[60px] pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center gap-4 md:gap-5">
                            <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                                <Plane size={34} strokeWidth={1.8} />
                            </div>

                            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                                Flight Booking
                            </h1>

                            <p className="text-sm md:text-base text-gray-400 font-medium max-w-md">
                                Book stays worldwide and earn YTP rewards on every reservation.
                            </p>

                            <div className="inline-flex items-start gap-2 bg-red-500/10 text-red-400 text-[13px] font-bold px-4 py-2.5 rounded-xl border border-red-500/20 max-w-md">
                                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                                <span className="text-left">NOT AVAILABLE FOR INDIAN USERS AS PER FIU-IND REGULATIONS.</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <PageFooter />
            </div>
            <Footer />
        </div>
    );
};

export default FlightPage;

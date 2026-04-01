import React, { useState } from 'react'
import {
    ChevronRight,
    Play,
    ArrowRight,
    Clock,
} from "lucide-react";

const videos = [
    { step: 1, src: "/video1.mp4", poster: "/poster1.jpg", title: "Staking Intro", duration: "5:30" },
    { step: 2, src: "/video2.mp4", poster: "/poster2.jpg", title: "AI Staking Benefits", duration: "4:20" },
    { step: 3, src: "/video3.mp4", poster: "/poster3.jpg", title: "How to Start", duration: "6:10" },
    { step: 4, src: "/video4.mp4", poster: "/poster4.jpg", title: "Maximize Rewards", duration: "3:50" },
];

const Section4 = () => {
    const [showAllVideos, setShowAllVideos] = useState(false);
    const visibleVideos = showAllVideos ? videos : videos.slice(0, 3);
    return (
        <>
            <section className="w-full py-20  text-white antialiased">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/5 pb-8">
                        <div className="max-w-2xl">
                            <p className="text-blue-500 font-mono text-xs uppercase tracking-[0.4em] mb-3">
                                Watch & Learn
                            </p>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight leading-tight">
                                Start Your <span className="font-semibold">Staking Journey</span>
                            </h2>
                        </div>
                        {/* Button visible everywhere, adjust width on mobile */}
                        <button className="flex w-full md:w-auto items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors justify-center md:justify-start mt-4 md:mt-0">
                            Explore All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Video Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleVideos.map((video, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111111] border border-white/[0.05] rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300"
                            >
                                <div className="relative aspect-video bg-[#1A1A1A] overflow-hidden">
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                                    <img
                                        src={video.poster}
                                        alt={video.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                        <div className="w-12 h-12 rounded-full border border-white/30 bg-black/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
                                            <Play size={18} className="text-white group-hover:text-black fill-current ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[10px] font-mono bg-black text-gray-400 px-2 py-1 rounded border border-white/10">
                                            {video.step}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                                            <Clock size={12} /> {video.duration}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-200 group-hover:text-white mb-5 line-clamp-1">
                                        {video.title}
                                    </h3>
                                    <button className="flex items-center gap-1 text-xs font-bold text-gray-400 group-hover:text-blue-500 transition-colors uppercase tracking-widest">
                                        Start Module <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </section>
        </>
    )
}

export default Section4
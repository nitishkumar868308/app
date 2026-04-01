import React from 'react'
import { ChevronRight } from 'lucide-react'

const Section2 = () => {
    return (
        <>
            {/* 3. Staking Status - Isko humne 'Card' look diya hai with depth */}
            <section className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Staking Analytics</h2>
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-bold">Live Status</span>
                </div>
                <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
                    <div className="p-8">
                        <p className="text-gray-500 text-sm mb-1">Total Invested</p>
                        <p className="text-3xl font-black">₹0.00</p>
                    </div>
                    <div className="p-8 bg-white/[0.02]">
                        <p className="text-gray-500 text-sm mb-1">Daily Earnings</p>
                        <p className="text-3xl font-black text-green-400">+ ₹0.00</p>
                    </div>
                    <div className="p-8">
                        <p className="text-gray-500 text-sm mb-1">Active Plan</p>
                        <p className="text-xl font-bold flex items-center gap-2">
                            No Active Plan <ChevronRight className="w-4 h-4 text-gray-600" />
                        </p>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Section2
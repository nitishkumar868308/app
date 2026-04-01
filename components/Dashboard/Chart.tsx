import React from 'react'

const Chart = () => {
    return (
        <>
            {/* 5. Pricing Chart - Clean and Dark */}
            <section className="bg-[#111] border border-white/5 p-6 rounded-3xl">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-sm font-bold text-gray-500 uppercase">Current Price</h2>
                        <p className="text-3xl font-black text-green-400">₹0.7165 <span className="text-xs font-normal">+2.4%</span></p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-gray-500 italic">Market is live</p>
                    </div>
                </div>
                <div className="h-32 bg-gradient-to-t from-blue-500/5 to-transparent rounded-xl flex items-center justify-center border border-dashed border-white/10">
                    <p className="text-gray-600 font-medium tracking-widest uppercase text-xs">Market Chart Coming Soon</p>
                </div>
            </section>
        </>
    )
}

export default Chart
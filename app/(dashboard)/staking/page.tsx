import React from 'react'
import Header from '@/components/Include/Header'
import Footer from '@/components/Include/Footer'
import Staking from '@/components/Staking/Staking'

const page = () => {
    return (
        <div className="min-h-screen bg-[#000] text-white p-4 md:p-8 max-w-7xl mx-auto space-y-10">
            <Header />
            <Staking />
            <Footer />
        </div>
    )
}

export default page
"use client";

import { useEffect } from "react";
import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import NetWorthSection from "./NetWorthSection";
import QuickActions from "./QuickActions";
import Services from "./Services";
import StakingPlans from "./StakingPlans";
import HotOffers from "./HotOffers";
import ReferralSection from "./ReferralSection";
import MarketChart from "./MarketChart";
import { useWallet } from "@/context/WalletContext";

export default function Dashboard() {
    const { refresh } = useWallet();

    // Re-fetch wallet data every time dashboard mounts (e.g. coming back from Add Fund / Buy Asset)
    useEffect(() => {
        refresh();
    }, []);

    return (
        /*
         * Outer wrapper is NOT min-h-screen so the page can grow
         * naturally. The fixed Footer handles the bottom nav position.
         * pb-24 on the scroll area gives exactly enough clearance for
         * the fixed nav pill (≈ 76px) so content never hides behind it.
         */
        <div className="bg-[#000000] text-white">
            <Header />

            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-5 pb-24">
                {/*
                  Grid strategy
                  ─ Desktop (lg): explicit 2-equal-col placement
                      Col 1 rows 1-3 : NetWorth → QuickActions → StakingPlans
                      Col 2 rows 1-2 : HotOffers → ReferralSection  (spans same height)
                      Row 4 full-width: MarketChart
                  ─ Mobile (single col): order utilities stack as
                      NetWorth → QuickActions → HotOffers → StakingPlans → ReferralSection → Chart
                */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* NetWorth ── left col row 1 ── mobile order 1 */}
                    <div className="order-1 lg:col-start-1 lg:row-start-1">
                        <NetWorthSection />
                    </div>

                    {/* Right col rows 1-5 ── mobile order 5 */}
                    <div className="order-5 lg:order-0 lg:col-start-2 lg:row-start-1 lg:row-end-5 space-y-5">
                        <HotOffers />
                        <ReferralSection />
                    </div>

                    {/* QuickActions ── left col row 2 ── mobile order 2 */}
                    <div className="order-2 lg:order-0 lg:col-start-1 lg:row-start-2">
                        <QuickActions />
                    </div>

                    {/* Services ── left col row 3 ── mobile order 3 */}
                    <div className="order-3 lg:order-0 lg:col-start-1 lg:row-start-3">
                        <Services />
                    </div>

                    {/* StakingPlans ── left col row 4 ── mobile order 6 */}
                    <div className="order-6 lg:order-0 lg:col-start-1 lg:row-start-4">
                        <StakingPlans />
                    </div>

                    {/* MarketChart ── full width ── mobile order 7 */}
                    <div className="order-7 lg:order-0 lg:col-span-2 lg:row-start-5">
                        <MarketChart />
                    </div>

                </div>

                {/* Rich page footer — scrolls with content, sits above the fixed nav */}
                <PageFooter />
            </div>

            {/* Fixed bottom nav pill — always visible */}
            <Footer />
        </div>
    );
}

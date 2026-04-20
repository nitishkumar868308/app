"use client";

import { Plane } from "lucide-react";
import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import ComingSoon from "@/components/Include/ComingSoon";

const FlightPage = () => {
    return (
        <div className="bg-[#000000] text-white">
            <Header />
            <div className="pb-24">
                <ComingSoon
                    title="Flight Booking"
                    subtitle="Compare and book flights with YTP. Exclusive traveler cashback drops soon."
                    icon={Plane}
                    accent="sky"
                />
                <PageFooter />
            </div>
            <Footer />
        </div>
    );
};

export default FlightPage;

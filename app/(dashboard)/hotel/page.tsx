"use client";

import { BedDouble } from "lucide-react";
import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import ComingSoon from "@/components/Include/ComingSoon";

const HotelPage = () => {
    return (
        <div className="bg-[#000000] text-white">
            <Header />
            <div className="pb-24">
                <ComingSoon
                    title="Hotel Booking"
                    subtitle="Book stays worldwide and earn YTP rewards on every reservation."
                    icon={BedDouble}
                    accent="amber"
                />
                <PageFooter />
            </div>
            <Footer />
        </div>
    );
};

export default HotelPage;

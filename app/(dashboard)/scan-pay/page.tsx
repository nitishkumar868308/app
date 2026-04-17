"use client";

import { QrCode } from "lucide-react";
import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import ComingSoon from "@/components/Include/ComingSoon";

const ScanPayPage = () => {
    return (
        <div className="bg-[#030a05] text-white">
            <Header />
            <div className="pb-24">
                <ComingSoon
                    title="Scan & Pay"
                    subtitle="Pay instantly by scanning any QR code. We're polishing the experience for you."
                    icon={QrCode}
                    accent="emerald"
                />
                <PageFooter />
            </div>
            <Footer />
        </div>
    );
};

export default ScanPayPage;

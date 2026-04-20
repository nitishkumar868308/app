"use client";

import { use } from "react";
import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import OfferDetail from "@/components/Offers/OfferDetail";

export default function OfferDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);

    return (
        <div className="bg-[#000000] text-white">
            <Header />
            <div className="pb-24">
                <OfferDetail slug={slug} />
                <PageFooter />
            </div>
            <Footer />
        </div>
    );
}

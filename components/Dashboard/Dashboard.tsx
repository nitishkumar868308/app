"use client";
import Header from "../Include/Header";
import Footer from "../Include/Footer";
import Section1 from "./Section1";
import Section2 from "./Section2";
import Section3 from "./Section3";
import Section4 from "./Section4";
import Section5 from "./Section5";
import Chart from "./Chart";
import FlatingIcons from "./FlatingIcons";

export default function Dashboard() {
    return (
        <>
            {/* <div className="relative min-h-screen bg-[#000] text-white">
                <FlatingIcons />
            </div> */}
            <div className="min-h-screen bg-[#000] text-white p-4 md:p-8 max-w-7xl mx-auto space-y-10">

                <Header />
                <Section1 />
                <Section2 />
                <Section3 />
                <Section4 />
                <Section5 />
                <Chart />
                <Footer />
            </div>


        </>
    );
}
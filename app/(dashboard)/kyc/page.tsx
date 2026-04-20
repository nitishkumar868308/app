import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import KYC from "@/components/KYC/KYC";

const page = () => {
    return (
        <div className="bg-[#000000] text-white">
            <Header />
            <div className="pb-24">
                <KYC />
                <PageFooter />
            </div>
            <Footer />
        </div>
    );
};

export default page;

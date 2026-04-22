import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import TwoFASettings from "@/components/TwoFA/TwoFASettings";

const page = () => {
    return (
        <div className="bg-[#000000] text-white">
            <Header />
            <div className="pb-24">
                <TwoFASettings />
                <PageFooter />
            </div>
            <Footer />
        </div>
    );
};

export default page;

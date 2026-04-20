import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import Wallet from "@/components/Wallet/Wallet";

const page = () => {
    return (
        <div className="bg-[#000000] text-white">
            <Header />
            <div className="pb-24">
                <Wallet />
                <PageFooter />
            </div>
            <Footer />
        </div>
    );
};

export default page;

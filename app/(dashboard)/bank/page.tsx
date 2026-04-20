import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import BankDetails from "@/components/BankDetails/BankDetails";

const page = () => {
    return (
        <div className="bg-[#000000] text-white">
            <Header />
            <div className="pb-24">
                <BankDetails />
                <PageFooter />
            </div>
            <Footer />
        </div>
    );
};

export default page;

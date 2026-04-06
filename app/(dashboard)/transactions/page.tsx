import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import Transactions from "@/components/Transactions/Transactions";

const page = () => {
    return (
        <div className="bg-[#030a05] text-white">
            <Header />
            <div className="pb-24">
                <Transactions />
                <PageFooter />
            </div>
            <Footer />
        </div>
    );
};

export default page;

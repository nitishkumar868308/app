import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import AddFund from "@/components/AddFund/AddFund";

const page = () => {
    return (
        <div className="bg-[#000000] text-white">
            <Header />
            <div className="pb-24">
                <AddFund />
                <PageFooter />
            </div>
            <Footer />
        </div>
    );
};

export default page;

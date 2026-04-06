import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import Exchange from "@/components/Exchange/Exchange";

const page = () => {
    return (
        <div className="bg-[#030a05] text-white">
            <Header />
            <div className="pb-24">
                <Exchange />
                <PageFooter />
            </div>
            <Footer />
        </div>
    );
};

export default page;

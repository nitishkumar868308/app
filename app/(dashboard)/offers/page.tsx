import Header from "@/components/Include/Header";
import Footer, { PageFooter } from "@/components/Include/Footer";
import OffersList from "@/components/Offers/OffersList";

const page = () => {
    return (
        <div className="bg-[#000000] text-white">
            <Header />
            <div className="pb-24">
                <OffersList />
                <PageFooter />
            </div>
            <Footer />
        </div>
    );
};

export default page;

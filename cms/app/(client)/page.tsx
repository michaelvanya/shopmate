import Container from "@/components/Container";
import HeroBanner from "@/components/HeroBanner";
import FeaturesBar from "@/components/FeaturesBar";
import CategoryShowcase from "@/components/CategoryShowcase";
import ProductList from "@/components/ProductList";
import SpecialOfferBanner from "@/components/SpecialOfferBanner";
import Testimonials from "@/components/Testimonials";
import { getAllCategories, getAllProducts, getSale } from "@/sanity/helpers";

export default async function Home() {
  const products = await getAllProducts();
  const categories = await getAllCategories();
  const sales = await getSale();

  const activeSale = sales && sales.length > 0 ? sales[0] : null;

  return (
    <div className="py-6">
      <Container>
        {/* Hero Banner Section */}
        <HeroBanner />

        {/* Feature Guarantees (Shipping, Payment, Returns, Support) */}
        <FeaturesBar />

        {/* Shop by Categories */}
        <CategoryShowcase categories={categories} />

        {/* Best Selling Products */}
        <ProductList products={products} categories={categories} title={true} />

        {/* Special Offer / 50% Promo Banner */}
        <SpecialOfferBanner
          discount={activeSale?.discountAmount || 50}
          title={activeSale?.title || "Up to 50% Off"}
          subtitle={
            activeSale?.description ||
            "Limited time offer on selected items. Hurry up and grab the best deals!"
          }
          couponCode={activeSale?.couponCode}
        />

        {/* Customer Testimonials Carousel */}
        <Testimonials />
      </Container>
    </div>
  );
}

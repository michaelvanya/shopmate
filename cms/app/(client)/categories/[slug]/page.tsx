import Container from "@/components/Container";
import ProductGrid from "@/components/ProductGrid";
import CategoryShowcase from "@/components/CategoryShowcase";
import { getAllCategories, getProductsByCategory } from "@/sanity/helpers";
import Link from "next/link";
import React from "react";
import { ArrowLeft, Tag } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

const CategoriesPage = async ({ params }: Props) => {
  const { slug } = await params;
  const products = await getProductsByCategory(slug);
  const categories = await getAllCategories();

  const formattedName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8">
      <Container>
        {/* Navigation / Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C7C3E] mb-2 hover:underline"
            >
              <ArrowLeft size={14} /> Back to all categories
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#EEF4E8] flex items-center justify-center text-[#5C7C3E]">
                <Tag size={16} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                {formattedName} Collection
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#706F6C] mt-1">
              Showing {products?.length || 0} items for this collection
            </p>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mb-8">
          <CategoryShowcase categories={categories} />
        </div>

        {/* Products */}
        {products && products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="bg-white rounded-3xl border border-[#ECE7DE] p-12 text-center max-w-lg mx-auto shadow-2xs">
            <h3 className="text-lg font-bold text-[#1A1A1A]">
              No products found in this category
            </h3>
            <p className="text-xs text-[#706F6C] mt-1 mb-4">
              Explore other categories or check back soon for new arrivals!
            </p>
            <Link
              href="/"
              className="inline-block bg-[#5C7C3E] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-2xs"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
};

export default CategoriesPage;

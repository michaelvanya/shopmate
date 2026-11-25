import Container from "@/components/Container";
import ProductGrid from "@/components/ProductGrid";
import { searchProductsByName } from "@/sanity/helpers";
import Link from "next/link";
import React from "react";
import { ArrowLeft, Search } from "lucide-react";

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) => {
  const { query = "" } = await searchParams;
  const products = await searchProductsByName(query);

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C7C3E] mb-2 hover:underline"
          >
            <ArrowLeft size={14} /> Back to store
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#EEF4E8] flex items-center justify-center text-[#5C7C3E]">
              <Search size={16} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              Search Results
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-[#706F6C] mt-1">
            {query
              ? `Found ${products?.length || 0} result${
                  products?.length === 1 ? "" : "s"
                } matching "${query}"`
              : "Showing all available products"}
          </p>
        </div>

        {/* Results */}
        {products && products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="bg-white rounded-3xl border border-[#ECE7DE] p-12 text-center max-w-lg mx-auto shadow-2xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-gray-400">
              <Search size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">
              No Products Found
            </h3>
            <p className="text-xs sm:text-sm text-[#706F6C] leading-relaxed">
              We couldn&apos;t find any items matching &ldquo;{query}&rdquo;. Try checking the spelling or searching with broader keywords.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block bg-[#5C7C3E] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-2xs hover:bg-[#4E6B32] transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default SearchPage;

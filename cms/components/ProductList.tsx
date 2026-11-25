import { Category, Product } from "@/sanity.types";
import React from "react";
import ProductGrid from "./ProductGrid";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  products: Product[];
  categories?: Category[];
  title?: boolean;
}

const ProductList = ({ products, title = true }: Props) => {
  return (
    <div id="products" className="my-10">
      {title && (
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
              Best Selling Products
            </h2>
            <p className="text-xs sm:text-sm text-[#706F6C] mt-1">
              Handpicked premium essentials loved by thousands of customers
            </p>
          </div>
          <Link
            href="/search?query="
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1A1A1A] hover:text-[#5C7C3E] transition-colors group"
          >
            View All Products
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}

      {products && products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#ECE7DE] p-8">
          <p className="text-base font-semibold text-[#1A1A1A]">
            No products available yet.
          </p>
          <p className="text-xs text-[#706F6C] mt-1">
            Add products in the Sanity Studio (/studio) to see them here!
          </p>
          <div className="mt-4">
            <Link
              href="/studio"
              className="inline-block bg-[#5C7C3E] text-white text-xs font-semibold px-4 py-2 rounded-xl"
            >
              Open Sanity Studio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;

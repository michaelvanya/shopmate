import AddToCartButton from "@/components/AddToCartButton";
import Container from "@/components/Container";
import PriceView from "@/components/PriceView";
import { getProductBySlug } from "@/sanity/helpers";
import { urlFor } from "@/sanity/lib/image";
import { notFound } from "next/navigation";
import React from "react";
import { Star, Truck, RotateCcw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const ProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  // Deterministic rating based on name length
  const ratingValue = (4.4 + (((product?.name?.length || 5) * 7) % 6) / 10).toFixed(1);
  const reviewCount = 50 + (((product?.name?.length || 4) * 23) % 180);

  return (
    <div className="bg-[#FAF8F5] py-8 sm:py-12">
      <Container>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#706F6C] mb-6">
          <Link href="/" className="hover:text-[#5C7C3E]">
            Home
          </Link>
          <span>/</span>
          <Link href="/#products" className="hover:text-[#5C7C3E]">
            Products
          </Link>
          <span>/</span>
          <span className="text-[#1A1A1A] font-semibold truncate max-w-[200px]">
            {product?.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start bg-white rounded-3xl border border-[#ECE7DE] p-6 sm:p-10 shadow-2xs">
          {/* Left: Product Image */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full aspect-square bg-[#FAF8F5] rounded-2xl border border-[#ECE7DE] p-6 flex items-center justify-center overflow-hidden relative group">
              {product?.image ? (
                <Image
                  src={urlFor(product.image).size(1000, 1000).url()}
                  alt={product.name || "Product"}
                  width={600}
                  height={600}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <span className="text-gray-400">No Image Available</span>
              )}

              {product?.status && (
                <span className="absolute top-4 left-4 bg-[#E5EEDD] text-[#4F6D34] text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
                  {product.status}
                </span>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div>
              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] tracking-tight">
                {product?.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-[#F5A623]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className="fill-[#F5A623] text-[#F5A623]"
                    />
                  ))}
                  <span className="text-xs font-bold text-[#1A1A1A] ml-1">
                    {ratingValue}
                  </span>
                </div>
                <span className="text-xs text-[#706F6C]">
                  ({reviewCount} customer reviews)
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E5EEDD] text-[#4F6D34]">
                  In Stock
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="border-y border-[#ECE7DE] py-4">
              <PriceView
                price={product?.price}
                discount={product?.discount}
                label={product?.label}
                className="text-3xl font-extrabold text-[#1A1A1A]"
              />
            </div>

            {/* Description */}
            {product?.description && (
              <div>
                <h3 className="text-xs font-bold text-[#706F6C] uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-sm text-[#4E4D4A] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Add to Cart CTA */}
            <div className="pt-2">
              <AddToCartButton
                product={product}
                className="py-3.5 text-base rounded-xl font-bold"
              />
            </div>

            {/* Guarantees Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#ECE7DE]">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE7DE]">
                <Truck size={20} className="text-[#5C7C3E] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A1A]">Free Shipping</h4>
                  <p className="text-[10px] text-[#706F6C]">On orders over $50</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE7DE]">
                <RotateCcw size={20} className="text-[#5C7C3E] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A1A]">30-Day Returns</h4>
                  <p className="text-[10px] text-[#706F6C]">Money-back guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductPage;

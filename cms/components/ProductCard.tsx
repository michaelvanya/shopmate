"use client";
import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import React, { useState } from "react";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import PriceView from "./PriceView";
import { Heart, Star } from "lucide-react";
import toast from "react-hot-toast";

const ProductCard = ({ product }: { product: Product }) => {
  const [isWishlist, setIsWishlist] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlist(!isWishlist);
    if (!isWishlist) {
      toast.success(`${product.name || "Product"} added to wishlist!`);
    } else {
      toast.success(`${product.name || "Product"} removed from wishlist!`);
    }
  };

  // Deterministic rating based on name length for visual aesthetic matching the design
  const ratingValue = (4.3 + (((product?.name?.length || 5) * 7) % 7) / 10).toFixed(1);
  const reviewCount = 45 + (((product?.name?.length || 4) * 23) % 150);

  return (
    <div className="bg-white rounded-2xl border border-[#ECE7DE] p-4 flex flex-col justify-between group transition-all duration-300 hover:shadow-lg hover:border-[#DED8CC] relative">
      {/* Wishlist Heart Icon */}
      <button
        onClick={toggleWishlist}
        aria-label="Add to wishlist"
        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-[#ECE7DE] flex items-center justify-center text-[#706F6C] hover:text-red-500 hover:border-red-200 transition-colors shadow-2xs hoverEffect"
      >
        <Heart
          size={16}
          className={isWishlist ? "fill-red-500 text-red-500" : ""}
        />
      </button>

      {/* Image container */}
      <div className="relative w-full aspect-square bg-[#FAF8F5] rounded-xl overflow-hidden mb-4 flex items-center justify-center p-3">
        {product?.image ? (
          <Link
            href={`/product/${product?.slug?.current || ""}`}
            className="w-full h-full flex items-center justify-center"
          >
            <img
              src={urlFor(product.image).size(500, 500).url()}
              alt={product?.name || "Product image"}
              className={`w-full h-full object-contain transition-transform duration-500 ${
                product?.stock !== 0 ? "group-hover:scale-105" : ""
              }`}
            />
          </Link>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            No Image
          </div>
        )}

        {/* Out of Stock overlay */}
        {product?.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center rounded-xl">
            <span className="text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Status Badge */}
        {product?.status && (
          <span className="absolute top-2 left-2 bg-[#E5EEDD] text-[#4F6D34] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            {product.status}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2 flex-1">
        {/* Title */}
        <Link href={`/product/${product?.slug?.current || ""}`}>
          <h3 className="font-semibold text-sm sm:text-base text-[#1A1A1A] line-clamp-1 hover:text-[#5C7C3E] transition-colors capitalize">
            {product?.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 text-xs text-[#706F6C]">
          <div className="flex items-center gap-1 text-[#F5A623]">
            <Star size={13} className="fill-[#F5A623]" />
            <span className="font-bold text-[#1A1A1A]">{ratingValue}</span>
          </div>
          <span>({reviewCount})</span>
        </div>

        {/* Price */}
        <PriceView
          price={product?.price}
          discount={product?.discount}
          label={product?.label}
          className="text-base sm:text-lg font-bold text-[#1A1A1A]"
        />

        {/* Add to Cart button */}
        <div className="pt-2 mt-auto">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

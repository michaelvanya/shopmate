import { Category } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";
import React from "react";
import { ArrowRight } from "lucide-react";

interface Props {
  categories: Category[];
}

// Fallback curated category presets matching the theme image
const defaultCategories = [
  {
    title: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-[#EAEFF5]",
  },
  {
    title: "Fashion",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-[#F5ECE8]",
  },
  {
    title: "Home & Kitchen",
    slug: "home-kitchen",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-[#F5F1E8]",
  },
  {
    title: "Beauty",
    slug: "beauty",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-[#F7EBEF]",
  },
  {
    title: "Sports",
    slug: "sports",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-[#E6F3F3]",
  },
  {
    title: "Accessories",
    slug: "accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-[#F7EFE4]",
  },
];

const CategoryShowcase = ({ categories }: Props) => {
  const displayList =
    categories && categories.length > 0
      ? categories.map((cat, i) => {
          const defaultItem = defaultCategories[i % defaultCategories.length];
          return {
            title: cat.title || defaultItem.title,
            slug: cat.slug?.current || defaultItem.slug,
            image: (cat as Category & { image?: Parameters<typeof urlFor>[0] }).image
              ? urlFor((cat as Category & { image?: Parameters<typeof urlFor>[0] }).image!)
                  .width(200)
                  .height(200)
                  .url()
              : defaultItem.image,
            bgColor: defaultItem.bgColor,
          };
        })
      : defaultCategories;

  return (
    <div className="mb-14">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
            Shop by Categories
          </h2>
        </div>
        <Link
          href="/#categories"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1A1A1A] hover:text-[#5C7C3E] transition-colors group"
        >
          View All Categories
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Circular Category Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6 justify-items-center">
        {displayList.slice(0, 6).map((cat, index) => (
          <Link
            key={index}
            href={`/categories/${cat.slug}`}
            className="flex flex-col items-center gap-3 group text-center cursor-pointer"
          >
            <div
              className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full ${cat.bgColor} flex items-center justify-center p-3 border border-black/5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md overflow-hidden relative`}
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#1A1A1A] group-hover:text-[#5C7C3E] transition-colors">
              {cat.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryShowcase;

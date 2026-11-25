import Link from "next/link";
import React from "react";
import { ArrowRight, Tag } from "lucide-react";

interface Props {
  discount?: number;
  title?: string;
  subtitle?: string;
  couponCode?: string;
}

const SpecialOfferBanner = ({
  discount = 50,
  title = "Up to 50% Off",
  subtitle = "Limited time offer on selected items. Hurry up and grab the best deals!",
  couponCode,
}: Props) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#F6F2EA] via-[#EFE8DC] to-[#E5DCBE] p-8 sm:p-12 my-14 border border-[#E7E0D2] shadow-xs">
      {/* Background shadow leaf silhouettes */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-black/20 via-transparent to-transparent"></div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Information */}
        <div className="md:col-span-7 flex flex-col items-start gap-3">
          <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#73716D] uppercase">
            Special Offer
          </span>

          <h2 className="text-3xl sm:text-5xl font-bold text-[#1A1A1A] tracking-tight">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-[#61605C] max-w-md leading-relaxed">
            {subtitle}
          </p>

          {couponCode && (
            <div className="inline-flex items-center gap-2 bg-[#E5EEDD] text-[#4F6D34] px-3.5 py-1.5 rounded-lg text-xs font-bold border border-[#D3E3C7]">
              <Tag size={14} /> Use code: <span className="underline">{couponCode}</span>
            </div>
          )}

          <div className="pt-3">
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 bg-[#5C7C3E] hover:bg-[#4E6B32] text-white font-medium text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-sm hoverEffect group"
            >
              Shop the Sale
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Visual composition */}
        <div className="md:col-span-5 flex items-center justify-center relative">
          <div className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-4/3 flex items-center justify-center">
            {/* Bag illustration / image representation with 50% badge */}
            <div className="relative z-10 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=500&q=80"
                alt="Special Offer Sale"
                className="w-56 sm:w-64 h-auto object-contain rounded-2xl drop-shadow-xl"
              />
              {/* Green Discount Tag */}
              <div className="absolute -top-3 -right-2 bg-[#5C7C3E] text-white font-black text-center px-4 py-2.5 rounded-2xl shadow-lg border-2 border-white rotate-12 transition-transform duration-300 hover:rotate-0">
                <span className="block text-sm sm:text-base leading-none">{discount}%</span>
                <span className="block text-[10px] sm:text-xs tracking-wider leading-none">OFF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialOfferBanner;

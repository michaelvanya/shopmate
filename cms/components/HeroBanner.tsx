import Link from "next/link";
import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";

const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#F7F4EC] via-[#EFE9DD] to-[#E6DEC9] p-8 md:p-12 lg:p-16 mb-8 border border-[#E8E2D5] shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Content */}
        <div className="lg:col-span-7 flex flex-col items-start gap-5 z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5EEDD] border border-[#D3E3C7] text-xs font-semibold text-[#4F6D34] tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-[#5C7C3E] animate-pulse"></span>
            NEW ARRIVALS
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#1A1A1A] tracking-tight leading-[1.15]">
            Discover The Best <br className="hidden sm:inline" />
            Products for You
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#61605C] max-w-xl leading-relaxed">
            Explore our wide range of high-quality products at affordable prices.
            Shop now and enjoy the best deals!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 bg-[#5C7C3E] hover:bg-[#4E6B32] text-white font-medium text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-sm hoverEffect group"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/#deals"
              className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] border border-[#D9D3C7] font-medium text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-2xs hoverEffect"
            >
              Explore Deals
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#DFD8CB]/80 w-full sm:w-auto">
            <div className="flex -space-x-2.5 overflow-hidden">
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="User 1"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="User 2"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                alt="User 3"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                alt="User 4"
              />
            </div>
            <p className="text-xs sm:text-sm text-[#4E4D4A] font-medium">
              Trusted by <span className="font-semibold text-[#1A1A1A]">10,000+</span> Happy Customers
            </p>
          </div>
        </div>

        {/* Right Product Composition */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-[420px] aspect-4/3 sm:aspect-square flex items-center justify-center">
            {/* Background circular pedestal effect */}
            <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-linear-to-tr from-[#E3DBCB] to-[#FAF8F5] opacity-70 -z-0 blur-xs"></div>
            
            {/* Main Hero Visual using curated high-definition ecommerce lifestyle imagery */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80"
                alt="Premium Lifestyle Products Showcase"
                className="w-full h-full object-contain drop-shadow-2xl rounded-2xl transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Floating Quality Tag */}
            <div className="absolute -bottom-2 -left-2 sm:bottom-4 sm:left-2 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-[#EDE7DC] flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#E5EEDD] flex items-center justify-center text-[#5C7C3E]">
                <Sparkles size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1A1A1A]">100% Authentic</p>
                <p className="text-[10px] text-[#706F6C]">Curated Quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;

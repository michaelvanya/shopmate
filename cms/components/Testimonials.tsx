"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const reviews = [
  {
    quote: "Amazing products and fast delivery! ShopMate is my go-to store for all my needs.",
    name: "John D.",
    role: "Verified Buyer",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  },
  {
    quote: "Great quality at affordable prices. The customer support is also very responsive.",
    name: "Sarah M.",
    role: "Verified Buyer",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  },
  {
    quote: "Very happy with my purchase. Highly recommend ShopMate to everyone!",
    name: "Michael T.",
    role: "Verified Buyer",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
  },
  {
    quote: "The packaging was exquisite and the return policy gives me absolute peace of mind.",
    name: "Emily R.",
    role: "Verified Buyer",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  },
];

const Testimonials = () => {
  const [startIndex, setStartIndex] = useState(0);

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? reviews.length - 3 : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev >= reviews.length - 3 ? 0 : prev + 1));
  };

  return (
    <div className="my-16">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
          What Our Customers Say
        </h2>
      </div>

      {/* Testimonials Carousel Container */}
      <div className="relative flex items-center justify-center">
        {/* Prev Arrow */}
        <button
          onClick={handlePrev}
          aria-label="Previous Testimonial"
          className="absolute -left-3 sm:-left-5 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border border-[#E5E0D5] shadow-md flex items-center justify-center text-[#1A1A1A] hover:bg-[#FAF8F5] hover:text-[#5C7C3E] transition-all hoverEffect"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4 sm:px-8">
          {reviews.slice(startIndex, startIndex + 3).map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-[#ECE7DE] shadow-2xs flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative"
            >
              {/* Quote Badge Icon */}
              <div className="mb-4">
                <div className="w-9 h-9 rounded-full bg-[#EEF4E8] flex items-center justify-center text-[#5C7C3E]">
                  <Quote size={16} className="fill-[#5C7C3E]" />
                </div>
              </div>

              {/* Review Text */}
              <p className="text-sm text-[#4E4D4A] leading-relaxed mb-6 italic">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* User info & Stars */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#F2EEE9]">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E5EEDD]"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#1A1A1A]">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className="fill-[#F5A623] text-[#F5A623]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          aria-label="Next Testimonial"
          className="absolute -right-3 sm:-right-5 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border border-[#E5E0D5] shadow-md flex items-center justify-center text-[#1A1A1A] hover:bg-[#FAF8F5] hover:text-[#5C7C3E] transition-all hoverEffect"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Testimonials;

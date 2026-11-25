import Link from "next/link";
import React from "react";
import Logo from "@/components/Logo";
import { Home, Search } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="bg-[#FAF8F5] min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#ECE7DE] p-8 sm:p-10 text-center shadow-xs space-y-6">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-[#5C7C3E]">404</span>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">
            Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-[#706F6C] leading-relaxed">
            The page you are looking for might have been moved or doesn&apos;t exist.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white bg-[#5C7C3E] hover:bg-[#4E6B32] text-xs font-semibold shadow-2xs hoverEffect"
          >
            <Home size={16} />
            Back to Home
          </Link>
          <Link
            href="/search?query="
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[#1A1A1A] bg-white hover:bg-[#FAF8F5] border border-[#D9D3C7] text-xs font-semibold hoverEffect"
          >
            <Search size={16} />
            Browse All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

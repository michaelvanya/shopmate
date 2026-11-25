import React from "react";
import Logo from "./Logo";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const NoAccessToCart = () => {
  return (
    <div className="flex items-center justify-center py-16 px-4 bg-[#FAF8F5] min-h-[60vh]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#ECE7DE] p-8 shadow-xs text-center space-y-6">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">
            Guest Checkout Is Available
          </h2>
          <p className="text-sm text-[#706F6C] mt-2">
            You can browse and shop without creating a customer account. Enter your email at checkout so the store can follow up on your order.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/"
            className="w-full bg-[#5C7C3E] hover:bg-[#4E6B32] text-white font-semibold py-3 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            <span>Continue shopping</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-[#706F6C] pt-2">
          <ShieldCheck size={14} className="text-[#5C7C3E]" />
          <span>Secure checkout with 100% data privacy</span>
        </div>
      </div>
    </div>
  );
};

export default NoAccessToCart;

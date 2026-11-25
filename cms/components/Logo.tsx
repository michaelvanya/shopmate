import Link from "next/link";
import React from "react";
import { ShoppingBag } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className = "", size = "md" }: LogoProps) => {
  const iconSize = size === "sm" ? 20 : size === "lg" ? 30 : 24;
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <Link href="/" className={`flex items-center gap-2 group ${className}`}>
      <div className="w-9 h-9 rounded-xl bg-[#5C7C3E] flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
        <ShoppingBag size={iconSize} className="stroke-[2.2]" />
      </div>
      <div className="flex items-center">
        <span className={`font-bold tracking-tight text-[#1A1A1A] ${textSize}`}>
          Shop<span className="text-[#5C7C3E]">Mate</span>
        </span>
      </div>
    </Link>
  );
};

export default Logo;

"use client";
import useCartStore from "@/store";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import PriceFormatter from "./PriceFormatter";
import { useIsMounted } from "@/lib/useIsMounted";

const CartIcon = () => {
  const isClient = useIsMounted();
  const groupedItems = useCartStore((state) => state.getGroupedItems());
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const totalCount = groupedItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (!isClient) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F5] text-xs">
        <ShoppingCart size={18} className="text-[#5C7C3E]" />
        <span className="font-semibold text-xs">Cart</span>
      </div>
    );
  }

  return (
    <Link
      href={"/cart"}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F5] hover:bg-[#F3EFE6] text-xs font-semibold text-[#1A1A1A] hoverEffect relative"
    >
      <div className="relative flex items-center justify-center">
        <ShoppingCart size={18} className="text-[#5C7C3E]" />
        {totalCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#5C7C3E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {totalCount}
          </span>
        )}
      </div>
      <div className="hidden sm:flex flex-col text-left leading-tight">
        <span className="text-[10px] text-[#706F6C]">
          {totalCount} {totalCount === 1 ? "item" : "items"}
        </span>
        <span className="font-bold">
          <PriceFormatter amount={getTotalPrice()} className="text-xs font-bold text-[#1A1A1A]" />
        </span>
      </div>
    </Link>
  );
};

export default CartIcon;

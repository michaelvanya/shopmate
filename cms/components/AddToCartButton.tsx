"use client";
import { Product } from "@/sanity.types";
import React from "react";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import PriceFormatter from "./PriceFormatter";
import useCartStore from "@/store";
import QuantityButtons from "./QuantityButtons";
import { ShoppingCart } from "lucide-react";
import { useIsMounted } from "@/lib/useIsMounted";

interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const { addItem, getItemCount } = useCartStore();
  const isClient = useIsMounted();

  const itemCount = getItemCount(product?._id);
  const isOutOfStock = product?.stock === 0;

  if (!isClient) {
    return (
      <div className="h-10 w-full bg-[#FAF8F5] rounded-xl border border-[#ECE7DE] animate-pulse" />
    );
  }

  return (
    <div className="w-full">
      {itemCount > 0 ? (
        <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#ECE7DE] flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#706F6C]">Qty:</span>
            <QuantityButtons product={product} />
          </div>
          <div className="flex items-center justify-between border-t border-[#ECE7DE] pt-1.5">
            <span className="text-[11px] font-semibold text-[#1A1A1A]">Subtotal:</span>
            <PriceFormatter
              amount={product?.price ? product.price * itemCount : 0}
              className="text-xs font-bold text-[#5C7C3E]"
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            addItem(product);
            toast.success(`${product?.name || "Product"} added to cart!`);
          }}
          disabled={isOutOfStock}
          className={twMerge(
            "w-full bg-[#5C7C3E] hover:bg-[#4E6B32] text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-2xs hoverEffect cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5C7C3E]",
            className
          )}
        >
          <ShoppingCart size={15} />
          <span>Add to Cart</span>
        </button>
      )}
    </div>
  );
};

export default AddToCartButton;

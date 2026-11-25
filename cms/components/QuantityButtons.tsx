import React from "react";
import { Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import useCartStore from "@/store";
import { Product } from "@/sanity.types";
import { twMerge } from "tailwind-merge";

interface Props {
  product: Product;
  className?: string;
  borderStyle?: string;
}

const QuantityButtons = ({ product, className, borderStyle }: Props) => {
  const { addItem, removeItem, getItemCount } = useCartStore();
  const itemCount = getItemCount(product?._id);
  const isOutOfStock = product?.stock === 0;

  const handleRemoveProduct = () => {
    removeItem(product?._id);
    if (itemCount > 1) {
      toast.success("Quantity updated");
    } else {
      toast.success(`${product?.name || "Product"} removed from cart`);
    }
  };

  return (
    <div
      className={twMerge(
        "flex items-center gap-1.5 text-xs",
        borderStyle,
        className
      )}
    >
      <button
        type="button"
        className="w-6 h-6 rounded-md bg-white border border-[#E0DACF] hover:bg-[#F3EFE6] flex items-center justify-center text-[#1A1A1A] disabled:opacity-40 transition-colors"
        onClick={handleRemoveProduct}
        disabled={itemCount === 0 || isOutOfStock}
      >
        <Minus size={12} />
      </button>

      <span className="font-bold w-6 text-center text-xs text-[#1A1A1A]">
        {itemCount}
      </span>

      <button
        type="button"
        className="w-6 h-6 rounded-md bg-[#5C7C3E] hover:bg-[#4E6B32] flex items-center justify-center text-white disabled:opacity-40 transition-colors shadow-2xs"
        onClick={() => {
          addItem(product);
          toast.success("Quantity increased");
        }}
        disabled={isOutOfStock}
      >
        <Plus size={12} />
      </button>
    </div>
  );
};

export default QuantityButtons;

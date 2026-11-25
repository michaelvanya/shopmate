import { twMerge } from "tailwind-merge";
import PriceFormatter from "./PriceFormatter";
import React from "react";

interface Props {
  price: number | undefined;
  discount?: number | undefined;
  className?: string;
  label?: string;
}

const PriceView = ({ price, discount, label, className }: Props) => {
  const originalPrice =
    price && discount ? price + (discount * price) / 100 : undefined;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-baseline gap-2">
        <PriceFormatter
          amount={price}
          className={twMerge("font-bold text-[#1A1A1A]", className)}
        />
        {originalPrice && (
          <PriceFormatter
            amount={originalPrice}
            className="line-through text-xs text-[#8C8A85] font-normal"
          />
        )}
      </div>
      {label && (
        <span className="text-[11px] font-medium text-[#706F6C] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#ECE7DE]">
          {label}
        </span>
      )}
    </div>
  );
};

export default PriceView;

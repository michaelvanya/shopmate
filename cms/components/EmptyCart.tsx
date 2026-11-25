import { ShoppingBag, ArrowRight } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const EmptyCart = () => {
  return (
    <div className="bg-white rounded-3xl border border-[#ECE7DE] flex items-center justify-center py-20 px-4 my-8 shadow-2xs">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-5 max-w-md"
      >
        <div className="w-20 h-20 rounded-full bg-[#EEF4E8] border border-[#D8E6CE] flex items-center justify-center mx-auto text-[#5C7C3E]">
          <ShoppingBag size={36} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-[#706F6C] leading-relaxed">
          Looks like you haven&apos;t added any items to your shopping bag yet. Explore our curated collections and discover great deals today!
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#5C7C3E] hover:bg-[#4E6B32] text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-xs hoverEffect"
          >
            Start Shopping
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default EmptyCart;

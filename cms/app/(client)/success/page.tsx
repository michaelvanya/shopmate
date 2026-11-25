"use client";

import useCartStore from "@/store";
import { Check, ShoppingBag } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const clearCart = useCartStore((state) => state.resetCart);

  useEffect(() => {
    if (orderNumber) {
      clearCart();
    }
  }, [orderNumber, clearCart]);

  return (
    <div className="py-12 md:py-24 bg-[#FAF8F5] flex items-center justify-center p-4 min-h-[75vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl border border-[#ECE7DE] shadow-lg px-8 py-12 max-w-xl w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-[#EEF4E8] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs"
        >
          <Check className="text-[#5C7C3E] w-10 h-10 stroke-[2.5]" />
        </motion.div>

        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">
          Order Confirmed!
        </h1>
        <div className="space-y-3 mb-8 text-left text-sm text-[#706F6C]">
          <p>
            Thank you for your purchase. Your order has been recorded, and the
            store team can follow up using the email you provided at checkout.
          </p>
          {orderNumber && (
            <p className="bg-[#FAF8F5] p-3 rounded-xl border border-[#ECE7DE] font-mono text-xs text-[#1A1A1A]">
              Order ID: <span className="font-bold">{orderNumber}</span>
            </p>
          )}
        </div>

        <div className="bg-[#FAF8F5] border border-[#ECE7DE] rounded-2xl p-4 mb-8 text-left">
          <h2 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A] mb-2">
            What to expect next
          </h2>
          <ul className="text-[#706F6C] text-xs space-y-1.5 list-disc list-inside">
            <li>Your order is available to the store team in Sanity Studio</li>
            <li>The store team will follow up about fulfillment</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/"
            className="flex items-center justify-center px-4 py-3 text-xs font-semibold bg-white text-[#1A1A1A] border border-[#D9D3C7] rounded-xl hover:bg-[#FAF8F5] transition-colors"
          >
            <ShoppingBag className="w-4 h-4 mr-1.5" />
            Shop More
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;

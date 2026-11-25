"use client";

import Container from "@/components/Container";
import PriceFormatter from "@/components/PriceFormatter";
import QuantityButtons from "@/components/QuantityButtons";
import { urlFor } from "@/sanity/lib/image";
import useCartStore from "@/store";
import { ShoppingBag, Trash2, ArrowLeft, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import EmptyCart from "@/components/EmptyCart";
import Loader from "@/components/Loader";
import { useIsMounted } from "@/lib/useIsMounted";
import {
  createCheckoutSession,
  Metadata,
} from "@/actions/createCheckoutSession";

const CartPage = () => {
  const {
    deleteCartProduct,
    getTotalPrice,
    getItemCount,
    getSubTotalPrice,
    resetCart,
  } = useCartStore();
  const isClient = useIsMounted();
  const [loading, setLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const groupedItems = useCartStore((state) => state.getGroupedItems());

  if (!isClient) {
    return <Loader />;
  }

  const handleResetCart = () => {
    const confirmed = window.confirm("Are you sure you want to clear your cart?");
    if (confirmed) {
      resetCart();
      toast.success("Cart cleared successfully!");
    }
  };

  const handleCheckout = async () => {
    if (!customerEmail.trim()) {
      toast.error("Enter an email address for your order confirmation.");
      return;
    }

    setLoading(true);
    try {
      const metadata: Metadata = {
        orderNumber: crypto.randomUUID(),
        customerName: "Guest",
        customerEmail: customerEmail.trim(),
      };
      const checkoutUrl = await createCheckoutSession(groupedItems, metadata);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteCartProduct(id);
    toast.success("Item removed from cart");
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8">
      <Container>
        {groupedItems?.length ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-[#ECE7DE] mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF4E8] flex items-center justify-center text-[#5C7C3E]">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                      Shopping Cart
                    </h1>
                    <p className="text-xs sm:text-sm text-[#706F6C]">
                      Review your selected items before checkout
                    </p>
                  </div>
                </div>

                <Link
                  href="/"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C7C3E] hover:underline"
                >
                  <ArrowLeft size={14} /> Continue Shopping
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Product List */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-[#ECE7DE] overflow-hidden shadow-2xs">
                  <div className="hidden sm:grid grid-cols-12 bg-[#FAF8F5] border-b border-[#ECE7DE] p-4 text-xs font-bold text-[#706F6C] uppercase tracking-wider">
                    <span className="col-span-6">Product</span>
                    <span className="col-span-2 text-center">Price</span>
                    <span className="col-span-2 text-center">Quantity</span>
                    <span className="col-span-2 text-right">Total</span>
                  </div>

                  <div className="divide-y divide-[#ECE7DE]">
                    {groupedItems.map(({ product }) => {
                      const count = getItemCount(product._id);
                      return (
                        <div
                          key={product._id}
                          className="p-4 sm:p-5 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-4 transition-colors hover:bg-[#FAF8F5]/50"
                        >
                          {/* Item Info */}
                          <div className="sm:col-span-6 flex items-center gap-3">
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              aria-label="Remove item"
                              className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>

                            {product.image && (
                              <div className="w-16 h-16 rounded-xl bg-[#FAF8F5] border border-[#ECE7DE] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                <Image
                                  src={urlFor(product.image).url()}
                                  alt={product.name || "Product"}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}

                            <div>
                              <h3 className="text-sm font-bold text-[#1A1A1A] line-clamp-1">
                                {product.name}
                              </h3>
                              {product.label && (
                                <span className="text-[10px] text-[#706F6C]">
                                  {product.label}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Unit Price */}
                          <div className="sm:col-span-2 text-left sm:text-center text-sm font-medium text-[#1A1A1A]">
                            <PriceFormatter amount={product.price} />
                          </div>

                          {/* Quantity */}
                          <div className="sm:col-span-2 flex justify-start sm:justify-center">
                            <QuantityButtons product={product} />
                          </div>

                          {/* Subtotal */}
                          <div className="sm:col-span-2 text-left sm:text-right text-sm font-bold text-[#5C7C3E]">
                            <PriceFormatter
                              amount={
                                product.price ? product.price * count : 0
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cart Actions */}
                  <div className="p-4 bg-[#FAF8F5] border-t border-[#ECE7DE] flex items-center justify-between">
                    <button
                      onClick={handleResetCart}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200 transition-colors"
                    >
                      Clear Cart
                    </button>

                    <Link
                      href="/"
                      className="sm:hidden text-xs font-semibold text-[#5C7C3E]"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-[#ECE7DE] p-6 shadow-2xs sticky top-24">
                  <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
                    Order Summary
                  </h2>

                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-2">
                    Email for your order confirmation
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(event) => setCustomerEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="mt-2 w-full bg-[#FAF8F5] text-sm text-[#1A1A1A] px-3 py-2.5 rounded-xl border border-[#E0DACF] focus:outline-hidden focus:border-[#5C7C3E] focus:ring-1 focus:ring-[#5C7C3E]"
                    />
                  </label>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-[#706F6C]">
                      <span>Subtotal</span>
                      <PriceFormatter
                        amount={getSubTotalPrice()}
                        className="text-[#1A1A1A] font-semibold"
                      />
                    </div>

                    <div className="flex justify-between text-[#706F6C]">
                      <span>Savings / Discount</span>
                      <PriceFormatter
                        amount={getSubTotalPrice() - getTotalPrice()}
                        className="text-[#5C7C3E] font-semibold"
                      />
                    </div>

                    <div className="flex justify-between text-[#706F6C]">
                      <span>Shipping</span>
                      <span className="text-[#5C7C3E] font-semibold">Free</span>
                    </div>

                    <div className="border-t border-[#ECE7DE] pt-3 flex justify-between items-baseline font-bold text-lg text-[#1A1A1A]">
                      <span>Total Amount</span>
                      <PriceFormatter
                        amount={getTotalPrice()}
                        className="text-xl font-bold text-[#5C7C3E]"
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full bg-[#5C7C3E] hover:bg-[#4E6B32] text-white font-bold py-3.5 px-4 rounded-xl shadow-xs transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? "Preparing Checkout..." : "Proceed to Checkout"}
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#706F6C]">
                    <ShieldCheck size={15} className="text-[#5C7C3E]" />
                    <span>Guaranteed Safe & Secure Checkout</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyCart />
          )}
        </Container>
      </div>
  );
};

export default CartPage;

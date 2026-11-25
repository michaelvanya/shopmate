"use client";
import React, { useState } from "react";
import Container from "./Container";
import Logo from "./Logo";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, ShieldCheck, Heart } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you for subscribing to ShopMate newsletter!");
    setEmail("");
  };

  return (
    <footer className="bg-[#FAF8F5] border-t border-[#ECE7DE] mt-16 pt-14 pb-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#ECE7DE]">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4">
            <Logo size="md" />
            <p className="text-sm text-[#706F6C] max-w-sm leading-relaxed">
              Your one-stop shop for quality products at the best prices. Crafted
              with modern care for your everyday lifestyle.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5C7C3E] bg-[#EEF4E8] px-3 py-1.5 rounded-lg border border-[#D8E6CE]">
              <ShieldCheck size={16} /> 100% Secure Shopping Guarantee
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-[#1A1A1A] tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-[#706F6C]">
              <li>
                <Link href="/" className="hover:text-[#5C7C3E] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-[#5C7C3E] transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-[#5C7C3E] transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#5C7C3E] transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#5C7C3E] transition-colors">
                  View Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-[#1A1A1A] tracking-wider uppercase">
              Customer Service
            </h4>
            <ul className="space-y-2 text-sm text-[#706F6C]">
              <li>
                <Link href="/orders" className="hover:text-[#5C7C3E] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <span className="hover:text-[#5C7C3E] transition-colors cursor-pointer">
                  Returns & Refunds
                </span>
              </li>
              <li>
                <span className="hover:text-[#5C7C3E] transition-colors cursor-pointer">
                  Shipping Policy
                </span>
              </li>
              <li>
                <span className="hover:text-[#5C7C3E] transition-colors cursor-pointer">
                  Help & FAQs
                </span>
              </li>
              <li>
                <span className="hover:text-[#5C7C3E] transition-colors cursor-pointer">
                  Contact Support
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-[#1A1A1A] tracking-wider uppercase">
              Subscribe to our newsletter
            </h4>
            <p className="text-xs text-[#706F6C] leading-relaxed">
              Get the latest updates on new products and upcoming sales.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-1">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-white text-[#1A1A1A] text-xs px-3.5 py-2.5 rounded-xl border border-[#E0DACF] focus:outline-hidden focus:border-[#5C7C3E] focus:ring-1 focus:ring-[#5C7C3E]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#5C7C3E] hover:bg-[#4E6B32] text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-2xs hoverEffect cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Credits & Payment Methods */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-[#706F6C]">
          <p>© {new Date().getFullYear()} ShopMate. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span>Visa</span>
            <span>•</span>
            <span>Mastercard</span>
            <span>•</span>
            <span>Apple Pay</span>
            <span>•</span>
            <span>Stripe</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

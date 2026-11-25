import React from "react";
import Form from "next/form";
import Container from "./Container";
import Logo from "./Logo";
import CartIcon from "./CartIcon";
import UserMenu from "./UserMenu";
import { Search } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#ECE7DE] shadow-2xs">
      <Container>
        <div className="flex items-center justify-between gap-4 py-3.5">
          {/* Logo */}
          <div className="shrink-0">
            <Logo size="md" />
          </div>

          {/* Search Form */}
          <Form
            action="/search"
            className="flex-1 max-w-xl mx-2 hidden sm:block"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                name="query"
                placeholder="Search products, brands, and categories..."
                className="w-full bg-[#FAF8F5] text-[#1A1A1A] placeholder:text-[#8C8A85] text-sm pl-11 pr-4 py-2.5 rounded-full border border-[#E5E0D5] focus:outline-hidden focus:border-[#5C7C3E] focus:ring-1 focus:ring-[#5C7C3E] hoverEffect"
              />
              <Search
                size={18}
                className="absolute left-4 text-[#8C8A85] pointer-events-none"
              />
            </div>
          </Form>

          {/* User actions */}
          <div className="flex items-center gap-3">
            <CartIcon />
            <UserMenu />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 sm:hidden">
          <Form action="/search" className="w-full">
            <div className="relative flex items-center">
              <input
                type="text"
                name="query"
                placeholder="Search products..."
                className="w-full bg-[#FAF8F5] text-[#1A1A1A] placeholder:text-[#8C8A85] text-sm pl-11 pr-4 py-2 rounded-full border border-[#E5E0D5] focus:outline-hidden focus:border-[#5C7C3E]"
              />
              <Search
                size={18}
                className="absolute left-4 text-[#8C8A85] pointer-events-none"
              />
            </div>
          </Form>
        </div>
      </Container>
    </header>
  );
};

export default Header;

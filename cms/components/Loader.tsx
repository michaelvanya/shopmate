import React from "react";
import Logo from "./Logo";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-3 border-[#EEF4E8] border-t-[#5C7C3E] animate-spin"></div>
      </div>
      <div className="flex flex-col items-center">
        <Logo size="sm" />
        <p className="text-xs text-[#706F6C] mt-2 animate-pulse font-medium">
          Loading ShopMate...
        </p>
      </div>
    </div>
  );
};

export default Loader;

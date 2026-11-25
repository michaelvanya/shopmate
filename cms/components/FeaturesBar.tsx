import React from "react";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $50",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "100% secure payment",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30 days return policy",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support",
  },
];

const FeaturesBar = () => {
  return (
    <div className="bg-white rounded-2xl border border-[#ECE7DE] p-4 sm:p-6 mb-12 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-4 p-2 transition-transform duration-300 hover:translate-x-1"
            >
              <div className="w-12 h-12 rounded-full bg-[#F4F7F0] border border-[#E2ECD8] flex items-center justify-center shrink-0 text-[#5C7C3E]">
                <IconComponent size={22} className="stroke-[1.8]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  {feature.title}
                </h3>
                <p className="text-xs text-[#706F6C]">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturesBar;

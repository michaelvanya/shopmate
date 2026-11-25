import Link from "next/link";
import { PanelsTopLeft } from "lucide-react";

const studioUrl =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "http://localhost:3333/studio";

const UserMenu = () => {
  return (
    <Link
      href={studioUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E5E0D5] bg-[#FAF8F5] hover:bg-[#F3EFE6] text-[#1A1A1A] text-xs sm:text-sm font-medium transition-colors"
      aria-label="Open the Sanity content studio"
    >
      <PanelsTopLeft size={16} />
      <span>Studio</span>
    </Link>
  );
};

export default UserMenu;

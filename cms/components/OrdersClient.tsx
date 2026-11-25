import Container from "@/components/Container";
import Link from "next/link";

export default function OrdersClient() {
  return (
    <div className="bg-[#FAF8F5] min-h-[60vh] flex items-center py-12">
      <Container>
        <div className="bg-white rounded-3xl border border-[#ECE7DE] p-8 max-w-xl mx-auto text-center shadow-2xs">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Order history</h1>
          <p className="mt-3 text-sm text-[#706F6C]">
            Customer accounts are not required for checkout. Order records are
            available to the store team in the Sanity Studio.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 bg-[#5C7C3E] hover:bg-[#4E6B32] text-white text-xs font-semibold px-6 py-3 rounded-xl transition-colors shadow-2xs"
          >
            Browse products
          </Link>
        </div>
      </Container>
    </div>
  );
}

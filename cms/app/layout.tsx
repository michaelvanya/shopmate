import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SanityLive } from "@/sanity/lib/live";
import { Toaster } from "react-hot-toast";
import { VisualEditing } from "next-sanity/visual-editing/client-component";
import { draftMode } from "next/headers";
import DisableDraftMode from "@/components/DisableDraftMode";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopMate - Discover The Best Products for You",
  description: "Explore our wide range of high-quality products at affordable prices. Shop now and enjoy the best deals!",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDraftMode = (await draftMode()).isEnabled;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1A1A1A] antialiased">
        {isDraftMode && (
          <>
            <DisableDraftMode />
            <VisualEditing />
          </>
        )}
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1E293B",
              color: "#FFFFFF",
              borderRadius: "10px",
            },
          }}
        />
        <SanityLive />
      </body>
    </html>
  );
}

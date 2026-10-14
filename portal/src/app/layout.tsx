import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: brand.name,
  icons: {
    icon: [
      { url: "/favicon.ico?v=bg-travel-emblem", sizes: "any" },
      { url: "/bg-travel/icon.png?v=emblem", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/bg-travel/apple-touch-icon.png?v=emblem", sizes: "180x180" },
  },
  description: `${brand.name} — дотоод систем`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="mn" className={cn("font-sans", manrope.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

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

import type { Metadata } from "next";
import { PublicProductList } from "@/features/market/components/PublicProductList";

export const metadata: Metadata = {
  title: "Бараа",
  description: "Нээлттэй барааны жагсаалт",
};

export default function MarketPage() {
  return <PublicProductList />;
}

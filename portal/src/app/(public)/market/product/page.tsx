import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicProductDetail } from "@/features/market/components/PublicProductDetail";

export const metadata: Metadata = { title: "Бараа" };

// useSearchParams() нь Suspense хүрээ шаарддаг — эс тэгвэл статик хуудас
// динамик болж хувирна.
export default function ProductDetailPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
      <PublicProductDetail />
    </Suspense>
  );
}

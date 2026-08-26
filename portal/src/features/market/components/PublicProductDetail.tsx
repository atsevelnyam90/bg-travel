"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicProduct } from "../hooks/usePublicProducts";
import { formatMoney } from "../money";

/**
 * ⚠️ Яагаад `/market/[slug]` биш, `/market/product?slug=…` вэ:
 *
 * Capacitor build нь `output: "export"` ажилладаг бөгөөд dynamic route
 * `generateStaticParams()` шаарддаг. Барааны жагсаалт байнга өөрчлөгддөг тул
 * build үед бүх slug-ыг мэдэх боломжгүй.
 *
 * Батлагдсан: `[slug]` route-той үед `pnpm build` (web) амжилттай, харин
 * `pnpm build:mobile` "Page /market/[slug] is missing generateStaticParams()"
 * гэж унасан. CI-ийн portal job build:mobile ажиллуулдаг тул PR дээр баригдана.
 *
 * Query param нь статик хуудас хэвээр үлдэж, mobile болон web хоёуланд ажиллана.
 */
export function PublicProductDetail() {
  const slug = useSearchParams().get("slug") ?? "";
  const { data: product, isPending, isError } = usePublicProduct(slug);

  if (!slug || isError) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Бараа олдсонгүй</EmptyTitle>
          <EmptyDescription>Холбоос буруу эсвэл бараа устсан байна.</EmptyDescription>
        </EmptyHeader>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/market">Жагсаалт руу</Link>
        </Button>
      </Empty>
    );
  }

  if (isPending) return <Skeleton className="h-64 w-full rounded-lg" />;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/market">
          <ArrowLeft />
          Буцах
        </Link>
      </Button>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h1 className="font-semibold text-2xl tracking-tight">{product.name}</h1>
          {product.description ? (
            <p className="text-muted-foreground">{product.description}</p>
          ) : null}
          <p className="font-semibold text-xl tabular-nums">
            {formatMoney(product.priceMinor, product.currency)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

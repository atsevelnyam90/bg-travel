"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicProducts } from "../hooks/usePublicProducts";
import { formatMoney } from "../money";

export function PublicProductList() {
  const [search, setSearch] = useState("");
  const query = useMemo(() => ({ page: 1, pageSize: 24, search: search || undefined }), [search]);
  const { data, isPending } = usePublicProducts(query);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="font-semibold text-2xl tracking-tight">Бараа</h1>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Бараа хайх…"
          className="max-w-sm"
          aria-label="Бараа хайх"
        />
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton, дараалал өөрчлөгдөхгүй
            <Skeleton key={index} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((product) => (
            <Link key={product.id} href={`/market/product?slug=${product.slug}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardContent className="space-y-2 p-4">
                  <h2 className="font-medium">{product.name}</h2>
                  {product.description ? (
                    <p className="line-clamp-2 text-muted-foreground text-sm">
                      {product.description}
                    </p>
                  ) : null}
                  <p className="font-semibold tabular-nums">
                    {formatMoney(product.priceMinor, product.currency)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Бараа олдсонгүй</EmptyTitle>
            <EmptyDescription>Хайлтаа өөрчилж үзнэ үү.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}

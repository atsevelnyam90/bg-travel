"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { products } from "@/api/generated/contracts";
import { getPublicProduct, listPublicProducts } from "../api";

export const marketKeys = {
  all: ["market"] as const,
  list: (query: products.ListProductsQuery) => [...marketKeys.all, "list", query] as const,
  detail: (slug: string) => [...marketKeys.all, "detail", slug] as const,
};

export function usePublicProducts(query: products.ListProductsQuery) {
  return useQuery({
    queryKey: marketKeys.list(query),
    queryFn: () => listPublicProducts(query),
    placeholderData: keepPreviousData,
  });
}

export function usePublicProduct(slug: string) {
  return useQuery({
    queryKey: marketKeys.detail(slug),
    queryFn: () => getPublicProduct(slug),
    enabled: slug.length > 0,
  });
}

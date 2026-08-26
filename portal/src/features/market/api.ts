import type { products } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

// ─── Public (нэвтрэлтгүй) ───────────────────────────────────────────────────
export const listPublicProducts = (query: products.ListProductsQuery) =>
  api.get<products.ListPublicProductsResponse>("/public/products", {
    query,
    // Нэвтрээгүй хүн үзэх тул 401 дээр токен сэргээх оролдлого утгагүй.
    skipAuthRefresh: true,
  });

export const getPublicProduct = (slug: string) =>
  api.get<products.PublicProduct>(`/public/products/${encodeURIComponent(slug)}`, {
    skipAuthRefresh: true,
  });

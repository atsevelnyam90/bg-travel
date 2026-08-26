// ⚠️ АВТОМАТААР ҮҮССЭН ФАЙЛ — ГАРААР БҮҮ ЗАС.
// Эх сурвалж: backend/packages/contracts/src
// Дахин үүсгэх: pnpm gen:contracts
import { z } from "zod";
import { paginatedSchema, paginationQuerySchema } from "./shared";

export const productStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type ProductStatus = z.infer<typeof productStatusSchema>;

export const productSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  /// Мөнгө нь ЦЭЛ тоо (₮-ийн хувьд мөнгө). Float ашиглахгүй.
  priceMinor: z.number().int(),
  discountMinor: z.number().int(),
  currency: z.string(),
  status: productStatusSchema,
  imageUrl: z.url().nullable(),
  /** Optimistic locking — засахдаа буцааж илгээнэ. */
  version: z.number().int(),
  createdAt: z.iso.datetime(),
});
export type Product = z.infer<typeof productSchema>;

/** Public талд гардаг талбарууд — DRAFT/ARCHIVED огт харагдахгүй. */
export const publicProductSchema = productSchema.omit({
  status: true,
  createdAt: true,
  version: true,
});
export type PublicProduct = z.infer<typeof publicProductSchema>;

export const listProductsQuerySchema = paginationQuerySchema.extend({
  status: productStatusSchema.optional(),
});
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

export const listProductsResponseSchema = paginatedSchema(productSchema);
export type ListProductsResponse = z.infer<typeof listProductsResponseSchema>;

export const listPublicProductsResponseSchema = paginatedSchema(publicProductSchema);
export type ListPublicProductsResponse = z.infer<typeof listPublicProductsResponseSchema>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const optionalUrlSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.url("Зургийн хаяг буруу").nullable().optional(),
);

/** Үүсгэхэд version хэрэггүй — шинэ мөр 0-ээс эхэлнэ. */
export const createProductSchema = z.object({
  name: z.string().min(1, "Нэр оруулна уу").max(200),
  slug: z
    .string()
    .min(1, "Slug оруулна уу")
    .max(200)
    .regex(slugPattern, "Зөвхөн жижиг латин үсэг, тоо, зураас"),
  description: z.string().max(5000).nullable().optional(),
  priceMinor: z.number().int().min(0, "Үнэ сөрөг байж болохгүй"),
  discountMinor: z.number().int().min(0, "Хөнгөлөлт сөрөг байж болохгүй").default(0),
  status: productStatusSchema,
  imageUrl: optionalUrlSchema,
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

/**
 * Засахад уншсан үеийн хувилбарыг ЗААВАЛ илгээнэ. Сервер DB-тэй тулгаж,
 * зөрвөл 409 буцаана — сүүлд бичсэн нь нөгөөг чимээгүй дарахгүй.
 *
 * Форм үргэлж энэ схемийг ашиглана (шинэ бараанд version 0). Үүсгэх route нь
 * `createProductSchema`-аар задлах тул илүү талбар зүгээр л хаягдана.
 */
export const updateProductSchema = createProductSchema.extend({
  version: z.number().int(),
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

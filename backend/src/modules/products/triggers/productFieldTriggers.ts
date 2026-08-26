import type { BuilderFieldTriggerContext } from "@winu/builder-backend/usecases";
import { builder as builderContract } from "@winu/contracts";

export const PRODUCT_SLUG_FIELD_TRIGGER = "/api/v1/builder-triggers/product-slug";
export const PRODUCT_DISCOUNT_FIELD_TRIGGER = "/api/v1/products/triggers/discount-from-price";

function slugify(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function productSlugFieldTrigger(context: BuilderFieldTriggerContext) {
  return builderContract.builderFieldTriggerResponseSchema.parse({
    schema: [{ field: "slug", value: slugify(context.value) }],
  });
}

export function productDiscountFromPriceFieldTrigger(context: BuilderFieldTriggerContext) {
  const priceMinor = Number(context.value);
  const discountMinor = Number.isFinite(priceMinor) ? Math.floor(priceMinor * 0.1) : 0;

  return builderContract.builderFieldTriggerResponseSchema.parse({
    schema: [{ field: "discountMinor", value: discountMinor }],
  });
}

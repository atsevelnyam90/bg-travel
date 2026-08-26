import type { BuilderFieldTriggerContext } from "@winu/builder-backend/usecases";
import type { builder as builderContract } from "@winu/contracts";
import { badRequest } from "@/lib/errors";
import {
  PRODUCT_DISCOUNT_FIELD_TRIGGER,
  PRODUCT_SLUG_FIELD_TRIGGER,
  productDiscountFromPriceFieldTrigger,
  productSlugFieldTrigger,
} from "@/modules/products/triggers";

type AppFieldTriggerHandler = (
  context: BuilderFieldTriggerContext,
) => builderContract.BuilderFieldTriggerResponse;

const appFieldTriggerHandlers: Record<string, AppFieldTriggerHandler> = {
  [PRODUCT_DISCOUNT_FIELD_TRIGGER]: productDiscountFromPriceFieldTrigger,
  [PRODUCT_SLUG_FIELD_TRIGGER]: productSlugFieldTrigger,
};

export function runAppFieldTrigger(
  context: BuilderFieldTriggerContext,
): builderContract.BuilderFieldTriggerResponse {
  const handler = appFieldTriggerHandlers[context.trigger.action];
  if (!handler) {
    throw badRequest(`Builder field trigger action бүртгэлгүй байна: ${context.trigger.action}`);
  }
  return handler(context);
}

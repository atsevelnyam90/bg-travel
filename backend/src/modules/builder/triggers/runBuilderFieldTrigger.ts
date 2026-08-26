import type { BuilderFieldTriggerContext } from "@winu/builder-backend/usecases";
import { builder as builderContract } from "@winu/contracts";
import { builderBadRequest } from "../shared/builderErrors";

function slugify(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function productSlugTrigger(context: BuilderFieldTriggerContext) {
  return builderContract.builderFieldTriggerResponseSchema.parse({
    schema: [{ field: "slug", value: slugify(context.value) }],
  });
}

const fieldTriggerHandlers: Record<
  string,
  (context: BuilderFieldTriggerContext) => builderContract.BuilderFieldTriggerResponse
> = {
  "/api/v1/builder-triggers/product-slug": productSlugTrigger,
};

export async function runBuilderFieldTrigger(
  context: BuilderFieldTriggerContext,
): Promise<builderContract.BuilderFieldTriggerResponse> {
  const handler = fieldTriggerHandlers[context.trigger.action];
  if (!handler) {
    throw builderBadRequest(
      `Builder field trigger action бүртгэлгүй байна: ${context.trigger.action}`,
    );
  }
  return handler(context);
}

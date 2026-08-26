import { describe, expect, it } from "vitest";
import {
  builderFieldTriggerResponseSchema,
  builderFormSchema,
  runBuilderFieldTriggerSchema,
} from "./builder";

describe("builder field triggers", () => {
  it("normalizes missing field trigger defaults", () => {
    const schema = builderFormSchema.parse({
      fields: [
        {
          key: "name",
          label: "Нэр",
          type: "text",
          required: true,
          triggers: [{ event: "onChange", action: "/api/v1/builder-triggers/product-slug" }],
        },
      ],
    });

    expect(schema.fields[0]?.triggers[0]).toMatchObject({
      event: "onChange",
      action: "/api/v1/builder-triggers/product-slug",
      enabled: true,
      debounceMs: 300,
      config: {},
    });
    expect(schema.fields[0]).toMatchObject({
      hidden: false,
      disabled: false,
    });
  });

  it("keeps full form values in field trigger input", () => {
    const input = runBuilderFieldTriggerSchema.parse({
      value: "iPhone XR",
      values: { name: "iPhone XR", hiddenCode: "PX-1" },
    });

    expect(input.values.hiddenCode).toBe("PX-1");
  });

  it("accepts schema patches from field trigger output", () => {
    const output = builderFieldTriggerResponseSchema.parse({
      schema: [{ field: "slug", value: "iphone-xr" }],
    });

    expect(output).toMatchObject({
      schema: [{ field: "slug", value: "iphone-xr" }],
      valuesPatch: {},
      fieldErrors: {},
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  builderFieldTriggerResponseSchema,
  builderFormSchema,
  builderListSchema,
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
    expect(schema.presentation).toBe("dialog");
  });

  it("keeps form and subform presentation settings", () => {
    const schema = builderFormSchema.parse({
      presentation: "drawer",
      fields: [{ key: "name", label: "Нэр", type: "text" }],
      subforms: [
        {
          key: "items",
          label: "Мөрүүд",
          viewId: "11111111-1111-4111-8111-111111111111",
          parentField: "id",
          childField: "parentId",
          presentation: "drawer",
        },
      ],
    });

    expect(schema.presentation).toBe("drawer");
    expect(schema.subforms[0]?.presentation).toBe("drawer");
  });

  it("accepts multiple list ordering rules and normalizes the legacy shape", () => {
    const columns = [{ key: "name", label: "Name", sortable: true }];
    const multiple = builderListSchema.parse({
      columns,
      orderBy: [
        { field: "status", direction: "asc" },
        { field: "created_at", direction: "desc" },
      ],
    });
    const legacy = builderListSchema.parse({
      columns,
      orderBy: { field: "created_at", direction: "desc" },
    });

    expect(multiple.orderBy).toHaveLength(2);
    expect(legacy.orderBy).toEqual([{ field: "created_at", direction: "desc" }]);
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

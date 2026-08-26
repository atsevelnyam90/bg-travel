import { describe, expect, it } from "vitest";
import {
  createBuilderEntryDefaultValues,
  createBuilderFormDefaultValues,
  formatBuilderRuntimeValue,
} from "./runtimeUtils";

const schema = {
  fields: [
    { key: "name", type: "text" },
    { key: "isActive", type: "checkbox" },
  ],
};

describe("runtimeUtils", () => {
  it("creates empty form values from a builder schema", () => {
    expect(createBuilderFormDefaultValues(schema)).toEqual({
      values: { name: "", isActive: false },
    });
  });

  it("keeps editing values when creating entry defaults", () => {
    expect(
      createBuilderEntryDefaultValues(
        { form: { schema } },
        { id: "entry-1", values: { name: "Owner" }, version: 4 },
      ),
    ).toEqual({
      values: { name: "Owner", isActive: false },
      version: 4,
    });
  });

  it("formats common runtime values", () => {
    expect(formatBuilderRuntimeValue(null)).toBe("—");
    expect(formatBuilderRuntimeValue(true)).toBe("Тийм");
    expect(formatBuilderRuntimeValue(12345)).toBe("12,345");
  });
});

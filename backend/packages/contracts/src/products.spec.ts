import { describe, expect, it } from "vitest";
import { createProductSchema } from "./products";

const validProductInput = {
  name: "iPhone XR",
  slug: "iphone-xr",
  priceMinor: 1000000,
  status: "DRAFT",
} as const;

describe("createProductSchema", () => {
  it("allows missing optional imageUrl", () => {
    expect(createProductSchema.parse(validProductInput).imageUrl).toBeUndefined();
  });

  it("normalizes empty optional imageUrl to null", () => {
    expect(createProductSchema.parse({ ...validProductInput, imageUrl: "" }).imageUrl).toBeNull();
    expect(
      createProductSchema.parse({ ...validProductInput, imageUrl: "   " }).imageUrl,
    ).toBeNull();
  });

  it("rejects invalid non-empty imageUrl", () => {
    expect(() =>
      createProductSchema.parse({ ...validProductInput, imageUrl: "not-a-url" }),
    ).toThrow("Зургийн хаяг буруу");
  });
});

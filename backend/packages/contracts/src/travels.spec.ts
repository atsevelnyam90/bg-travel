import { describe, expect, it } from "vitest";
import { publicTravelsQuerySchema } from "./travels";

describe("publicTravelsQuerySchema", () => {
  it("defaults to Mongolian and accepts supported locales", () => {
    expect(publicTravelsQuerySchema.parse({})).toEqual({ locale: "mn" });
    expect(publicTravelsQuerySchema.parse({ locale: "en" })).toEqual({ locale: "en" });
    expect(publicTravelsQuerySchema.parse({ locale: "zh" })).toEqual({ locale: "zh" });
    expect(publicTravelsQuerySchema.parse({ locale: "ko" })).toEqual({ locale: "ko" });
    expect(publicTravelsQuerySchema.parse({ category: "WEDDING", locale: "en" })).toEqual({
      category: "WEDDING",
      locale: "en",
    });
  });

  it("rejects unsupported locales and categories", () => {
    expect(() => publicTravelsQuerySchema.parse({ locale: "fr" })).toThrow();
    expect(() => publicTravelsQuerySchema.parse({ category: "UNKNOWN" })).toThrow();
  });
});

import { describe, expect, it } from "vitest";
import { createOrderReference } from "./orderReference";

describe("createOrderReference", () => {
  it("банканд ашиглах богино ORD код үүсгэнэ", () => {
    expect(createOrderReference()).toMatch(/^ORD-[A-F0-9]{16}$/);
  });

  it("олноор үүсгэсэн код давхцахгүй", () => {
    const references = Array.from({ length: 1_000 }, createOrderReference);
    expect(new Set(references).size).toBe(references.length);
  });
});

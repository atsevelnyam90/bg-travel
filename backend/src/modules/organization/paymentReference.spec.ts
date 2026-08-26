import { describe, expect, it } from "vitest";
import { generateReference, REFERENCE_PATTERN } from "./paymentReference";

describe("Төлбөрийн лавлагаа", () => {
  it("8 тэмдэгттэй, зөвшөөрөгдсөн цагаан толгойгоор", () => {
    for (let i = 0; i < 200; i += 1) {
      expect(generateReference()).toMatch(REFERENCE_PATTERN);
    }
  });

  it("андуурагдах тэмдэгт агуулахгүй (0 O 1 I L S 5 2 Z 8 B)", () => {
    const ambiguous = /[01ILS52Z8B]/;
    for (let i = 0; i < 200; i += 1) {
      expect(generateReference()).not.toMatch(ambiguous);
    }
  });

  it("EMVCo-д аюулгүй — зөвхөн A-Z0-9", () => {
    expect(generateReference()).toMatch(/^[A-Z0-9]+$/);
  });

  it("давтагдал бага (1000 удаа үүсгэхэд)", () => {
    const seen = new Set(Array.from({ length: 1000 }, generateReference));
    expect(seen.size).toBeGreaterThan(995);
  });
});

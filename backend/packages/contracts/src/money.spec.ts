import { describe, expect, it } from "vitest";
import {
  addVat,
  distribute,
  extractVat,
  formatMinor,
  multiplyMinor,
  roundHalfUp,
  toMinor,
} from "./money";

describe("Мөнгө", () => {
  it("хагасыг дээш, сөрөгт тэгш хэмтэй", () => {
    expect(roundHalfUp(0.5)).toBe(1);
    expect(roundHalfUp(1.5)).toBe(2);
    // Math.round(-0.5) === -0 буюу дээш — бид тэгш хэмтэй байлгана
    expect(roundHalfUp(-0.5)).toBe(-1);
    expect(roundHalfUp(-1.5)).toBe(-2);
  });

  it("НӨАТ нэмэхэд net + vat === gross", () => {
    const result = addVat(100_000);
    expect(result.vat).toBe(10_000);
    expect(result.net + result.vat).toBe(result.gross);
  });

  it("НӨАТ задлахад net + vat === gross (дугуйруулсны дараа ч)", () => {
    for (const gross of [110_000, 99_999, 1, 7, 12_345, 1_000_003]) {
      const result = extractVat(gross);
      expect(result.net + result.vat).toBe(gross);
    }
  });

  it("110,000-аас НӨАТ 10,000", () => {
    expect(extractVat(110_000).vat).toBe(10_000);
  });

  it("distribute нийлбэрийг ЯГ хадгална", () => {
    for (const [total, weights] of [
      [100, [1, 1, 1]],
      [10_000, [3, 5, 2]],
      [7, [1, 1]],
      [1, [1, 1, 1]],
    ] as Array<[number, number[]]>) {
      const shares = distribute(total, weights);
      expect(shares.reduce((sum, share) => sum + share, 0)).toBe(total);
    }
  });

  it("жин тэг бол бүгд тэг", () => {
    expect(distribute(100, [0, 0])).toEqual([0, 0]);
  });

  it("toMinor / formatMinor", () => {
    expect(toMinor(1200)).toBe(120_000);
    expect(formatMinor(120_000)).toContain("1");
    expect(formatMinor(120_000)).toContain("₮");
  });

  it("unit price-ийг тоо ширхгээр үржүүлнэ", () => {
    expect(multiplyMinor(125_000, 3)).toBe(375_000);
    expect(() => multiplyMinor(Number.MAX_SAFE_INTEGER, 2)).toThrow(RangeError);
  });
});

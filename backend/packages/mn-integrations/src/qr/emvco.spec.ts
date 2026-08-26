import { describe, expect, it } from "vitest";
import { buildEmvcoQr, parseEmvcoQr } from "./emvco";

describe("EMVCo QR", () => {
  it("бүтээсэн QR-аа буцааж уншина (round trip)", () => {
    const raw = buildEmvcoQr({
      accountNumber: "5000123456",
      accountName: "TEST MERCHANT",
      currency: "MNT",
      amount: 1500,
      merchantCity: "Ulaanbaatar",
    });

    const parsed = parseEmvcoQr(raw);

    expect(parsed.accountOrId).toBe("5000123456");
    expect(parsed.merchantName).toBe("TEST MERCHANT");
    expect(parsed.amount).toBe("1500.00");
    expect(parsed.country).toBe("MN");
  });

  it("CRC-г төгсгөлд нь залгана", () => {
    const raw = buildEmvcoQr({ accountNumber: "5000123456", accountName: "TEST" });
    // Сүүлийн 8 тэмдэгт: "6304" + 4 оронтой CRC
    expect(raw.slice(-8, -4)).toBe("6304");
    expect(raw.slice(-4)).toMatch(/^[0-9A-F]{4}$/);
  });

  it("дүнгүй QR нь статик (tag 01 = 11) байна", () => {
    const raw = buildEmvcoQr({ accountNumber: "5000123456", accountName: "TEST" });
    expect(raw).toContain("010211");
  });

  it("дансны дугааргүй бол шидэнэ", () => {
    expect(() => buildEmvcoQr({ accountNumber: "", accountName: "TEST" })).toThrow();
  });
});

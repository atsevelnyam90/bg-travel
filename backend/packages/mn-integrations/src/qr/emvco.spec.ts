import { describe, expect, it } from "vitest";
import { buildEmvcoQr, parseEmvcoQr } from "./emvco";

describe("EMVCo QR", () => {
  it("бүтээсэн QR-аа буцааж уншина (round trip)", () => {
    const raw = buildEmvcoQr({
      accountNumber: "MN770005005619113075",
      accountName: "TEST MERCHANT",
      bankId: "AGMOMNUB",
      merchantCategoryCode: "4722",
      transactionType: "02",
      currency: "MNT",
      amount: 1500,
      merchantCity: "Ulaanbaatar",
    });

    const parsed = parseEmvcoQr(raw);

    expect(parsed.merchantAccountGui).toBe("A0000008430001");
    expect(parsed.bankId).toBe("AGMOMNUB");
    expect(parsed.accountOrId).toBe("MN770005005619113075");
    expect(parsed.merchantCategoryCode).toBe("4722");
    expect(parsed.transactionType).toBe("02");
    expect(parsed.merchantName).toBe("TEST MERCHANT");
    expect(parsed.amount).toBe("1500.00");
    expect(parsed.country).toBe("MN");
  });

  it("CRC-г төгсгөлд нь залгана", () => {
    const raw = buildEmvcoQr({
      accountNumber: "MN770005005619113075",
      accountName: "TEST",
      bankId: "AGMOMNUB",
      merchantCategoryCode: "4722",
      transactionType: "02",
    });
    // Сүүлийн 8 тэмдэгт: "6304" + 4 оронтой CRC
    expect(raw.slice(-8, -4)).toBe("6304");
    expect(raw.slice(-4)).toMatch(/^[0-9A-F]{4}$/);
  });

  it("дүнгүй QR нь статик (tag 01 = 11) байна", () => {
    const raw = buildEmvcoQr({
      accountNumber: "MN770005005619113075",
      accountName: "TEST",
      bankId: "AGMOMNUB",
      merchantCategoryCode: "4722",
      transactionType: "02",
    });
    expect(raw).toContain("010211");
  });

  it("дансны дугааргүй бол шидэнэ", () => {
    expect(() =>
      buildEmvcoQr({
        accountNumber: "",
        accountName: "TEST",
        bankId: "AGMOMNUB",
        merchantCategoryCode: "4722",
        transactionType: "02",
      }),
    ).toThrow();
  });

  it("Монголбанкны merchant QR-ийн тогтмол GUI, гүйлгээний төрөл, утгын tag ашиглана", () => {
    const raw = buildEmvcoQr({
      accountNumber: "MN770005005619113075",
      accountName: "KOSO LINE",
      bankId: "AGMOMNUB",
      merchantCategoryCode: "4722",
      transactionType: "02",
      purpose: "ORD-2026-000001",
    });

    expect(raw).toContain("0014A0000008430001");
    expect(raw).toContain("62190815ORD-2026-000001");
    expect(raw).toContain("800202");
  });
});

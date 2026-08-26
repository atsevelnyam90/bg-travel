import { describe, expect, it } from "vitest";
import { findBankByBic, findBankByCode, MN_BANKS } from "./index";

describe("Монголын банкууд", () => {
  it("жагсаалт хоосон биш", () => {
    expect(MN_BANKS.length).toBeGreaterThan(5);
  });

  it("код бүр давхардаагүй", () => {
    const codes = MN_BANKS.map((bank) => bank.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("BIC бүр давхардаагүй", () => {
    const bics = MN_BANKS.map((bank) => bank.bic);
    expect(new Set(bics).size).toBe(bics.length);
  });

  it("Хаан банкийг кодоор олно (KB CGW-д to_bank болж ордог)", () => {
    const khan = findBankByCode("050000");
    expect(khan).toBeDefined();
    expect(khan?.bic).toBeTruthy();
  });

  it("BIC-ээр олсон банк код нь буцаж таарна", () => {
    const first = MN_BANKS[0];
    expect(findBankByBic(first.bic)?.code).toBe(first.code);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { nextDocumentNumber } from "./documentNumber";

describe("Баримтын дугаар", () => {
  beforeEach(async () => {
    await prisma.documentSequence.deleteMany();
  });

  it("дараалан өснө", async () => {
    const at = new Date("2026-03-15T00:00:00Z");
    expect(await nextDocumentNumber({ name: "invoice", prefix: "INV", at })).toBe(
      "INV-2026-000001",
    );
    expect(await nextDocumentNumber({ name: "invoice", prefix: "INV", at })).toBe(
      "INV-2026-000002",
    );
  });

  it("нэр бүр өөрийн дараалалтай", async () => {
    const at = new Date("2026-03-15T00:00:00Z");
    await nextDocumentNumber({ name: "invoice", prefix: "INV", at });
    expect(await nextDocumentNumber({ name: "order", prefix: "ORD", at })).toBe("ORD-2026-000001");
  });

  it("жил солигдоход 1-ээс эхэлнэ", async () => {
    await nextDocumentNumber({
      name: "invoice",
      prefix: "INV",
      at: new Date("2026-12-31T00:00:00Z"),
    });
    const next = await nextDocumentNumber({
      name: "invoice",
      prefix: "INV",
      at: new Date("2027-01-01T00:00:00Z"),
    });
    expect(next).toBe("INV-2027-000001");
  });

  it("сар бүрийн мөчлөг", async () => {
    const at = new Date("2026-08-05T00:00:00Z");
    expect(await nextDocumentNumber({ name: "receipt", prefix: "RC", period: "monthly", at })).toBe(
      "RC-2026-08-000001",
    );
  });

  it("ЗЭРЭГ 50 дуудахад давхардахгүй (уралдааны шалгуур)", async () => {
    const at = new Date("2026-03-15T00:00:00Z");
    const numbers = await Promise.all(
      Array.from({ length: 50 }, () => nextDocumentNumber({ name: "concurrent", prefix: "C", at })),
    );

    // count()+1 ашигласан бол энд давхардал гарна.
    expect(new Set(numbers).size).toBe(50);
    expect(numbers).toContain("C-2026-000001");
    expect(numbers).toContain("C-2026-000050");
  });
});

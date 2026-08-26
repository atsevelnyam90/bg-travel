import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./passwordService";

describe("passwordService", () => {
  it("зөв нууц үгийг танина", async () => {
    const hash = await hashPassword("Нууц-Үг-123");
    expect(await verifyPassword("Нууц-Үг-123", hash)).toBe(true);
  });

  it("буруу нууц үгийг татгалзана", async () => {
    const hash = await hashPassword("Нууц-Үг-123");
    expect(await verifyPassword("Нууц-Үг-124", hash)).toBe(false);
  });

  it("ижил нууц үг тус бүрдээ өөр hash үүсгэнэ (salt)", async () => {
    const a = await hashPassword("ижил");
    const b = await hashPassword("ижил");
    expect(a).not.toBe(b);
  });

  it("hash дотор параметрүүд хадгалагдана", async () => {
    const hash = await hashPassword("test");
    expect(hash.split("$")).toHaveLength(6);
    expect(hash.startsWith("scrypt$")).toBe(true);
  });

  it("гэмтсэн hash-д false буцаана, шидэхгүй", async () => {
    expect(await verifyPassword("test", "хог")).toBe(false);
    expect(await verifyPassword("test", "")).toBe(false);
  });

  it("Unicode-ыг хэвийн болгоно (NFKC)", async () => {
    const hash = await hashPassword("Café");
    expect(await verifyPassword("Café", hash)).toBe(true);
  });
});

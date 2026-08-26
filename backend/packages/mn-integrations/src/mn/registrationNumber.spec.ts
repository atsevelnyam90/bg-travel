import { describe, expect, it } from "vitest";
import { parseMongolianRegistrationNumber } from "./registrationNumber";

describe("Регистрийн дугаар", () => {
  it("буруу урттай бол null", () => {
    expect(parseMongolianRegistrationNumber("УБ123")).toBeNull();
  });

  it("хоосон бол null", () => {
    expect(parseMongolianRegistrationNumber("")).toBeNull();
  });

  it("латин үсэгтэй бол null (кирилл байх ёстой)", () => {
    expect(parseMongolianRegistrationNumber("AB95010112")).toBeNull();
  });

  it("зөв дугаараас төрсөн он сар өдөр, хүйс гаргана", () => {
    const parsed = parseMongolianRegistrationNumber("УБ95010112");
    expect(parsed).not.toBeNull();
    expect(parsed?.birthYear).toBe(1995);
    expect(parsed?.birthMonth).toBe(1);
    expect(parsed?.birthDay).toBe(1);
    expect(["male", "female"]).toContain(parsed?.gender);
  });
});

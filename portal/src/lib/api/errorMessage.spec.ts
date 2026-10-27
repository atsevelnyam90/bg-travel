import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_API_BASE_URL: "http://localhost:4000/api/v1" },
}));

import { ApiError } from "./apiClient";
import { apiErrorMessage } from "./errorMessage";

describe("apiErrorMessage", () => {
  it("explains a database outage in the context of the failed action", () => {
    const error = new ApiError(503, {
      message: "Өгөгдлийн сантай холбогдож чадсангүй. Түр хүлээгээд дахин оролдоно уу.",
      code: "DATABASE_UNAVAILABLE",
    });

    expect(apiErrorMessage(error, "Нэвтрэх боломжгүй байна")).toBe(
      "Нэвтрэх боломжгүй байна. Өгөгдлийн сантай холбогдож чадсангүй. Түр хүлээгээд дахин оролдоно уу.",
    );
  });

  it("includes the request id for an unexpected server error", () => {
    const error = new ApiError(500, {
      message: "Дотоод алдаа гарлаа",
      code: "INTERNAL_ERROR",
      requestId: "request-123",
    });

    expect(apiErrorMessage(error, "Аяллыг хадгалж чадсангүй")).toContain("Лавлах код: request-123");
  });

  it("shows field-level validation details", () => {
    const error = new ApiError(400, {
      message: "Өгөгдөл буруу байна",
      code: "VALIDATION_ERROR",
      details: [{ path: ["departures", 0, "capacity"], message: "1-ээс бага байж болохгүй" }],
    });

    expect(apiErrorMessage(error)).toContain("departures.0.capacity: 1-ээс бага байж болохгүй");
  });

  it("explains a network failure", () => {
    expect(apiErrorMessage(new TypeError("Failed to fetch"), "Нэвтрэх боломжгүй байна")).toBe(
      "Нэвтрэх боломжгүй байна. Сервертэй холбогдож чадсангүй. Холболтоо шалгаад дахин оролдоно уу.",
    );
  });
});

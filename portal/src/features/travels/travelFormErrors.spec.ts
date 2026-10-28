import { describe, expect, it } from "vitest";
import { getTravelFormErrorFeedback } from "./travelFormErrors";

describe("getTravelFormErrorFeedback", () => {
  it("names a required general field and opens its language tab", () => {
    expect(
      getTravelFormErrorFeedback({
        name: { type: "too_small", message: "Required" },
      }),
    ).toEqual({
      tab: "general",
      locale: "mn",
      message: "“Аяллын нэр” талбарыг зөв бөглөнө үү.",
    });
  });

  it("opens the language tab containing a translation error", () => {
    expect(
      getTravelFormErrorFeedback({
        nameEn: { type: "too_big", message: "Too long" },
      }),
    ).toEqual({
      tab: "general",
      locale: "en",
      message: "“Travel name” талбарыг зөв бөглөнө үү.",
    });
  });

  it("identifies the row and field for a nested departure error", () => {
    expect(
      getTravelFormErrorFeedback({
        departures: [undefined, { returnDate: { type: "invalid_format", message: "Invalid" } }],
      }),
    ).toEqual({
      tab: "departures",
      message: "“Гаралт 2 — Буцах огноо” талбарыг зөв бөглөнө үү.",
    });
  });
});

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BookingBudgetScreen, TravelOption, TravelSlot } from "./useBookingBudgetScreen";
import { useBookingSearchScreen } from "./useBookingSearchScreen";

vi.mock("./useBookingBudgetScreen", () => ({
  formatTravelMoney: (priceMinor: number) => `${priceMinor}`,
  getTravelSlotDateKey: (slot: TravelSlot) => `${slot.departureDate}|${slot.returnDate}`,
}));

function createSlot(
  publicId: string,
  departureDate: string,
  transportType: TravelSlot["transportType"],
  unitPriceMinor = 100_000_000,
): TravelSlot {
  return {
    capacity: 10,
    departureDate,
    publicId,
    remainingSeats: 5,
    returnDate: departureDate,
    transportType,
    unitPriceMinor,
  };
}

function createTrip(publicId: string, name: string, slots: TravelSlot[]): TravelOption {
  return {
    category: "INTERNATIONAL",
    coverImage: null,
    destinationLabel: null,
    description: null,
    details: [],
    itinerarySections: [],
    durationDays: 4,
    name,
    publicId,
    slots,
    slug: publicId,
    tagline: null,
  };
}

describe("useBookingSearchScreen", () => {
  it("cross-filters trips and dates when transport is selected first", () => {
    const applySearchSelection = vi.fn();
    const directSlot = createSlot("slot-direct", "2026-11-10", "DIRECT_FLIGHT", 120_000_000);
    const screen = {
      applySearchSelection,
      formatTravelDate: (departureDate: string) => departureDate,
      transportLabel: (transportType: TravelSlot["transportType"]) => transportType,
      travelOptions: [
        createTrip("trip-one", "Trip One", [
          createSlot("slot-ground-one", "2026-11-08", "GROUND"),
          directSlot,
        ]),
        createTrip("trip-two", "Trip Two", [createSlot("slot-ground-two", "2026-11-10", "GROUND")]),
      ],
    } as unknown as BookingBudgetScreen;
    const { result } = renderHook(() => useBookingSearchScreen(screen));

    act(() => result.current.selectTransport("DIRECT_FLIGHT"));

    expect(result.current.tripOptions.map((option) => option.label)).toEqual(["Trip One"]);
    expect(result.current.dateOptions.map((option) => option.value)).toEqual([
      "2026-11-10|2026-11-10",
    ]);
    expect(result.current.priceOptions.map((option) => option.value)).toEqual(["120000000"]);

    act(() => result.current.selectDate("2026-11-10|2026-11-10"));
    act(() => result.current.selectTrip("trip-one"));
    act(() => result.current.selectPrice("120000000"));

    expect(result.current.selectedSlot).toBe(directSlot);
    expect(result.current.canBook).toBe(true);

    act(() => result.current.bookSelection());

    expect(applySearchSelection).toHaveBeenCalledWith({
      dateKey: "2026-11-10|2026-11-10",
      transportType: "DIRECT_FLIGHT",
      tripPublicId: "trip-one",
      unitPriceMinor: 120_000_000,
    });
  });

  it("cross-filters trips and transport when date is selected first", () => {
    const screen = {
      applySearchSelection: vi.fn(),
      formatTravelDate: (departureDate: string) => departureDate,
      transportLabel: (transportType: TravelSlot["transportType"]) => transportType,
      travelOptions: [
        createTrip("trip-one", "Trip One", [createSlot("slot-ground", "2026-11-08", "GROUND")]),
        createTrip("trip-two", "Trip Two", [
          createSlot("slot-direct", "2026-11-10", "DIRECT_FLIGHT"),
        ]),
      ],
    } as unknown as BookingBudgetScreen;
    const { result } = renderHook(() => useBookingSearchScreen(screen));

    act(() => result.current.selectDate("2026-11-10|2026-11-10"));

    expect(result.current.tripOptions.map((option) => option.label)).toEqual(["Trip Two"]);
    expect(result.current.transportOptions.map((option) => option.value)).toEqual([
      "DIRECT_FLIGHT",
    ]);
  });

  it("groups larger departure sets by month and aggregates matching slot availability", () => {
    const novemberRange = {
      ...createSlot("slot-range-one", "2026-11-08", "GROUND"),
      remainingSeats: 3,
      returnDate: "2026-11-10",
    };
    const duplicateRange = {
      ...createSlot("slot-range-two", "2026-11-08", "DIRECT_FLIGHT"),
      remainingSeats: 4,
      returnDate: "2026-11-10",
    };
    const screen = {
      applySearchSelection: vi.fn(),
      formatTravelDate: (departureDate: string, returnDate: string) =>
        `${departureDate} – ${returnDate}`,
      transportLabel: (transportType: TravelSlot["transportType"]) => transportType,
      travelOptions: [
        createTrip("trip-one", "Trip One", [
          novemberRange,
          ...[11, 12, 13, 14, 15].map((day) =>
            createSlot(`slot-${day}`, `2026-11-${day}`, "GROUND"),
          ),
          createSlot("slot-december", "2026-12-02", "GROUND"),
        ]),
        createTrip("trip-two", "Trip Two", [duplicateRange]),
      ],
    } as unknown as BookingBudgetScreen;
    const { result } = renderHook(() => useBookingSearchScreen(screen));

    expect(result.current.dateMonths).toEqual(["2026-11", "2026-12"]);
    expect(result.current.activeDateMonth).toBe("2026-11");
    expect(result.current.visibleDateOptions).toHaveLength(6);
    expect(result.current.dateOptions[0]).toMatchObject({
      durationDays: 3,
      remainingSeats: 7,
      value: "2026-11-08|2026-11-10",
    });

    act(() => result.current.selectDateMonth("2026-12"));

    expect(result.current.activeDateMonth).toBe("2026-12");
    expect(result.current.visibleDateOptions.map((option) => option.departureDate)).toEqual([
      "2026-12-02",
    ]);
  });
});

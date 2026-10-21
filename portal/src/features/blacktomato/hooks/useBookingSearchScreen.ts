"use client";

import { useMemo, useState } from "react";
import {
  type BookingBudgetScreen,
  formatTravelMoney,
  getTravelSlotDateKey,
  type TravelSlot,
} from "./useBookingBudgetScreen";

export type BookingSearchFacet = "trip" | "date" | "transport" | "price";

type SearchOption = {
  label: string;
  value: string;
};

type SlotMatch = {
  dateKey: string;
  slot: TravelSlot;
  tripPublicId: string;
};

export function useBookingSearchScreen(screen: BookingBudgetScreen) {
  const [activeFacet, setActiveFacet] = useState<BookingSearchFacet | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedTransportType, setSelectedTransportType] = useState<
    TravelSlot["transportType"] | null
  >(null);
  const [selectedPriceMinor, setSelectedPriceMinor] = useState<number | null>(null);

  const slotMatches = useMemo<SlotMatch[]>(
    () =>
      screen.travelOptions.flatMap((trip) =>
        trip.slots.map((slot) => ({
          dateKey: getTravelSlotDateKey(slot),
          slot,
          tripPublicId: trip.publicId,
        })),
      ),
    [screen.travelOptions],
  );

  const tripOptions = useMemo<SearchOption[]>(
    () =>
      screen.travelOptions
        .filter((trip) =>
          trip.slots.some(
            (slot) =>
              (!selectedDateKey || getTravelSlotDateKey(slot) === selectedDateKey) &&
              (!selectedTransportType || slot.transportType === selectedTransportType) &&
              (selectedPriceMinor === null || slot.unitPriceMinor === selectedPriceMinor),
          ),
        )
        .map((trip) => ({ label: trip.name, value: trip.publicId })),
    [screen.travelOptions, selectedDateKey, selectedPriceMinor, selectedTransportType],
  );

  const dateOptions = useMemo<SearchOption[]>(() => {
    const uniqueDates = new Map<string, SearchOption>();
    for (const match of slotMatches) {
      if (selectedTripId && match.tripPublicId !== selectedTripId) continue;
      if (selectedTransportType && match.slot.transportType !== selectedTransportType) continue;
      if (selectedPriceMinor !== null && match.slot.unitPriceMinor !== selectedPriceMinor) continue;
      if (uniqueDates.has(match.dateKey)) continue;
      uniqueDates.set(match.dateKey, {
        label: screen.formatTravelDate(match.slot.departureDate, match.slot.returnDate),
        value: match.dateKey,
      });
    }
    return [...uniqueDates.values()];
  }, [
    screen.formatTravelDate,
    selectedPriceMinor,
    selectedTransportType,
    selectedTripId,
    slotMatches,
  ]);

  const transportOptions = useMemo<SearchOption[]>(() => {
    const uniqueTransports = new Map<string, SearchOption>();
    for (const match of slotMatches) {
      if (selectedTripId && match.tripPublicId !== selectedTripId) continue;
      if (selectedDateKey && match.dateKey !== selectedDateKey) continue;
      if (selectedPriceMinor !== null && match.slot.unitPriceMinor !== selectedPriceMinor) continue;
      const value = match.slot.transportType;
      if (uniqueTransports.has(value)) continue;
      uniqueTransports.set(value, {
        label: screen.transportLabel(value),
        value,
      });
    }
    return [...uniqueTransports.values()];
  }, [screen.transportLabel, selectedDateKey, selectedPriceMinor, selectedTripId, slotMatches]);

  const priceOptions = useMemo<SearchOption[]>(() => {
    const uniquePrices = new Map<number, SearchOption>();
    for (const match of slotMatches) {
      if (selectedTripId && match.tripPublicId !== selectedTripId) continue;
      if (selectedDateKey && match.dateKey !== selectedDateKey) continue;
      if (selectedTransportType && match.slot.transportType !== selectedTransportType) continue;
      const value = match.slot.unitPriceMinor;
      if (uniquePrices.has(value)) continue;
      uniquePrices.set(value, {
        label: formatTravelMoney(value),
        value: String(value),
      });
    }
    return [...uniquePrices.values()].sort(
      (left, right) => Number(left.value) - Number(right.value),
    );
  }, [selectedDateKey, selectedTransportType, selectedTripId, slotMatches]);

  const selectedTrip =
    screen.travelOptions.find((trip) => trip.publicId === selectedTripId) ?? null;
  const selectedDate = dateOptions.find((option) => option.value === selectedDateKey) ?? null;
  const selectedTransport =
    transportOptions.find((option) => option.value === selectedTransportType) ?? null;
  const selectedPrice =
    priceOptions.find((option) => option.value === String(selectedPriceMinor)) ?? null;
  const selectedSlot =
    selectedTripId && selectedDateKey && selectedTransportType && selectedPriceMinor !== null
      ? (slotMatches.find(
          (match) =>
            match.tripPublicId === selectedTripId &&
            match.dateKey === selectedDateKey &&
            match.slot.transportType === selectedTransportType &&
            match.slot.unitPriceMinor === selectedPriceMinor,
        )?.slot ?? null)
      : null;

  function selectTrip(value: string | null) {
    setSelectedTripId(value);
    setActiveFacet(null);
  }

  function selectDate(value: string | null) {
    setSelectedDateKey(value);
    setActiveFacet(null);
  }

  function selectTransport(value: string | null) {
    setSelectedTransportType(value as TravelSlot["transportType"] | null);
    setActiveFacet(null);
  }

  function selectPrice(value: string | null) {
    setSelectedPriceMinor(value === null ? null : Number(value));
    setActiveFacet(null);
  }

  function bookSelection() {
    if (
      !selectedTripId ||
      !selectedDateKey ||
      !selectedTransportType ||
      selectedPriceMinor === null ||
      !selectedSlot
    ) {
      return;
    }
    screen.applySearchSelection({
      dateKey: selectedDateKey,
      transportType: selectedTransportType,
      tripPublicId: selectedTripId,
      unitPriceMinor: selectedPriceMinor,
    });
  }

  return {
    activeFacet,
    bookSelection,
    canBook: Boolean(selectedSlot?.remainingSeats),
    dateOptions,
    priceOptions,
    selectDate,
    selectPrice,
    selectedDate,
    selectedPrice,
    selectedSlot,
    selectedTransport,
    selectedTrip,
    selectTransport,
    selectTrip,
    setActiveFacet,
    transportOptions,
    tripOptions,
  };
}

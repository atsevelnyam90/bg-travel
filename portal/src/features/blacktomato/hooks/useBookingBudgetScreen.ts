"use client";

import { type FormEvent, useMemo, useState } from "react";

export type TransportOption = {
  id: "ground" | "direct-flight" | "private-transfer" | "domestic-flight";
  label: string;
  priceMnt: number;
};

export type TravelOption = {
  id: string;
  title: string;
  category: "Гадаад аялал" | "Дотоод аялал";
  region: string;
  duration: string;
  availableSeats: number;
  isInternational: boolean;
  transportOptions: TransportOption[];
};

export type BookingQuote = {
  selectedTrip: TravelOption;
  selectedTransport: TransportOption;
  travelDate: string;
  peopleCount: number;
  totalPriceMnt: number;
  hasAvailability: boolean;
};

type BookingBudgetScreenOptions = {
  initialTripId?: string;
  mode?: "home" | "detail";
  onContinue?: (quote: BookingQuote) => void;
};

export const travelOptions: TravelOption[] = [
  {
    availableSeats: 9,
    category: "Гадаад аялал",
    duration: "8 өдөр",
    id: "kenya-private-safari",
    isInternational: true,
    region: "Masai Mara, Kenya",
    title: "Kenya Private Safari",
    transportOptions: [
      { id: "ground", label: "Газар", priceMnt: 8_900_000 },
      { id: "direct-flight", label: "Шууд нислэг", priceMnt: 11_800_000 },
    ],
  },
  {
    availableSeats: 6,
    category: "Гадаад аялал",
    duration: "10 өдөр",
    id: "japan-ryokan-culture",
    isInternational: true,
    region: "Tokyo, Kyoto, Hakone",
    title: "Japan Ryokan & Culture",
    transportOptions: [
      { id: "ground", label: "Газар", priceMnt: 7_600_000 },
      { id: "direct-flight", label: "Шууд нислэг", priceMnt: 10_400_000 },
    ],
  },
  {
    availableSeats: 4,
    category: "Гадаад аялал",
    duration: "7 өдөр",
    id: "maldives-blue-water",
    isInternational: true,
    region: "Baa Atoll, Maldives",
    title: "Maldives Blue Water Escape",
    transportOptions: [
      { id: "ground", label: "Газар", priceMnt: 9_200_000 },
      { id: "direct-flight", label: "Шууд нислэг", priceMnt: 13_500_000 },
    ],
  },
  {
    availableSeats: 14,
    category: "Дотоод аялал",
    duration: "5 өдөр",
    id: "gobi-desert-expedition",
    isInternational: false,
    region: "Өмнөговь, Хонгорын элс",
    title: "Говийн аялал",
    transportOptions: [{ id: "private-transfer", label: "Аяллын унаа", priceMnt: 1_450_000 }],
  },
  {
    availableSeats: 10,
    category: "Дотоод аялал",
    duration: "6 өдөр",
    id: "khangai-journey",
    isInternational: false,
    region: "Архангай, Өвөрхангай",
    title: "Хангайн аялал",
    transportOptions: [{ id: "private-transfer", label: "Аяллын унаа", priceMnt: 1_650_000 }],
  },
  {
    availableSeats: 8,
    category: "Дотоод аялал",
    duration: "7 өдөр",
    id: "tavan-bogd-journey",
    isInternational: false,
    region: "Баян-Өлгий, Алтай Таван Богд",
    title: "Таван богд аялал",
    transportOptions: [{ id: "private-transfer", label: "Аяллын унаа", priceMnt: 2_500_000 }],
  },
  {
    availableSeats: 12,
    category: "Дотоод аялал",
    duration: "3 өдөр",
    id: "terelj-weekend-escape",
    isInternational: false,
    region: "Тэрэлж",
    title: "Тэрэлжийн аялал",
    transportOptions: [{ id: "private-transfer", label: "Аяллын унаа", priceMnt: 890_000 }],
  },
  {
    availableSeats: 10,
    category: "Дотоод аялал",
    duration: "8 өдөр",
    id: "gobi-khangai-journey",
    isInternational: false,
    region: "Өмнөговь, Архангай",
    title: "Говь хангай хосолсон аялал",
    transportOptions: [{ id: "private-transfer", label: "Аяллын унаа", priceMnt: 2_200_000 }],
  },
];

const moneyFormatter = new Intl.NumberFormat("mn-MN", {
  currency: "MNT",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatTravelMoney(priceMnt: number) {
  return moneyFormatter.format(priceMnt);
}

export function useBookingBudgetScreen({
  initialTripId,
  mode = "home",
  onContinue,
}: BookingBudgetScreenOptions = {}) {
  const initialTrip =
    travelOptions.find((trip) => trip.id === initialTripId) ??
    (mode === "detail" ? travelOptions[0] : null);

  const [query, setQuery] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TravelOption | null>(initialTrip);
  const [selectedTransportId, setSelectedTransportId] = useState<string | null>(
    initialTrip?.transportOptions[0]?.id ?? null,
  );
  const [travelDate, setTravelDate] = useState("");
  const [peopleCount, setPeopleCount] = useState(2);
  const [isSubmitting, setSubmitting] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTripGroups = useMemo(() => {
    const filteredTrips = normalizedQuery
      ? travelOptions.filter((trip) =>
          [
            trip.title,
            trip.category,
            trip.region,
            trip.duration,
            ...trip.transportOptions.map((option) => option.label),
          ].some((value) => value.toLowerCase().includes(normalizedQuery)),
        )
      : travelOptions;

    return ["Гадаад аялал", "Дотоод аялал"].map((category) => ({
      category,
      trips: filteredTrips.filter((trip) => trip.category === category),
    }));
  }, [normalizedQuery]);

  const selectedTransport =
    selectedTrip?.transportOptions.find((transport) => transport.id === selectedTransportId) ??
    selectedTrip?.transportOptions[0] ??
    null;

  const quote = useMemo<BookingQuote | null>(() => {
    if (!selectedTrip || !selectedTransport || !travelDate) {
      return null;
    }

    return {
      hasAvailability: selectedTrip.availableSeats >= peopleCount,
      peopleCount,
      selectedTransport,
      selectedTrip,
      totalPriceMnt: selectedTransport.priceMnt * peopleCount,
      travelDate,
    };
  }, [peopleCount, selectedTransport, selectedTrip, travelDate]);

  const canContinue = Boolean(quote?.hasAvailability);

  function selectTrip(trip: TravelOption) {
    setSelectedTrip(trip);
    setSelectedTransportId(trip.transportOptions[0]?.id ?? null);
    setQuery("");
    setDropdownOpen(false);
  }

  function incrementPeople() {
    setPeopleCount((current) => Math.min(current + 1, 12));
  }

  function decrementPeople() {
    setPeopleCount((current) => Math.max(current - 1, 1));
  }

  function continueBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!quote || !canContinue || isSubmitting) {
      return;
    }

    setSubmitting(true);
    onContinue?.(quote);
  }

  return {
    canContinue,
    continueBooking,
    decrementPeople,
    filteredTripGroups,
    incrementPeople,
    isDropdownOpen,
    isSubmitting,
    peopleCount,
    query,
    quote,
    selectTrip,
    selectedTransport,
    selectedTrip,
    setDropdownOpen,
    setQuery,
    setSelectedTransportId,
    setTravelDate,
    travelDate,
  };
}

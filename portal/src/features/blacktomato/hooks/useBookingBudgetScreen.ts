"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { orders, type travels } from "@/api/generated/contracts";
import { formatMinor } from "@/api/generated/contracts/money";
import { useCreatePublicOrder } from "./useCreatePublicOrder";
import { usePublicPaymentInfo } from "./usePublicPaymentInfo";
import { usePublicTravels } from "./usePublicTravels";

export type TravelOption = travels.PublicTravel;
export type TravelSlot = travels.PublicTravelSlot;

export type BookingQuote = {
  selectedTrip: TravelOption;
  selectedSlot: TravelSlot;
  peopleCount: number;
  totalPriceMinor: number;
  hasAvailability: boolean;
};

export type BookingCustomerInput = Pick<
  orders.CreatePublicOrderInput,
  "firstName" | "lastName" | "phone" | "email" | "address"
>;

export type BookingStep = "selection" | "customer" | "payment";
export type PaymentCopyField = "bankAccount" | "amount";

const bookingCustomerSchema = orders.createPublicOrderSchema.pick({
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  address: true,
});

type BookingBudgetScreenOptions = {
  initialTripId?: string;
  mode?: "home" | "detail";
  onContinue?: (quote: BookingQuote) => void;
};

const transportLabels: Record<TravelSlot["transportType"], string> = {
  GROUND: "Газар",
  DIRECT_FLIGHT: "Шууд нислэг",
};

const dateFormatter = new Intl.DateTimeFormat("mn-MN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
});

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function slotDateKey(slot: TravelSlot): string {
  return `${slot.departureDate}|${slot.returnDate}`;
}

export function formatTravelDate(departureDate: string, returnDate: string): string {
  const departure = dateFormatter.format(parseDateOnly(departureDate));
  const returning = dateFormatter.format(parseDateOnly(returnDate));
  return departureDate === returnDate ? departure : `${departure} – ${returning}`;
}

export function formatTravelMoney(priceMinor: number) {
  return formatMinor(priceMinor);
}

export function transportLabel(type: TravelSlot["transportType"]): string {
  return transportLabels[type];
}

export function useBookingBudgetScreen({
  initialTripId,
  mode = "home",
  onContinue,
}: BookingBudgetScreenOptions = {}) {
  const travelsQuery = usePublicTravels();
  const paymentInfoQuery = usePublicPaymentInfo();
  const orderMutation = useCreatePublicOrder();
  const travelOptions = travelsQuery.data ?? [];
  const [step, setStep] = useState<BookingStep>("selection");
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(initialTripId ?? null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [peopleCount, setPeopleCount] = useState(1);
  const [pendingCustomer, setPendingCustomer] = useState<BookingCustomerInput | null>(null);
  const [orderResult, setOrderResult] = useState<orders.PublicOrder | null>(null);
  const [copiedPaymentField, setCopiedPaymentField] = useState<PaymentCopyField | null>(null);
  const idempotencyKey = useRef<string | null>(null);
  const stepContainerRef = useRef<HTMLElement>(null);
  const bookingActionsRef = useRef<HTMLDivElement>(null);
  const hasMountedStep = useRef(false);
  const customerForm = useForm<BookingCustomerInput>({
    resolver: zodResolver(bookingCustomerSchema),
    defaultValues: { firstName: "", lastName: "", phone: "", email: "", address: "" },
  });

  const selectedTrip =
    travelOptions.find((trip) => trip.publicId === selectedTripId) ??
    (mode === "detail" ? (travelOptions[0] ?? null) : null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTripGroups = useMemo(() => {
    const filteredTrips = normalizedQuery
      ? travelOptions.filter((trip) =>
          [
            trip.name,
            trip.description ?? "",
            ...trip.slots.map((slot) => transportLabel(slot.transportType)),
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : travelOptions;
    return [{ category: "Аяллууд", trips: filteredTrips }];
  }, [normalizedQuery, travelOptions]);

  const dateOptions = useMemo(() => {
    const unique = new Map<string, { key: string; label: string }>();
    for (const slot of selectedTrip?.slots ?? []) {
      const key = slotDateKey(slot);
      if (!unique.has(key)) {
        unique.set(key, {
          key,
          label: formatTravelDate(slot.departureDate, slot.returnDate),
        });
      }
    }
    return [...unique.values()];
  }, [selectedTrip]);

  const transportOptions = selectedDateKey
    ? (selectedTrip?.slots.filter((slot) => slotDateKey(slot) === selectedDateKey) ?? [])
    : [];
  const selectedSlot =
    transportOptions.find((slot) => slot.publicId === selectedSlotId) ??
    transportOptions[0] ??
    null;

  const quote = useMemo<BookingQuote | null>(() => {
    if (!selectedTrip || !selectedSlot) return null;
    return {
      hasAvailability: selectedSlot.capacity >= peopleCount,
      peopleCount,
      selectedSlot,
      selectedTrip,
      totalPriceMinor: selectedSlot.unitPriceMinor * peopleCount,
    };
  }, [peopleCount, selectedSlot, selectedTrip]);

  const canContinue = Boolean(quote?.hasAvailability);

  useEffect(() => {
    if (!hasMountedStep.current) {
      hasMountedStep.current = true;
      return;
    }
    const container = stepContainerRef.current;
    if (container?.dataset.step === step) {
      container.focus({ preventScroll: true });
    }
  }, [step]);

  useEffect(() => {
    if (!selectedDateKey) return;

    const frame = window.requestAnimationFrame(() => {
      bookingActionsRef.current?.scrollIntoView?.({
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "nearest",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectedDateKey]);

  function selectTrip(trip: TravelOption) {
    setSelectedTripId(trip.publicId);
    setSelectedDateKey(null);
    setSelectedSlotId(null);
    setQuery("");
    setDropdownOpen(false);
  }

  function selectDate(dateKey: string) {
    setSelectedDateKey(dateKey);
    const firstSlot = selectedTrip?.slots.find((slot) => slotDateKey(slot) === dateKey);
    setSelectedSlotId(firstSlot?.publicId ?? null);
  }

  function incrementPeople() {
    setPeopleCount((current) => Math.min(current + 1, 12));
  }

  function decrementPeople() {
    setPeopleCount((current) => Math.max(current - 1, 1));
  }

  function continueBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quote || !canContinue) return;
    onContinue?.(quote);
    setStep("customer");
  }

  function goBackToSelection() {
    orderMutation.reset();
    setPendingCustomer(null);
    setStep("selection");
  }

  const continueToPayment = customerForm.handleSubmit((customer) => {
    setPendingCustomer(customer);
    orderMutation.reset();
    setStep("payment");
  });

  async function confirmPayment() {
    if (!quote || !pendingCustomer || orderResult || orderMutation.isPending) return;
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      const created = await orderMutation.mutateAsync({
        ...pendingCustomer,
        slotPublicId: quote.selectedSlot.publicId,
        travelerCount: quote.peopleCount,
        idempotencyKey: idempotencyKey.current,
      });
      setOrderResult(created);
    } catch {
      return;
    }
  }

  async function copyPaymentValue(field: PaymentCopyField, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedPaymentField(field);
    } catch {
      setCopiedPaymentField(null);
    }
  }

  function resetBooking() {
    setStep("selection");
    setSelectedTripId(initialTripId ?? null);
    setSelectedDateKey(null);
    setSelectedSlotId(null);
    setPeopleCount(1);
    setPendingCustomer(null);
    setOrderResult(null);
    setCopiedPaymentField(null);
    idempotencyKey.current = null;
    customerForm.reset();
    orderMutation.reset();
  }

  return {
    bookingActionsRef,
    canContinue,
    confirmPayment,
    continueBooking,
    continueToPayment,
    copiedPaymentField,
    copyPaymentValue,
    dateOptions,
    decrementPeople,
    filteredTripGroups,
    incrementPeople,
    isDropdownOpen,
    isLoading: travelsQuery.isLoading,
    isSubmitting: orderMutation.isPending,
    customerForm,
    goBackToSelection,
    orderResult,
    paymentInfo: paymentInfoQuery.data ?? null,
    paymentInfoError: paymentInfoQuery.isError,
    paymentInfoLoading: paymentInfoQuery.isLoading,
    peopleCount,
    query,
    quote,
    selectDate,
    selectTrip,
    step,
    stepContainerRef,
    submitError: orderMutation.error instanceof Error ? orderMutation.error.message : null,
    selectedDateKey,
    selectedSlot,
    selectedTrip,
    setDropdownOpen,
    setQuery,
    setSelectedSlotId,
    transportOptions,
    travelsError: travelsQuery.isError,
    resetBooking,
  };
}

export type BookingBudgetScreen = ReturnType<typeof useBookingBudgetScreen>;

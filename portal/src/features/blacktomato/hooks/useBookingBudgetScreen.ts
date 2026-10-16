"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function slotDateKey(slot: TravelSlot): string {
  return `${slot.departureDate}|${slot.returnDate}`;
}

export function formatTravelMoney(priceMinor: number) {
  return formatMinor(priceMinor);
}

export function useBookingBudgetScreen({
  initialTripId,
  mode = "home",
  onContinue,
}: BookingBudgetScreenOptions = {}) {
  const locale = useLocale();
  const t = useTranslations("publicBooking");
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
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
      }),
    [locale],
  );
  const formatTravelDate = useCallback(
    (departureDate: string, returnDate: string) => {
      const departure = dateFormatter.format(parseDateOnly(departureDate));
      const returning = dateFormatter.format(parseDateOnly(returnDate));
      return departureDate === returnDate ? departure : `${departure} – ${returning}`;
    },
    [dateFormatter],
  );
  const transportLabel = useCallback(
    (type: TravelSlot["transportType"]) => t(`transport.${type}`),
    [t],
  );

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
    return [{ category: t("tripsGroup"), trips: filteredTrips }];
  }, [normalizedQuery, t, transportLabel, travelOptions]);

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
  }, [formatTravelDate, selectedTrip]);

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
      hasAvailability: selectedSlot.remainingSeats >= peopleCount,
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

  function goBackToCustomer() {
    if (orderMutation.isPending || orderResult) return;
    orderMutation.reset();
    setStep("customer");
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
      toast.success(t("toast.success"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.error"));
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
    formatTravelDate,
    incrementPeople,
    isDropdownOpen,
    isLoading: travelsQuery.isLoading,
    isSubmitting: orderMutation.isPending,
    customerForm,
    goBackToCustomer,
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
    selectedDateKey,
    selectedSlot,
    selectedTrip,
    setDropdownOpen,
    setQuery,
    setSelectedSlotId,
    transportOptions,
    transportLabel,
    travelsError: travelsQuery.isError,
    resetBooking,
  };
}

export type BookingBudgetScreen = ReturnType<typeof useBookingBudgetScreen>;

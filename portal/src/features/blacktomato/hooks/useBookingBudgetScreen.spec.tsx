import { act, cleanup, renderHook } from "@testing-library/react";
import type { FormEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBookingBudgetScreen } from "./useBookingBudgetScreen";
import { useCreatePublicOrder } from "./useCreatePublicOrder";
import { usePublicPaymentInfo } from "./usePublicPaymentInfo";
import { usePublicTravels } from "./usePublicTravels";

vi.mock("./usePublicTravels", () => ({
  usePublicTravels: vi.fn(),
}));

vi.mock("./useCreatePublicOrder", () => ({
  useCreatePublicOrder: vi.fn(),
}));

vi.mock("./usePublicPaymentInfo", () => ({
  usePublicPaymentInfo: vi.fn(),
}));

const mutateAsync = vi.fn();

const travel = {
  publicId: "6cc7df59-93bf-4499-a9d5-4c90834618eb",
  name: "Kenya Private Safari",
  description: "Safari аялал",
  slots: [
    {
      publicId: "ab2c0b37-ed02-4a8d-96d9-864c59acc70b",
      departureDate: "2026-10-16",
      returnDate: "2026-10-18",
      transportType: "GROUND" as const,
      unitPriceMinor: 100_000_000,
      capacity: 10,
    },
    {
      publicId: "77e8e98f-3c2f-4fa6-bbbf-a1f19655dd59",
      departureDate: "2026-10-16",
      returnDate: "2026-10-18",
      transportType: "DIRECT_FLIGHT" as const,
      unitPriceMinor: 150_000_000,
      capacity: 1,
    },
  ],
};

beforeEach(() => {
  vi.mocked(usePublicTravels).mockReturnValue({
    data: [travel],
    isError: false,
    isLoading: false,
  } as ReturnType<typeof usePublicTravels>);
  vi.mocked(usePublicPaymentInfo).mockReturnValue({
    data: {
      bankAccount: "MN770005005619113075",
      bankAccountName: "КОСО ЛАЙН",
      bankName: "Хаан банк",
      currency: "MNT",
    },
    isError: false,
    isLoading: false,
  } as ReturnType<typeof usePublicPaymentInfo>);
  mutateAsync.mockResolvedValue({
    publicOrderId: "ORD-2026-000001",
    status: "AWAITING_PAYMENT",
    totalPriceMinor: 100_000_000,
    payment: {
      reference: "ORD-2026-000001",
      amountMinor: 100_000_000,
      currency: "MNT",
      bankName: "Хаан банк",
      bankAccount: "MN770005005619113075",
      bankAccountName: "КОСО ЛАЙН",
    },
  });
  vi.mocked(useCreatePublicOrder).mockReturnValue({
    error: null,
    isPending: false,
    mutateAsync,
    reset: vi.fn(),
  } as unknown as ReturnType<typeof useCreatePublicOrder>);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("useBookingBudgetScreen", () => {
  it("groups slots by date and calculates the selected transport total", () => {
    const { result } = renderHook(() => useBookingBudgetScreen());

    act(() => result.current.selectTrip(travel));

    expect(result.current.dateOptions).toHaveLength(1);
    expect(result.current.transportOptions).toHaveLength(0);

    act(() => result.current.selectDate(result.current.dateOptions[0].key));

    expect(result.current.transportOptions).toHaveLength(2);
    expect(result.current.peopleCount).toBe(1);
    expect(result.current.quote?.totalPriceMinor).toBe(100_000_000);
    expect(result.current.canContinue).toBe(true);

    act(() => result.current.incrementPeople());

    expect(result.current.quote?.totalPriceMinor).toBe(200_000_000);
    expect(result.current.canContinue).toBe(true);

    act(() => result.current.setSelectedSlotId(travel.slots[1].publicId));

    expect(result.current.quote?.totalPriceMinor).toBe(300_000_000);
    expect(result.current.canContinue).toBe(false);
  });

  it("creates the order only after the customer confirms payment", async () => {
    const { result } = renderHook(() => useBookingBudgetScreen());
    act(() => result.current.selectTrip(travel));
    act(() => result.current.selectDate(result.current.dateOptions[0].key));
    act(() =>
      result.current.continueBooking({
        preventDefault: vi.fn(),
      } as unknown as FormEvent<HTMLFormElement>),
    );

    expect(result.current.step).toBe("customer");
    act(() => {
      result.current.customerForm.setValue("firstName", "Бат");
      result.current.customerForm.setValue("lastName", "Болд");
      result.current.customerForm.setValue("phone", "99112233");
      result.current.customerForm.setValue("email", "bat@example.mn");
      result.current.customerForm.setValue("address", "Улаанбаатар");
    });
    await act(async () => result.current.continueToPayment());

    expect(result.current.step).toBe("payment");
    expect(mutateAsync).not.toHaveBeenCalled();

    await act(async () => result.current.confirmPayment());

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        slotPublicId: travel.slots[0].publicId,
        travelerCount: 1,
        firstName: "Бат",
        email: "bat@example.mn",
        address: "Улаанбаатар",
      }),
    );
    expect(result.current.orderResult?.publicOrderId).toBe("ORD-2026-000001");
  });
});

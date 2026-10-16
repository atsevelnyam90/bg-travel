import type {
  BuilderTriggerContext,
  BuilderTriggerResult,
} from "@duke333/builder-backend/triggers";
import { badRequest, conflict } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getRequestAuth } from "@/lib/requestContext";

export const ORDER_CONFIRM_PAID_TRIGGER = "/api/v1/orders/triggers/confirm-paid";

function statusValue(values: Record<string, unknown> | undefined): string | null {
  const value = values?.status;
  return typeof value === "string" ? value : null;
}

async function assertDepartureHasCapacity(order: {
  id: string;
  travelDepartureId: string | null;
  travelerCount: number;
}) {
  if (!order.travelDepartureId) return;

  const departure = await prisma.travelDeparture.findFirst({
    where: { id: order.travelDepartureId },
    select: { capacity: true },
  });
  if (!departure) {
    throw badRequest("Захиалгын аяллын гаралт олдсонгүй");
  }

  const confirmedOrders = await prisma.order.findMany({
    where: {
      id: { not: order.id },
      status: "PAID",
      travelDepartureId: order.travelDepartureId,
    },
    select: { travelerCount: true },
  });
  const confirmedSeats = confirmedOrders.reduce(
    (total, confirmedOrder) => total + confirmedOrder.travelerCount,
    0,
  );
  const remainingSeats = departure.capacity - confirmedSeats;
  if (remainingSeats < order.travelerCount) {
    throw conflict(`Энэ гаралт дээр ${Math.max(remainingSeats, 0)} суудал үлдсэн байна`);
  }
}

export async function confirmPaidOrderTrigger(
  context: BuilderTriggerContext,
): Promise<BuilderTriggerResult | undefined> {
  const status = statusValue(context.values);
  if (status === "AWAITING_PAYMENT") {
    return { valuesPatch: { confirmed_by_user_id: null, confirmed_at: null } };
  }

  if (status !== "PAID") return undefined;

  if (context.entryId) {
    const existing = await prisma.order.findUnique({
      where: { id: context.entryId },
      select: {
        id: true,
        status: true,
        confirmedByUserId: true,
        confirmedAt: true,
        travelDepartureId: true,
        travelerCount: true,
      },
    });
    if (existing?.status === "PAID" && existing.confirmedByUserId && existing.confirmedAt) {
      return {
        valuesPatch: {
          confirmed_by_user_id: existing.confirmedByUserId,
          confirmed_at: existing.confirmedAt.toISOString(),
        },
      };
    }
    if (existing) await assertDepartureHasCapacity(existing);
  }

  const auth = getRequestAuth();
  if (!auth?.userId) {
    throw badRequest("Төлбөр баталгаажуулах хэрэглэгч олдсонгүй");
  }

  return {
    valuesPatch: {
      confirmed_by_user_id: auth.userId,
      confirmed_at: new Date().toISOString(),
    },
  };
}

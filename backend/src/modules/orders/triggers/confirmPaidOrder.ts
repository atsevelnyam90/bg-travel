import type {
  BuilderTriggerContext,
  BuilderTriggerResult,
} from "@duke333/builder-backend/triggers";
import { badRequest } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getRequestAuth } from "@/lib/requestContext";

export const ORDER_CONFIRM_PAID_TRIGGER = "/api/v1/orders/triggers/confirm-paid";

function statusValue(values: Record<string, unknown> | undefined): string | null {
  const value = values?.status;
  return typeof value === "string" ? value : null;
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
      select: { status: true, confirmedByUserId: true, confirmedAt: true },
    });
    if (existing?.status === "PAID" && existing.confirmedByUserId && existing.confirmedAt) {
      return {
        valuesPatch: {
          confirmed_by_user_id: existing.confirmedByUserId,
          confirmed_at: existing.confirmedAt.toISOString(),
        },
      };
    }
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

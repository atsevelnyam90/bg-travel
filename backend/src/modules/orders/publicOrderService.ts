import type { orders as ordersContract } from "@winu/contracts";
import { Prisma } from "@/generated/prisma/client";
import { conflict, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { nextDocumentNumber } from "@/lib/sequence/documentNumber";

const transportNames = {
  GROUND: "Газар",
  DIRECT_FLIGHT: "Шууд нислэг",
} as const;

type PublicOrderResult = {
  order: ordersContract.PublicOrder;
  orderId: string;
  created: boolean;
};

type PaymentAccount = {
  bankAccount: string;
  bankAccountName: string;
  bankName: string;
};

const PAYMENT_ACCOUNT = {
  bankAccount: "MN770005005619113075",
  bankAccountName: "КОСО ЛАЙН",
  bankName: "Хаан банк",
} satisfies PaymentAccount;

export function getPublicPaymentInfo(): ordersContract.PublicPaymentInfo {
  return { ...PAYMENT_ACCOUNT, currency: "MNT" };
}

function toResponse(
  order: {
    publicOrderId: string;
    status: "AWAITING_PAYMENT" | "PAID";
    totalPriceMinor: bigint;
  },
  paymentAccount: PaymentAccount,
): ordersContract.PublicOrder {
  if (order.status !== "AWAITING_PAYMENT") {
    throw conflict("Энэ захиалга аль хэдийн төлөгдсөн байна");
  }
  const totalPriceMinor = Number(order.totalPriceMinor);
  if (!Number.isSafeInteger(totalPriceMinor)) {
    throw conflict("Захиалгын нийт дүн боловсруулах хэмжээнээс хэтэрсэн байна");
  }
  const payment: ordersContract.PublicOrderPayment = {
    reference: order.publicOrderId,
    amountMinor: totalPriceMinor,
    ...paymentAccount,
    currency: "MNT",
  };
  return { publicOrderId: order.publicOrderId, status: order.status, totalPriceMinor, payment };
}

async function findByIdempotencyKey(
  idempotencyKey: string,
  paymentAccount: PaymentAccount,
): Promise<PublicOrderResult | null> {
  const existing = await prisma.order.findFirst({
    where: { idempotencyKey },
    select: { id: true, publicOrderId: true, status: true, totalPriceMinor: true },
  });
  return existing
    ? { order: toResponse(existing, paymentAccount), orderId: existing.id, created: false }
    : null;
}

export async function createPublicOrder(
  input: ordersContract.CreatePublicOrderInput,
): Promise<PublicOrderResult> {
  const paymentAccount = PAYMENT_ACCOUNT;
  const replay = await findByIdempotencyKey(input.idempotencyKey, paymentAccount);
  if (replay) return replay;

  const publicOrderId = await nextDocumentNumber({ name: "order", prefix: "ORD" });

  try {
    return await prisma.$transaction(async (tx) => {
      const slots = await tx.$queryRaw<
        Array<{
          id: string;
          travelId: string;
          travelPublicId: string;
          departureDate: Date;
          transportType: "GROUND" | "DIRECT_FLIGHT";
          unitPriceMinor: bigint;
          capacity: number;
          isBookingOpen: boolean;
          travelName: string;
        }>
      >(Prisma.sql`
        SELECT
          departure.id,
          departure."travelId" AS "travelId",
          travel."publicId" AS "travelPublicId",
          departure."departureDate" AS "departureDate",
          departure."transportType" AS "transportType",
          departure."unitPriceMinor" AS "unitPriceMinor",
          departure.capacity,
          departure."isBookingOpen" AS "isBookingOpen",
          travel.name AS "travelName"
        FROM travel_departures departure
        INNER JOIN travels travel ON travel.id = departure."travelId"
        WHERE departure."publicId" = ${input.slotPublicId}
          AND departure."deletedAt" IS NULL
          AND travel."deletedAt" IS NULL
          AND travel.status = 'PUBLISHED'::"TravelStatus"
        FOR UPDATE OF departure
      `);
      const slot = slots[0];
      if (!slot) throw notFound("Сонгосон аяллын гаралт олдсонгүй");
      if (!slot.isBookingOpen) throw conflict("Энэ гаралтын захиалга хаагдсан байна");

      const booked = await tx.order.aggregate({
        where: { travelDepartureId: slot.id, status: "PAID", deletedAt: null },
        _sum: { travelerCount: true },
      });
      const remainingSeats = slot.capacity - (booked._sum.travelerCount ?? 0);
      if (remainingSeats < input.travelerCount) {
        throw conflict(`Энэ гаралт дээр ${Math.max(remainingSeats, 0)} суудал үлдсэн байна`);
      }

      const totalPriceMinor = slot.unitPriceMinor * BigInt(input.travelerCount);
      const created = await tx.order.create({
        data: {
          publicOrderId,
          firstName: input.firstName,
          lastName: input.lastName,
          address: input.address ?? "",
          phone: input.phone,
          email: input.email.toLowerCase(),
          serviceCode: slot.travelPublicId,
          travelDepartureId: slot.id,
          transportType: slot.transportType,
          travelDate: slot.departureDate,
          travelerCount: input.travelerCount,
          serviceNameSnapshot: slot.travelName,
          transportNameSnapshot: transportNames[slot.transportType],
          unitPriceMinor: slot.unitPriceMinor,
          totalPriceMinor,
          idempotencyKey: input.idempotencyKey,
        },
        select: {
          id: true,
          publicOrderId: true,
          status: true,
          totalPriceMinor: true,
        },
      });
      return { order: toResponse(created, paymentAccount), orderId: created.id, created: true };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const duplicate = await findByIdempotencyKey(input.idempotencyKey, paymentAccount);
      if (duplicate) return duplicate;
    }
    throw error;
  }
}

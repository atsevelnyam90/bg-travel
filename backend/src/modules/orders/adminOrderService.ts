import type { orders as ordersContract } from "@winu/contracts";
import type { Prisma } from "@/generated/prisma/client";
import { conflict, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const ORDER_SELECT = {
  id: true,
  publicOrderId: true,
  firstName: true,
  lastName: true,
  address: true,
  phone: true,
  email: true,
  serviceCode: true,
  travelDepartureId: true,
  transportType: true,
  travelDate: true,
  travelerCount: true,
  serviceNameSnapshot: true,
  transportNameSnapshot: true,
  unitPriceMinor: true,
  totalPriceMinor: true,
  status: true,
  confirmedByUserId: true,
  confirmedAt: true,
  idempotencyKey: true,
  version: true,
  createdAt: true,
  updatedAt: true,
} as const;

type OrderRow = Prisma.OrderGetPayload<{ select: typeof ORDER_SELECT }>;

function safeMoney(value: bigint): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number))
    throw conflict("Мөнгөн дүн боловсруулах хэмжээнээс хэтэрсэн байна");
  return number;
}

function toAdminOrder(row: OrderRow): ordersContract.AdminOrder {
  return {
    ...row,
    travelDate: row.travelDate.toISOString().slice(0, 10),
    unitPriceMinor: safeMoney(row.unitPriceMinor),
    totalPriceMinor: safeMoney(row.totalPriceMinor),
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const SORTABLE = {
  publicOrderId: "publicOrderId",
  firstName: "firstName",
  lastName: "lastName",
  phone: "phone",
  serviceNameSnapshot: "serviceNameSnapshot",
  transportType: "transportType",
  travelDate: "travelDate",
  travelerCount: "travelerCount",
  totalPriceMinor: "totalPriceMinor",
  status: "status",
  createdAt: "createdAt",
} as const;

function orderBy(sort?: string): Prisma.OrderOrderByWithRelationInput {
  const desc = sort?.startsWith("-") ?? true;
  const key = desc ? sort?.slice(1) : sort;
  const column = SORTABLE[key as keyof typeof SORTABLE] ?? "createdAt";
  return { [column]: desc ? "desc" : "asc" };
}

export async function listAdminOrders(
  query: ordersContract.ListAdminOrdersQuery,
): Promise<ordersContract.ListAdminOrdersResponse> {
  const where: Prisma.OrderWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { publicOrderId: { contains: query.search, mode: "insensitive" } },
            { firstName: { contains: query.search, mode: "insensitive" } },
            { lastName: { contains: query.search, mode: "insensitive" } },
            { phone: { contains: query.search, mode: "insensitive" } },
            { serviceNameSnapshot: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: orderBy(query.sort),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: ORDER_SELECT,
    }),
  ]);
  return { items: rows.map(toAdminOrder), total, page: query.page, pageSize: query.pageSize };
}

async function assertCapacity(order: {
  id?: string;
  travelDepartureId?: string | null;
  travelerCount: number;
}) {
  if (!order.travelDepartureId) return;
  const departure = await prisma.travelDeparture.findFirst({
    where: { id: order.travelDepartureId },
    select: { capacity: true },
  });
  if (!departure) throw notFound("Аяллын гаралт олдсонгүй");
  const paid = await prisma.order.aggregate({
    where: {
      status: "PAID",
      travelDepartureId: order.travelDepartureId,
      ...(order.id ? { id: { not: order.id } } : {}),
    },
    _sum: { travelerCount: true },
  });
  const remaining = departure.capacity - (paid._sum.travelerCount ?? 0);
  if (remaining < order.travelerCount) {
    throw conflict(`Энэ гаралт дээр ${Math.max(remaining, 0)} суудал үлдсэн байна`);
  }
}

function mutationData(
  input: ordersContract.CreateAdminOrderInput | ordersContract.UpdateAdminOrderInput,
  actorId: string,
  existing?: Pick<OrderRow, "status" | "confirmedByUserId" | "confirmedAt">,
) {
  const preserveConfirmation = input.status === "PAID" && existing?.status === "PAID";
  return {
    publicOrderId: input.publicOrderId,
    firstName: input.firstName,
    lastName: input.lastName,
    address: input.address,
    phone: input.phone,
    email: input.email.toLowerCase(),
    serviceCode: input.serviceCode,
    travelDepartureId: input.travelDepartureId ?? null,
    transportType: input.transportType,
    travelDate: new Date(`${input.travelDate}T00:00:00.000Z`),
    travelerCount: input.travelerCount,
    serviceNameSnapshot: input.serviceNameSnapshot,
    transportNameSnapshot: input.transportNameSnapshot,
    unitPriceMinor: BigInt(input.unitPriceMinor),
    totalPriceMinor: BigInt(input.totalPriceMinor),
    status: input.status,
    idempotencyKey: input.idempotencyKey,
    confirmedByUserId: preserveConfirmation
      ? existing.confirmedByUserId
      : input.status === "PAID"
        ? actorId
        : null,
    confirmedAt: preserveConfirmation
      ? existing.confirmedAt
      : input.status === "PAID"
        ? new Date()
        : null,
  };
}

export async function createAdminOrder(
  input: ordersContract.CreateAdminOrderInput,
  actorId: string,
) {
  if (input.status === "PAID") await assertCapacity(input);
  const row = await prisma.order.create({
    data: mutationData(input, actorId),
    select: ORDER_SELECT,
  });
  return toAdminOrder(row);
}

export async function updateAdminOrder(
  id: string,
  input: ordersContract.UpdateAdminOrderInput,
  actorId: string,
) {
  const existing = await prisma.order.findFirst({ where: { id }, select: ORDER_SELECT });
  if (!existing) throw notFound("Захиалга олдсонгүй");
  if (input.status === "PAID") {
    await assertCapacity({ id, ...input });
  }
  const result = await prisma.order.updateMany({
    where: { id, version: input.version },
    data: { ...mutationData(input, actorId, existing), version: { increment: 1 } },
  });
  if (result.count === 0) {
    throw conflict("Энэ захиалгыг өөр хэрэглэгч зэрэг заслаа. Жагсаалтаа шинэчилнэ үү.");
  }
  const updated = await prisma.order.findFirstOrThrow({ where: { id }, select: ORDER_SELECT });
  return { order: toAdminOrder(updated), before: toAdminOrder(existing) };
}

export async function confirmAdminOrder(id: string, version: number, actorId: string) {
  const existing = await prisma.order.findFirst({ where: { id }, select: ORDER_SELECT });
  if (!existing) throw notFound("Захиалга олдсонгүй");
  if (existing.status === "PAID")
    return { order: toAdminOrder(existing), before: toAdminOrder(existing) };
  await assertCapacity(existing);
  const result = await prisma.order.updateMany({
    where: { id, version },
    data: {
      status: "PAID",
      confirmedByUserId: actorId,
      confirmedAt: new Date(),
      version: { increment: 1 },
    },
  });
  if (result.count === 0) throw conflict("Захиалга өөрчлөгдсөн байна. Жагсаалтаа шинэчилнэ үү.");
  const updated = await prisma.order.findFirstOrThrow({ where: { id }, select: ORDER_SELECT });
  return { order: toAdminOrder(updated), before: toAdminOrder(existing) };
}

export async function deleteAdminOrder(id: string) {
  const existing = await prisma.order.findFirst({ where: { id }, select: { id: true } });
  if (!existing) throw notFound("Захиалга олдсонгүй");
  await prisma.order.update({
    where: { id },
    data: { deletedAt: new Date(), version: { increment: 1 } },
  });
}

import { randomUUID } from "node:crypto";
import type { orders as ordersContract } from "@winu/contracts";
import { mn } from "@winu/mn-integrations";
import type { Prisma } from "@/generated/prisma/client";
import { conflict, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { nextDocumentNumber } from "@/lib/sequence/documentNumber";

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
type OrderTransaction = Pick<typeof prisma, "order" | "$queryRaw">;

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
    ...(query.publicOrderId
      ? { publicOrderId: { contains: query.publicOrderId, mode: "insensitive" } }
      : {}),
    ...(query.firstName ? { firstName: { contains: query.firstName, mode: "insensitive" } } : {}),
    ...(query.lastName ? { lastName: { contains: query.lastName, mode: "insensitive" } } : {}),
    ...(query.phone ? { phone: { contains: query.phone, mode: "insensitive" } } : {}),
    ...(query.serviceNameSnapshot
      ? { serviceNameSnapshot: { contains: query.serviceNameSnapshot, mode: "insensitive" } }
      : {}),
    ...(query.travelDate ? { travelDate: new Date(`${query.travelDate}T00:00:00.000Z`) } : {}),
    ...(query.travelerCount ? { travelerCount: query.travelerCount } : {}),
    ...(query.totalPriceMinor !== undefined
      ? { totalPriceMinor: BigInt(query.totalPriceMinor) }
      : {}),
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

const DAY_MS = 24 * 60 * 60 * 1000;
const DASHBOARD_DETAIL_LIMIT = 50;

function dashboardDateRange(days: ordersContract.OrderDashboard["days"], date?: string) {
  if (date) {
    const start = mn.zonedStartOfDayUtc(new Date(`${date}T12:00:00.000Z`));
    return { start, end: new Date(start.getTime() + DAY_MS) };
  }
  const todayStart = mn.zonedStartOfDayUtc(new Date());
  const end = new Date(todayStart.getTime() + DAY_MS);
  return { start: new Date(end.getTime() - days * DAY_MS), end };
}

export async function getOrderDashboard(
  days: ordersContract.OrderDashboard["days"],
): Promise<ordersContract.OrderDashboard> {
  const { start, end } = dashboardDateRange(days);
  const [orders, paidOrders, pendingOrders] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: {
        createdAt: true,
        serviceNameSnapshot: true,
        status: true,
        travelerCount: true,
        travelDeparture: { select: { travelId: true } },
      },
    }),
    prisma.order.findMany({
      where: { status: "PAID", confirmedAt: { gte: start, lt: end } },
      select: { confirmedAt: true, totalPriceMinor: true, travelerCount: true },
    }),
    prisma.order.findMany({
      where: { status: "AWAITING_PAYMENT" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, totalPriceMinor: true, travelerCount: true },
    }),
  ]);
  const daily = Array.from({ length: days }, (_, index) => ({
    date: mn.zonedParts(new Date(start.getTime() + index * DAY_MS)).dateKey,
    orders: 0,
    confirmedOrders: 0,
    pendingOrders: 0,
    paidRevenueMinor: 0n,
  }));
  const byDate = new Map(daily.map((day) => [day.date, day]));
  for (const order of orders) {
    const day = byDate.get(mn.zonedParts(order.createdAt).dateKey);
    if (day) {
      day.orders += 1;
      if (order.status === "AWAITING_PAYMENT") day.pendingOrders += 1;
    }
  }
  for (const order of paidOrders) {
    if (!order.confirmedAt) continue;
    const day = byDate.get(mn.zonedParts(order.confirmedAt).dateKey);
    if (day) {
      day.confirmedOrders += 1;
      day.paidRevenueMinor += order.totalPriceMinor;
    }
  }
  const topTrips = new Map<string, { travelId: string; name: string; travelerCount: number }>();
  for (const order of orders) {
    const travelId = order.travelDeparture?.travelId;
    if (!travelId) continue;
    const current = topTrips.get(travelId);
    topTrips.set(travelId, {
      travelId,
      name: current?.name ?? order.serviceNameSnapshot,
      travelerCount: (current?.travelerCount ?? 0) + order.travelerCount,
    });
  }
  const responseDaily = daily.map((day) => ({
    date: day.date,
    orders: day.orders,
    confirmedOrders: day.confirmedOrders,
    pendingOrders: day.pendingOrders,
    paidRevenueMinor: safeMoney(day.paidRevenueMinor),
  }));
  const paidRevenueMinor = safeMoney(
    paidOrders.reduce((total, order) => total + order.totalPriceMinor, 0n),
  );
  return {
    days,
    totalOrders: orders.length,
    totalTravelers: orders.reduce((total, order) => total + order.travelerCount, 0),
    pending: {
      orderCount: pendingOrders.length,
      travelerCount: pendingOrders.reduce((total, order) => total + order.travelerCount, 0),
      amountMinor: safeMoney(
        pendingOrders.reduce((total, order) => total + order.totalPriceMinor, 0n),
      ),
      oldestCreatedAt: pendingOrders[0]?.createdAt.toISOString() ?? null,
    },
    confirmed: {
      orderCount: paidOrders.length,
      travelerCount: paidOrders.reduce((total, order) => total + order.travelerCount, 0),
      revenueMinor: paidRevenueMinor,
    },
    daily: responseDaily,
    topTrips: [...topTrips.values()]
      .sort(
        (left, right) =>
          right.travelerCount - left.travelerCount || left.name.localeCompare(right.name, "mn"),
      )
      .slice(0, 10),
  };
}

const DASHBOARD_DETAIL_SELECT = {
  id: true,
  publicOrderId: true,
  firstName: true,
  lastName: true,
  serviceNameSnapshot: true,
  travelDate: true,
  travelerCount: true,
  totalPriceMinor: true,
  status: true,
  createdAt: true,
  confirmedAt: true,
} as const;

type DashboardDetailRow = Prisma.OrderGetPayload<{ select: typeof DASHBOARD_DETAIL_SELECT }>;

function toDashboardDetailItem(row: DashboardDetailRow): ordersContract.OrderDashboardDetailItem {
  return {
    id: row.id,
    publicOrderId: row.publicOrderId,
    customerName: `${row.lastName} ${row.firstName}`.trim(),
    serviceName: row.serviceNameSnapshot,
    travelDate: row.travelDate.toISOString().slice(0, 10),
    travelerCount: row.travelerCount,
    totalPriceMinor: safeMoney(row.totalPriceMinor),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
  };
}

function dashboardTripOptions(rows: DashboardDetailRow[]) {
  return [...new Set(rows.map((order) => order.serviceNameSnapshot))].sort((left, right) =>
    left.localeCompare(right, "mn"),
  );
}

function filterDashboardDetails(
  rows: DashboardDetailRow[],
  query: ordersContract.OrderDashboardDetailsQuery,
) {
  const search = query.search?.toLocaleLowerCase("mn-MN");
  return rows.filter(
    (order) =>
      (!query.travelName || order.serviceNameSnapshot === query.travelName) &&
      (!search ||
        order.publicOrderId.toLocaleLowerCase("mn-MN").includes(search) ||
        order.firstName.toLocaleLowerCase("mn-MN").includes(search) ||
        order.lastName.toLocaleLowerCase("mn-MN").includes(search) ||
        `${order.lastName} ${order.firstName}`.toLocaleLowerCase("mn-MN").includes(search)),
  );
}

export async function getOrderDashboardDetails(
  query: ordersContract.OrderDashboardDetailsQuery,
): Promise<ordersContract.OrderDashboardDetails> {
  const { start, end } = dashboardDateRange(query.days, query.date);
  const travelFilter = query.travelId
    ? { travelDeparture: { travelId: query.travelId } }
    : undefined;
  const pendingAll = query.scope === "PENDING_ALL";
  const [createdOrders, paidOrders] = await Promise.all([
    prisma.order.findMany({
      where: pendingAll
        ? { status: "AWAITING_PAYMENT" }
        : { createdAt: { gte: start, lt: end }, ...travelFilter },
      orderBy: { createdAt: "desc" },
      select: DASHBOARD_DETAIL_SELECT,
    }),
    pendingAll
      ? Promise.resolve([])
      : prisma.order.findMany({
          where: {
            status: "PAID",
            confirmedAt: { gte: start, lt: end },
            ...travelFilter,
          },
          orderBy: { confirmedAt: "desc" },
          select: DASHBOARD_DETAIL_SELECT,
        }),
  ]);
  const filteredCreatedOrders = filterDashboardDetails(createdOrders, query);
  const filteredPaidOrders = filterDashboardDetails(paidOrders, query);
  return {
    totalOrders: filteredCreatedOrders.length,
    totalTravelers: filteredCreatedOrders.reduce((total, order) => total + order.travelerCount, 0),
    totalAmountMinor: safeMoney(
      filteredCreatedOrders.reduce((total, order) => total + order.totalPriceMinor, 0n),
    ),
    totalPaidOrders: filteredPaidOrders.length,
    totalPaidTravelers: filteredPaidOrders.reduce((total, order) => total + order.travelerCount, 0),
    paidRevenueMinor: safeMoney(
      filteredPaidOrders.reduce((total, order) => total + order.totalPriceMinor, 0n),
    ),
    orderTripOptions: dashboardTripOptions(createdOrders),
    paidTripOptions: dashboardTripOptions(paidOrders),
    orders: filteredCreatedOrders.slice(0, DASHBOARD_DETAIL_LIMIT).map(toDashboardDetailItem),
    paidOrders: filteredPaidOrders.slice(0, DASHBOARD_DETAIL_LIMIT).map(toDashboardDetailItem),
    hasMoreOrders: filteredCreatedOrders.length > DASHBOARD_DETAIL_LIMIT,
    hasMorePaidOrders: filteredPaidOrders.length > DASHBOARD_DETAIL_LIMIT,
  };
}

export async function listAdminOrderDepartureOptions(): Promise<ordersContract.ListAdminOrderDepartureOptionsResponse> {
  const departures = await prisma.travelDeparture.findMany({
    orderBy: { departureDate: "asc" },
    select: {
      id: true,
      departureDate: true,
      returnDate: true,
      transportType: true,
      unitPriceMinor: true,
      capacity: true,
      isBookingOpen: true,
      travel: { select: { id: true, name: true } },
      orders: {
        where: { status: "PAID" },
        select: { travelerCount: true },
      },
    },
  });

  return departures.map((departure) => ({
    id: departure.id,
    travelId: departure.travel.id,
    travelName: departure.travel.name,
    departureDate: departure.departureDate.toISOString().slice(0, 10),
    returnDate: departure.returnDate.toISOString().slice(0, 10),
    transportType: departure.transportType,
    unitPriceMinor: safeMoney(departure.unitPriceMinor),
    capacity: departure.capacity,
    remainingSeats: Math.max(
      0,
      departure.capacity -
        departure.orders.reduce((total, order) => total + order.travelerCount, 0),
    ),
    isBookingOpen: departure.isBookingOpen,
  }));
}

async function assertCapacity(
  db: OrderTransaction,
  order: {
    id?: string;
    travelDepartureId?: string | null;
    travelerCount: number;
  },
) {
  if (!order.travelDepartureId) return;
  const departures = await db.$queryRaw<Array<{ capacity: number }>>`
    SELECT capacity
    FROM travel_departures
    WHERE id = ${order.travelDepartureId}
      AND "deletedAt" IS NULL
    FOR UPDATE
  `;
  const departure = departures[0];
  if (!departure) throw notFound("Аяллын гаралт олдсонгүй");
  const paid = await db.order.aggregate({
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
  input: ordersContract.UpdateAdminOrderInput,
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
  const createInput: ordersContract.UpdateAdminOrderInput = {
    ...input,
    publicOrderId: await nextDocumentNumber({ name: "order", prefix: "ORD" }),
    idempotencyKey: randomUUID(),
    version: 0,
  };
  const row = await prisma.$transaction(async (tx) => {
    if (createInput.status === "PAID") await assertCapacity(tx, createInput);
    return tx.order.create({
      data: mutationData(createInput, actorId),
      select: ORDER_SELECT,
    });
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
  const updated = await prisma.$transaction(async (tx) => {
    if (input.status === "PAID") await assertCapacity(tx, { id, ...input });
    const result = await tx.order.updateMany({
      where: { id, version: input.version },
      data: { ...mutationData(input, actorId, existing), version: { increment: 1 } },
    });
    if (result.count === 0) {
      throw conflict("Энэ захиалгыг өөр хэрэглэгч зэрэг заслаа. Жагсаалтаа шинэчилнэ үү.");
    }
    return tx.order.findFirstOrThrow({ where: { id }, select: ORDER_SELECT });
  });
  return { order: toAdminOrder(updated), before: toAdminOrder(existing) };
}

export async function confirmAdminOrder(id: string, version: number, actorId: string) {
  const existing = await prisma.order.findFirst({ where: { id }, select: ORDER_SELECT });
  if (!existing) throw notFound("Захиалга олдсонгүй");
  if (existing.status === "PAID")
    return { order: toAdminOrder(existing), before: toAdminOrder(existing) };
  const updated = await prisma.$transaction(async (tx) => {
    await assertCapacity(tx, existing);
    const result = await tx.order.updateMany({
      where: { id, version },
      data: {
        status: "PAID",
        confirmedByUserId: actorId,
        confirmedAt: new Date(),
        version: { increment: 1 },
      },
    });
    if (result.count === 0) {
      throw conflict("Захиалга өөрчлөгдсөн байна. Жагсаалтаа шинэчилнэ үү.");
    }
    return tx.order.findFirstOrThrow({ where: { id }, select: ORDER_SELECT });
  });
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

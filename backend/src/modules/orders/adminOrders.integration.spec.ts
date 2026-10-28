import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  api,
  bearer,
  createUser,
  login,
  PREFIX,
  resetDatabase,
  seedOrganization,
  seedRoles,
} from "@/test/helpers";

describe("admin orders (integration)", () => {
  let departureId: string;

  beforeEach(async () => {
    await resetDatabase();
    await seedOrganization();
    const roles = await seedRoles();
    await createUser({ email: "owner@test.mn", password: "Test1234!", roleId: roles.owner });
    await createUser({ email: "viewer@test.mn", password: "Test1234!", roleId: roles.viewer });
    const travel = await prisma.travel.create({
      data: {
        name: "Тест аялал",
        slug: "order-test-travel",
        departures: {
          create: {
            departureDate: new Date("2027-06-01T00:00:00.000Z"),
            returnDate: new Date("2027-06-03T00:00:00.000Z"),
            transportType: "GROUND",
            unitPriceMinor: 100000n,
            capacity: 2,
          },
        },
      },
      include: { departures: true },
    });
    departureId = travel.departures[0]?.id ?? "";
  });

  it("нэвтрээгүй хэрэглэгч 401, бичих эрхгүй хэрэглэгч 403 авна", async () => {
    await api().get(`${PREFIX}/orders`).expect(401);
    const viewerToken = await login("viewer@test.mn", "Test1234!");
    await api().get(`${PREFIX}/orders`).set(bearer(viewerToken)).expect(200);
    await api().post(`${PREFIX}/orders`).set(bearer(viewerToken)).send({}).expect(403);
    await api().get(`${PREFIX}/orders/departure-options`).expect(401);
    await api().get(`${PREFIX}/orders/departure-options`).set(bearer(viewerToken)).expect(403);
    await api().get(`${PREFIX}/orders/dashboard`).expect(401);
    await api().get(`${PREFIX}/orders/dashboard`).set(bearer(viewerToken)).expect(200);

    const restrictedRole = await prisma.role.create({
      data: { name: "restricted", permissions: [], isSystem: false },
    });
    await createUser({
      email: "restricted@test.mn",
      password: "Test1234!",
      roleId: restrictedRole.id,
    });
    const restrictedToken = await login("restricted@test.mn", "Test1234!");
    await api().get(`${PREFIX}/orders/dashboard`).set(bearer(restrictedToken)).expect(403);
  });

  it("dashboard захиалга, төлөгдсөн орлого, эрэлттэй аяллыг нэгтгэнэ", async () => {
    const token = await login("owner@test.mn", "Test1234!");
    const owner = await prisma.user.findFirstOrThrow({ where: { email: "owner@test.mn" } });
    const secondTravel = await prisma.travel.create({
      data: {
        name: "Хоёр дахь аялал",
        slug: "second-dashboard-travel",
        departures: {
          create: {
            departureDate: new Date("2027-07-01T00:00:00.000Z"),
            returnDate: new Date("2027-07-03T00:00:00.000Z"),
            transportType: "DIRECT_FLIGHT",
            unitPriceMinor: 150000n,
            capacity: 10,
          },
        },
      },
      include: { departures: true },
    });
    const now = new Date();
    const baseOrder = {
      firstName: "Бат",
      lastName: "Дорж",
      address: "Улаанбаатар",
      phone: "99112233",
      email: "dashboard@example.com",
      serviceCode: "TRAVEL",
      transportType: "GROUND" as const,
      travelDate: new Date("2027-06-01T00:00:00.000Z"),
      transportNameSnapshot: "Автобус",
      unitPriceMinor: 100000n,
      createdAt: now,
    };
    await prisma.order.createMany({
      data: [
        {
          ...baseOrder,
          publicOrderId: "ORD-DASH-1",
          travelDepartureId: departureId,
          travelerCount: 2,
          serviceNameSnapshot: "Тест аялал",
          totalPriceMinor: 200000n,
          status: "PAID",
          confirmedByUserId: owner.id,
          confirmedAt: now,
          idempotencyKey: "dashboard-order-1",
        },
        {
          ...baseOrder,
          publicOrderId: "ORD-DASH-2",
          travelDepartureId: departureId,
          travelerCount: 1,
          serviceNameSnapshot: "Тест аялал",
          totalPriceMinor: 100000n,
          idempotencyKey: "dashboard-order-2",
        },
        {
          ...baseOrder,
          publicOrderId: "ORD-DASH-3",
          travelDepartureId: secondTravel.departures[0]?.id,
          transportType: "DIRECT_FLIGHT",
          travelerCount: 1,
          serviceNameSnapshot: "Хоёр дахь аялал",
          totalPriceMinor: 150000n,
          status: "PAID",
          confirmedByUserId: owner.id,
          confirmedAt: now,
          idempotencyKey: "dashboard-order-3",
        },
      ],
    });

    const response = await api()
      .get(`${PREFIX}/orders/dashboard?days=7`)
      .set(bearer(token))
      .expect(200);

    expect(response.body.totalOrders).toBe(3);
    expect(response.body.paidRevenueMinor).toBe(350000);
    expect(response.body.daily).toHaveLength(7);
    expect(
      response.body.daily.reduce((total: number, day: { orders: number }) => total + day.orders, 0),
    ).toBe(3);
    expect(response.body.topTrips[0]).toEqual(
      expect.objectContaining({ name: "Тест аялал", travelerCount: 3 }),
    );
  });

  it("захиалгын form-д гаралт болон үлдсэн суудлыг өгнө", async () => {
    const token = await login("owner@test.mn", "Test1234!");
    const response = await api()
      .get(`${PREFIX}/orders/departure-options`)
      .set(bearer(token))
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        id: departureId,
        capacity: 2,
        remainingSeats: 2,
        isBookingOpen: true,
      }),
    ]);
  });

  it("захиалга үүсгэж, төлбөр баталгаажуулж, зөөлөн устгана", async () => {
    const token = await login("owner@test.mn", "Test1234!");
    const created = await api()
      .post(`${PREFIX}/orders`)
      .set(bearer(token))
      .send({
        firstName: "Бат",
        lastName: "Дорж",
        address: "Улаанбаатар",
        phone: "99112233",
        email: "bat@example.com",
        serviceCode: "TRAVEL",
        travelDepartureId: departureId,
        transportType: "GROUND",
        travelDate: "2027-06-01",
        travelerCount: 2,
        serviceNameSnapshot: "Тест аялал",
        transportNameSnapshot: "Автобус",
        unitPriceMinor: 100000,
        totalPriceMinor: 200000,
        status: "AWAITING_PAYMENT",
      })
      .expect(201);
    expect(created.body.publicOrderId).toMatch(/^ORD-\d{4}-\d{6}$/);

    const confirmed = await api()
      .post(`${PREFIX}/orders/${created.body.id}/confirm`)
      .set(bearer(token))
      .send({ version: created.body.version })
      .expect(200);
    expect(confirmed.body.status).toBe("PAID");
    expect(confirmed.body.confirmedByUserId).not.toBeNull();

    const edited = await api()
      .patch(`${PREFIX}/orders/${created.body.id}`)
      .set(bearer(token))
      .send({
        ...confirmed.body,
        firstName: "Зассан нэр",
        version: confirmed.body.version,
      })
      .expect(200);
    expect(edited.body.confirmedAt).toBe(confirmed.body.confirmedAt);

    await api().delete(`${PREFIX}/orders/${created.body.id}`).set(bearer(token)).expect(204);
    const list = await api().get(`${PREFIX}/orders`).set(bearer(token)).expect(200);
    expect(list.body.total).toBe(0);
  });

  it("хоёр захиалгыг зэрэг баталгаажуулахад суудлын багтаамж хэтрэхгүй", async () => {
    const token = await login("owner@test.mn", "Test1234!");
    const orders = await Promise.all(
      [1, 2].map((index) =>
        prisma.order.create({
          data: {
            publicOrderId: `ORD-RACE-${index}`,
            firstName: "Бат",
            lastName: "Дорж",
            address: "Улаанбаатар",
            phone: "99112233",
            email: `race-${index}@example.com`,
            serviceCode: "TRAVEL",
            travelDepartureId: departureId,
            transportType: "GROUND",
            travelDate: new Date("2027-06-01T00:00:00.000Z"),
            travelerCount: 2,
            serviceNameSnapshot: "Тест аялал",
            transportNameSnapshot: "Автобус",
            unitPriceMinor: 100000n,
            totalPriceMinor: 200000n,
            idempotencyKey: `race-order-${index}`,
          },
          select: { id: true, version: true },
        }),
      ),
    );

    const responses = await Promise.all(
      orders.map((order) =>
        api()
          .post(`${PREFIX}/orders/${order.id}/confirm`)
          .set(bearer(token))
          .send({ version: order.version }),
      ),
    );

    expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
    const paid = await prisma.order.aggregate({
      where: { travelDepartureId: departureId, status: "PAID" },
      _sum: { travelerCount: true },
    });
    expect(paid._sum.travelerCount).toBe(2);
  });
});

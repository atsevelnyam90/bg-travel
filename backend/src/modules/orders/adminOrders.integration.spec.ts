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
  });

  it("захиалга үүсгэж, төлбөр баталгаажуулж, зөөлөн устгана", async () => {
    const token = await login("owner@test.mn", "Test1234!");
    const created = await api()
      .post(`${PREFIX}/orders`)
      .set(bearer(token))
      .send({
        publicOrderId: "ORD-TEST-1",
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
        idempotencyKey: "admin-test-order-1",
      })
      .expect(201);

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
});

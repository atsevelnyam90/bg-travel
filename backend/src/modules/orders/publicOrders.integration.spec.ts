import { orders as ordersContract } from "@winu/contracts";
import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { api, PREFIX, resetDatabase } from "@/test/helpers";

const orderInput = {
  travelerCount: 2,
  firstName: "Бат",
  lastName: "Болд",
  phone: "99112233",
  email: "BAT@example.mn",
  address: "Улаанбаатар",
  idempotencyKey: "c06bd669-6a43-4ed5-a1f2-b76a9c6b1269",
};

async function seedSlot(options?: { capacity?: number; isBookingOpen?: boolean }) {
  const travel = await prisma.travel.create({
    data: { name: "Kenya Private Safari", description: "Safari аялал" },
  });
  const slot = await prisma.travelDeparture.create({
    data: {
      travelId: travel.id,
      departureDate: new Date("2026-11-05T00:00:00.000Z"),
      returnDate: new Date("2026-11-12T00:00:00.000Z"),
      transportType: "GROUND",
      unitPriceMinor: 890_000_000n,
      capacity: options?.capacity ?? 12,
      isBookingOpen: options?.isBookingOpen ?? true,
    },
  });
  return { travel, slot };
}

describe("public orders", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("returns only public payment account fields without authentication", async () => {
    const response = await api().get(`${PREFIX}/public/payment-info`).expect(200);

    expect(ordersContract.publicPaymentInfoSchema.parse(response.body)).toEqual({
      bankAccount: "MN770005005619113075",
      bankAccountName: "КОСО ЛАЙН",
      bankName: "Хаан банк",
      currency: "MNT",
    });
    expect(Object.keys(response.body).sort()).toEqual(
      ["bankAccount", "bankAccountName", "bankName", "currency"].sort(),
    );
  });

  it("creates an order from the server-side slot values without authentication", async () => {
    const { travel, slot } = await seedSlot();

    const response = await api()
      .post(`${PREFIX}/public/orders`)
      .send({ ...orderInput, slotPublicId: slot.publicId, totalPriceMinor: 1 })
      .expect(201);

    const publicOrder = ordersContract.publicOrderSchema.parse(response.body);
    expect(publicOrder).toMatchObject({
      status: "AWAITING_PAYMENT",
      totalPriceMinor: 1_780_000_000,
      payment: {
        amountMinor: 1_780_000_000,
        bankAccount: "MN770005005619113075",
        bankAccountName: "КОСО ЛАЙН",
        bankName: "Хаан банк",
        currency: "MNT",
      },
    });
    expect(response.body).not.toHaveProperty("id");

    const saved = await prisma.order.findFirstOrThrow({
      where: { publicOrderId: response.body.publicOrderId },
    });
    expect(saved).toMatchObject({
      firstName: "Бат",
      lastName: "Болд",
      address: "Улаанбаатар",
      email: "bat@example.mn",
      travelDepartureId: slot.id,
      serviceCode: travel.publicId,
      serviceNameSnapshot: travel.name,
      transportNameSnapshot: "Газар",
      unitPriceMinor: 890_000_000n,
      totalPriceMinor: 1_780_000_000n,
      travelerCount: 2,
    });
  });

  it("accepts an order without an address", async () => {
    const { slot } = await seedSlot();

    const response = await api()
      .post(`${PREFIX}/public/orders`)
      .send({ ...orderInput, address: undefined, slotPublicId: slot.publicId })
      .expect(201);

    const saved = await prisma.order.findFirstOrThrow({
      where: { publicOrderId: response.body.publicOrderId },
      select: { address: true },
    });
    expect(saved.address).toBe("");
  });

  it("returns the same order when an idempotency key is submitted again", async () => {
    const { slot } = await seedSlot();
    const body = { ...orderInput, slotPublicId: slot.publicId };

    const created = await api().post(`${PREFIX}/public/orders`).send(body).expect(201);
    const replay = await api().post(`${PREFIX}/public/orders`).send(body).expect(200);

    expect(replay.body).toEqual(created.body);
    expect(await prisma.order.count()).toBe(1);
  });

  it("rejects closed departures and counts only confirmed orders against capacity", async () => {
    const closed = await seedSlot({ isBookingOpen: false });
    await api()
      .post(`${PREFIX}/public/orders`)
      .send({ ...orderInput, slotPublicId: closed.slot.publicId })
      .expect(409);

    const limited = await seedSlot({ capacity: 2 });
    const pending = await api()
      .post(`${PREFIX}/public/orders`)
      .send({
        ...orderInput,
        idempotencyKey: "d14f3f78-f36e-4b83-b113-6b60bf0039a1",
        slotPublicId: limited.slot.publicId,
      })
      .expect(201);

    await api()
      .post(`${PREFIX}/public/orders`)
      .send({
        ...orderInput,
        travelerCount: 1,
        idempotencyKey: "0e91e0fd-8fa7-4cb5-826c-14c9865d2bc1",
        slotPublicId: limited.slot.publicId,
      })
      .expect(201);

    const confirmer = await prisma.user.create({
      data: { email: "order-confirmer@example.mn", name: "Баталгаажуулагч", status: "ACTIVE" },
    });
    await prisma.order.update({
      where: { publicOrderId: pending.body.publicOrderId },
      data: { status: "PAID", confirmedByUserId: confirmer.id, confirmedAt: new Date() },
    });

    const full = await api()
      .post(`${PREFIX}/public/orders`)
      .send({
        ...orderInput,
        travelerCount: 1,
        idempotencyKey: "8cd58412-42f4-4aa2-9fba-f50fa40af26a",
        slotPublicId: limited.slot.publicId,
      })
      .expect(409);
    expect(full.body.code).toBe("CONFLICT");
  });
});

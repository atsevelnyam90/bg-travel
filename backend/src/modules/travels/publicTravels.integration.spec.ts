import { travels as travelsContract } from "@winu/contracts";
import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { api, PREFIX, resetDatabase } from "@/test/helpers";

describe("public travels", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("returns open slots nested under their travel without authentication", async () => {
    const kenya = await prisma.travel.create({
      data: {
        name: "Kenya Private Safari",
        slug: "kenya-private-safari",
        description: "Safari аялал",
        category: "INTERNATIONAL",
        status: "PUBLISHED",
        coverImage: "https://cdn.example.com/kenya.jpg",
        durationDays: 8,
      },
    });
    const gobi = await prisma.travel.create({
      data: { name: "Gobi tour", slug: "gobi-tour", description: null, status: "PUBLISHED" },
    });
    await prisma.travelDetail.createMany({
      data: [
        {
          travelId: kenya.id,
          dayNumber: 2,
          title: "Маасай тосгон",
          content: "Өдрийн аялал",
          images: ["https://cdn.example.com/day-2.jpg"],
        },
        { travelId: kenya.id, dayNumber: 1, title: "Найроби", content: null },
      ],
    });
    const openSlot = await prisma.travelDeparture.create({
      data: {
        travelId: kenya.id,
        departureDate: new Date("2026-11-05T00:00:00.000Z"),
        returnDate: new Date("2026-11-12T00:00:00.000Z"),
        transportType: "GROUND",
        unitPriceMinor: 890000000n,
        capacity: 12,
        isBookingOpen: true,
      },
    });
    await prisma.travelDeparture.createMany({
      data: [
        {
          travelId: kenya.id,
          departureDate: new Date("2026-12-05T00:00:00.000Z"),
          returnDate: new Date("2026-12-12T00:00:00.000Z"),
          transportType: "DIRECT_FLIGHT",
          unitPriceMinor: 1180000000n,
          capacity: 10,
          isBookingOpen: false,
        },
        {
          travelId: gobi.id,
          departureDate: new Date("2026-10-20T00:00:00.000Z"),
          returnDate: new Date("2026-10-22T00:00:00.000Z"),
          transportType: "GROUND",
          unitPriceMinor: 100000000n,
          capacity: 8,
          isBookingOpen: false,
        },
      ],
    });

    const confirmed = await api()
      .post(`${PREFIX}/public/orders`)
      .send({
        slotPublicId: openSlot.publicId,
        travelerCount: 3,
        firstName: "Бат",
        lastName: "Болд",
        phone: "99112233",
        email: "confirmed@example.mn",
        idempotencyKey: "af3ed29a-10fe-4dfc-8161-23e97f5d7f8c",
      })
      .expect(201);
    const confirmer = await prisma.user.create({
      data: { email: "travel-confirmer@example.mn", name: "Баталгаажуулагч", status: "ACTIVE" },
    });
    await prisma.order.update({
      where: { publicOrderId: confirmed.body.publicOrderId },
      data: { status: "PAID", confirmedByUserId: confirmer.id, confirmedAt: new Date() },
    });
    await api()
      .post(`${PREFIX}/public/orders`)
      .send({
        slotPublicId: openSlot.publicId,
        travelerCount: 2,
        firstName: "Сараа",
        lastName: "Дорж",
        phone: "88112233",
        email: "pending@example.mn",
        idempotencyKey: "3ead4a11-4dbf-46ed-868d-a572ea667d75",
      })
      .expect(201);

    const response = await api().get(`${PREFIX}/public/travels`).expect(200);
    expect(travelsContract.listPublicTravelsResponseSchema.parse(response.body)).toEqual([
      {
        publicId: kenya.publicId,
        slug: "kenya-private-safari",
        name: "Kenya Private Safari",
        description: "Safari аялал",
        category: "INTERNATIONAL",
        coverImage: "https://cdn.example.com/kenya.jpg",
        durationDays: 8,
        details: [
          {
            dayNumber: 1,
            title: "Найроби",
            content: null,
            images: [],
          },
          {
            dayNumber: 2,
            title: "Маасай тосгон",
            content: "Өдрийн аялал",
            images: ["https://cdn.example.com/day-2.jpg"],
          },
        ],
        slots: [
          {
            publicId: openSlot.publicId,
            departureDate: "2026-11-05",
            returnDate: "2026-11-12",
            transportType: "GROUND",
            unitPriceMinor: 890000000,
            capacity: 12,
            remainingSeats: 9,
          },
        ],
      },
    ]);
  });

  it("does not expose internal fields or soft-deleted rows", async () => {
    const visible = await prisma.travel.create({
      data: { name: "Visible", slug: "visible", status: "PUBLISHED" },
    });
    const deleted = await prisma.travel.create({
      data: { name: "Deleted", slug: "deleted", status: "PUBLISHED", deletedAt: new Date() },
    });
    const draft = await prisma.travel.create({
      data: { name: "Draft", slug: "draft", status: "DRAFT" },
    });
    const visibleSlot = await prisma.travelDeparture.create({
      data: {
        travelId: visible.id,
        departureDate: new Date("2026-11-05T00:00:00.000Z"),
        returnDate: new Date("2026-11-12T00:00:00.000Z"),
        transportType: "GROUND",
        unitPriceMinor: 890000000n,
        capacity: 12,
      },
    });
    await prisma.travelDeparture.createMany({
      data: [
        {
          travelId: visible.id,
          departureDate: new Date("2026-12-05T00:00:00.000Z"),
          returnDate: new Date("2026-12-12T00:00:00.000Z"),
          transportType: "GROUND",
          unitPriceMinor: 900000000n,
          capacity: 10,
          deletedAt: new Date(),
        },
        {
          travelId: deleted.id,
          departureDate: new Date("2026-11-05T00:00:00.000Z"),
          returnDate: new Date("2026-11-12T00:00:00.000Z"),
          transportType: "GROUND",
          unitPriceMinor: 800000000n,
          capacity: 10,
        },
        {
          travelId: draft.id,
          departureDate: new Date("2026-11-05T00:00:00.000Z"),
          returnDate: new Date("2026-11-12T00:00:00.000Z"),
          transportType: "GROUND",
          unitPriceMinor: 800000000n,
          capacity: 10,
        },
      ],
    });

    const response = await api().get(`${PREFIX}/public/travels`).expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].publicId).toBe(visible.publicId);
    expect(response.body[0].slots).toHaveLength(1);
    expect(response.body[0].slots[0].publicId).toBe(visibleSlot.publicId);
    expect(response.body[0].slots[0].remainingSeats).toBe(12);
    for (const forbidden of ["id", "version", "createdAt", "updatedAt", "deletedAt", "status"]) {
      expect(response.body[0]).not.toHaveProperty(forbidden);
      expect(response.body[0].slots[0]).not.toHaveProperty(forbidden);
    }
  });

  it("returns a published travel by slug even when it has no open departure", async () => {
    const travel = await prisma.travel.create({
      data: {
        name: "Wedding escape",
        slug: "wedding-escape",
        category: "WEDDING",
        status: "PUBLISHED",
        durationDays: 4,
      },
    });
    await prisma.travelDetail.create({
      data: { travelId: travel.id, dayNumber: 1, title: "Ирэх өдөр" },
    });

    const response = await api().get(`${PREFIX}/public/travels/wedding-escape`).expect(200);
    expect(travelsContract.getPublicTravelResponseSchema.parse(response.body)).toMatchObject({
      slug: "wedding-escape",
      category: "WEDDING",
      durationDays: 4,
      slots: [],
      details: [{ dayNumber: 1, title: "Ирэх өдөр" }],
    });

    await prisma.travel.update({ where: { id: travel.id }, data: { status: "ARCHIVED" } });
    await api().get(`${PREFIX}/public/travels/wedding-escape`).expect(404);
  });
});

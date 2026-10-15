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
      data: { name: "Kenya Private Safari", description: "Safari аялал" },
    });
    const gobi = await prisma.travel.create({
      data: { name: "Gobi tour", description: null },
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

    const response = await api().get(`${PREFIX}/public/travels`).expect(200);
    expect(travelsContract.listPublicTravelsResponseSchema.parse(response.body)).toEqual([
      {
        publicId: kenya.publicId,
        name: "Kenya Private Safari",
        description: "Safari аялал",
        slots: [
          {
            publicId: openSlot.publicId,
            departureDate: "2026-11-05",
            returnDate: "2026-11-12",
            transportType: "GROUND",
            unitPriceMinor: 890000000,
            capacity: 12,
          },
        ],
      },
    ]);
  });

  it("does not expose internal fields or soft-deleted rows", async () => {
    const visible = await prisma.travel.create({ data: { name: "Visible" } });
    const deleted = await prisma.travel.create({
      data: { name: "Deleted", deletedAt: new Date() },
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
      ],
    });

    const response = await api().get(`${PREFIX}/public/travels`).expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].publicId).toBe(visible.publicId);
    expect(response.body[0].slots).toHaveLength(1);
    expect(response.body[0].slots[0].publicId).toBe(visibleSlot.publicId);
    for (const forbidden of ["id", "version", "createdAt", "updatedAt", "deletedAt"]) {
      expect(response.body[0]).not.toHaveProperty(forbidden);
      expect(response.body[0].slots[0]).not.toHaveProperty(forbidden);
    }
  });
});

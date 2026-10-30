import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { resetDatabase } from "@/test/helpers";
import { seedTravelDemo } from "./seedTravelDemo";

describe("seedTravelDemo", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("creates the demo travel with departures and rich-text details exactly once", async () => {
    await expect(seedTravelDemo()).resolves.toMatchObject({
      created: { departures: 4, details: 8, sections: 3, travel: 1 },
      skippedDeletedTravel: false,
      slug: "vietnam-three-cities",
    });

    const travel = await prisma.travel.findFirstOrThrow({
      where: { slug: "vietnam-three-cities" },
      include: {
        departures: { orderBy: [{ departureDate: "asc" }, { transportType: "asc" }] },
        itinerarySections: { orderBy: { sortOrder: "asc" } },
        details: { orderBy: { dayNumber: "asc" } },
      },
    });
    expect(travel).toMatchObject({
      category: "INTERNATIONAL",
      durationDays: 8,
      status: "PUBLISHED",
    });
    expect(travel.departures).toHaveLength(4);
    expect(travel.itinerarySections).toHaveLength(3);
    expect(travel.itinerarySections[1].images).toHaveLength(4);
    expect(travel.details).toHaveLength(8);
    expect(travel.details.every((detail) => detail.sectionId !== null)).toBe(true);
    expect(JSON.parse(travel.details[0].content ?? "")).toMatchObject({ type: "doc" });
    expect(travel.details[5].images).toHaveLength(5);

    await expect(seedTravelDemo()).resolves.toMatchObject({
      created: { departures: 0, details: 0, sections: 0, travel: 0 },
      skippedDeletedTravel: false,
    });
    expect(await prisma.travel.count()).toBe(1);
    expect(await prisma.travelDeparture.count()).toBe(4);
    expect(await prisma.travelItinerarySection.count()).toBe(3);
    expect(await prisma.travelDetail.count()).toBe(8);
  });

  it("does not recreate a soft-deleted seeded travel", async () => {
    await seedTravelDemo();
    await prisma.travel.update({
      where: { slug: "vietnam-three-cities" },
      data: { deletedAt: new Date() },
    });

    await expect(seedTravelDemo()).resolves.toMatchObject({
      created: { departures: 0, details: 0, sections: 0, travel: 0 },
      skippedDeletedTravel: true,
    });
  });
});

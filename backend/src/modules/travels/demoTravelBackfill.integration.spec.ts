import { readFileSync } from "node:fs";
import { Client } from "pg";
import { beforeEach, describe, expect, it } from "vitest";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { resetDatabase } from "@/test/helpers";

const migrationSql = readFileSync(
  new URL(
    "../../../prisma/migrations/20261026190000_backfill_existing_demo_travel_sections/migration.sql",
    import.meta.url,
  ),
  "utf8",
);

async function runBackfill(): Promise<void> {
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(migrationSql);
  } finally {
    await client.end();
  }
}

describe("existing demo travel backfill migration", () => {
  beforeEach(resetDatabase);

  it("adds missing copy and sections once while preserving existing day content", async () => {
    const travel = await prisma.travel.create({
      data: { name: "Edited demo", slug: "vietnam-three-cities", description: "Editor copy" },
    });
    await prisma.travelDetail.createMany({
      data: [
        { travelId: travel.id, dayNumber: 1, title: "Custom day one" },
        { travelId: travel.id, dayNumber: 5, title: "Custom day five" },
        { travelId: travel.id, dayNumber: 8, title: "Custom day eight" },
      ],
    });

    await runBackfill();
    await runBackfill();

    const updated = await prisma.travel.findUniqueOrThrow({ where: { id: travel.id } });
    expect(updated).toMatchObject({
      name: "Edited demo",
      description: "Editor copy",
      destinationLabel: "ХӨХХОТ · ХАНОЙ · КАТ БА · ХАЛОНГ",
      tagline: "ХОТЫН СОЁЛ, АРЛЫН АМРАЛТ, БУЛАНГИЙН АДАЛ ЯВДАЛ",
      version: 2,
    });
    const sections = await prisma.travelItinerarySection.findMany({
      where: { travelId: travel.id },
      orderBy: { sortOrder: "asc" },
    });
    expect(sections.map((section) => section.title)).toEqual([
      "ХӨХХОТ & ХАНОЙ",
      "КАТ БА & ХАЛОНГ",
      "БУЦАХ ЗАМ",
    ]);
    const details = await prisma.travelDetail.findMany({
      where: { travelId: travel.id },
      orderBy: { dayNumber: "asc" },
    });
    expect(details.map((detail) => detail.title)).toEqual([
      "Custom day one",
      "Custom day five",
      "Custom day eight",
    ]);
    expect(details.map((detail) => detail.sectionId)).toEqual(
      sections.map((section) => section.id),
    );
    expect(await prisma.auditLog.count()).toBe(8);
  });

  it("keeps editor copy and a deliberately removed section untouched", async () => {
    const travel = await prisma.travel.create({
      data: {
        name: "Edited demo",
        slug: "vietnam-three-cities",
        destinationLabel: "Custom destination",
        tagline: "Custom tagline",
      },
    });
    await prisma.travelItinerarySection.create({
      data: {
        travelId: travel.id,
        title: "Removed by editor",
        deletedAt: new Date(),
      },
    });

    await runBackfill();

    expect(await prisma.travel.findUniqueOrThrow({ where: { id: travel.id } })).toMatchObject({
      destinationLabel: "Custom destination",
      tagline: "Custom tagline",
      version: 0,
    });
    expect(await prisma.travelItinerarySection.count({ where: { travelId: travel.id } })).toBe(0);
    expect(await prisma.auditLog.count()).toBe(0);
  });
});

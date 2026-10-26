import { readFileSync } from "node:fs";
import { Client } from "pg";
import { beforeEach, describe, expect, it } from "vitest";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { setupTravelBuilder } from "@/modules/travels/setupTravelBuilder";
import { TRAVEL_BUILDER_IDS as travelIds } from "@/modules/travels/travelBuilderDefinitions";
import { resetDatabase, seedRoles } from "@/test/helpers";

const migrationSql = readFileSync(
  new URL(
    "../../../prisma/migrations/20261026233000_restore_original_admin_permissions/migration.sql",
    import.meta.url,
  ),
  "utf8",
);
const historicalMigrations = [
  "20261026210000_travel_permissions",
  "20261026220000_builder_admin_permission",
  "20261026230000_website_builder_definitions",
].map((name) =>
  readFileSync(
    new URL(`../../../prisma/migrations/${name}/migration.sql`, import.meta.url),
    "utf8",
  ),
);

async function runMigration(sql = migrationSql): Promise<void> {
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

describe("restore original admin permissions", () => {
  beforeEach(resetDatabase);

  it("restores org:manage once while preserving custom settings and all definitions", async () => {
    await seedRoles();
    const originalRoles = await prisma.role.findMany({ orderBy: { name: "asc" } });
    const admin = await prisma.role.findUniqueOrThrow({ where: { name: "admin" } });
    await prisma.role.update({
      where: { id: admin.id },
      data: { permissions: admin.permissions.filter((permission) => permission !== "org:manage") },
    });
    const customRole = await prisma.role.create({
      data: { name: "custom-editor", permissions: ["product:read"] },
    });
    await setupTravelBuilder();
    for (const sql of historicalMigrations) await runMigration(sql);
    const definitions = await prisma.builderDefinition.findMany({ orderBy: { id: "asc" } });
    await prisma.builderView.update({
      where: { id: travelIds.detailView },
      data: { permissionRead: "product:read", title: "Custom itinerary title" },
    });

    const versions = new Map(
      (await prisma.builderView.findMany()).map((view) => [view.id, view.version]),
    );
    const auditCount = await prisma.auditLog.count();
    await runMigration();
    await runMigration();

    for (const before of originalRoles) {
      const after = await prisma.role.findUniqueOrThrow({ where: { id: before.id } });
      expect([...after.permissions].sort()).toEqual([...before.permissions].sort());
    }
    expect(await prisma.role.findUniqueOrThrow({ where: { id: customRole.id } })).toEqual(
      customRole,
    );
    expect(await prisma.builderDefinition.findMany({ orderBy: { id: "asc" } })).toEqual(
      definitions,
    );
    for (const view of await prisma.builderView.findMany()) {
      expect(view.permissionRead).toBe(
        view.id === travelIds.detailView ? "product:read" : "org:manage",
      );
      expect(view.permissionWrite).toBe("org:manage");
      expect(view.version).toBe((versions.get(view.id) ?? 0) + 1);
    }
    expect(
      (await prisma.builderView.findUniqueOrThrow({ where: { id: travelIds.detailView } })).title,
    ).toBe("Custom itinerary title");
    expect(await prisma.auditLog.count()).toBe(auditCount + 8);
  });
});

import { readFileSync } from "node:fs";
import { Client } from "pg";
import { beforeEach, describe, expect, it } from "vitest";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { setupTravelBuilder } from "@/modules/travels/setupTravelBuilder";
import { TRAVEL_BUILDER_IDS as travelIds } from "@/modules/travels/travelBuilderDefinitions";
import { setupWebsiteBuilder } from "@/modules/website/setupWebsiteBuilder";
import { WEBSITE_BUILDER_IDS as websiteIds } from "@/modules/website/websiteBuilderDefinitions";
import { resetDatabase, seedRoles } from "@/test/helpers";

const migrationSql = readFileSync(
  new URL(
    "../../../prisma/migrations/20261026233000_restore_original_admin_permissions/migration.sql",
    import.meta.url,
  ),
  "utf8",
);
const temporaryPermissions = ["travel:read", "travel:write", "builder:manage"];

async function runMigration(): Promise<void> {
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(migrationSql);
  } finally {
    await client.end();
  }
}

describe("restore original admin permissions", () => {
  beforeEach(resetDatabase);

  it("restores org:manage once while preserving custom settings and all definitions", async () => {
    await seedRoles();
    const originalRoles = await prisma.role.findMany({ orderBy: { name: "asc" } });
    for (const name of ["owner", "admin"]) {
      const role = await prisma.role.findUniqueOrThrow({ where: { name } });
      await prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: [
            ...role.permissions.filter(
              (permission) => name !== "admin" || permission !== "org:manage",
            ),
            ...temporaryPermissions,
          ],
        },
      });
    }
    const customRole = await prisma.role.create({
      data: { name: "custom-editor", permissions: ["product:read"] },
    });
    await setupTravelBuilder();
    await setupWebsiteBuilder();
    const definitions = await prisma.builderDefinition.findMany({ orderBy: { id: "asc" } });
    await prisma.builderView.updateMany({
      where: {
        id: {
          in: [
            travelIds.travelView,
            travelIds.departureView,
            travelIds.sectionView,
            travelIds.detailView,
          ],
        },
      },
      data: { permissionRead: "travel:read", permissionWrite: "travel:write" },
    });
    await prisma.builderView.updateMany({
      where: { id: { in: [websiteIds.pageView, websiteIds.sectionView] } },
      data: { permissionRead: "builder:manage", permissionWrite: "builder:manage" },
    });
    await prisma.builderView.update({
      where: { id: travelIds.detailView },
      data: { permissionRead: "product:read", title: "Custom itinerary title" },
    });

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
      expect(view.version).toBe(1);
    }
    expect(
      (await prisma.builderView.findUniqueOrThrow({ where: { id: travelIds.detailView } })).title,
    ).toBe("Custom itinerary title");
    expect(await prisma.auditLog.count()).toBe(auditCount + 8);
  });
});

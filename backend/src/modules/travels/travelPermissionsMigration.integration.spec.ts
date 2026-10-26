import { readFileSync } from "node:fs";
import { Client } from "pg";
import { beforeEach, describe, expect, it } from "vitest";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { resetDatabase, seedRoles } from "@/test/helpers";
import { setupTravelBuilder } from "./setupTravelBuilder";
import { TRAVEL_BUILDER_IDS as ids } from "./travelBuilderDefinitions";

const migrationSql = readFileSync(
  new URL(
    "../../../prisma/migrations/20261026210000_travel_permissions/migration.sql",
    import.meta.url,
  ),
  "utf8",
);
const viewIds = [ids.travelView, ids.departureView, ids.sectionView, ids.detailView];

async function runMigration(): Promise<void> {
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(migrationSql);
  } finally {
    await client.end();
  }
}

describe("travel permissions migration", () => {
  beforeEach(resetDatabase);

  it("upgrades the old role and view permissions once and preserves custom permissions", async () => {
    await seedRoles();
    await setupTravelBuilder();
    for (const name of ["owner", "admin"]) {
      const role = await prisma.role.findUniqueOrThrow({ where: { name } });
      await prisma.role.update({
        where: { id: role.id },
        data: {
          // Reproduce the role before the historical migration, not today's defaults.
          permissions: role.permissions.filter(
            (permission) =>
              !permission.startsWith("travel:") &&
              !(name === "admin" && permission === "org:manage"),
          ),
        },
      });
    }
    await prisma.builderView.updateMany({
      where: { id: { in: viewIds } },
      data: { permissionRead: "org:manage", permissionWrite: "org:manage" },
    });
    await prisma.builderView.update({
      where: { id: ids.detailView },
      data: { permissionRead: "product:read" },
    });

    const auditCount = await prisma.auditLog.count();
    await runMigration();
    await runMigration();

    for (const name of ["owner", "admin"]) {
      const role = await prisma.role.findUniqueOrThrow({ where: { name } });
      expect(role.permissions).toEqual(expect.arrayContaining(["travel:read", "travel:write"]));
    }
    const admin = await prisma.role.findUniqueOrThrow({ where: { name: "admin" } });
    expect(admin.permissions).not.toContain("org:manage");
    const viewer = await prisma.role.findUniqueOrThrow({ where: { name: "viewer" } });
    expect(viewer.permissions).not.toContain("travel:read");

    const views = await prisma.builderView.findMany({ where: { id: { in: viewIds } } });
    expect(views).toHaveLength(4);
    for (const view of views) {
      expect(view.permissionRead).toBe(view.id === ids.detailView ? "product:read" : "travel:read");
      expect(view.permissionWrite).toBe("travel:write");
      expect(view.version).toBe(1);
    }
    expect(await prisma.auditLog.count()).toBe(auditCount + 6);
    const detailAudit = await prisma.auditLog.findFirstOrThrow({
      where: { resource: "builderView", resourceId: ids.detailView },
      orderBy: { createdAt: "desc" },
    });
    expect(detailAudit.meta).toMatchObject({ changedFields: ["permissionWrite"] });
  });
});

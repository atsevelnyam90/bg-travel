import { readFileSync } from "node:fs";
import { Client } from "pg";
import { beforeEach, describe, expect, it } from "vitest";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { resetDatabase, seedRoles } from "@/test/helpers";

const migrationSql = readFileSync(
  new URL(
    "../../../prisma/migrations/20261026220000_builder_admin_permission/migration.sql",
    import.meta.url,
  ),
  "utf8",
);

async function runMigration(): Promise<void> {
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(migrationSql);
  } finally {
    await client.end();
  }
}

describe("Builder admin permission migration", () => {
  beforeEach(resetDatabase);

  it("upgrades existing system roles once without granting organization management", async () => {
    await seedRoles();
    for (const name of ["owner", "admin"]) {
      const role = await prisma.role.findUniqueOrThrow({ where: { name } });
      await prisma.role.update({
        where: { id: role.id },
        data: {
          // Reproduce the role before the historical migration, not today's defaults.
          permissions: role.permissions.filter(
            (permission) =>
              permission !== "builder:manage" && !(name === "admin" && permission === "org:manage"),
          ),
        },
      });
    }

    await runMigration();
    await runMigration();

    for (const name of ["owner", "admin"]) {
      const role = await prisma.role.findUniqueOrThrow({ where: { name } });
      expect(role.permissions).toContain("builder:manage");
    }
    const admin = await prisma.role.findUniqueOrThrow({ where: { name: "admin" } });
    expect(admin.permissions).not.toContain("org:manage");
    expect(admin.permissions).toContain("report:export");
    const viewer = await prisma.role.findUniqueOrThrow({ where: { name: "viewer" } });
    expect(viewer.permissions).not.toContain("builder:manage");
    expect(await prisma.auditLog.count({ where: { resource: "role" } })).toBe(2);
  });
});

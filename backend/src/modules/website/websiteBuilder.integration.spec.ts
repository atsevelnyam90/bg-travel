import { readFileSync } from "node:fs";
import { Client } from "pg";
import { beforeEach, describe, expect, it } from "vitest";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { resetDatabase } from "@/test/helpers";
import { setupWebsiteBuilder } from "./setupWebsiteBuilder";
import {
  WEBSITE_BUILDER_IDS as ids,
  websitePageListSchema,
  websiteSectionFormSchema,
} from "./websiteBuilderDefinitions";

const migrationSql = readFileSync(
  new URL(
    "../../../prisma/migrations/20261026230000_website_builder_definitions/migration.sql",
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

describe("WebSite Builder definitions", () => {
  beforeEach(resetDatabase);

  it("seeds the four definitions and two views without replacing editor changes", async () => {
    expect((await setupWebsiteBuilder()).created).toHaveLength(6);
    await prisma.builderDefinition.update({
      where: { id: ids.pageForm },
      data: { title: "Editor title" },
    });

    expect((await setupWebsiteBuilder()).created).toHaveLength(0);
    expect(await prisma.builderDefinition.count()).toBe(4);
    expect(await prisma.builderView.count()).toBe(2);
    expect(
      (await prisma.builderDefinition.findUniqueOrThrow({ where: { id: ids.pageForm } })).title,
    ).toBe("Editor title");
    expect(await prisma.auditLog.count()).toBe(6);
  });

  it("migrates existing databases once and preserves a custom definition", async () => {
    await prisma.builderDefinition.create({
      data: {
        id: ids.pageForm,
        type: "form",
        title: "Existing custom page form",
        source: { type: "dbTable", tableName: "website_pages" },
        schema: { fields: [] },
      },
    });

    await runMigration();
    await runMigration();

    expect(await prisma.builderDefinition.count()).toBe(4);
    expect(await prisma.builderView.count()).toBe(2);
    expect(
      (await prisma.builderDefinition.findUniqueOrThrow({ where: { id: ids.pageForm } })).title,
    ).toBe("Existing custom page form");
    expect(
      (await prisma.builderDefinition.findUniqueOrThrow({ where: { id: ids.pageList } })).schema,
    ).toEqual(websitePageListSchema);
    expect(
      (await prisma.builderDefinition.findUniqueOrThrow({ where: { id: ids.sectionForm } })).schema,
    ).toEqual(websiteSectionFormSchema);
    expect(
      await prisma.builderView.findUniqueOrThrow({ where: { id: ids.sectionView } }),
    ).toMatchObject({
      permissionRead: "builder:manage",
      permissionWrite: "builder:manage",
    });
    expect(await prisma.auditLog.count()).toBe(5);
  });
});

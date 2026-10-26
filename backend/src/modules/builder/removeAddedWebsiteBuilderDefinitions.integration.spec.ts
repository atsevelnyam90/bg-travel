import { readFileSync } from "node:fs";
import { Client } from "pg";
import { beforeEach, describe, expect, it } from "vitest";
import { env } from "@/lib/env";
import { prisma, prismaUnfiltered } from "@/lib/prisma";
import { resetDatabase } from "@/test/helpers";

async function runMigration(name: string): Promise<void> {
  const sql = readFileSync(
    new URL(`../../../prisma/migrations/${name}/migration.sql`, import.meta.url),
    "utf8",
  );
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

describe("remove added WebSite Builder definitions", () => {
  beforeEach(resetDatabase);

  it("soft-deletes only the added metadata once and preserves actual website content", async () => {
    await runMigration("20261026230000_website_builder_definitions");
    const addedDefinitions = await prisma.builderDefinition.findMany();
    const addedViews = await prisma.builderView.findMany();
    const unrelated = await prisma.builderDefinition.create({
      data: { type: "form", title: "Existing user-created form", schema: { fields: [] } },
    });
    const page = await prisma.websitePage.create({ data: { type: "existing-page" } });
    const section = await prisma.websiteSection.create({
      data: { pageId: page.id, title: "Existing content" },
    });
    const auditCount = await prisma.auditLog.count();

    await runMigration("20261027001000_remove_added_website_builder_definitions");
    await runMigration("20261027001000_remove_added_website_builder_definitions");

    expect(await prisma.builderDefinition.findMany()).toEqual([unrelated]);
    expect(await prisma.builderView.count()).toBe(0);
    expect(await prisma.websitePage.findUniqueOrThrow({ where: { id: page.id } })).toEqual(page);
    expect(await prisma.websiteSection.findUniqueOrThrow({ where: { id: section.id } })).toEqual(
      section,
    );

    // Read deleted rows explicitly to verify history rather than silently dropping it.
    const definitions = await prismaUnfiltered.builderDefinition.findMany({
      where: { id: { in: addedDefinitions.map((definition) => definition.id) } },
    });
    const views = await prismaUnfiltered.builderView.findMany({
      where: { id: { in: addedViews.map((view) => view.id) } },
    });
    expect(definitions).toHaveLength(4);
    expect(views).toHaveLength(2);
    for (const row of [...definitions, ...views]) {
      expect(row.deletedAt).toBeInstanceOf(Date);
      expect(row.version).toBe(1);
    }
    expect(await prisma.auditLog.count()).toBe(auditCount + 6);
  });
});

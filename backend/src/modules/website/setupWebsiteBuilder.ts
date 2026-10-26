import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  WEBSITE_BUILDER_IDS as ids,
  websitePageFormSchema,
  websitePageListSchema,
  websiteSectionFormSchema,
  websiteSectionListSchema,
} from "./websiteBuilderDefinitions";

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

/** Seed the optional website content forms without replacing editor changes. */
export async function setupWebsiteBuilder() {
  return prisma.$transaction(async (tx) => {
    const created: string[] = [];
    const definitions = [
      {
        id: ids.pageForm,
        type: "form",
        title: "WebSite Pages Form",
        tableName: "website_pages",
        schema: websitePageFormSchema,
      },
      {
        id: ids.pageList,
        type: "list",
        title: "WebSite Pages List",
        tableName: "website_pages",
        schema: websitePageListSchema,
      },
      {
        id: ids.sectionForm,
        type: "form",
        title: "WebSite Sections Form",
        tableName: "website_sections",
        schema: websiteSectionFormSchema,
      },
      {
        id: ids.sectionList,
        type: "list",
        title: "WebSite Sections List",
        tableName: "website_sections",
        schema: websiteSectionListSchema,
      },
    ];
    for (const { tableName, ...definition } of definitions) {
      const exists = await tx.builderDefinition.findUnique({ where: { id: definition.id } });
      if (exists) continue;
      await tx.builderDefinition.create({
        data: {
          ...definition,
          source: jsonValue({ type: "dbTable", tableName }),
          schema: jsonValue(definition.schema),
          triggers: [],
        },
      });
      await tx.auditLog.create({
        data: {
          action: "create",
          resource: "builderDefinition",
          resourceId: definition.id,
          meta: { source: "setupWebsiteBuilder" },
        },
      });
      created.push(definition.id);
    }

    for (const view of [
      {
        id: ids.pageView,
        title: "WebSite Pages",
        formId: ids.pageForm,
        listId: ids.pageList,
      },
      {
        id: ids.sectionView,
        title: "WebSite Sections",
        formId: ids.sectionForm,
        listId: ids.sectionList,
      },
    ]) {
      const exists = await tx.builderView.findUnique({ where: { id: view.id } });
      if (exists) continue;
      await tx.builderView.create({
        data: {
          ...view,
          permissionRead: "builder:manage",
          permissionWrite: "builder:manage",
          triggers: [],
        },
      });
      await tx.auditLog.create({
        data: {
          action: "create",
          resource: "builderView",
          resourceId: view.id,
          meta: { source: "setupWebsiteBuilder" },
        },
      });
      created.push(view.id);
    }

    return { created, pageViewId: ids.pageView, sectionViewId: ids.sectionView };
  });
}

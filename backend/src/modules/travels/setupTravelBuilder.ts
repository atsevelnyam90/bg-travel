import { isDeepStrictEqual } from "node:util";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  departureFormSchema,
  departureListSchema,
  detailFormSchema,
  detailListSchema,
  TRAVEL_BUILDER_IDS as ids,
  sectionFormSchema,
  sectionListSchema,
  travelFormSchema,
  travelListSchema,
} from "./travelBuilderDefinitions";

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function setupTravelBuilder() {
  return prisma.$transaction(async (tx) => {
    const created: string[] = [];
    const updated: string[] = [];
    const definitions = [
      {
        id: ids.departureForm,
        type: "form",
        title: "Аяллын гаралт — form",
        tableName: "travel_departures",
        schema: departureFormSchema,
      },
      {
        id: ids.departureList,
        type: "list",
        title: "Аяллын гаралт — grid",
        tableName: "travel_departures",
        schema: departureListSchema,
      },
      {
        id: ids.sectionForm,
        type: "form",
        title: "Аяллын хөтөлбөрийн бүлэг — form",
        tableName: "travel_itinerary_sections",
        schema: sectionFormSchema,
      },
      {
        id: ids.sectionList,
        type: "list",
        title: "Аяллын хөтөлбөрийн бүлэг — grid",
        tableName: "travel_itinerary_sections",
        schema: sectionListSchema,
      },
      {
        id: ids.detailForm,
        type: "form",
        title: "Аяллын өдрийн хөтөлбөр — form",
        tableName: "travel_details",
        schema: detailFormSchema,
      },
      {
        id: ids.detailList,
        type: "list",
        title: "Аяллын өдрийн хөтөлбөр — grid",
        tableName: "travel_details",
        schema: detailListSchema,
      },
      {
        id: ids.travelForm,
        type: "form",
        title: "Аялал — form",
        tableName: "travels",
        schema: travelFormSchema,
      },
      {
        id: ids.travelList,
        type: "list",
        title: "Аялал — grid",
        tableName: "travels",
        schema: travelListSchema,
      },
    ];
    for (const { tableName, ...definition } of definitions) {
      const existing = await tx.builderDefinition.findUnique({ where: { id: definition.id } });
      const source = { type: "dbTable", tableName };
      if (existing) {
        const needsUpdate =
          existing.type !== definition.type ||
          existing.title !== definition.title ||
          !isDeepStrictEqual(existing.source, source) ||
          !isDeepStrictEqual(existing.schema, definition.schema) ||
          !isDeepStrictEqual(existing.triggers, []);
        if (!needsUpdate) continue;
        await tx.builderDefinition.update({
          where: { id: definition.id },
          data: {
            type: definition.type,
            title: definition.title,
            source: jsonValue(source),
            schema: jsonValue(definition.schema),
            triggers: [],
            version: { increment: 1 },
          },
        });
        await tx.auditLog.create({
          data: {
            action: "update",
            resource: "builderDefinition",
            resourceId: definition.id,
            meta: {
              source: "setupTravelBuilder",
              changedFields: ["type", "title", "source", "schema", "triggers"],
            },
          },
        });
        updated.push(definition.id);
        continue;
      }
      await tx.builderDefinition.create({
        data: {
          ...definition,
          schema: jsonValue(definition.schema),
          source: jsonValue(source),
          triggers: [],
        },
      });
      await tx.auditLog.create({
        data: {
          action: "create",
          resource: "builderDefinition",
          resourceId: definition.id,
          meta: { source: "setupTravelBuilder" },
        },
      });
      created.push(definition.id);
    }
    for (const view of [
      {
        id: ids.departureView,
        title: "Аяллын гаралтууд",
        formId: ids.departureForm,
        listId: ids.departureList,
      },
      {
        id: ids.sectionView,
        title: "Аяллын хөтөлбөрийн бүлгүүд",
        formId: ids.sectionForm,
        listId: ids.sectionList,
      },
      {
        id: ids.detailView,
        title: "Аяллын өдрийн хөтөлбөр",
        formId: ids.detailForm,
        listId: ids.detailList,
      },
      { id: ids.travelView, title: "Аялал", formId: ids.travelForm, listId: ids.travelList },
    ]) {
      const existing = await tx.builderView.findUnique({ where: { id: view.id } });
      if (existing) {
        const needsUpdate =
          existing.title !== view.title ||
          existing.formId !== view.formId ||
          existing.listId !== view.listId ||
          existing.permissionRead !== "org:manage" ||
          existing.permissionWrite !== "org:manage" ||
          !isDeepStrictEqual(existing.triggers, []);
        if (!needsUpdate) continue;
        await tx.builderView.update({
          where: { id: view.id },
          data: {
            ...view,
            permissionRead: "org:manage",
            permissionWrite: "org:manage",
            triggers: [],
            version: { increment: 1 },
          },
        });
        await tx.auditLog.create({
          data: {
            action: "update",
            resource: "builderView",
            resourceId: view.id,
            meta: {
              source: "setupTravelBuilder",
              changedFields: [
                "title",
                "formId",
                "listId",
                "permissionRead",
                "permissionWrite",
                "triggers",
              ],
            },
          },
        });
        updated.push(view.id);
        continue;
      }
      await tx.builderView.create({
        data: {
          ...view,
          permissionRead: "org:manage",
          permissionWrite: "org:manage",
          triggers: [],
        },
      });
      await tx.auditLog.create({
        data: {
          action: "create",
          resource: "builderView",
          resourceId: view.id,
          meta: { source: "setupTravelBuilder" },
        },
      });
      created.push(view.id);
    }
    return { created, updated, viewId: ids.travelView };
  });
}

import type {
  BuilderDefinitionData,
  BuilderDefinitionKind,
  BuilderMetadataRepository,
  BuilderViewData,
  ListBuilderDefinitionRowsArgs,
  ListBuilderViewRowsArgs,
  UpdateBuilderDefinitionRowArgs,
  UpdateBuilderViewRowArgs,
} from "@duke333/builder-backend/metadata";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildOrderBy,
  DEFINITION_SELECT,
  type DefinitionRow,
  VIEW_INCLUDE,
  type ViewRow,
} from "../shared/builderMapper";

function definitionWhere(args: {
  type: BuilderDefinitionKind;
  search?: string;
}): Prisma.BuilderDefinitionWhereInput {
  return {
    type: args.type,
    ...(args.search
      ? {
          OR: [{ title: { contains: args.search, mode: "insensitive" } }],
        }
      : {}),
  };
}

function viewWhere(args: { search?: string }): Prisma.BuilderViewWhereInput {
  return {
    ...(args.search
      ? {
          OR: [{ title: { contains: args.search, mode: "insensitive" } }],
        }
      : {}),
  };
}

function nullableJson(value: unknown) {
  return value === null || value === undefined ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}

function definitionData(data: BuilderDefinitionData) {
  return {
    type: data.type,
    title: data.title,
    description: data.description,
    source: nullableJson(data.source),
    schema: nullableJson(data.schema),
    triggers: nullableJson(data.triggers),
  };
}

function viewData(data: BuilderViewData) {
  return {
    title: data.title,
    description: data.description,
    formId: data.formId,
    listId: data.listId,
    permissionRead: data.permissionRead,
    permissionWrite: data.permissionWrite,
    triggers: nullableJson(data.triggers),
  };
}

export async function listBuilderDefinitionRows(
  args: ListBuilderDefinitionRowsArgs,
): Promise<{ total: number; rows: DefinitionRow[] }> {
  const where = definitionWhere(args);
  const [total, rows] = await Promise.all([
    prisma.builderDefinition.count({ where }),
    prisma.builderDefinition.findMany({
      where,
      orderBy: buildOrderBy<Prisma.BuilderDefinitionOrderByWithRelationInput>(args.sort),
      skip: (args.page - 1) * args.pageSize,
      take: args.pageSize,
      select: DEFINITION_SELECT,
    }),
  ]);
  return { total, rows };
}

export async function listAllBuilderDefinitionRows(
  type: BuilderDefinitionKind,
): Promise<DefinitionRow[]> {
  return prisma.builderDefinition.findMany({
    where: { type },
    orderBy: { title: "asc" },
    select: DEFINITION_SELECT,
  });
}

export async function findBuilderDefinitionRow(args: {
  id: string;
  type: BuilderDefinitionKind;
}): Promise<DefinitionRow | null> {
  return prisma.builderDefinition.findFirst({
    where: { id: args.id, type: args.type },
    select: DEFINITION_SELECT,
  });
}

export async function findBuilderDefinitionId(args: {
  id: string;
  type: BuilderDefinitionKind;
}): Promise<{ id: string } | null> {
  return prisma.builderDefinition.findFirst({
    where: { id: args.id, type: args.type },
    select: { id: true },
  });
}

export async function createBuilderDefinitionRow(
  data: BuilderDefinitionData,
): Promise<DefinitionRow> {
  return prisma.builderDefinition.create({ data: definitionData(data), select: DEFINITION_SELECT });
}

export async function updateBuilderDefinitionRow(
  args: UpdateBuilderDefinitionRowArgs,
): Promise<boolean> {
  const result = await prisma.builderDefinition.updateMany({
    where: { id: args.id, type: args.type, deletedAt: null, version: args.version },
    data: { ...definitionData(args.data), version: { increment: 1 } },
  });
  return result.count > 0;
}

export async function softDeleteBuilderDefinitionRow(args: {
  id: string;
  type: BuilderDefinitionKind;
}): Promise<boolean> {
  const { count } = await prisma.builderDefinition.updateMany({
    where: { id: args.id, type: args.type, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  return count > 0;
}

export async function listBuilderViewRows(
  args: ListBuilderViewRowsArgs,
): Promise<{ total: number; rows: ViewRow[] }> {
  const where = viewWhere(args);
  const [total, rows] = await Promise.all([
    prisma.builderView.count({ where }),
    prisma.builderView.findMany({
      where,
      orderBy: buildOrderBy<Prisma.BuilderViewOrderByWithRelationInput>(args.sort),
      skip: (args.page - 1) * args.pageSize,
      take: args.pageSize,
      include: VIEW_INCLUDE,
    }),
  ]);
  return { total, rows };
}

export async function findBuilderViewRow(id: string): Promise<ViewRow | null> {
  return prisma.builderView.findFirst({
    where: { id },
    include: VIEW_INCLUDE,
  });
}

export async function createBuilderViewRow(data: BuilderViewData): Promise<ViewRow> {
  return prisma.builderView.create({ data: viewData(data), include: VIEW_INCLUDE });
}

export async function updateBuilderViewRow(args: UpdateBuilderViewRowArgs): Promise<boolean> {
  const result = await prisma.builderView.updateMany({
    where: { id: args.id, deletedAt: null, version: args.version },
    data: { ...viewData(args.data), version: { increment: 1 } },
  });
  return result.count > 0;
}

export async function softDeleteBuilderViewRow(id: string): Promise<boolean> {
  const { count } = await prisma.builderView.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  return count > 0;
}

export const builderMetadataRepository: BuilderMetadataRepository = {
  listDefinitionRows: listBuilderDefinitionRows,
  listAllDefinitionRows: listAllBuilderDefinitionRows,
  findDefinitionRow: findBuilderDefinitionRow,
  findDefinitionId: findBuilderDefinitionId,
  createDefinitionRow: createBuilderDefinitionRow,
  updateDefinitionRow: updateBuilderDefinitionRow,
  softDeleteDefinitionRow: softDeleteBuilderDefinitionRow,
  listViewRows: listBuilderViewRows,
  findViewRow: findBuilderViewRow,
  createViewRow: createBuilderViewRow,
  updateViewRow: updateBuilderViewRow,
  softDeleteViewRow: softDeleteBuilderViewRow,
};

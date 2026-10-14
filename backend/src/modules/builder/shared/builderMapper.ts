import type { DefinitionRow, ViewRow } from "@duke333/builder-backend/metadata";
import {
  buildOrderBy,
  toDefinitionDto,
  toEntryDto,
  toFormDto,
  toIso,
  toListDto,
  toViewDto,
} from "@duke333/builder-backend/metadata";
import { Prisma } from "@/generated/prisma/client";

export const DEFINITION_SELECT = {
  id: true,
  type: true,
  title: true,
  description: true,
  source: true,
  schema: true,
  triggers: true,
  version: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const VIEW_INCLUDE = {
  form: { select: DEFINITION_SELECT },
  list: { select: DEFINITION_SELECT },
} as const;

export function nullableJson(value: Prisma.InputJsonValue | null | undefined) {
  return value ?? Prisma.JsonNull;
}

export type { DefinitionRow, ViewRow };
export { buildOrderBy, toDefinitionDto, toEntryDto, toFormDto, toIso, toListDto, toViewDto };

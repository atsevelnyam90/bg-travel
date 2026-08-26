import type { DefinitionRow, ViewRow } from "@winu/builder-backend/metadata";
import {
  buildOrderBy,
  toDefinitionDto,
  toEntryDto,
  toFormDto,
  toIso,
  toListDto,
  toViewDto,
} from "@winu/builder-backend/metadata";
import type { Permission } from "@winu/contracts";
import { Prisma } from "@/generated/prisma/client";
import { builderForbidden } from "./builderErrors";

export const DEFAULT_BUILDER_VIEW_PERMISSION = "org:manage" satisfies Permission;

export function assertPermission(granted: readonly Permission[], permission?: Permission | null) {
  if (!permission) {
    throw builderForbidden("Builder view дээр эрх тохируулагдаагүй байна");
  }
  if (!granted.includes(permission)) throw builderForbidden();
}

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

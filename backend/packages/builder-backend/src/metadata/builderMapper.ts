import { builder as builderContract } from "@winu/contracts";

const SORTABLE = { title: "title", createdAt: "createdAt" } as const;

export type DefinitionRow = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  source: unknown;
  schema: unknown;
  triggers: unknown;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ViewRow = {
  id: string;
  title: string;
  description: string | null;
  formId: string | null;
  listId: string | null;
  permissionRead: string | null;
  permissionWrite: string | null;
  triggers: unknown;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  form?: DefinitionRow | null;
  list?: DefinitionRow | null;
};

export function buildOrderBy<T>(sort?: string): T {
  if (!sort) return { createdAt: "desc" } as T;
  const desc = sort.startsWith("-");
  const column = SORTABLE[(desc ? sort.slice(1) : sort) as keyof typeof SORTABLE];
  return (column ? { [column]: desc ? "desc" : "asc" } : { createdAt: "desc" }) as T;
}

export function toDefinitionDto(row: DefinitionRow): builderContract.BuilderDefinition {
  return builderContract.builderDefinitionSchema.parse({
    ...row,
    triggers: row.triggers ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export function toFormDto(row: DefinitionRow): builderContract.BuilderForm {
  return builderContract.builderFormRecordSchema.parse(toDefinitionDto(row));
}

export function toListDto(row: DefinitionRow): builderContract.BuilderList {
  return builderContract.builderListRecordSchema.parse(toDefinitionDto(row));
}

export function toViewDto(row: ViewRow): builderContract.BuilderView {
  return builderContract.builderViewSchema.parse({
    ...row,
    form: row.form ? toFormDto(row.form) : null,
    list: row.list ? toListDto(row.list) : null,
    triggers: row.triggers ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export function toIso(value: Date | string | null | undefined) {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date ? value.toISOString() : value;
}

export function toEntryDto(input: {
  id: string;
  viewId: string;
  values: Record<string, unknown>;
  version?: number | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}): builderContract.BuilderViewEntry {
  return builderContract.builderViewEntrySchema.parse({
    id: input.id,
    viewId: input.viewId,
    values: input.values,
    version: input.version ?? 0,
    createdAt: toIso(input.createdAt),
    updatedAt: toIso(input.updatedAt ?? input.createdAt),
  });
}

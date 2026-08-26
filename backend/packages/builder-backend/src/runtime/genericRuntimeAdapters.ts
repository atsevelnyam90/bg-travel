import type { builder as builderContract } from "@winu/contracts";
import type { BuilderErrors } from "../errors";
import { toEntryDto } from "../metadata";
import type {
  BuilderGenericRuntimeColumn,
  BuilderGenericRuntimeRepository,
} from "./genericRuntimeRepositoryTypes";
import type { RuntimeEntryMutationResult } from "./runtimeAdapterTypes";

const GENERIC_RUNTIME_BLOCKED_TABLES = new Set([
  "_prisma_migrations",
  "audit_logs",
  "builder_definitions",
  "builder_views",
  "invitations",
  "refresh_tokens",
  "sessions",
]);
const HIDDEN_COLUMNS = new Set(["deletedAt", "passwordHash", "tokenHash", "replacedBy"]);
const WRITE_SKIP_COLUMNS = new Set(["id", "version", "createdAt", "updatedAt", "deletedAt"]);

export type GenericRuntimeAdapterDependencies = {
  repository: BuilderGenericRuntimeRepository;
  errors: Pick<BuilderErrors, "badRequest">;
};

function isBlank(value: unknown) {
  return value === null || value === undefined || value === "";
}

function columnMap(columns: BuilderGenericRuntimeColumn[]) {
  return new Map(columns.map((column) => [column.name, column]));
}

function hasColumn(columns: Map<string, BuilderGenericRuntimeColumn>, column: string) {
  return columns.has(column) && !HIDDEN_COLUMNS.has(column);
}

function assertColumn(
  errors: Pick<BuilderErrors, "badRequest">,
  columns: Map<string, BuilderGenericRuntimeColumn>,
  tableName: string,
  fieldName: string,
): BuilderGenericRuntimeColumn {
  const column = columns.get(fieldName);
  if (!column || HIDDEN_COLUMNS.has(column.name)) {
    throw errors.badRequest(`${tableName}.${fieldName} column зөвшөөрөгдөөгүй байна`);
  }
  return column;
}

function assertUuidIdColumn(
  errors: Pick<BuilderErrors, "badRequest">,
  columns: Map<string, BuilderGenericRuntimeColumn>,
  tableName: string,
) {
  const idColumn = assertColumn(errors, columns, tableName, "id");
  if (idColumn.udtName !== "uuid") {
    throw errors.badRequest(`${tableName}.id нь uuid байх ёстой`);
  }
}

function normalizeGenericValue(
  errors: Pick<BuilderErrors, "badRequest">,
  field: builderContract.BuilderField,
  value: unknown,
) {
  if (isBlank(value)) return null;
  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "money" || field.type === "number") {
    const number = Number(value);
    if (!Number.isFinite(number)) throw errors.badRequest(`${field.label} талбар тоо байх ёстой`);
    return field.type === "money" ? Math.trunc(number) : number;
  }
  return String(value);
}

function entryValues(row: Record<string, unknown>, selectedColumns: readonly string[]) {
  const values: Record<string, unknown> = {};
  for (const column of selectedColumns) values[column] = row[column];
  return values;
}

function genericEntry(
  viewId: string,
  row: Record<string, unknown>,
  selectedColumns: readonly string[],
): builderContract.BuilderViewEntry {
  return toEntryDto({
    id: String(row.id),
    viewId,
    version: typeof row.version === "number" ? row.version : 0,
    createdAt: row.createdAt as Date | string | null | undefined,
    updatedAt: row.updatedAt as Date | string | null | undefined,
    values: entryValues(row, selectedColumns),
  });
}

function assertRuntimeTable(
  errors: Pick<BuilderErrors, "badRequest">,
  tableName: string,
  columns: readonly BuilderGenericRuntimeColumn[],
) {
  if (tableName.startsWith("builder_") || GENERIC_RUNTIME_BLOCKED_TABLES.has(tableName)) {
    throw errors.badRequest(`${tableName} table runtime datasource-д зөвшөөрөгдөөгүй байна`);
  }
  if (columns.length === 0) throw errors.badRequest(`${tableName} table олдсонгүй`);
}

export function createGenericRuntimeAdapters(deps: GenericRuntimeAdapterDependencies) {
  const { errors, repository } = deps;

  async function getRuntimeColumns(tableName: string) {
    const columns = await repository.listColumns(tableName);
    assertRuntimeTable(errors, tableName, columns);
    return columns;
  }

  async function listGenericRuntimeEntries(
    tableName: string,
    list: builderContract.BuilderList,
    viewId: string,
    query: builderContract.ListBuilderViewEntriesQuery,
  ): Promise<builderContract.ListBuilderViewEntriesResponse> {
    const columns = await getRuntimeColumns(tableName);
    const columnsByName = columnMap(columns);
    assertUuidIdColumn(errors, columnsByName, tableName);

    const visibleColumns = list.schema.columns.map((column) => {
      assertColumn(errors, columnsByName, tableName, column.key);
      return column.key;
    });
    const selectedColumns = [
      "id",
      ...(hasColumn(columnsByName, "version") ? ["version"] : []),
      ...(hasColumn(columnsByName, "createdAt") ? ["createdAt"] : []),
      ...(hasColumn(columnsByName, "updatedAt") ? ["updatedAt"] : []),
      ...visibleColumns.filter(
        (column) => !["id", "version", "createdAt", "updatedAt"].includes(column),
      ),
    ];

    const requestedSort = query.sort?.startsWith("-") ? query.sort.slice(1) : query.sort;
    const sortColumn = list.schema.columns.find(
      (column) => column.key === requestedSort && column.sortable,
    );
    const orderByColumn =
      sortColumn?.key ?? (hasColumn(columnsByName, "createdAt") ? "createdAt" : "id");
    const orderDirection = query.sort?.startsWith("-") || !sortColumn ? "desc" : "asc";
    const searchableColumns = visibleColumns.filter((name) => {
      const column = columnsByName.get(name);
      return column ? !["json", "jsonb"].includes(column.dataType.toLowerCase()) : false;
    });

    const result = await repository.listRows({
      tableName,
      selectedColumns,
      searchableColumns,
      search: query.search,
      orderByColumn,
      orderDirection,
      page: query.page,
      pageSize: query.pageSize,
      filterDeletedAt: columnsByName.has("deletedAt"),
    });

    return {
      items: result.rows.map((row) => genericEntry(viewId, row, selectedColumns)),
      total: result.total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async function createGenericRuntimeEntry(
    tableName: string,
    form: builderContract.BuilderForm,
    viewId: string,
    values: Record<string, unknown>,
  ): Promise<RuntimeEntryMutationResult> {
    const columns = await getRuntimeColumns(tableName);
    const columnsByName = columnMap(columns);
    assertUuidIdColumn(errors, columnsByName, tableName);

    const writableFields = form.schema.fields.filter((field) => {
      assertColumn(errors, columnsByName, tableName, field.key);
      return !WRITE_SKIP_COLUMNS.has(field.key);
    });
    if (writableFields.length === 0) throw errors.badRequest("Бичих боломжтой field алга");

    const insertColumns = writableFields.map((field) => field.key);
    const insertValues = writableFields.map((field) =>
      normalizeGenericValue(errors, field, values[field.key]),
    );
    const returningColumns = [
      "id",
      ...(hasColumn(columnsByName, "version") ? ["version"] : []),
      ...(hasColumn(columnsByName, "createdAt") ? ["createdAt"] : []),
      ...(hasColumn(columnsByName, "updatedAt") ? ["updatedAt"] : []),
      ...insertColumns,
    ];

    const row = await repository.createRow({
      tableName,
      insertColumns,
      insertValues,
      returningColumns,
    });

    if (!row) throw errors.badRequest("Мөр үүсгэж чадсангүй");
    return {
      entry: genericEntry(viewId, row, returningColumns),
      audit: {
        resource: `builder:${tableName}`,
        resourceId: String(row.id),
        meta: { tableName, definitionId: form.id, viewId },
      },
    };
  }

  return {
    createGenericRuntimeEntry,
    listGenericRuntimeEntries,
  };
}

export type GenericRuntimeAdapters = ReturnType<typeof createGenericRuntimeAdapters>;

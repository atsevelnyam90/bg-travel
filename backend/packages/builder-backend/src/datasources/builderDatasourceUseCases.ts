import { builder as builderContract } from "@winu/contracts";
import type { BuilderErrors } from "../errors";
import type {
  BuilderDatasourceColumnRow,
  BuilderDatasourceRepository,
} from "./datasourceRepositoryTypes";

const HIDDEN_DB_COLUMNS = new Set(["deletedAt", "passwordHash", "tokenHash", "replacedBy"]);
const FORM_SKIP_COLUMNS = new Set(["id", "version", "createdAt", "updatedAt", "deletedAt"]);

export type BuilderDatasourceUseCaseDependencies = {
  datasourceRepository: BuilderDatasourceRepository;
  errors: Pick<BuilderErrors, "badRequest">;
};

function humanizeColumn(name: string) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function inferFieldType(
  column: BuilderDatasourceColumnRow,
): builderContract.BuilderDbColumn["fieldType"] {
  const lowerName = column.columnName.toLowerCase();
  const lowerType = column.dataType.toLowerCase();
  if (lowerType.includes("bool")) return "checkbox";
  if (lowerType.includes("date") || lowerType.includes("time")) return "date";
  if (lowerName.includes("price") || lowerName.includes("amount") || lowerName.includes("minor")) {
    return "money";
  }
  if (
    lowerType.includes("int") ||
    lowerType.includes("numeric") ||
    lowerType.includes("decimal") ||
    lowerType.includes("double") ||
    lowerType.includes("real")
  ) {
    return "number";
  }
  return "text";
}

function toBuilderColumn(column: BuilderDatasourceColumnRow) {
  return {
    name: column.columnName,
    label: humanizeColumn(column.columnName),
    dataType: column.udtName || column.dataType,
    nullable: column.nullable,
    fieldType: inferFieldType(column),
    sortable: !["json", "jsonb"].includes(column.dataType.toLowerCase()),
  };
}

function groupColumns(rows: readonly BuilderDatasourceColumnRow[]) {
  const grouped = new Map<string, BuilderDatasourceColumnRow[]>();
  for (const row of rows) {
    grouped.set(row.tableName, [...(grouped.get(row.tableName) ?? []), row]);
  }
  return grouped;
}

function toBuilderTables(rows: readonly BuilderDatasourceColumnRow[]) {
  return [...groupColumns(rows).entries()].map(([name, allColumns]) => {
    const columns = allColumns.filter((column) => !HIDDEN_DB_COLUMNS.has(column.columnName));
    return builderContract.builderDbTableSchema.parse({
      name,
      label: humanizeColumn(name),
      lookupColumns: columns.map(toBuilderColumn),
      columns: columns
        .filter((column) => !FORM_SKIP_COLUMNS.has(column.columnName))
        .map(toBuilderColumn),
    });
  });
}

function assertKnownColumn(
  errors: Pick<BuilderErrors, "badRequest">,
  table: builderContract.BuilderDbTable,
  fieldName: string,
): builderContract.BuilderDbColumn {
  const column = (table.lookupColumns ?? table.columns).find((item) => item.name === fieldName);
  if (!column) throw errors.badRequest(`${table.name}.${fieldName} column зөвшөөрөгдөөгүй байна`);
  if (!column.sortable && column.name !== "id") {
    throw errors.badRequest(`${table.name}.${fieldName} column option query-д тохирохгүй байна`);
  }
  return column;
}

function getDepends(query: builderContract.ListBuilderFieldOptionsQuery) {
  const depends: Record<string, string> = { ...(query.depends ?? {}) };
  for (const [key, value] of Object.entries(query)) {
    if (!key.startsWith("depends.") || typeof value !== "string") continue;
    depends[key.slice("depends.".length)] = value;
  }
  return depends;
}

export function createBuilderDatasourceUseCases(deps: BuilderDatasourceUseCaseDependencies) {
  const { datasourceRepository, errors } = deps;

  async function listBuilderDbTables(): Promise<builderContract.BuilderDbTable[]> {
    return toBuilderTables(await datasourceRepository.listDbColumns());
  }

  async function listBuilderFieldOptions(
    source: builderContract.BuilderSelectOptionsSource,
    query: builderContract.ListBuilderFieldOptionsQuery,
  ): Promise<builderContract.ListBuilderFieldOptionsResponse> {
    const columnRows = await datasourceRepository.listDbColumns();
    const allColumnsByTable = groupColumns(columnRows);
    const tables = toBuilderTables(columnRows);
    const table = tables.find((item) => item.name === source.tableName);
    if (!table) throw errors.badRequest(`${source.tableName} table зөвшөөрөгдөөгүй байна`);

    const valueColumn = assertKnownColumn(errors, table, source.valueField);
    const labelColumn = assertKnownColumn(errors, table, source.labelField);
    const searchColumns = (source.searchFields?.length ? source.searchFields : [source.labelField])
      .map((fieldName) => assertKnownColumn(errors, table, fieldName))
      .filter((column) => column.sortable);
    const filterColumn = source.filterBy
      ? assertKnownColumn(errors, table, source.filterBy.field)
      : null;
    const hasDeletedAt =
      allColumnsByTable.get(table.name)?.some((column) => column.columnName === "deletedAt") ??
      false;
    const depends = getDepends(query);
    const filterValue = source.filterBy ? depends[source.filterBy.valueFromField] : undefined;

    return datasourceRepository.listFieldOptionRows({
      tableName: table.name,
      valueColumn: valueColumn.name,
      labelColumn: labelColumn.name,
      searchColumns: searchColumns.map((column) => column.name),
      search: query.search,
      filterColumn: filterColumn?.name,
      filterValue,
      filterDeletedAt: hasDeletedAt,
    });
  }

  return {
    listBuilderDbTables,
    listBuilderFieldOptions,
  };
}

export type BuilderDatasourceUseCases = ReturnType<typeof createBuilderDatasourceUseCases>;

export type BuilderGenericRuntimeColumn = {
  name: string;
  dataType: string;
  udtName: string;
  nullable: boolean;
  ordinalPosition: number;
};

export type ListGenericRuntimeRowsArgs = {
  tableName: string;
  selectedColumns: readonly string[];
  searchableColumns: readonly string[];
  search?: string;
  orderByColumn: string;
  orderDirection: "asc" | "desc";
  page: number;
  pageSize: number;
  filterDeletedAt: boolean;
};

export type ListGenericRuntimeRowsResult = {
  total: number;
  rows: Record<string, unknown>[];
};

export type CreateGenericRuntimeRowArgs = {
  tableName: string;
  insertColumns: readonly string[];
  insertValues: readonly unknown[];
  returningColumns: readonly string[];
};

export type BuilderGenericRuntimeRepository = {
  listColumns(tableName: string): Promise<BuilderGenericRuntimeColumn[]>;
  listRows(args: ListGenericRuntimeRowsArgs): Promise<ListGenericRuntimeRowsResult>;
  createRow(args: CreateGenericRuntimeRowArgs): Promise<Record<string, unknown> | null>;
};

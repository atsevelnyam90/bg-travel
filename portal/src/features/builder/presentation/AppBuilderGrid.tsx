"use client";

import type { ReadyBuilderContracts } from "@duke333/builder-ui";
import {
  createDynamicListComponent,
  type DynamicListDataGridProps,
  type DynamicListErrorStateProps,
} from "@duke333/builder-ui/components";
import type { BuilderHooks } from "@duke333/builder-ui/hooks";
import { formatBuilderRuntimeValue } from "@duke333/builder-ui/runtime";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DataGrid,
  type DataTableController,
  type DataTableState,
  useDataTable,
  useDataTableState,
} from "@/components/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BuilderList = ReadyBuilderContracts["BuilderList"];
type BuilderViewEntry = ReadyBuilderContracts["BuilderViewEntry"];

function buildColumns(list: BuilderList) {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack v9 feature generic is unrelated to row data.
  const columns: ColumnDef<any, BuilderViewEntry, unknown>[] = list.schema.columns
    .filter((column) => !column.hidden)
    .map((column) => ({
      id: column.key,
      header: column.label,
      meta: { sortable: column.sortable, label: column.label, align: column.align },
      cell: ({ row }) => (
        <span className={column.align === "right" ? "tabular-nums" : undefined}>
          {formatBuilderRuntimeValue(row.original.values[column.key])}
        </span>
      ),
    }));

  return columns;
}

function BuilderDataGrid({
  controller,
  ...props
}: DynamicListDataGridProps<DataTableController<BuilderViewEntry>>) {
  return <DataGrid<BuilderViewEntry> controller={controller} {...props} />;
}

function ErrorState({ title, description }: DynamicListErrorStateProps) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">{description}</CardContent>
    </Card>
  );
}

function useBuilderDataTableState(args?: { pageSize?: number }) {
  return useDataTableState(args) as DataTableState & {
    query: ReadyBuilderContracts["ListBuilderViewEntriesQuery"];
  };
}

function useBuilderDataTable(args: {
  columns: ReturnType<typeof buildColumns>;
  data: BuilderViewEntry[];
  rowCount: number;
  state: DataTableState;
  getRowId(row: BuilderViewEntry): string;
}) {
  return useDataTable<BuilderViewEntry>(args);
}

export function createAppBuilderGrid(hooks: BuilderHooks<ReadyBuilderContracts>) {
  return createDynamicListComponent<
    ReadyBuilderContracts,
    ReturnType<typeof buildColumns>[number],
    ReturnType<typeof useBuilderDataTableState>,
    DataTableController<BuilderViewEntry>
  >({
    hooks,
    buildColumns,
    useDataTableState: useBuilderDataTableState,
    useDataTable: useBuilderDataTable,
    DataGrid: BuilderDataGrid,
    ErrorState,
  });
}

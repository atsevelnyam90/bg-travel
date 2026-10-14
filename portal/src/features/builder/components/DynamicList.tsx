"use client";

import {
  createDynamicListComponent,
  type DynamicListDataGridProps,
  type DynamicListErrorStateProps,
} from "@duke333/builder-ui/components";
import { formatBuilderRuntimeValue } from "@duke333/builder-ui/runtime";
import type { ColumnDef } from "@tanstack/react-table";
import type { builder } from "@/api/generated/contracts";
import {
  DataGrid,
  type DataTableController,
  type DataTableState,
  useDataTable,
  useDataTableState,
} from "@/components/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortalBuilderApiContracts } from "../builder.config";
import { useRuntimeBuilderList, useRuntimeBuilderListEntries } from "../builder.config";

function buildColumns(list: builder.BuilderList) {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack v9-ийн feature generic — багана тодорхойлолтод хамаагүй.
  const columns: ColumnDef<any, builder.BuilderViewEntry, unknown>[] = list.schema.columns.map(
    (column) => ({
      id: column.key,
      header: column.label,
      meta: { sortable: column.sortable, label: column.label, align: column.align },
      cell: ({ row }) => (
        <span className={column.align === "right" ? "tabular-nums" : undefined}>
          {formatBuilderRuntimeValue(row.original.values[column.key])}
        </span>
      ),
    }),
  );

  return columns;
}

function BuilderDataGrid({
  controller,
  ...props
}: DynamicListDataGridProps<DataTableController<builder.BuilderViewEntry>>) {
  return <DataGrid<builder.BuilderViewEntry> controller={controller} {...props} />;
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
    query: PortalBuilderApiContracts["ListBuilderViewEntriesQuery"];
  };
}

function useBuilderDataTable(args: {
  columns: ReturnType<typeof buildColumns>;
  data: builder.BuilderViewEntry[];
  rowCount: number;
  state: DataTableState;
  getRowId(row: builder.BuilderViewEntry): string;
}) {
  return useDataTable<builder.BuilderViewEntry>(args);
}

export const DynamicList = createDynamicListComponent<
  PortalBuilderApiContracts,
  ReturnType<typeof buildColumns>[number],
  ReturnType<typeof useBuilderDataTableState>,
  DataTableController<builder.BuilderViewEntry>
>({
  hooks: {
    useRuntimeBuilderList,
    useRuntimeBuilderListEntries,
  },
  buildColumns,
  useDataTableState: useBuilderDataTableState,
  useDataTable: useBuilderDataTable,
  DataGrid: BuilderDataGrid,
  ErrorState,
});

"use client";

import type { ComponentType } from "react";
import { useMemo } from "react";
import type { BuilderApiContracts } from "../api";
import type { BuilderHooks } from "../hooks";

export type DynamicListContracts = BuilderApiContracts & {
  BuilderList: {
    id: string;
    title: string;
    description?: string | null;
  };
  BuilderViewEntry: {
    id: string;
  };
  ListBuilderViewEntriesResponse: {
    items: Array<BuilderApiContracts["BuilderViewEntry"]>;
    total: number;
  };
};

export type DynamicListProps = {
  listId: string;
};

export type DynamicListDataGridProps<TController> = {
  title?: string;
  description?: string;
  controller: TController;
  isLoading?: boolean;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export type DynamicListErrorStateProps = {
  title: string;
  description: string;
};

export type DynamicListDependencies<
  C extends DynamicListContracts,
  TColumn,
  TState extends { query: C["ListBuilderViewEntriesQuery"] },
  TController,
> = {
  hooks: Pick<BuilderHooks<C>, "useRuntimeBuilderList" | "useRuntimeBuilderListEntries">;
  buildColumns(list: C["BuilderList"]): TColumn[];
  useDataTableState(args?: { pageSize?: number }): TState;
  useDataTable(args: {
    columns: TColumn[];
    data: C["BuilderViewEntry"][];
    rowCount: number;
    state: TState;
    getRowId(row: C["BuilderViewEntry"]): string;
  }): TController;
  DataGrid: ComponentType<DynamicListDataGridProps<TController>>;
  ErrorState: ComponentType<DynamicListErrorStateProps>;
};

export function createDynamicListComponent<
  C extends DynamicListContracts,
  TColumn,
  TState extends { query: C["ListBuilderViewEntriesQuery"] },
  TController,
>(deps: DynamicListDependencies<C, TColumn, TState, TController>) {
  return function DynamicList({ listId }: DynamicListProps) {
    const query = deps.hooks.useRuntimeBuilderList(listId);
    const state = deps.useDataTableState({ pageSize: 20 });
    const entriesQuery = deps.hooks.useRuntimeBuilderListEntries(listId, state.query);
    const columns = useMemo(() => (query.data ? deps.buildColumns(query.data) : []), [query.data]);
    const entries = entriesQuery.data?.items ?? [];
    const controller = deps.useDataTable({
      columns,
      data: entries as C["BuilderViewEntry"][],
      rowCount: entriesQuery.data?.total ?? 0,
      state,
      getRowId: (row) => row.id,
    });

    if (query.isError) {
      return (
        <deps.ErrorState
          title="List нээгдсэнгүй"
          description={`«${listId}» id-тай list олдсонгүй.`}
        />
      );
    }

    return (
      <deps.DataGrid
        title={query.data?.title ?? "Dynamic List"}
        description={query.data?.description ?? `/winu/list?id=${listId}`}
        controller={controller}
        isLoading={query.isPending || entriesQuery.isPending}
        searchPlaceholder="Мөр хайх..."
        emptyTitle="Мөр алга"
        emptyDescription="Энэ list-ийн datasource дээр мөр алга."
      />
    );
  };
}

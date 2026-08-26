"use client";

import type { ComponentType, ReactNode } from "react";
import { useMemo, useState } from "react";
import type { BuilderApiContracts } from "../api";
import type { BuilderHooks } from "../hooks";
import type { BuilderRuntimeEntryLike } from "../runtime";

export type DynamicViewContracts = BuilderApiContracts & {
  BuilderView: {
    id: string;
    title: string;
    description?: string | null;
    form?: unknown | null;
  };
  BuilderViewEntry: BuilderRuntimeEntryLike;
  ListBuilderViewEntriesResponse: {
    items: Array<BuilderApiContracts["BuilderViewEntry"]>;
    total: number;
  };
};

export type DynamicViewProps = {
  viewId: string;
};

export type DynamicViewColumnActions<TEntry> = {
  onEdit(entry: TEntry): void;
  onDelete(entry: TEntry): void;
};

export type DynamicViewDataGridProps<TController> = {
  title?: string;
  description?: string;
  controller: TController;
  isLoading?: boolean;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: unknown) => void;
  toolbarExtra?: ReactNode;
};

export type DynamicViewAddButtonProps = {
  disabled: boolean;
  onAdd(): void;
};

export type DynamicViewEntryDialogProps<TView, TEntry, TInput> = {
  open: boolean;
  view: TView;
  editing: TEntry | null;
  onClose(): void;
  onSave(args: { id?: string; input: TInput }): Promise<unknown>;
  isSaving: boolean;
};

export type DynamicViewDeleteDialogProps<TEntry> = {
  entry: TEntry | null;
  isDeleting: boolean;
  onClose(): void;
  onConfirm(): Promise<void>;
};

export type DynamicViewErrorStateProps = {
  title: string;
  description: string;
};

export type DynamicViewDependencies<
  C extends DynamicViewContracts,
  TColumn,
  TState extends { query: C["ListBuilderViewEntriesQuery"] },
  TController,
> = {
  hooks: Pick<
    BuilderHooks<C>,
    | "useBuilderViewEntries"
    | "useDeleteBuilderViewEntry"
    | "useRuntimeBuilderView"
    | "useSaveBuilderViewEntry"
  >;
  buildColumns(
    view: C["BuilderView"],
    actions: DynamicViewColumnActions<C["BuilderViewEntry"]>,
  ): TColumn[];
  useDataTableState(args?: { pageSize?: number }): TState;
  useDataTable(args: {
    columns: TColumn[];
    data: C["BuilderViewEntry"][];
    rowCount: number;
    state: TState;
    getRowId(row: C["BuilderViewEntry"]): string;
  }): TController;
  DataGrid: ComponentType<DynamicViewDataGridProps<TController>>;
  AddButton: ComponentType<DynamicViewAddButtonProps>;
  EntryDialog: ComponentType<
    DynamicViewEntryDialogProps<
      C["BuilderView"],
      C["BuilderViewEntry"],
      C["UpdateBuilderViewEntryInput"]
    >
  >;
  DeleteDialog: ComponentType<DynamicViewDeleteDialogProps<C["BuilderViewEntry"]>>;
  ErrorState: ComponentType<DynamicViewErrorStateProps>;
};

export function createDynamicViewComponent<
  C extends DynamicViewContracts,
  TColumn,
  TState extends { query: C["ListBuilderViewEntriesQuery"] },
  TController,
>(deps: DynamicViewDependencies<C, TColumn, TState, TController>) {
  return function DynamicView({ viewId }: DynamicViewProps) {
    const [editing, setEditing] = useState<C["BuilderViewEntry"] | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<C["BuilderViewEntry"] | null>(null);

    const viewQuery = deps.hooks.useRuntimeBuilderView(viewId);
    const state = deps.useDataTableState({ pageSize: 20 });
    const entriesQuery = deps.hooks.useBuilderViewEntries(viewId, state.query);
    const save = deps.hooks.useSaveBuilderViewEntry(viewId);
    const remove = deps.hooks.useDeleteBuilderViewEntry(viewId);
    const view = viewQuery.data;

    const columns = useMemo(
      () =>
        view
          ? deps.buildColumns(view, {
              onEdit: (entry) => {
                setEditing(entry);
                setDialogOpen(true);
              },
              onDelete: setPendingDelete,
            })
          : [],
      [view],
    );

    const controller = deps.useDataTable({
      columns,
      data: (entriesQuery.data?.items ?? []) as C["BuilderViewEntry"][],
      rowCount: entriesQuery.data?.total ?? 0,
      state,
      getRowId: (row) => row.id,
    });

    if (viewQuery.isError) {
      return (
        <deps.ErrorState
          title="View нээгдсэнгүй"
          description={`«${viewId}» id-тай view олдсонгүй.`}
        />
      );
    }

    return (
      <div className="space-y-6">
        <deps.DataGrid
          title={view?.title ?? "Dynamic View"}
          description={view?.description ?? `/winu/view?id=${viewId}`}
          controller={controller}
          isLoading={viewQuery.isPending || entriesQuery.isPending}
          searchPlaceholder="Мөр хайх..."
          emptyTitle="Мөр алга"
          emptyDescription="Энэ view дээр эхний мөрөө нэмээрэй."
          onRowClick={(entry) => {
            setEditing(entry as C["BuilderViewEntry"]);
            setDialogOpen(true);
          }}
          toolbarExtra={
            <deps.AddButton
              disabled={!view?.form}
              onAdd={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            />
          }
        />

        {view ? (
          <deps.EntryDialog
            open={isDialogOpen}
            view={view}
            editing={editing}
            onClose={() => setDialogOpen(false)}
            onSave={save.mutateAsync}
            isSaving={save.isPending}
          />
        ) : null}

        <deps.DeleteDialog
          entry={pendingDelete}
          isDeleting={remove.isPending}
          onClose={() => setPendingDelete(null)}
          onConfirm={async () => {
            if (!pendingDelete) return;
            await remove.mutateAsync(pendingDelete.id);
            setPendingDelete(null);
          }}
        />
      </div>
    );
  };
}

"use client";

import type { ComponentType, ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

export type BuilderEntityManagerEntity = {
  id: string;
  title: string;
};

export type BuilderEntityManagerActions<TEntity extends BuilderEntityManagerEntity> = {
  onEdit(entity: TEntity): void;
  onReplicate(entity: TEntity): void | Promise<void>;
  onDelete(entity: TEntity): void;
  runtimeHref?: (entity: TEntity) => string;
};

export type BuilderEntityManagerDataGridProps<TController, TEntity> = {
  title: string;
  description: string;
  controller: TController;
  isLoading?: boolean;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  onRowClick(entity: TEntity): void;
  toolbarExtra: ReactNode;
};

export type BuilderEntityManagerAddButtonProps = {
  href: string;
  label: string;
};

export type BuilderEntityManagerDialogAddButtonProps = {
  label: string;
  onAdd(): void;
};

export type BuilderEntityManagerDeleteDialogProps<TEntity> = {
  entity: TEntity | null;
  title: string;
  description: string;
  isDeleting: boolean;
  onClose(): void;
  onConfirm(): Promise<void>;
};

export type BuilderEntityManagerEditorDialogProps<TEntity> = {
  open: boolean;
  editing: TEntity | null;
  onClose(): void;
};

export type BuilderEntityManagerHookResult<TEntity> = {
  data?: {
    items: TEntity[];
    total: number;
  };
  isPending: boolean;
};

export type BuilderEntityManagerMutation<TInput> = {
  mutateAsync(input: TInput): Promise<unknown>;
  isPending: boolean;
};

export type BuilderEntityManagerLabels = {
  title: string;
  description: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  addLabel: string;
  deleteTitle: string;
  deleteDescription(entity: BuilderEntityManagerEntity | null): string;
};

export type BuilderEntityManagerDependencies<
  TEntity extends BuilderEntityManagerEntity,
  TColumn,
  TState extends { query: TQuery },
  TQuery,
  TController,
> = {
  labels: BuilderEntityManagerLabels;
  createHref: string;
  runtimeHref(entity: TEntity): string;
  navigateToEdit(entity: TEntity): void;
  requestReplicateTitle(entity: TEntity): string | null | Promise<string | null>;
  hooks: {
    useEntities(query: TQuery): BuilderEntityManagerHookResult<TEntity>;
    useDelete(): BuilderEntityManagerMutation<string>;
    useReplicate(): BuilderEntityManagerMutation<{ id: string; input: { title?: string } }>;
  };
  buildColumns(actions: BuilderEntityManagerActions<TEntity>): TColumn[];
  useDataTableState(args?: { pageSize?: number }): TState;
  useDataTable(args: {
    columns: TColumn[];
    data: TEntity[];
    rowCount: number;
    state: TState;
    getRowId(row: TEntity): string;
  }): TController;
  DataGrid: ComponentType<BuilderEntityManagerDataGridProps<TController, TEntity>>;
  AddButton: ComponentType<BuilderEntityManagerAddButtonProps>;
  DeleteDialog: ComponentType<BuilderEntityManagerDeleteDialogProps<TEntity>>;
};

export type BuilderEntityDialogManagerDependencies<
  TEntity extends BuilderEntityManagerEntity,
  TColumn,
  TState extends { query: TQuery },
  TQuery,
  TController,
> = {
  labels: BuilderEntityManagerLabels;
  runtimeHref(entity: TEntity): string;
  requestReplicateTitle(entity: TEntity): string | null | Promise<string | null>;
  hooks: {
    useEntities(query: TQuery): BuilderEntityManagerHookResult<TEntity>;
    useDelete(): BuilderEntityManagerMutation<string>;
    useReplicate(): BuilderEntityManagerMutation<{ id: string; input: { title?: string } }>;
  };
  buildColumns(actions: BuilderEntityManagerActions<TEntity>): TColumn[];
  useDataTableState(args?: { pageSize?: number }): TState;
  useDataTable(args: {
    columns: TColumn[];
    data: TEntity[];
    rowCount: number;
    state: TState;
    getRowId(row: TEntity): string;
  }): TController;
  DataGrid: ComponentType<BuilderEntityManagerDataGridProps<TController, TEntity>>;
  AddButton: ComponentType<BuilderEntityManagerDialogAddButtonProps>;
  EditorDialog: ComponentType<BuilderEntityManagerEditorDialogProps<TEntity>>;
  DeleteDialog: ComponentType<BuilderEntityManagerDeleteDialogProps<TEntity>>;
};

export function createBuilderEntityManagerComponent<
  TEntity extends BuilderEntityManagerEntity,
  TColumn,
  TState extends { query: TQuery },
  TQuery,
  TController,
>(deps: BuilderEntityManagerDependencies<TEntity, TColumn, TState, TQuery, TController>) {
  return function BuilderEntityManager() {
    const [pendingDelete, setPendingDelete] = useState<TEntity | null>(null);
    const state = deps.useDataTableState({ pageSize: 20 });
    const query = deps.hooks.useEntities(state.query);
    const remove = deps.hooks.useDelete();
    const replicate = deps.hooks.useReplicate();

    const columns = useMemo(
      () =>
        deps.buildColumns({
          onEdit: deps.navigateToEdit,
          onReplicate: async (entity) => {
            const title = await deps.requestReplicateTitle(entity);
            if (!title) return;
            await replicate.mutateAsync({ id: entity.id, input: { title } });
          },
          onDelete: setPendingDelete,
          runtimeHref: deps.runtimeHref,
        }),
      [replicate],
    );

    const controller = deps.useDataTable({
      columns,
      data: query.data?.items ?? [],
      rowCount: query.data?.total ?? 0,
      state,
      getRowId: (row) => row.id,
    });

    return (
      <div className="space-y-6">
        <deps.DataGrid
          title={deps.labels.title}
          description={deps.labels.description}
          controller={controller}
          isLoading={query.isPending}
          searchPlaceholder={deps.labels.searchPlaceholder}
          emptyTitle={deps.labels.emptyTitle}
          emptyDescription={deps.labels.emptyDescription}
          onRowClick={deps.navigateToEdit}
          toolbarExtra={<deps.AddButton href={deps.createHref} label={deps.labels.addLabel} />}
        />

        <deps.DeleteDialog
          entity={pendingDelete}
          title={deps.labels.deleteTitle}
          description={deps.labels.deleteDescription(pendingDelete)}
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

export function createBuilderEntityDialogManagerComponent<
  TEntity extends BuilderEntityManagerEntity,
  TColumn,
  TState extends { query: TQuery },
  TQuery,
  TController,
>(deps: BuilderEntityDialogManagerDependencies<TEntity, TColumn, TState, TQuery, TController>) {
  return function BuilderEntityDialogManager() {
    const [editing, setEditing] = useState<TEntity | null>(null);
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<TEntity | null>(null);
    const state = deps.useDataTableState({ pageSize: 20 });
    const query = deps.hooks.useEntities(state.query);
    const remove = deps.hooks.useDelete();
    const replicate = deps.hooks.useReplicate();

    const openEditor = useCallback((entity: TEntity | null) => {
      setEditing(entity);
      setEditorOpen(true);
    }, []);

    const columns = useMemo(
      () =>
        deps.buildColumns({
          onEdit: (entity) => openEditor(entity),
          onReplicate: async (entity) => {
            const title = await deps.requestReplicateTitle(entity);
            if (!title) return;
            await replicate.mutateAsync({ id: entity.id, input: { title } });
          },
          onDelete: setPendingDelete,
          runtimeHref: deps.runtimeHref,
        }),
      [replicate, openEditor],
    );

    const controller = deps.useDataTable({
      columns,
      data: query.data?.items ?? [],
      rowCount: query.data?.total ?? 0,
      state,
      getRowId: (row) => row.id,
    });

    return (
      <div className="space-y-6">
        <deps.DataGrid
          title={deps.labels.title}
          description={deps.labels.description}
          controller={controller}
          isLoading={query.isPending}
          searchPlaceholder={deps.labels.searchPlaceholder}
          emptyTitle={deps.labels.emptyTitle}
          emptyDescription={deps.labels.emptyDescription}
          onRowClick={openEditor}
          toolbarExtra={
            <deps.AddButton label={deps.labels.addLabel} onAdd={() => openEditor(null)} />
          }
        />

        <deps.EditorDialog
          open={isEditorOpen}
          editing={editing}
          onClose={() => setEditorOpen(false)}
        />

        <deps.DeleteDialog
          entity={pendingDelete}
          title={deps.labels.deleteTitle}
          description={deps.labels.deleteDescription(pendingDelete)}
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

"use client";

import type { ReadyBuilderContracts } from "@duke333/builder-ui";
import {
  createDynamicViewComponent,
  type DynamicViewAddButtonProps,
  type DynamicViewColumnActions,
  type DynamicViewDataGridProps,
  type DynamicViewDeleteDialogProps,
  type DynamicViewErrorStateProps,
} from "@duke333/builder-ui/components";
import type { BuilderHooks } from "@duke333/builder-ui/hooks";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  type DataTableController,
  type DataTableState,
  useDataTable,
  useDataTableState,
} from "@/components/data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { createAppBuilderEntryDialog } from "./AppBuilderEntryDialog";
import { formatBuilderField } from "./formatBuilderField";

export type AppBuilderViewDefinition = ReadyBuilderContracts["BuilderView"];
export type AppBuilderViewEntry = ReadyBuilderContracts["BuilderViewEntry"];

// biome-ignore lint/suspicious/noExplicitAny: TanStack v9 feature generic is unrelated to row data.
export type AppBuilderColumn = ColumnDef<any, AppBuilderViewEntry, unknown>;

export type AppBuilderViewExtension = (args: {
  view: AppBuilderViewDefinition;
  columns: AppBuilderColumn[];
  actions: DynamicViewColumnActions<AppBuilderViewEntry>;
}) => void;

function buildColumns(
  view: AppBuilderViewDefinition,
  actions: DynamicViewColumnActions<AppBuilderViewEntry>,
  extendColumns?: AppBuilderViewExtension,
) {
  const columns: AppBuilderColumn[] =
    view.list?.schema.columns
      .filter((column) => !column.hidden)
      .map((column) => ({
        id: column.key,
        header: column.label,
        meta: { sortable: column.sortable, label: column.label, align: column.align },
        cell: ({ row }) => (
          <span className={column.align === "right" ? "tabular-nums" : undefined}>
            {formatBuilderField(
              row.original.values[column.key],
              view.form?.schema.fields.find((field) => field.key === column.key),
            )}
          </span>
        ),
      })) ?? [];

  extendColumns?.({ view, columns, actions });

  columns.push({
    id: "actions",
    header: () => <div className="text-right">Үйлдэл</div>,
    meta: { hideOnMobile: true },
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-right" data-builder-row-action>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Мөрийн үйлдэл"
              className="text-muted-foreground"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              onClick={(event) => event.stopPropagation()}
              onSelect={(event) => {
                event.stopPropagation();
                actions.onEdit(row.original, event);
              }}
            >
              <Pencil />
              Засах
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={(event) => event.stopPropagation()}
              onSelect={(event) => {
                event.stopPropagation();
                actions.onDelete(row.original, event);
              }}
            >
              <Trash2 />
              Устгах
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  });

  return columns;
}

function BuilderDataGrid({
  controller,
  onRowClick,
  ...props
}: DynamicViewDataGridProps<DataTableController<AppBuilderViewEntry>>) {
  return (
    <DataGrid<AppBuilderViewEntry> controller={controller} onRowClick={onRowClick} {...props} />
  );
}

function AddButton({ disabled, onAdd }: DynamicViewAddButtonProps) {
  return (
    <Button size="sm" onClick={onAdd} disabled={disabled}>
      <Plus />
      Нэмэх
    </Button>
  );
}

function DeleteDialog({
  entry,
  isDeleting,
  onClose,
  onConfirm,
}: DynamicViewDeleteDialogProps<AppBuilderViewEntry>) {
  return (
    <AlertDialog open={Boolean(entry)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Мөр устгах уу?</AlertDialogTitle>
          <AlertDialogDescription>Энэ мөр view жагсаалтаас алга болно.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Болих</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} onClick={onConfirm}>
            Устгах
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ErrorState({ title, description }: DynamicViewErrorStateProps) {
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
  columns: AppBuilderColumn[];
  data: AppBuilderViewEntry[];
  rowCount: number;
  state: DataTableState;
  getRowId(row: AppBuilderViewEntry): string;
}) {
  return useDataTable<AppBuilderViewEntry>(args);
}

function useDeleteBuilderViewEntryWithToast(
  hooks: BuilderHooks<ReadyBuilderContracts>,
  viewId: string,
) {
  const mutation = hooks.useDeleteBuilderViewEntry(viewId);
  return {
    ...mutation,
    mutateAsync: async (entryId: string) => {
      try {
        return await mutation.mutateAsync(entryId);
      } catch (error) {
        toast.error(apiErrorMessage(error, "Мөр устгахад алдаа гарлаа"));
        throw error;
      }
    },
  };
}

export function createAppBuilderView(
  hooks: BuilderHooks<ReadyBuilderContracts>,
  options: { extendColumns?: AppBuilderViewExtension } = {},
) {
  return createDynamicViewComponent<
    ReadyBuilderContracts,
    AppBuilderColumn,
    ReturnType<typeof useBuilderDataTableState>,
    DataTableController<AppBuilderViewEntry>
  >({
    hooks: {
      useBuilderViewEntries: hooks.useBuilderViewEntries,
      useDeleteBuilderViewEntry: (viewId) => useDeleteBuilderViewEntryWithToast(hooks, viewId),
      useRuntimeBuilderView: hooks.useRuntimeBuilderView,
      useSaveBuilderViewEntry: hooks.useSaveBuilderViewEntry,
    },
    buildColumns: (view, actions) => buildColumns(view, actions, options.extendColumns),
    useDataTableState: useBuilderDataTableState,
    useDataTable: useBuilderDataTable,
    DataGrid: BuilderDataGrid,
    AddButton,
    EntryDialog: createAppBuilderEntryDialog(hooks),
    DeleteDialog,
    ErrorState,
  });
}

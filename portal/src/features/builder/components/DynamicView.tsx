"use client";

import {
  createDynamicViewComponent,
  type DynamicViewAddButtonProps,
  type DynamicViewColumnActions,
  type DynamicViewDataGridProps,
  type DynamicViewDeleteDialogProps,
  type DynamicViewErrorStateProps,
} from "@duke333/builder-ui/components";
import { formatBuilderRuntimeValue } from "@duke333/builder-ui/runtime";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { builder } from "@/api/generated/contracts";
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
import type { PortalBuilderApiContracts } from "../builder.config";
import {
  useBuilderViewEntries,
  useDeleteBuilderViewEntry,
  useRuntimeBuilderView,
  useSaveBuilderViewEntry,
} from "../builder.config";
import { RuntimeEntryDialog } from "./RuntimeEntryDialog";

function buildColumns(
  view: builder.BuilderView,
  actions: DynamicViewColumnActions<builder.BuilderViewEntry>,
) {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack v9-ийн feature generic — багана тодорхойлолтод хамаагүй.
  const columns: ColumnDef<any, builder.BuilderViewEntry, unknown>[] =
    view.list?.schema.columns.map((column) => ({
      id: column.key,
      header: column.label,
      meta: { sortable: column.sortable, label: column.label, align: column.align },
      cell: ({ row }) => (
        <span className={column.align === "right" ? "tabular-nums" : undefined}>
          {formatBuilderRuntimeValue(row.original.values[column.key])}
        </span>
      ),
    })) ?? [];

  columns.push({
    id: "actions",
    header: () => <div className="text-right">Үйлдэл</div>,
    meta: { hideOnMobile: true },
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-right">
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
                actions.onEdit(row.original);
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
                actions.onDelete(row.original);
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
}: DynamicViewDataGridProps<DataTableController<builder.BuilderViewEntry>>) {
  return (
    <DataGrid<builder.BuilderViewEntry>
      controller={controller}
      onRowClick={onRowClick as (row: builder.BuilderViewEntry) => void}
      {...props}
    />
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
}: DynamicViewDeleteDialogProps<builder.BuilderViewEntry>) {
  return (
    <AlertDialog open={Boolean(entry)} onOpenChange={onClose}>
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

function useDeleteBuilderViewEntryWithToast(viewId: string) {
  const mutation = useDeleteBuilderViewEntry(viewId);
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

export const DynamicView = createDynamicViewComponent<
  PortalBuilderApiContracts,
  ReturnType<typeof buildColumns>[number],
  ReturnType<typeof useBuilderDataTableState>,
  DataTableController<builder.BuilderViewEntry>
>({
  hooks: {
    useBuilderViewEntries,
    useDeleteBuilderViewEntry: useDeleteBuilderViewEntryWithToast,
    useRuntimeBuilderView,
    useSaveBuilderViewEntry,
  },
  buildColumns,
  useDataTableState: useBuilderDataTableState,
  useDataTable: useBuilderDataTable,
  DataGrid: BuilderDataGrid,
  AddButton,
  EntryDialog: RuntimeEntryDialog,
  DeleteDialog,
  ErrorState,
});

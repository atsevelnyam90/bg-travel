"use client";

import {
  createRuntimeSubformFieldComponent,
  type RuntimeSubformDataPanelProps,
  type RuntimeSubformDialogActionsProps,
  type RuntimeSubformDialogFieldsProps,
  type RuntimeSubformDialogShellProps,
  type RuntimeSubformShellProps,
} from "@duke333/builder-ui/components";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { builder } from "@/api/generated/contracts";
import {
  DataForm,
  DataPagination,
  DataTable,
  type DataTableColumnDef,
  type DataTableController,
  type DataTableState,
  useDataTable,
  useDataTableState,
} from "@/components/data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import type { PortalBuilderApiContracts } from "../builder.config";
import {
  useBuilderViewEntries,
  useRuntimeBuilderView,
  useSaveBuilderViewEntry,
} from "../builder.config";
import { formatRuntimeField } from "../formatRuntimeField";

function buildSubformColumns(
  view: builder.BuilderView,
): DataTableColumnDef<builder.BuilderViewEntry>[] {
  return (
    view.list?.schema.columns.map((column) => ({
      id: column.key,
      header: column.label,
      meta: { sortable: column.sortable, label: column.label, align: column.align },
      cell: ({ row }) =>
        formatRuntimeField(
          row.original.values[column.key],
          view.form?.schema.fields.find((field) => field.key === column.key),
        ),
    })) ?? []
  );
}

function useBuilderDataTableState(args?: { pageSize?: number }) {
  return useDataTableState(args) as DataTableState & {
    query: PortalBuilderApiContracts["ListBuilderViewEntriesQuery"];
  };
}

function useBuilderDataTable(args: {
  columns: ReturnType<typeof buildSubformColumns>;
  data: builder.BuilderViewEntry[];
  rowCount: number;
  state: DataTableState;
  getRowId(row: builder.BuilderViewEntry): string;
}) {
  return useDataTable<builder.BuilderViewEntry>(args);
}

function Shell({
  label,
  buttonLabel,
  canOpen,
  missingParentDescription,
  onAdd,
  children,
}: RuntimeSubformShellProps) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Button type="button" variant="outline" disabled={!canOpen} onClick={onAdd}>
        <Plus />
        {buttonLabel}
      </Button>
      {missingParentDescription ? (
        <FieldDescription>{missingParentDescription}</FieldDescription>
      ) : null}
      {children}
    </Field>
  );
}

function DataPanel({
  controller,
  isLoading,
  showDraftDelete,
  onRowClick,
  onDeleteSelected,
}: RuntimeSubformDataPanelProps<
  DataTableController<builder.BuilderViewEntry>,
  builder.BuilderViewEntry
>) {
  return (
    <div className="min-w-0 overflow-hidden rounded-md border bg-card">
      <DataTable
        controller={controller}
        isLoading={isLoading}
        emptyTitle="Мэдээлэл алга"
        emptyDescription="Нэмэх товчоор шинэ мөр бүртгэнэ үү."
        onRowClick={onRowClick}
      />
      <div className="border-t">
        <DataPagination controller={controller} />
      </div>
      {showDraftDelete ? (
        <div className="flex justify-end border-t px-3 py-2">
          <Button type="button" variant="ghost" size="sm" onClick={onDeleteSelected}>
            <Trash2 />
            Сонгосон устгах
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function DialogShell({
  open,
  title,
  description,
  onClose,
  children,
}: RuntimeSubformDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[88dvh] flex-col gap-0 overflow-hidden rounded-lg p-0 sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader className="border-b bg-muted/20 px-5 py-4 pr-12">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription className="truncate">{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function DialogFields({
  formId,
  viewId,
  schema,
  namePrefix,
}: RuntimeSubformDialogFieldsProps<builder.BuilderFormSchema>) {
  return (
    <FieldGroup className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
      <DataForm formId={formId} viewId={viewId} schema={schema} namePrefix={namePrefix} />
    </FieldGroup>
  );
}

function DialogActions({ isSaving, onClose }: RuntimeSubformDialogActionsProps) {
  return (
    <DialogFooter className="mx-0 mt-0 mb-0 flex-row justify-end rounded-none border-t bg-background px-5 py-3">
      <Button type="button" variant="outline" className="min-w-24" onClick={onClose}>
        Болих
      </Button>
      <Button type="submit" className="min-w-28" disabled={isSaving}>
        {isSaving ? "Хадгалж байна..." : "Хадгалах"}
      </Button>
    </DialogFooter>
  );
}

export const RuntimeSubformField = createRuntimeSubformFieldComponent<
  PortalBuilderApiContracts,
  builder.BuilderFormSubform,
  ReturnType<typeof buildSubformColumns>[number],
  ReturnType<typeof useBuilderDataTableState>,
  DataTableController<builder.BuilderViewEntry>
>({
  hooks: {
    useBuilderViewEntries,
    useRuntimeBuilderView,
    useSaveBuilderViewEntry,
  },
  buildColumns: buildSubformColumns,
  useDataTableState: useBuilderDataTableState,
  useDataTable: useBuilderDataTable,
  Shell,
  DataPanel,
  DialogShell,
  DialogFields,
  DialogActions,
  dialogFormClassName: "flex min-h-0 flex-1 flex-col",
  notifications: {
    success: toast.success,
    error: toast.error,
    errorMessage: apiErrorMessage,
  },
});

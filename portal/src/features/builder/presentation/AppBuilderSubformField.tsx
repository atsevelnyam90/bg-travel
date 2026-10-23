"use client";

import type { ReadyBuilderContracts } from "@duke333/builder-ui";
import {
  createRuntimeSubformFieldComponent,
  type RuntimeSubformDataPanelProps,
  type RuntimeSubformDialogActionsProps,
  type RuntimeSubformDialogFieldsProps,
  type RuntimeSubformDialogShellProps,
  type RuntimeSubformShellProps,
} from "@duke333/builder-ui/components";
import type { BuilderHooks } from "@duke333/builder-ui/hooks";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { AppBuilderPresentationShell } from "./AppBuilderPresentationShell";
import { formatBuilderField } from "./formatBuilderField";

type BuilderFormSchema = ReadyBuilderContracts["BuilderForm"]["schema"];
type BuilderFormSubform = BuilderFormSchema["subforms"][number];
type BuilderView = ReadyBuilderContracts["BuilderView"];
type BuilderViewEntry = ReadyBuilderContracts["BuilderViewEntry"];

function buildSubformColumns(view: BuilderView): DataTableColumnDef<BuilderViewEntry>[] {
  return (
    view.list?.schema.columns
      .filter((column) => !column.hidden)
      .map((column) => ({
        id: column.key,
        header: column.label,
        meta: { sortable: column.sortable, label: column.label, align: column.align },
        cell: ({ row }) =>
          formatBuilderField(
            row.original.values[column.key],
            view.form?.schema.fields.find((field) => field.key === column.key),
          ),
      })) ?? []
  );
}

function useBuilderDataTableState(args?: { pageSize?: number }) {
  return useDataTableState(args) as DataTableState & {
    query: ReadyBuilderContracts["ListBuilderViewEntriesQuery"];
  };
}

function useBuilderDataTable(args: {
  columns: ReturnType<typeof buildSubformColumns>;
  data: BuilderViewEntry[];
  rowCount: number;
  state: DataTableState;
  getRowId(row: BuilderViewEntry): string;
}) {
  return useDataTable<BuilderViewEntry>(args);
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
}: RuntimeSubformDataPanelProps<DataTableController<BuilderViewEntry>, BuilderViewEntry>) {
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

const DialogShell = (props: RuntimeSubformDialogShellProps) => (
  <AppBuilderPresentationShell {...props} />
);

function DialogFields({
  formId,
  viewId,
  schema,
  namePrefix,
}: RuntimeSubformDialogFieldsProps<BuilderFormSchema>) {
  return (
    <FieldGroup className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
      <DataForm formId={formId} viewId={viewId} schema={schema} namePrefix={namePrefix} />
    </FieldGroup>
  );
}

function DialogActions({ isSaving, submitLabel, onClose }: RuntimeSubformDialogActionsProps) {
  return (
    <div className="mx-0 mt-0 mb-0 flex flex-row justify-end gap-2 rounded-none border-t bg-background px-5 py-3">
      <Button type="button" variant="outline" className="min-w-24" onClick={onClose}>
        Болих
      </Button>
      <Button type="submit" className="min-w-28" disabled={isSaving}>
        {isSaving ? `${submitLabel}...` : submitLabel}
      </Button>
    </div>
  );
}

export function createAppBuilderSubformField(hooks: BuilderHooks<ReadyBuilderContracts>) {
  return createRuntimeSubformFieldComponent<
    ReadyBuilderContracts,
    BuilderFormSubform,
    ReturnType<typeof buildSubformColumns>[number],
    ReturnType<typeof useBuilderDataTableState>,
    DataTableController<BuilderViewEntry>
  >({
    hooks,
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
}

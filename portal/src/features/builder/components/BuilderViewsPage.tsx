"use client";

import {
  type BuilderEntityManagerDataGridProps,
  type BuilderEntityManagerDeleteDialogProps,
  type BuilderEntityManagerDialogAddButtonProps,
  type BuilderEntityManagerEditorDialogProps,
  createBuilderEntityDialogManagerComponent,
} from "@winu/builder-ui/admin";
import { Plus } from "lucide-react";
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
import type { PortalBuilderApiContracts } from "../api";
import {
  useBuilderFormOptions,
  useBuilderListOptions,
  useBuilderViews,
  useDeleteBuilderView,
  useReplicateBuilderView,
  useSaveBuilderView,
} from "../hooks/useBuilder";
import { BuilderViewDialog } from "./BuilderViewDialog";
import { buildBuilderViewColumns } from "./builderEntityColumns";

function BuilderDataGrid({
  controller,
  onRowClick,
  ...props
}: BuilderEntityManagerDataGridProps<
  DataTableController<builder.BuilderView>,
  builder.BuilderView
>) {
  return (
    <DataGrid<builder.BuilderView> controller={controller} onRowClick={onRowClick} {...props} />
  );
}

function AddButton({ label, onAdd }: BuilderEntityManagerDialogAddButtonProps) {
  return (
    <Button size="sm" onClick={onAdd}>
      <Plus />
      {label}
    </Button>
  );
}

function EditorDialog({
  open,
  editing,
  onClose,
}: BuilderEntityManagerEditorDialogProps<builder.BuilderView>) {
  const forms = useBuilderFormOptions();
  const lists = useBuilderListOptions();
  const save = useSaveBuilderView();

  return (
    <BuilderViewDialog
      open={open}
      editing={editing}
      forms={forms.data ?? []}
      lists={lists.data ?? []}
      onClose={onClose}
      onSave={save.mutateAsync}
      isSaving={save.isPending}
    />
  );
}

function DeleteDialog({
  entity,
  title,
  description,
  isDeleting,
  onClose,
  onConfirm,
}: BuilderEntityManagerDeleteDialogProps<builder.BuilderView>) {
  return (
    <AlertDialog open={Boolean(entity)} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
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

function useBuilderDataTableState(args?: { pageSize?: number }) {
  return useDataTableState(args) as DataTableState & {
    query: PortalBuilderApiContracts["ListBuilderViewsQuery"];
  };
}

function useBuilderDataTable(args: {
  columns: ReturnType<typeof buildBuilderViewColumns>;
  data: builder.BuilderView[];
  rowCount: number;
  state: ReturnType<typeof useBuilderDataTableState>;
  getRowId(row: builder.BuilderView): string;
}) {
  return useDataTable<builder.BuilderView>(args);
}

function useViews(query: PortalBuilderApiContracts["ListBuilderViewsQuery"]) {
  return useBuilderViews(query);
}

export const BuilderViewsManager = createBuilderEntityDialogManagerComponent<
  builder.BuilderView,
  ReturnType<typeof buildBuilderViewColumns>[number],
  ReturnType<typeof useBuilderDataTableState>,
  PortalBuilderApiContracts["ListBuilderViewsQuery"],
  DataTableController<builder.BuilderView>
>({
  labels: {
    title: "Dynamic Views",
    description: "Form + List сонгож нийлүүлсэн runtime view-үүд.",
    searchPlaceholder: "View нэр, key-ээр хайх...",
    emptyTitle: "View алга",
    emptyDescription: "Form, List үүсгээд тэднийг нэг view болгож нийлүүлээрэй.",
    addLabel: "Нэмэх",
    deleteTitle: "View устгах уу?",
    deleteDescription: (entity) => `«${entity?.title}» view идэвхгүй болно.`,
  },
  runtimeHref: (view) => `/winu/view?id=${encodeURIComponent(view.id)}`,
  requestReplicateTitle: (view) => window.prompt("Шинэ view нэр", `${view.title} copy`),
  hooks: {
    useEntities: useViews,
    useDelete: useDeleteBuilderView,
    useReplicate: useReplicateBuilderView,
  },
  buildColumns: buildBuilderViewColumns,
  useDataTableState: useBuilderDataTableState,
  useDataTable: useBuilderDataTable,
  DataGrid: BuilderDataGrid,
  AddButton,
  EditorDialog,
  DeleteDialog,
});

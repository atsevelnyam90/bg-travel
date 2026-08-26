"use client";

import {
  type BuilderEntityManagerAddButtonProps,
  type BuilderEntityManagerDataGridProps,
  type BuilderEntityManagerDeleteDialogProps,
  createBuilderEntityManagerComponent,
} from "@winu/builder-ui/admin";
import { Plus } from "lucide-react";
import Link from "next/link";
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
  useBuilderForms,
  useDeleteBuilderForm,
  useReplicateBuilderForm,
} from "../hooks/useBuilder";
import { buildBuilderFormColumns } from "./builderEntityColumns";

function BuilderDataGrid({
  controller,
  onRowClick,
  ...props
}: BuilderEntityManagerDataGridProps<
  DataTableController<builder.BuilderForm>,
  builder.BuilderForm
>) {
  return (
    <DataGrid<builder.BuilderForm> controller={controller} onRowClick={onRowClick} {...props} />
  );
}

function AddButton({ href, label }: BuilderEntityManagerAddButtonProps) {
  return (
    <Button asChild size="sm">
      <Link href={href}>
        <Plus />
        {label}
      </Link>
    </Button>
  );
}

function DeleteDialog({
  entity,
  title,
  description,
  isDeleting,
  onClose,
  onConfirm,
}: BuilderEntityManagerDeleteDialogProps<builder.BuilderForm>) {
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
    query: PortalBuilderApiContracts["ListBuilderFormsQuery"];
  };
}

function useBuilderDataTable(args: {
  columns: ReturnType<typeof buildBuilderFormColumns>;
  data: builder.BuilderForm[];
  rowCount: number;
  state: ReturnType<typeof useBuilderDataTableState>;
  getRowId(row: builder.BuilderForm): string;
}) {
  return useDataTable<builder.BuilderForm>(args);
}

function useForms(query: PortalBuilderApiContracts["ListBuilderFormsQuery"]) {
  return useBuilderForms(query);
}

export const BuilderFormsManager = createBuilderEntityManagerComponent<
  builder.BuilderForm,
  ReturnType<typeof buildBuilderFormColumns>[number],
  ReturnType<typeof useBuilderDataTableState>,
  PortalBuilderApiContracts["ListBuilderFormsQuery"],
  DataTableController<builder.BuilderForm>
>({
  labels: {
    title: "Dynamic Forms",
    description: "Дангаар нь дуудаж болох form schema-ууд.",
    searchPlaceholder: "Form нэр, key-ээр хайх...",
    emptyTitle: "Form алга",
    emptyDescription: "Эхний dynamic form-оо үүсгээрэй.",
    addLabel: "Нэмэх",
    deleteTitle: "Form устгах уу?",
    deleteDescription: (entity) => `«${entity?.title}» form идэвхгүй болно.`,
  },
  createHref: "/winu/builder/forms/new",
  runtimeHref: (form) => `/winu/form?id=${encodeURIComponent(form.id)}`,
  navigateToEdit: (form) => {
    window.location.assign(`/winu/builder/forms/edit?id=${form.id}`);
  },
  requestReplicateTitle: (form) => window.prompt("Шинэ form нэр", `${form.title} copy`),
  hooks: {
    useEntities: useForms,
    useDelete: useDeleteBuilderForm,
    useReplicate: useReplicateBuilderForm,
  },
  buildColumns: buildBuilderFormColumns,
  useDataTableState: useBuilderDataTableState,
  useDataTable: useBuilderDataTable,
  DataGrid: BuilderDataGrid,
  AddButton,
  DeleteDialog,
});

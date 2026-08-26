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
  useBuilderLists,
  useDeleteBuilderList,
  useReplicateBuilderList,
} from "../hooks/useBuilder";
import { buildBuilderListColumns } from "./builderEntityColumns";

function BuilderDataGrid({
  controller,
  onRowClick,
  ...props
}: BuilderEntityManagerDataGridProps<
  DataTableController<builder.BuilderList>,
  builder.BuilderList
>) {
  return (
    <DataGrid<builder.BuilderList> controller={controller} onRowClick={onRowClick} {...props} />
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
}: BuilderEntityManagerDeleteDialogProps<builder.BuilderList>) {
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
    query: PortalBuilderApiContracts["ListBuilderListsQuery"];
  };
}

function useBuilderDataTable(args: {
  columns: ReturnType<typeof buildBuilderListColumns>;
  data: builder.BuilderList[];
  rowCount: number;
  state: ReturnType<typeof useBuilderDataTableState>;
  getRowId(row: builder.BuilderList): string;
}) {
  return useDataTable<builder.BuilderList>(args);
}

function useLists(query: PortalBuilderApiContracts["ListBuilderListsQuery"]) {
  return useBuilderLists(query);
}

export const BuilderListsManager = createBuilderEntityManagerComponent<
  builder.BuilderList,
  ReturnType<typeof buildBuilderListColumns>[number],
  ReturnType<typeof useBuilderDataTableState>,
  PortalBuilderApiContracts["ListBuilderListsQuery"],
  DataTableController<builder.BuilderList>
>({
  labels: {
    title: "Dynamic Lists",
    description: "Дангаар нь дуудаж болох list/grid schema-ууд.",
    searchPlaceholder: "List нэр, key-ээр хайх...",
    emptyTitle: "List алга",
    emptyDescription: "Эхний dynamic list-ээ үүсгээрэй.",
    addLabel: "Нэмэх",
    deleteTitle: "List устгах уу?",
    deleteDescription: (entity) => `«${entity?.title}» list идэвхгүй болно.`,
  },
  createHref: "/winu/builder/lists/new",
  runtimeHref: (list) => `/winu/list?id=${encodeURIComponent(list.id)}`,
  navigateToEdit: (list) => {
    window.location.assign(`/winu/builder/lists/edit?id=${list.id}`);
  },
  requestReplicateTitle: (list) => window.prompt("Шинэ list нэр", `${list.title} copy`),
  hooks: {
    useEntities: useLists,
    useDelete: useDeleteBuilderList,
    useReplicate: useReplicateBuilderList,
  },
  buildColumns: buildBuilderListColumns,
  useDataTableState: useBuilderDataTableState,
  useDataTable: useBuilderDataTable,
  DataGrid: BuilderDataGrid,
  AddButton,
  DeleteDialog,
});

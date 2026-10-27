"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { travels } from "@/api/generated/contracts";
import {
  type DataTableColumnDef,
  RowActions,
  useDataTable,
  useDataTableState,
} from "@/components/data";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { createTravel, deleteTravel, getTravel, listTravels, updateTravel } from "../api";

const keys = {
  all: ["admin-travels"] as const,
  list: (query: object) => ["admin-travels", "list", query] as const,
  detail: (id: string) => ["admin-travels", "detail", id] as const,
};

export function useTravelsScreen() {
  const queryClient = useQueryClient();
  const state = useDataTableState({ pageSize: 20 });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<travels.AdminTravelListItem | null>(null);
  const query = useQuery({
    queryKey: keys.list(state.query),
    queryFn: () => listTravels(state.query),
    placeholderData: keepPreviousData,
  });
  const detail = useQuery({
    queryKey: keys.detail(editingId ?? "new"),
    queryFn: () => getTravel(editingId ?? ""),
    enabled: editorOpen && Boolean(editingId),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: keys.all });
  const createMutation = useMutation({ mutationFn: createTravel, onSuccess: invalidate });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: travels.UpdateAdminTravelInput }) =>
      updateTravel(id, input),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({ mutationFn: deleteTravel, onSuccess: invalidate });
  const columns = useMemo<DataTableColumnDef<travels.AdminTravelListItem>[]>(
    () => [
      {
        id: "name",
        header: "Аялал",
        meta: { sortable: true },
        cell: ({ row }) => row.original.name,
      },
      {
        id: "category",
        header: "Ангилал",
        meta: { sortable: true },
        cell: ({ row }) => row.original.category,
      },
      {
        id: "status",
        header: "Төлөв",
        meta: { sortable: true },
        cell: ({ row }) => row.original.status,
      },
      {
        id: "durationDays",
        header: "Хоног",
        meta: { sortable: true, align: "right" },
        cell: ({ row }) => <span className="tabular-nums">{row.original.durationDays}</span>,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Үйлдэл</div>,
        meta: { hideOnMobile: true },
        enableHiding: false,
        cell: ({ row }) => (
          <RowActions
            onEdit={(event) => {
              event.stopPropagation();
              setEditingId(row.original.id);
              setEditorOpen(true);
            }}
            onDelete={(event) => {
              event.stopPropagation();
              setDeleting(row.original);
            }}
          />
        ),
      },
    ],
    [],
  );
  const rows = useMemo(() => query.data?.items ?? [], [query.data]);

  return {
    controller: useDataTable({
      columns,
      data: rows,
      rowCount: query.data?.total ?? 0,
      state,
      getRowId: (row) => row.id,
    }),
    isLoading: query.isPending,
    editorOpen,
    editorLoading: Boolean(editingId) && detail.isPending,
    travel: editingId ? (detail.data ?? null) : null,
    deleting,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    openAdd: () => {
      setEditingId(null);
      setEditorOpen(true);
    },
    openEdit: (travel: travels.AdminTravelListItem) => {
      setEditingId(travel.id);
      setEditorOpen(true);
    },
    closeEditor: () => setEditorOpen(false),
    closeDelete: () => setDeleting(null),
    save: async (input: travels.CreateAdminTravelInput | travels.UpdateAdminTravelInput) => {
      try {
        if (editingId) {
          await updateMutation.mutateAsync({
            id: editingId,
            input: input as travels.UpdateAdminTravelInput,
          });
        } else {
          await createMutation.mutateAsync(input as travels.CreateAdminTravelInput);
        }
        setEditorOpen(false);
        toast.success("Аялал хадгалагдлаа");
      } catch (error) {
        toast.error(apiErrorMessage(error, "Аяллыг хадгалж чадсангүй"));
      }
    },
    remove: async () => {
      if (!deleting) return;
      try {
        await deleteMutation.mutateAsync(deleting.id);
        setDeleting(null);
        toast.success("Аялал устгагдлаа");
      } catch (error) {
        toast.error(apiErrorMessage(error, "Аяллыг устгаж чадсангүй"));
      }
    },
  };
}

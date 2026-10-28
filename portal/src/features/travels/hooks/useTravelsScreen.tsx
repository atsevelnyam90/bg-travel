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
import { Badge } from "@/components/ui/badge";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { createTravel, deleteTravel, getTravel, listTravels, updateTravel } from "../api";
import {
  travelCategoryLabels,
  travelCategoryOptions,
  travelStatusLabels,
  travelStatusOptions,
} from "../labels";

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
    queryFn: ({ signal }) => listTravels(state.query, signal),
    placeholderData: keepPreviousData,
  });
  const detail = useQuery({
    queryKey: keys.detail(editingId ?? "new"),
    queryFn: ({ signal }) => getTravel(editingId ?? "", signal),
    enabled: editorOpen && Boolean(editingId),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: keys.all });
  const createMutation = useMutation({
    mutationFn: createTravel,
    onSuccess: () => void invalidate(),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: travels.UpdateAdminTravelInput }) =>
      updateTravel(id, input),
    onSuccess: () => void invalidate(),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteTravel,
    onSuccess: () => void invalidate(),
  });
  const columns = useMemo<DataTableColumnDef<travels.AdminTravelListItem>[]>(
    () => [
      {
        id: "name",
        header: "Аялал",
        meta: { sortable: true, label: "Аялал", filter: { type: "text", placeholder: "Нэр…" } },
        cell: ({ row }) => row.original.name,
      },
      {
        id: "category",
        header: "Ангилал",
        meta: {
          sortable: true,
          label: "Ангилал",
          filter: { type: "select", options: travelCategoryOptions },
        },
        cell: ({ row }) => travelCategoryLabels[row.original.category],
      },
      {
        id: "status",
        header: "Төлөв",
        meta: {
          sortable: true,
          label: "Төлөв",
          filter: { type: "select", options: travelStatusOptions },
        },
        cell: ({ row }) => (
          <Badge variant={row.original.status === "PUBLISHED" ? "default" : "outline"}>
            {travelStatusLabels[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "durationDays",
        header: "Хоног",
        meta: {
          sortable: true,
          align: "right",
          label: "Хоног",
          filter: { type: "number", min: 1, placeholder: "Хоног…" },
        },
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

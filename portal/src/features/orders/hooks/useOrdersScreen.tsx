"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { orders } from "@/api/generated/contracts";
import { formatMinor } from "@/api/generated/contracts/money";
import {
  type DataTableColumnDef,
  RowActions,
  useDataTable,
  useDataTableState,
} from "@/components/data";
import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { confirmOrder, createOrder, deleteOrder, listOrders, updateOrder } from "../api";

const keys = {
  all: ["orders"] as const,
  list: (query: object) => ["orders", "list", query] as const,
};

export function useOrdersScreen() {
  const queryClient = useQueryClient();
  const state = useDataTableState({ pageSize: 20 });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<orders.AdminOrder | null>(null);
  const [deleting, setDeleting] = useState<orders.AdminOrder | null>(null);
  const [confirming, setConfirming] = useState<orders.AdminOrder | null>(null);
  const query = useQuery({
    queryKey: keys.list(state.query),
    queryFn: () => listOrders(state.query),
    placeholderData: keepPreviousData,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: keys.all });
  const createMutation = useMutation({ mutationFn: createOrder, onSuccess: invalidate });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: orders.UpdateAdminOrderInput }) =>
      updateOrder(id, input),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({ mutationFn: deleteOrder, onSuccess: invalidate });
  const confirmMutation = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => confirmOrder(id, { version }),
    onSuccess: invalidate,
  });

  const columns = useMemo<DataTableColumnDef<orders.AdminOrder>[]>(
    () => [
      {
        id: "publicOrderId",
        header: "Дугаар",
        meta: { sortable: true, label: "Дугаар" },
        cell: ({ row }) => row.original.publicOrderId,
      },
      {
        id: "confirmation",
        header: "Баталгаажуулалт",
        meta: { label: "Баталгаажуулалт" },
        cell: ({ row }) =>
          row.original.status === "PAID" ? (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-green-600 text-sm">
              <CircleCheck className="size-4" />
              Баталгаажсан
            </span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="border-primary/40 bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={(event) => {
                event.stopPropagation();
                setConfirming(row.original);
              }}
            >
              Баталгаажуулах
            </Button>
          ),
      },
      {
        id: "firstName",
        header: "Нэр",
        meta: { sortable: true },
        cell: ({ row }) => row.original.firstName,
      },
      {
        id: "lastName",
        header: "Овог",
        meta: { sortable: true },
        cell: ({ row }) => row.original.lastName,
      },
      {
        id: "phone",
        header: "Утас",
        meta: { sortable: true },
        cell: ({ row }) => row.original.phone,
      },
      {
        id: "serviceNameSnapshot",
        header: "Аялал",
        meta: { sortable: true },
        cell: ({ row }) => row.original.serviceNameSnapshot,
      },
      {
        id: "travelDate",
        header: "Аяллын огноо",
        meta: { sortable: true },
        cell: ({ row }) => row.original.travelDate,
      },
      {
        id: "travelerCount",
        header: "Зорчигч",
        meta: { sortable: true, align: "right" },
        cell: ({ row }) => <span className="tabular-nums">{row.original.travelerCount}</span>,
      },
      {
        id: "totalPriceMinor",
        header: "Нийт үнэ",
        meta: { sortable: true, align: "right" },
        cell: ({ row }) => (
          <span className="tabular-nums">{formatMinor(row.original.totalPriceMinor)}</span>
        ),
      },
      {
        id: "status",
        header: "Төлөв",
        meta: { sortable: true },
        cell: ({ row }) => row.original.status,
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
              setEditing(row.original);
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

  async function save(input: orders.CreateAdminOrderInput | orders.UpdateAdminOrderInput) {
    try {
      if (editing)
        await updateMutation.mutateAsync({
          id: editing.id,
          input: input as orders.UpdateAdminOrderInput,
        });
      else await createMutation.mutateAsync(input as orders.CreateAdminOrderInput);
      setEditorOpen(false);
      toast.success("Захиалга хадгалагдлаа");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Захиалгыг хадгалж чадсангүй"));
    }
  }

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
    editing,
    deleting,
    confirming,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isConfirming: confirmMutation.isPending,
    openAdd: () => {
      setEditing(null);
      setEditorOpen(true);
    },
    openEdit: (order: orders.AdminOrder) => {
      setEditing(order);
      setEditorOpen(true);
    },
    closeEditor: () => setEditorOpen(false),
    closeDelete: () => setDeleting(null),
    closeConfirm: () => setConfirming(null),
    save,
    remove: async () => {
      if (!deleting) return;
      try {
        await deleteMutation.mutateAsync(deleting.id);
        setDeleting(null);
        toast.success("Захиалга устгагдлаа");
      } catch (error) {
        toast.error(apiErrorMessage(error, "Захиалгыг устгаж чадсангүй"));
      }
    },
    confirm: async () => {
      if (!confirming) return;
      try {
        await confirmMutation.mutateAsync({ id: confirming.id, version: confirming.version });
        setConfirming(null);
        toast.success("Захиалга баталгаажлаа");
      } catch (error) {
        toast.error(apiErrorMessage(error, "Захиалгыг баталгаажуулж чадсангүй"));
      }
    },
  };
}

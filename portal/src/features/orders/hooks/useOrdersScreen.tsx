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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/features/auth";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import {
  confirmOrder,
  createOrder,
  deleteOrder,
  listOrderDepartureOptions,
  listOrders,
  updateOrder,
} from "../api";
import { orderStatusLabels, orderStatusOptions } from "../labels";

const keys = {
  all: ["orders"] as const,
  list: (query: object) => ["orders", "list", query] as const,
  departureOptions: ["orders", "departure-options"] as const,
};

const confirmationOptions = [
  { value: "AWAITING_PAYMENT", label: "Хүлээгдэж байна" },
  { value: "PAID", label: "Баталгаажсан" },
];

export function useOrdersScreen() {
  const { can } = usePermissions();
  const canWrite = can("order:write");
  const canDelete = can("order:delete");
  const queryClient = useQueryClient();
  const state = useDataTableState({ pageSize: 20 });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<orders.AdminOrder | null>(null);
  const [deleting, setDeleting] = useState<orders.AdminOrder | null>(null);
  const [confirming, setConfirming] = useState<orders.AdminOrder | null>(null);
  const query = useQuery({
    queryKey: keys.list(state.query),
    queryFn: ({ signal }) => listOrders(state.query, signal),
    placeholderData: keepPreviousData,
  });
  const departureOptions = useQuery({
    queryKey: keys.departureOptions,
    queryFn: ({ signal }) => listOrderDepartureOptions(signal),
    enabled: editorOpen && canWrite,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: keys.all });
  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => void invalidate(),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: orders.UpdateAdminOrderInput }) =>
      updateOrder(id, input),
    onSuccess: () => void invalidate(),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => void invalidate(),
  });
  const confirmMutation = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => confirmOrder(id, { version }),
    onSuccess: () => void invalidate(),
  });

  const columns = useMemo<DataTableColumnDef<orders.AdminOrder>[]>(
    () => [
      {
        id: "publicOrderId",
        header: "Дугаар",
        meta: {
          sortable: true,
          label: "Дугаар",
          filter: { type: "text", placeholder: "Дугаар…" },
        },
        cell: ({ row }) => row.original.publicOrderId,
      },
      {
        id: "confirmation",
        header: "Баталгаажуулалт",
        meta: {
          label: "Баталгаажуулалт",
          filter: { type: "select", key: "status", options: confirmationOptions },
        },
        cell: ({ row }) =>
          row.original.status === "PAID" ? (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-green-600 text-sm">
              <CircleCheck className="size-4" />
              Баталгаажсан
            </span>
          ) : canWrite ? (
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
          ) : (
            <span className="text-muted-foreground text-sm">Хүлээгдэж байна</span>
          ),
      },
      {
        id: "firstName",
        header: "Нэр",
        meta: {
          sortable: true,
          label: "Нэр",
          filter: { type: "text", placeholder: "Нэр…" },
        },
        cell: ({ row }) => row.original.firstName,
      },
      {
        id: "lastName",
        header: "Овог",
        meta: {
          sortable: true,
          label: "Овог",
          filter: { type: "text", placeholder: "Овог…" },
        },
        cell: ({ row }) => row.original.lastName,
      },
      {
        id: "phone",
        header: "Утас",
        meta: {
          sortable: true,
          label: "Утас",
          filter: { type: "text", placeholder: "Утас…" },
        },
        cell: ({ row }) => row.original.phone,
      },
      {
        id: "serviceNameSnapshot",
        header: "Аялал",
        meta: {
          sortable: true,
          label: "Аялал",
          filter: { type: "text", placeholder: "Аялал…" },
        },
        cell: ({ row }) => row.original.serviceNameSnapshot,
      },
      {
        id: "travelDate",
        header: "Аяллын огноо",
        meta: { sortable: true, label: "Аяллын огноо", filter: { type: "date" } },
        cell: ({ row }) => row.original.travelDate,
      },
      {
        id: "travelerCount",
        header: "Зорчигч",
        meta: {
          sortable: true,
          align: "right",
          label: "Зорчигч",
          filter: { type: "number", min: 1, placeholder: "Тоо…" },
        },
        cell: ({ row }) => <span className="tabular-nums">{row.original.travelerCount}</span>,
      },
      {
        id: "totalPriceMinor",
        header: "Нийт үнэ",
        meta: {
          sortable: true,
          align: "right",
          label: "Нийт үнэ",
          filter: { type: "number", min: 0, placeholder: "Үнэ…" },
        },
        cell: ({ row }) => (
          <span className="tabular-nums">{formatMinor(row.original.totalPriceMinor)}</span>
        ),
      },
      {
        id: "status",
        header: "Төлбөрийн төлөв",
        meta: {
          sortable: true,
          label: "Төлбөрийн төлөв",
          filter: { type: "select", options: orderStatusOptions },
        },
        cell: ({ row }) => (
          <Badge variant={row.original.status === "PAID" ? "secondary" : "outline"}>
            {orderStatusLabels[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Үйлдэл</div>,
        meta: { hideOnMobile: true },
        enableHiding: false,
        cell: ({ row }) => (
          <RowActions
            onEdit={
              canWrite
                ? (event) => {
                    event.stopPropagation();
                    setEditing(row.original);
                    setEditorOpen(true);
                  }
                : undefined
            }
            onDelete={
              canDelete
                ? (event) => {
                    event.stopPropagation();
                    setDeleting(row.original);
                  }
                : undefined
            }
          />
        ),
      },
    ],
    [canDelete, canWrite],
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
    canWrite,
    departureOptions: departureOptions.data ?? [],
    departureOptionsLoading: departureOptions.isPending,
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

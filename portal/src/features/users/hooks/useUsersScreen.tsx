"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { users } from "@/api/generated/contracts";
import {
  type DataTableColumnDef,
  RowActions,
  useDataTable,
  useDataTableState,
} from "@/components/data";
import { usePermissions } from "@/features/auth";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { disableUser, inviteUser, listRoles, listUsers, updateUser } from "../api";

const keys = {
  all: ["users"] as const,
  list: (query: object) => ["users", "list", query] as const,
};

export function useUsersScreen() {
  const { can } = usePermissions();
  const canReadRoles = can("role:read");
  const canEdit = can("user:update") && canReadRoles;
  const canInvite = can("user:invite") && canReadRoles;
  const canDisable = can("user:disable");
  const queryClient = useQueryClient();
  const state = useDataTableState({ pageSize: 20 });
  const [editing, setEditing] = useState<users.User | null>(null);
  const [deleting, setDeleting] = useState<users.User | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const query = useQuery({
    queryKey: keys.list(state.query),
    queryFn: ({ signal }) => listUsers(state.query, signal),
    placeholderData: keepPreviousData,
  });
  const roles = useQuery({
    queryKey: [...keys.all, "roles"],
    queryFn: ({ signal }) => listRoles(signal),
    enabled: canReadRoles,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: keys.all });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: users.UpdateUserInput }) =>
      updateUser(id, input),
    onSuccess: () => void invalidate(),
  });
  const deleteMutation = useMutation({
    mutationFn: disableUser,
    onSuccess: () => void invalidate(),
  });
  const inviteMutation = useMutation({
    mutationFn: inviteUser,
    onSuccess: () => void invalidate(),
  });
  const columns = useMemo<DataTableColumnDef<users.User>[]>(
    () => [
      { id: "name", header: "Нэр", meta: { sortable: true }, cell: ({ row }) => row.original.name },
      {
        id: "email",
        header: "И-мэйл",
        meta: { sortable: true },
        cell: ({ row }) => row.original.email,
      },
      {
        id: "status",
        header: "Төлөв",
        meta: { sortable: true },
        cell: ({ row }) => row.original.status,
      },
      {
        id: "role",
        header: "Role",
        cell: ({ row }) => roles.data?.find((role) => role.id === row.original.roleId)?.name ?? "—",
      },
      {
        id: "actions",
        header: () => <div className="text-right">Үйлдэл</div>,
        meta: { hideOnMobile: true },
        enableHiding: false,
        cell: ({ row }) => (
          <RowActions
            onEdit={
              canEdit
                ? (event) => {
                    event.stopPropagation();
                    setEditing(row.original);
                  }
                : undefined
            }
            onDelete={
              canDisable
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
    [canDisable, canEdit, roles.data],
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
    roles: roles.data ?? [],
    isLoading: query.isPending,
    canEdit,
    canInvite,
    editing,
    deleting,
    inviteOpen,
    isSaving: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isInviting: inviteMutation.isPending,
    openEdit: setEditing,
    closeEdit: () => setEditing(null),
    closeDelete: () => setDeleting(null),
    openInvite: () => setInviteOpen(true),
    closeInvite: () => setInviteOpen(false),
    save: async (input: users.UpdateUserInput) => {
      if (!editing) return;
      try {
        await updateMutation.mutateAsync({ id: editing.id, input });
        setEditing(null);
        toast.success("Хэрэглэгч хадгалагдлаа");
      } catch (error) {
        toast.error(apiErrorMessage(error, "Хэрэглэгчийг хадгалж чадсангүй"));
      }
    },
    invite: async (input: users.InviteUserInput) => {
      try {
        const result = await inviteMutation.mutateAsync(input);
        setInviteOpen(false);
        toast.success(
          result.mailFailed ? "Урилга үүссэн, и-мэйл илгээгдсэнгүй" : "Урилга илгээгдлээ",
        );
      } catch (error) {
        toast.error(apiErrorMessage(error, "Урилгыг илгээж чадсангүй"));
      }
    },
    remove: async () => {
      if (!deleting) return;
      try {
        await deleteMutation.mutateAsync(deleting.id);
        setDeleting(null);
        toast.success("Хэрэглэгч идэвхгүй боллоо");
      } catch (error) {
        toast.error(apiErrorMessage(error, "Хэрэглэгчийг идэвхгүй болгож чадсангүй"));
      }
    },
  };
}

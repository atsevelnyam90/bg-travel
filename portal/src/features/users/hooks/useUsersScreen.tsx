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
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { disableUser, inviteUser, listRoles, listUsers, updateUser } from "../api";

const keys = {
  all: ["users"] as const,
  list: (query: object) => ["users", "list", query] as const,
};

export function useUsersScreen() {
  const queryClient = useQueryClient();
  const state = useDataTableState({ pageSize: 20 });
  const [editing, setEditing] = useState<users.User | null>(null);
  const [deleting, setDeleting] = useState<users.User | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const query = useQuery({
    queryKey: keys.list(state.query),
    queryFn: () => listUsers(state.query),
    placeholderData: keepPreviousData,
  });
  const roles = useQuery({ queryKey: [...keys.all, "roles"], queryFn: listRoles });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: keys.all });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: users.UpdateUserInput }) =>
      updateUser(id, input),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({ mutationFn: disableUser, onSuccess: invalidate });
  const inviteMutation = useMutation({ mutationFn: inviteUser, onSuccess: invalidate });
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
            onEdit={(event) => {
              event.stopPropagation();
              setEditing(row.original);
            }}
            onDelete={(event) => {
              event.stopPropagation();
              setDeleting(row.original);
            }}
          />
        ),
      },
    ],
    [roles.data],
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

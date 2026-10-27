"use client";

import { Plus } from "lucide-react";
import { DataGrid, DeleteDialog } from "@/components/data";
import { Button } from "@/components/ui/button";
import { useUsersScreen } from "../hooks/useUsersScreen";
import { InviteUserDialog } from "./InviteUserDialog";
import { UserEditor } from "./UserEditor";

export function UsersScreen() {
  const screen = useUsersScreen();
  return (
    <>
      <DataGrid
        title="Хэрэглэгч"
        description="Хэрэглэгчийн эрх, төлөв."
        controller={screen.controller}
        isLoading={screen.isLoading}
        searchPlaceholder="Нэр, и-мэйлээр хайх…"
        emptyTitle="Хэрэглэгч алга"
        onRowClick={(row, event) => {
          if ((event.target as HTMLElement).closest("[data-row-action]")) return;
          screen.openEdit(row);
        }}
        toolbarExtra={
          <Button size="sm" onClick={screen.openInvite}>
            <Plus /> Урих
          </Button>
        }
      />
      <UserEditor
        user={screen.editing}
        roles={screen.roles}
        isSaving={screen.isSaving}
        onClose={screen.closeEdit}
        onSave={screen.save}
      />
      <InviteUserDialog
        open={screen.inviteOpen}
        roles={screen.roles}
        isSaving={screen.isInviting}
        onClose={screen.closeInvite}
        onSave={screen.invite}
      />
      <DeleteDialog
        open={Boolean(screen.deleting)}
        title="Хэрэглэгчийг идэвхгүй болгох уу?"
        description="Хэрэглэгч нэвтрэх боломжгүй болж, жагсаалтаас алга болно."
        isDeleting={screen.isDeleting}
        onClose={screen.closeDelete}
        onConfirm={() => void screen.remove()}
      />
    </>
  );
}

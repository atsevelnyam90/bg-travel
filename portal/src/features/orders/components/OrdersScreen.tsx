"use client";

import { Plus } from "lucide-react";
import { DataGrid, DeleteDialog } from "@/components/data";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useOrdersScreen } from "../hooks/useOrdersScreen";
import { OrderEditor } from "./OrderEditor";

export function OrdersScreen() {
  const screen = useOrdersScreen();
  return (
    <>
      <DataGrid
        title="Захиалга"
        description="Аяллын захиалга, төлбөрийн төлөв."
        controller={screen.controller}
        isLoading={screen.isLoading}
        searchPlaceholder="Дугаар, нэр, утасаар хайх…"
        emptyTitle="Захиалга алга"
        onRowClick={(row, event) => {
          if ((event.target as HTMLElement).closest("[data-row-action]")) return;
          screen.openEdit(row);
        }}
        toolbarExtra={
          <Button size="sm" onClick={screen.openAdd}>
            <Plus /> Нэмэх
          </Button>
        }
      />
      <OrderEditor
        open={screen.editorOpen}
        order={screen.editing}
        isSaving={screen.isSaving}
        onClose={screen.closeEditor}
        onSave={screen.save}
      />
      <DeleteDialog
        open={Boolean(screen.deleting)}
        title="Захиалга устгах уу?"
        isDeleting={screen.isDeleting}
        onClose={screen.closeDelete}
        onConfirm={() => void screen.remove()}
      />
      <AlertDialog
        open={Boolean(screen.confirming)}
        onOpenChange={(open) => !open && screen.closeConfirm()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Захиалгыг баталгаажуулах уу?</AlertDialogTitle>
            <AlertDialogDescription>
              {screen.confirming?.publicOrderId} захиалгын төлбөрийг хүлээн авсан гэж тэмдэглэнэ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={screen.isConfirming}>Болих</AlertDialogCancel>
            <Button disabled={screen.isConfirming} onClick={() => void screen.confirm()}>
              {screen.isConfirming ? "Баталгаажуулж байна…" : "Баталгаажуулах"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

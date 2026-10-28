"use client";

import { Plus } from "lucide-react";
import { DataGrid, DeleteDialog } from "@/components/data";
import { Button } from "@/components/ui/button";
import { useTravelsScreen } from "../hooks/useTravelsScreen";
import { TravelEditor } from "./TravelEditor";

export function TravelsScreen() {
  const screen = useTravelsScreen();
  return (
    <>
      <DataGrid
        title="Аялал"
        description="Аялал, гаралт, өдрийн хөтөлбөр."
        controller={screen.controller}
        isLoading={screen.isLoading}
        showSearch={false}
        emptyTitle="Аялал алга"
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
      <TravelEditor
        open={screen.editorOpen}
        loading={screen.editorLoading}
        travel={screen.travel}
        isSaving={screen.isSaving}
        onClose={screen.closeEditor}
        onSave={screen.save}
      />
      <DeleteDialog
        open={Boolean(screen.deleting)}
        title="Аялал устгах уу?"
        description="Аялал public сайт болон admin жагсаалтаас алга болно."
        isDeleting={screen.isDeleting}
        onClose={screen.closeDelete}
        onConfirm={() => void screen.remove()}
      />
    </>
  );
}

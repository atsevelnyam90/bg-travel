"use client";

import { DataGrid } from "@/components/data";
import { useAuditScreen } from "../hooks/useAuditScreen";

export function AuditScreen() {
  const screen = useAuditScreen();

  return (
    <div className="space-y-6">
      <DataGrid
        title="Аудит"
        description="Хэн, юуг, хэзээ өөрчилсөн бүртгэл."
        controller={screen.controller}
        isLoading={screen.isLoading}
        searchPlaceholder="Бичлэгийн дугаараар хайх…"
        emptyTitle="Бүртгэл алга"
        emptyDescription="Одоогоор бүртгэгдсэн үйлдэл байхгүй байна."
      />
    </div>
  );
}

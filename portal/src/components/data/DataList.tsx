"use client";

import { flexRender, type RowData } from "@tanstack/react-table";
import type { MouseEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DataTableController } from "./useDataTable";

// Картын шошго нь ЗӨВХӨН текст байх ёстой — header-ийн JSX (эрэмбэлэх товч г.м)
// картад тохирохгүй. Тиймээс meta.label → header-ийн мөр → багааны id гэсэн дараалал.
function cellLabel(column: {
  id: string;
  columnDef: { header?: unknown; meta?: { label?: string } };
}): string {
  const { header, meta } = column.columnDef;
  if (meta?.label) return meta.label;
  if (typeof header === "string") return header;
  return column.id;
}

type DataListProps<T extends RowData> = {
  controller: DataTableController<T>;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T, event: MouseEvent) => void;
};

/**
 * Mobile харагдац — мөр бүр карт болно.
 *
 * `DataTable`-тай ЯГ ИЖИЛ `useDataTable`-аас тэжээгдэнэ: багана, дата,
 * эрэмбэ, сонголт бүгд нэг эх сурвалжтай. Хоёр газар state барихгүй
 * (09-mobile-desktop.md §2).
 */
export function DataList<T extends RowData>({
  controller,
  isLoading,
  emptyTitle = "Мэдээлэл алга",
  emptyDescription = "Энэ хэсэгт харуулах өгөгдөл одоогоор байхгүй байна.",
  onRowClick,
}: DataListProps<T>) {
  const { table } = controller;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton, дараалал өөрчлөгдөхгүй
          <Skeleton key={index} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <Empty className="border-0 py-12">
        <EmptyHeader>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <Card
          key={row.id}
          className={cn("py-0 shadow-xs", onRowClick && "cursor-pointer active:bg-muted/50")}
          onClick={onRowClick ? (event) => onRowClick(row.original, event) : undefined}
        >
          <CardContent className="grid gap-2 p-4">
            {row
              .getVisibleCells()
              .filter((cell) => cell.column.columnDef.meta?.hideOnMobile !== true)
              .map((cell) => (
                <div key={cell.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="shrink-0 text-muted-foreground">{cellLabel(cell.column)}</span>
                  <span className="text-right font-medium">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

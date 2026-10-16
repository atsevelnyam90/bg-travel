"use client";

import { flexRender, type RowData } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DataTableController } from "./useDataTable";

type DataTableProps<T extends RowData> = {
  controller: DataTableController<T>;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T, event: MouseEvent) => void;
};

function alignClass(align?: "left" | "center" | "right") {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return undefined;
}

/** Desktop харагдац. Mobile-д `DataList`. Логик хоёуланд нь `useDataTable`-аас. */
export function DataTable<T extends RowData>({
  controller,
  isLoading,
  emptyTitle = "Мэдээлэл алга",
  emptyDescription = "Энэ хэсэгт харуулах өгөгдөл одоогоор байхгүй байна.",
  onRowClick,
}: DataTableProps<T>) {
  const { table, sort, toggleSort } = controller;
  const columns = table.getAllLeafColumns();

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 6 }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton мөрүүд тогтвортой, дараалал өөрчлөгдөхгүй
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <Empty className="border-0 py-16">
        <EmptyHeader>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    // Өргөн хүснэгт нь ЗӨВХӨН энэ савны дотор гүйнэ — хуудас өөрөө хэвтээ гүйхгүй.
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/30">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortable = header.column.columnDef.meta?.sortable === true;
                const active = sort?.id === header.column.id;

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-11 px-4 text-muted-foreground text-xs uppercase",
                      alignClass(header.column.columnDef.meta?.align),
                    )}
                  >
                    {header.isPlaceholder ? null : sortable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "-ml-2 h-8 gap-1 px-2 text-xs uppercase data-[active=true]:text-foreground",
                          alignClass(header.column.columnDef.meta?.align),
                        )}
                        data-active={active}
                        onClick={() => toggleSort(header.column.id)}
                        aria-label={`${header.column.id} баганаар эрэмбэлэх`}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {active ? (
                          sort.desc ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUp className="size-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-40" />
                        )}
                      </Button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? "selected" : undefined}
              className={cn(onRowClick && "cursor-pointer")}
              onClick={onRowClick ? (event) => onRowClick(row.original, event) : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn("h-12 px-4", alignClass(cell.column.columnDef.meta?.align))}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <span className="sr-only">{columns.length} багана</span>
    </div>
  );
}

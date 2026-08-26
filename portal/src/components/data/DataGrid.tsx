"use client";

import type { RowData } from "@tanstack/react-table";
import { Grid3X3, Rows3 } from "lucide-react";
import type { ReactNode } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/lib/useBreakpoint";
import { DataList } from "./DataList";
import { DataPagination } from "./DataPagination";
import { DataTable } from "./DataTable";
import { DataToolbar } from "./DataToolbar";
import type { DataTableController } from "./useDataTable";

type DataGridProps<T extends RowData> = {
  controller: DataTableController<T>;
  title?: string;
  description?: string;
  isLoading?: boolean;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  toolbarExtra?: ReactNode;
  filterBar?: ReactNode;
};

/**
 * Toolbar + (хүснэгт эсвэл карт жагсаалт) + хуудаслалт.
 *
 * Дэлгэцийн өргөнөөр л сонгоно — `useIsMobile()` ганц эх сурвалж.
 * Хоёр хувилбар нэг controller-оос тэжээгддэг тул state давхардахгүй.
 */
export function DataGrid<T extends RowData>({
  controller,
  title,
  description,
  isLoading,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  onRowClick,
  toolbarExtra,
  filterBar,
}: DataGridProps<T>) {
  const isMobile = useIsMobile();
  const selectedCount = controller.table.getFilteredSelectedRowModel().rows.length;

  return (
    <Card className="shadow-none">
      <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
        <div className="min-w-0 space-y-1">
          {title ? <CardTitle className="truncate text-xl leading-none">{title}</CardTitle> : null}
          {description ? (
            <CardDescription className="max-w-sm leading-snug">{description}</CardDescription>
          ) : null}
        </div>
        <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
          <DataToolbar controller={controller} searchPlaceholder={searchPlaceholder}>
            {toolbarExtra}
          </DataToolbar>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        {filterBar ? (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4">{filterBar}</div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="text-muted-foreground text-sm tabular-nums">{selectedCount} selected</div>

          <Tabs defaultValue={isMobile ? "grid" : "list"}>
            <TabsList>
              <TabsTrigger value="list" aria-label="Жагсаалт харагдац">
                <Rows3 />
              </TabsTrigger>
              <TabsTrigger value="grid" aria-label="Карт харагдац">
                <Grid3X3 />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="min-w-0">
          {isMobile ? (
            <div className="p-3">
              <DataList
                controller={controller}
                isLoading={isLoading}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
                onRowClick={onRowClick}
              />
            </div>
          ) : (
            <DataTable
              controller={controller}
              isLoading={isLoading}
              emptyTitle={emptyTitle}
              emptyDescription={emptyDescription}
              onRowClick={onRowClick}
            />
          )}
        </div>

        <DataPagination controller={controller} />
      </CardContent>
    </Card>
  );
}

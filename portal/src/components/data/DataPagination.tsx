"use client";

import type { RowData } from "@tanstack/react-table";
import type { MouseEvent } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { DataTableController } from "./useDataTable";

function preventNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}

export function DataPagination<T extends RowData>({
  controller,
}: {
  controller: DataTableController<T>;
}) {
  const { page, pageCount, rowCount, pageSize, setPage } = controller;

  const from = rowCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, rowCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4">
      <p className="text-muted-foreground text-sm" aria-live="polite">
        {rowCount === 0 ? "Илэрц алга" : `${rowCount}-аас ${from}–${to}`}
      </p>

      <Pagination className="mx-0 w-auto justify-start md:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              text=""
              className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
              onClick={(event) => {
                preventNavigation(event);
                setPage(page - 1);
              }}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="flex h-8 items-center px-2 text-sm tabular-nums">
              {page} / {pageCount}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              text=""
              className={page >= pageCount ? "pointer-events-none opacity-50" : undefined}
              onClick={(event) => {
                preventNavigation(event);
                setPage(page + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

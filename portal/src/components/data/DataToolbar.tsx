"use client";

import type { RowData } from "@tanstack/react-table";
import { Search, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { DataTableController } from "./useDataTable";

type DataToolbarProps<T extends RowData> = {
  controller: DataTableController<T>;
  searchPlaceholder?: string;
  showSearch?: boolean;
  /** Шүүлтүүр, "Нэмэх" товч зэрэг нэмэлт үйлдлүүд. */
  children?: ReactNode;
};

export function DataToolbar<T extends RowData>({
  controller,
  searchPlaceholder = "Хайх…",
  showSearch = true,
  children,
}: DataToolbarProps<T>) {
  const { table, search, setSearch } = controller;

  return (
    <div className="flex w-full flex-wrap justify-start gap-2 md:w-auto md:flex-nowrap md:justify-end">
      {showSearch ? (
        <InputGroup className="h-7 w-full md:w-64">
          <InputGroupAddon align="inline-start">
            <Search className="size-3.5" />
          </InputGroupAddon>
          <InputGroupInput
            className="h-7"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
          <InputGroupAddon align="inline-end">
            <span className="flex h-4 items-center rounded border bg-muted px-1 font-medium text-[10px]">
              ⌘K
            </span>
          </InputGroupAddon>
        </InputGroup>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <SlidersHorizontal />
            Багана
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Багана</DropdownMenuLabel>
          {table
            .getAllLeafColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(checked) => column.toggleVisibility(checked)}
                // Багана сэлгэх бүрт цэс хаагдвал эвгүй.
                onSelect={(event) => event.preventDefault()}
              >
                {column.columnDef.meta?.label ??
                  (typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id)}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {children}
    </div>
  );
}

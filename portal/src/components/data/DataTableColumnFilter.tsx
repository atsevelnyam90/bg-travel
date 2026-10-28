"use client";

import type { RowData } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DataTableController } from "./useDataTable";

const ALL_VALUES = "__all_column_filter_values__";

type DataTableColumnFilterProps<T extends RowData> = {
  column: DataTableController<T>["table"]["getAllLeafColumns"] extends () => Array<infer TColumn>
    ? TColumn
    : never;
  controller: DataTableController<T>;
};

export function DataTableColumnFilter<T extends RowData>({
  column,
  controller,
}: DataTableColumnFilterProps<T>) {
  const filter = column.columnDef.meta?.filter;
  if (!filter) return null;

  const key = filter.key ?? column.id;
  const value = controller.filters[key] ?? "";
  const label = column.columnDef.meta?.label ?? column.id;

  if (filter.type === "select") {
    return (
      <Select
        value={value || ALL_VALUES}
        onValueChange={(nextValue) =>
          controller.setFilter(key, nextValue === ALL_VALUES ? "" : nextValue)
        }
      >
        <SelectTrigger
          size="sm"
          className="w-full min-w-32 normal-case"
          aria-label={`${label} шүүх`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value={ALL_VALUES}>Бүгд</SelectItem>
          {filter.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={filter.type}
      min={filter.type === "number" ? filter.min : undefined}
      step={filter.type === "number" ? 1 : undefined}
      inputMode={filter.type === "number" ? "numeric" : undefined}
      value={value}
      onChange={(event) => controller.setFilter(key, event.target.value)}
      placeholder={filter.type === "date" ? undefined : (filter.placeholder ?? "Шүүх…")}
      aria-label={`${label} шүүх`}
      className={cn("h-7 normal-case", filter.type === "number" ? "min-w-24" : "min-w-32")}
    />
  );
}

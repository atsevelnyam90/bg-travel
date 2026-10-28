"use client";

import {
  type CellData,
  type ColumnDef,
  columnVisibilityFeature,
  type RowData,
  type RowSelectionState,
  rowSelectionFeature,
  type TableFeatures,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";

// TanStack Table v9 нь feature-үүдийг ИЛ зарлахыг шаарддаг (tree-shaking).
// Sort/filter/pagination-ыг СЕРВЕР хийдэг тул тэдгээрийн row model хэрэггүй —
// зөвхөн харагдац талын feature-үүдийг авна.
// coreRowModel-ыг өгөхгүй байвал built-in createCoreRowModel() автоматаар хэрэглэгдэнэ.
const features = tableFeatures({
  columnVisibilityFeature,
  rowSelectionFeature,
});

// Багана бүрд нэмэлт мэдээлэл. Эрэмбэлэлт нь СЕРВЕР талд хийгддэг тул
// TanStack-ийн rowSortingFeature-ыг бүртгээгүй — аль багана эрэмбэлэгдэхийг
// энд зарлана.
declare module "@tanstack/table-core" {
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  > {
    /** Толгой дээр дарж эрэмбэлэх боломжтой эсэх. Default: үгүй. */
    sortable?: boolean;
    /** Тоон утгыг баруун тийш зэрэгцүүлэхэд. */
    align?: "left" | "right";
    /** Mobile карт дээр нуух багана (үйлдлийн багана г.м). */
    hideOnMobile?: boolean;
    /** Mobile карт дээрх шошго. Байхгүй бол header-ийн текст, эсвэл багааны id. */
    label?: string;
  }
}

export type SortState = { id: string; desc: boolean } | null;

export type DataTableQuery = {
  page: number;
  pageSize: number;
  search: string;
  sort?: string;
};

type Features = typeof features;

export type DataTableColumnDef<T extends RowData> = ColumnDef<Features, T, unknown>;

/**
 * Хүснэгтийн ТӨЛӨВ. Дата татахаас ӨМНӨ хэрэгтэй (query нь дуудлагын оролт),
 * тиймээс `useDataTable`-аас тусад нь.
 *
 *   const state = useDataTableState();
 *   const { data } = useItems(state.query);
 *   const controller = useDataTable({ columns, data, rowCount, state });
 */
export function useDataTableState({
  pageSize = 20,
  searchDelayMs = 350,
}: {
  pageSize?: number;
  searchDelayMs?: number;
} = {}) {
  const [page, setPage] = useState(1);
  const [search, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortState>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), searchDelayMs);
    return () => window.clearTimeout(timeout);
  }, [search, searchDelayMs]);

  // Шүүлт/хайлт өөрчлөгдвөл эхний хуудас руу — эс тэгвэл хоосон хуудсан дээр үлдэнэ.
  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const toggleSort = useCallback((id: string) => {
    setSort((current) => {
      if (current?.id !== id) return { id, desc: false };
      if (!current.desc) return { id, desc: true };
      return null; // өсөх → буурах → эрэмбэлэхгүй
    });
    setPage(1);
  }, []);

  const query = useMemo<DataTableQuery>(
    () => ({
      page,
      pageSize,
      search: debouncedSearch,
      sort: sort ? `${sort.desc ? "-" : ""}${sort.id}` : undefined,
    }),
    [debouncedSearch, page, pageSize, sort],
  );

  return { page, setPage, pageSize, search, setSearch, sort, toggleSort, query };
}

export type DataTableState = ReturnType<typeof useDataTableState>;

type UseDataTableOptions<T extends RowData> = {
  columns: DataTableColumnDef<T>[];
  data: T[];
  /** Сервер талын НИЙТ мөрийн тоо (тухайн хуудсынх биш). */
  rowCount: number;
  state: DataTableState;
  getRowId?: (row: T) => string;
};

/**
 * Server-side хүснэгтийн ЛОГИК. Харагдац `DataTable` / `DataList`-д.
 *
 * Дата татахыг ЭНЭ hook хийхгүй — `query`-г буцаана, дуудагч тал өөрийн
 * TanStack Query-д дамжуулна. Ингэснээр хүснэгт нь дурын endpoint-той ажиллана.
 */
export function useDataTable<T extends RowData>({
  columns,
  data,
  rowCount,
  state,
  getRowId,
}: UseDataTableOptions<T>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useTable<Features, T>({
    features,
    columns,
    data,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
  });

  const pageCount = Math.max(1, Math.ceil(rowCount / state.pageSize));

  return {
    table,
    ...state,
    pageCount,
    rowCount,
    selectedIds: Object.keys(rowSelection).filter((id) => rowSelection[id]),
    clearSelection: useCallback(() => setRowSelection({}), []),
  };
}

export type DataTableController<T extends RowData> = ReturnType<typeof useDataTable<T>>;

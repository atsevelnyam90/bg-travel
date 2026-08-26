"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { audit } from "@/api/generated/contracts";
import { useDataTable, useDataTableState } from "@/components/data";
import { listAudit } from "../api";
import { auditColumns } from "../components/columns";

export function useAuditScreen() {
  const state = useDataTableState({ pageSize: 25 });

  const query = useQuery({
    queryKey: ["audit", "list", state.query],
    queryFn: () => listAudit(state.query),
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(() => query.data?.items ?? [], [query.data]);

  return {
    controller: useDataTable<audit.AuditEntry>({
      columns: auditColumns,
      data: rows,
      rowCount: query.data?.total ?? 0,
      state,
      getRowId: (row) => row.id,
    }),
    isLoading: query.isPending,
  };
}
